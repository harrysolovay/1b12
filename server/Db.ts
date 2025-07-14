import type { ClerkId } from "@1b1/domain"
import * as Context from "effect/Context"
import * as Effect from "effect/Effect"

export interface CoinbaseAccessTokenDetails {
  accessToken: string
  refreshToken: string
}

export class Db extends Context.Tag("Db")<Db, {
  setCoinbaseAccessTokenDetails: (
    clerkId: ClerkId,
    accessTokens: {
      accessToken: string
      refreshToken: string
    },
  ) => Effect.Effect<void>
  getCoinbaseAccessTokenDetails: (clerkId: ClerkId) => Effect.Effect<CoinbaseAccessTokenDetails | undefined>
  setMetamaskAccessToken: (
    clerkId: ClerkId,
    payload: {
      accessToken: string
    },
  ) => Effect.Effect<void>
  getMetamaskAccessToken: (clerkId: ClerkId) => Effect.Effect<string | undefined>
}>() {}
