import * as MeshClient from "@1b1/experimental_client/MeshClient"
import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"
import { maybeCurrentUserId } from "./auth.ts"
import { Db } from "./Db.ts"

const decodeCoinbaseAccessTokenDetails = Schema.decodeUnknownSync(
  Schema.Struct({
    accessToken: Schema.String,
    refreshToken: Schema.String,
  }),
)

export const maybeAccessTokens = Effect.gen(function*() {
  const clerkId = yield* maybeCurrentUserId
  if (!clerkId) {
    return undefined
  }
  const mesh = yield* MeshClient.MeshClient
  const db = yield* Db
  let {
    coinbaseAccessTokenDetails,
    metamaskAccessToken,
  } = yield* Effect.all({
    coinbaseAccessTokenDetails: db.getCoinbaseAccessTokenDetails(clerkId),
    metamaskAccessToken: db.getMetamaskAccessToken(clerkId),
  })
  // TODO: more careful handling of token & refresh token expiry
  if (coinbaseAccessTokenDetails) {
    coinbaseAccessTokenDetails = yield* mesh["POST/api/v1/token/refresh"]({
      type: "coinbase",
      ...coinbaseAccessTokenDetails,
    }).pipe(
      Effect.map(({ content }) =>
        decodeCoinbaseAccessTokenDetails({
          accessToken: content?.accessToken,
          refreshToken: content?.refreshToken,
        })
      ),
      Effect.orDie,
    )
    yield* db.setCoinbaseAccessTokenDetails(clerkId, coinbaseAccessTokenDetails)
  }
  return {
    coinbase: coinbaseAccessTokenDetails?.accessToken,
    metamask: metamaskAccessToken,
  }
})
