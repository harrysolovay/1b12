import { Api } from "@1b1/domain"
import { make } from "@1b1/experimental_client/Generated"
import * as HttpApiBuilder from "@effect/platform/HttpApiBuilder"
import * as HttpClient from "@effect/platform/HttpClient"
import * as HttpClientRequest from "@effect/platform/HttpClientRequest"
import * as Effect from "effect/Effect"
import { flow } from "effect/Function"
import * as Redacted from "effect/Redacted"
import assert from "node:assert"
import type { access } from "node:fs"
import { ConfigService } from "../ConfigService.ts"

// TODO: Replace with actual user ID retrieval logic
const userId = "1b1"
const symbol = "ETH"

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

    const ethereumNetworkId = yield* mesh["GET/api/v1/transfers/managed/networks"]().pipe(
      Effect.map(({ content }) => content?.networks?.find((network) => network.name === "Ethereum")?.id),
      Effect.flatMap(Effect.fromNullable),
    )

    const integrations = yield* mesh["GET/api/v1/transfers/managed/integrations"]().pipe(
      Effect.map(({ content }) => content?.integrations),
      Effect.flatMap(Effect.fromNullable),
      Effect.orDie,
    )

    let coinbaseIntegrationId: string | undefined
    let metamaskIntegrationId: string | undefined
    for (const { name, id } of integrations) {
      if (name === "Coinbase") {
        coinbaseIntegrationId = id!
      } else if (name === "MetaMask") {
        metamaskIntegrationId = id!
      }
    }
    assert(
      typeof coinbaseIntegrationId === "string" && typeof metamaskIntegrationId === "string",
    )

    return handlers
      .handle(
        "createLinkToken",
        Effect.fn(function*({ payload: { _tag } }) {
          return yield* mesh["POST/api/v1/linktoken"]({
            userId,
            restrictMultipleAccounts: true,
            integrationId: _tag === "coinbase" ? coinbaseIntegrationId : metamaskIntegrationId,
            // TODO: why is this not represented in the OpenAPI spec?
            ...{
              enableTransfers: false,
            } as {},
          }).pipe(
            Effect.map(({ content }) => content?.linkToken),
            Effect.flatMap(Effect.fromNullable),
            Effect.orDie,
          )
        }),
      )
      .handle(
        "refreshCoinbaseToken",
        Effect.fn(function*({ payload: { accessToken, refreshToken } }) {
          return yield* mesh["POST/api/v1/token/refresh"]({
            type: "coinbase",
            refreshToken,
            accessToken,
          }).pipe(
            Effect.map(({ content }) => ({
              accessToken: content?.accessToken!,
              refreshToken: content?.refreshToken!,
            })),
            Effect.orDie,
          )
        }),
      )
      .handle(
        "getBalances",
        Effect.fn(function*({ payload: { coinbase, metamask } }) {
          return yield* Effect.all({
            coinbase: coinbase
              ? mesh["POST/api/v1/holdings/get"]({
                authToken: coinbase,
                type: "coinbase",
                includeMarketValue: true,
              }).pipe(
                Effect.map(({ content }) =>
                  content?.cryptocurrencyPositions?.find(({ symbol: symbol_ }) => symbol === symbol_)?.amount ?? 0
                ),
              )
              : Effect.succeed(0),
            metamask: metamask
              ? mesh["POST/api/v1/holdings/get"]({
                authToken: metamask,
                type: "deFiWallet",
                includeMarketValue: true,
              }).pipe(
                Effect.map(({ content }) =>
                  content?.cryptocurrencyPositions?.find(({ symbol: symbol_ }) => symbol === symbol_)?.amount ?? 0
                ),
              )
              : Effect.succeed(0),
          }).pipe(
            Effect.orDie,
          )
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
                networkId: ethereumNetworkId,
                symbol,
                address: destinationAddress,
              },
            ],
            networkId: ethereumNetworkId,
          }).pipe(
            Effect.orDie,
          )
          console.log({
            fromAuthToken: Redacted.value(accessToken),
            fromType: brokerType,
            symbol,
            amount,
            networkId: ethereumNetworkId,
            toAddress: destinationAddress,
          })
          const previewId = yield* mesh["POST/api/v1/transfers/managed/preview"]({
            fromAuthToken: Redacted.value(accessToken),
            fromType: brokerType,
            symbol,
            amount,
            networkId: ethereumNetworkId,
            toAddress: destinationAddress,
          }).pipe(
            Effect.tapError((error) => {
              return Effect.logError(error)
            }),
            Effect.map(({ content }) => {
              // console.log({ content }, "\n\n\n\n\n\n\n")
              return content?.previewResult?.previewId
            }),
            Effect.flatMap(Effect.fromNullable),
            Effect.orDie,
          )
          console.log({ previewId })
          const content = yield* mesh["POST/api/v1/transfers/managed/execute"]({
            fromAuthToken: Redacted.value(accessToken),
            fromType: brokerType,
            previewId,
            tryAnotherMfa: true,
          }).pipe(
            Effect.map(({ content }) => content),
            Effect.flatMap(Effect.fromNullable),
            Effect.orDie,
          )
          if (content.status === "mfaRequired") {
            return { _tag: "mfa", previewId }
          }
          return { _tag: "success", content }
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
