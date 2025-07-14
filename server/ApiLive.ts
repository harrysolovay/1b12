import { Api, FundsSource } from "@1b1/domain"
import * as MeshClient from "@1b1/experimental_client/MeshClient"
import * as HttpApiBuilder from "@effect/platform/HttpApiBuilder"
import * as HttpApiError from "@effect/platform/HttpApiError"
import * as Console from "effect/Console"
import * as Effect from "effect/Effect"
import assert from "node:assert"
import { currentUserId } from "./auth.ts"
import { ConfigService } from "./ConfigService.ts"
import { Db } from "./Db.ts"
import { maybeAccessTokens } from "./tokens.ts"

const symbol = "ETH"
const amount = .001

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
        Effect.fn(function*({ payload: { source } }) {
          const clerkId = yield* currentUserId
          return yield* mesh["POST/api/v1/linktoken"]({
            userId: clerkId,
            restrictMultipleAccounts: true,
            integrationId: source === "coinbase" ? coinbaseIntegrationId : metamaskIntegrationId,
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
          const clerkId = yield* currentUserId
          yield* db.setCoinbaseAccessTokenDetails(clerkId, payload)
        }),
      )
      .handle(
        "saveMetamaskToken",
        Effect.fn(function*({ payload }) {
          const clerkId = yield* currentUserId
          yield* db.setMetamaskAccessToken(clerkId, payload)
        }),
      )
      .handle(
        "getUserInfo",
        Effect.fn(function*() {
          const tokens = yield* maybeAccessTokens.pipe(
            Effect.tap(Console.log),
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
        "configureAndPreviewTransfer",
        Effect.fn(function*({ payload: { source } }) {
          const { fromAuthToken, fromType } = yield* transferCommon(source)
          yield* mesh["POST/api/v1/transfers/managed/configure"]({
            fromAuthToken,
            fromType,
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
          return yield* mesh["POST/api/v1/transfers/managed/preview"]({
            fromAuthToken,
            fromType,
            symbol,
            amount,
            networkId: ethereumNetworkId,
            toAddress: destinationAddress,
          }).pipe(
            Effect.tap(Console.log),
            Effect.map(({ content }) => content?.previewResult),
            Effect.flatMap(Effect.fromNullable),
            Effect.orDie,
          )
        }),
      )
      .handle(
        "executeTransfer",
        Effect.fn(function*({ payload: { source, mfaCode, previewId } }) {
          const { fromAuthToken, fromType } = yield* transferCommon(source)
          return yield* mesh["POST/api/v1/transfers/managed/execute"]({
            fromAuthToken,
            fromType,
            previewId,
            tryAnotherMfa: mfaCode === undefined,
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

const transferCommon = (source: typeof FundsSource.Encoded) =>
  Effect.all({
    fromAuthToken: maybeAccessTokens.pipe(
      Effect.map((tokens) => source === "coinbase" ? tokens?.coinbase : tokens?.metamask),
      Effect.flatMap(Effect.fromNullable),
      Effect.catchTag("NoSuchElementException", () => Effect.fail(new HttpApiError.Unauthorized())),
    ),
    fromType: Effect.succeed(
      source === "coinbase" ? "coinbase" as const : "deFiWallet" as const,
    ),
  })
