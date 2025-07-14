import { Api } from "@1b1/domain"
import * as MeshClient from "@1b1/experimental_client/MeshClient"
import * as HttpApiBuilder from "@effect/platform/HttpApiBuilder"
import * as HttpApiError from "@effect/platform/HttpApiError"
import * as Console from "effect/Console"
import * as Effect from "effect/Effect"
import * as Redacted from "effect/Redacted"
import assert from "node:assert"
import { ConfigService } from "./ConfigService.ts"
import { CurrentUserId } from "./CurrentUserId.ts"
import { Db } from "./Db.ts"
import { accessTokens } from "./tokens.ts"

// TODO: Replace with actual user ID retrieval logic
const userId = "1b1"
const symbol = "ETH"

export const ApiLive = HttpApiBuilder.group(
  Api,
  "v1",
  Effect.fn(function*(handlers) {
    const { destinationAddress } = yield* ConfigService
    const mesh = yield* MeshClient.MeshClient
    const db = yield* Db

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
        "saveCoinbaseTokens",
        Effect.fn(function*({ payload }) {
          console.log({ saveCoinbaseTokens: payload })
          const clerkId = yield* CurrentUserId
          if (typeof clerkId === "undefined") {
            return yield* new HttpApiError.Unauthorized()
          }
          yield* db.setCoinbaseAccessTokenDetails(clerkId, payload)
        }),
      )
      .handle(
        "saveMetamaskToken",
        Effect.fn(function*({ payload }) {
          console.log({ saveMetamaskToken: payload })
          const clerkId = yield* CurrentUserId
          if (typeof clerkId === "undefined") {
            return yield* new HttpApiError.Unauthorized()
          }
          yield* db.setMetamaskAccessToken(clerkId, payload)
        }),
      )
      .handle(
        "getUserInfo",
        Effect.fn(function*() {
          const tokens = yield* accessTokens.pipe(
            Effect.tap(Console.log),
            Effect.catchTag("NoSuchElementException", () => Effect.succeed(undefined)),
            Effect.orDie,
          )
          if (!tokens) {
            return {
              coinbase: {
                connected: false,
                balance: 0,
              },
              metamask: {
                connected: false,
                balance: 0,
              },
            }
          }
          const balances = yield* Effect.all({
            coinbase: tokens.coinbase
              ? mesh["POST/api/v1/holdings/get"]({
                authToken: tokens.coinbase,
                type: "coinbase",
                includeMarketValue: true,
              }).pipe(
                Effect.map(({ content }) =>
                  content?.cryptocurrencyPositions?.find(({ symbol: symbol_ }) => symbol === symbol_)?.amount ?? 0
                ),
              )
              : Effect.succeed(0),
            metamask: tokens.metamask
              ? mesh["POST/api/v1/holdings/get"]({
                authToken: tokens.metamask,
                type: "deFiWallet",
                includeMarketValue: true,
              }).pipe(
                Effect.map(({ content }) =>
                  content?.cryptocurrencyPositions?.find(({ symbol: symbol_ }) => symbol === symbol_)?.amount ?? 0
                ),
              )
              : Effect.succeed(0),
          }).pipe(Effect.orDie)
          return {
            coinbase: {
              connected: !!tokens.coinbase,
              balance: balances.coinbase,
            },
            metamask: {
              connected: !!tokens.metamask,
              balance: balances.metamask,
            },
          }
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
