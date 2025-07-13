import { Api, ApiError } from "@1b1/domain"
import { make } from "@1b1/experimental_client/Generated"
import * as HttpApiBuilder from "@effect/platform/HttpApiBuilder"
import * as HttpClient from "@effect/platform/HttpClient"
import * as HttpClientRequest from "@effect/platform/HttpClientRequest"
import * as Effect from "effect/Effect"
import { flow } from "effect/Function"
import * as Redacted from "effect/Redacted"
import { ConfigService } from "../ConfigService.ts"

export const V1ApiGroupLive = HttpApiBuilder.group(
  Api,
  "v1",
  Effect.fn(function*(handlers) {
    const { clientId, secret, destinationAddress } = yield* ConfigService

    const mesh = (yield* HttpClient.HttpClient).pipe(
      HttpClient.mapRequest(flow(
        HttpClientRequest.prependUrl("https://integration-api.meshconnect.com"),
        HttpClientRequest.setHeaders({
          "X-Client-Id": clientId,
          "X-Client-Secret": Redacted.value(secret),
        }),
      )),
      make,
    )

    const { networkId, symbol } = yield* mesh["GET/api/v1/transfers/managed/networks"]().pipe(
      Effect.map(({ content }) => content?.networks?.find((network) => network.name === "Ethereum")),
      Effect.flatMap(Effect.fromNullable),
      Effect.flatMap(({ id, nativeSymbol }) =>
        Effect.all({
          networkId: Effect.fromNullable(id),
          symbol: Effect.fromNullable(nativeSymbol),
        })
      ),
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
          const balance = yield* mesh["POST/api/v1/holdings/get"]({
            authToken: Redacted.value(accessToken),
            type: brokerType,
            includeMarketValue: true,
          }).pipe(
            Effect.map(({ content }) =>
              content?.cryptocurrencyPositions?.find(({ symbol }) => symbol === "ETH")?.amount ?? 0
            ),
            Effect.flatMap(Effect.fromNullable),
            Effect.orDie,
          )
          return { balance }
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
            fromType: brokerType,
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
            fromType: brokerType,
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
            fromType: brokerType,
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
            fromType: brokerType,
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
