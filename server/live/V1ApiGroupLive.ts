import { Api } from "@1b1/domain/Api"
import { ApiError } from "@1b1/domain/errors"
import { make } from "@1b1/experimental_client/Generated"
import * as HttpApiBuilder from "@effect/platform/HttpApiBuilder"
import * as HttpClient from "@effect/platform/HttpClient"
import * as HttpClientRequest from "@effect/platform/HttpClientRequest"
import * as HttpClientResponse from "@effect/platform/HttpClientResponse"
import * as Array from "effect/Array"
import * as Effect from "effect/Effect"
import { flow } from "effect/Function"
import * as Option from "effect/Option"
import * as Redacted from "effect/Redacted"
import * as Schema from "effect/Schema"
import * as Struct from "effect/Struct"
import { ConfigService } from "../ConfigService.ts"

export const V1ApiGroupLive = HttpApiBuilder.group(
  Api,
  "v1",
  Effect.fn(function*(handlers) {
    const { clientId, secret, destinationAddress } = yield* ConfigService
    const meshClient = (yield* HttpClient.HttpClient).pipe(
      HttpClient.mapRequest(flow(
        HttpClientRequest.prependUrl("https://integration-api.meshconnect.com/api/v1"),
        HttpClientRequest.setHeaders({
          "X-Client-Id": clientId,
          "X-Client-Secret": Redacted.value(secret),
        }),
      )),
    )
    const mesh = make(meshClient)

    const post = <T>(
      pathname: string,
      body: unknown,
      content: Schema.Schema<T>,
    ) =>
      HttpClientRequest.post(pathname).pipe(
        HttpClientRequest.bodyJson(body),
        Effect.flatMap(meshClient.execute),
        Effect.flatMap(HttpClientResponse.filterStatusOk),
        Effect.flatMap(HttpClientResponse.schemaBodyJson(Schema.Struct({ content }))),
        Effect.mapError((inner) => new ApiError({ inner })),
        Effect.map(Struct.get("content")),
      )

    const {
      id: networkId,
      nativeSymbol: symbol,
    } = yield* mesh["GET/api/v1/transfers/managed/networks"]().pipe(
      Effect.map(Struct.get("content")),
      Effect.flatMap(Effect.fromNullable),
      Effect.map(Struct.get("networks")),
      Effect.flatMap(Effect.fromNullable),
      Effect.map(Array.findFirst((network) => network.name === "Ethereum")),
      Effect.flatMap(Option.match({
        onSome: (v) => Effect.succeed(v),
        onNone: () => Effect.fail(new ApiError()),
      })),
      Effect.flatMap(Schema.decodeUnknown(Schema.Struct({
        id: Schema.String,
        nativeSymbol: Schema.String,
      }))),
    )

    return handlers
      .handle(
        "createLinkToken",
        Effect.fn(function*({ payload: { integrationId, transferOptions, userId, enableTransfers } }) {
          const linkToken = yield* mesh["POST/api/v1/linktoken"]({
            userId,
            restrictMultipleAccounts: true,
            integrationId,
            transferOptions,
            ...{ enableTransfers } as {}, // TODO
          }).pipe(
            Effect.map(({ content }) => content?.linkToken),
            Effect.flatMap(Effect.fromNullable),
            Effect.mapError((inner) => new ApiError({ inner })),
          )
          return { linkToken }
        }),
      )
      .handle(
        "getCoinbaseBalance",
        Effect.fn(function*({ payload: { accessToken, brokerType } }) {
          const { cryptocurrencyPositions } = yield* post(
            "/holdings/get",
            {
              authToken: accessToken,
              type: brokerType,
              includeMarketValue: true,
            },
            Schema.Struct({
              cryptocurrencyPositions: Schema.Array(Schema.Struct({
                symbol: Schema.String,
                amount: Schema.Number.pipe(Schema.optional),
              })),
            }),
          )
          const ethPosition = cryptocurrencyPositions.find(({ symbol }) => symbol === "ETH")
          return { balance: ethPosition?.amount ?? 0 }
        }),
      )
      .handle(
        "getNetworksAndIntegrations",
        Effect.fn(function*() {
          return yield* Effect.all(
            {
              networks: mesh["GET/api/v1/transfers/managed/networks"]().pipe(
                Effect.map(({ content }) => content?.networks),
                Effect.flatMap(Effect.fromNullable),
              ),
              integrations: mesh["GET/api/v1/transfers/managed/integrations"]().pipe(
                Effect.map(({ content }) => content?.integrations),
                Effect.flatMap(Effect.fromNullable),
              ),
            },
            { concurrency: "unbounded" },
          ).pipe(Effect.orDie)
        }),
      )
      .handle(
        "getWalletPortfolio",
        Effect.fn(function*({ payload: { accessToken } }) {
          const balance = yield* mesh["POST/api/v1/holdings/get"]({
            authToken: Redacted.value(accessToken),
            type: "deFiWallet",
          }).pipe(
            Effect.map(({ content }) =>
              content?.cryptocurrencyPositions?.find(({ symbol }) => symbol === "ETH")?.amount ?? 0
            ),
            Effect.orDie,
          )
          return { balance }
        }),
      )
      .handle(
        "transferFromCoinbase",
        Effect.fn(function*({ payload: { accessToken, amount, brokerType } }) {
          yield* mesh["POST/api/v1/transfers/managed/configure"]({
            fromAuthToken: Redacted.value(accessToken),
            fromType: brokerType as never, // TODO
            symbol,
            amount,
            toAddresses: [
              {
                networkId,
                symbol,
                address: destinationAddress,
              },
            ],
            networkId,
          }).pipe(Effect.orDie)
          const previewId = yield* mesh["POST/api/v1/transfers/managed/preview"]({
            fromAuthToken: Redacted.value(accessToken),
            fromType: brokerType as never, // TODO
            symbol,
            amount,
            networkId,
            toAddress: destinationAddress,
          }).pipe(
            Effect.map(({ content }) => content?.previewResult?.previewId),
            Effect.flatMap(Effect.fromNullable),
            Effect.orDie,
          )
          return yield* mesh["POST/api/v1/transfers/managed/execute"]({
            fromAuthToken: Redacted.value(accessToken),
            fromType: brokerType as never, // TODO
            previewId,
            tryAnotherMfa: true,
          }).pipe(
            Effect.map(({ content }) => content),
            Effect.flatMap(Effect.fromNullable),
            Effect.orDie,
          )
        }),
      )
      .handle(
        "transferFromCoinbaseMfa",
        Effect.fn(function*({ payload: { accessToken, brokerType, mfaCode, previewId } }) {
          return yield* mesh["POST/api/v1/transfers/managed/execute"]({
            fromAuthToken: Redacted.value(accessToken),
            fromType: brokerType as never, // TODO
            previewId,
            tryAnotherMfa: false,
            mfaCode,
          }).pipe(
            Effect.map(({ content }) => content),
            Effect.flatMap(Effect.fromNullable),
            Effect.orDie,
          )
        }),
      )
  }),
)
