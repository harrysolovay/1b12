import type { ClerkId } from "@1b1/domain"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import { Db } from "./Db.ts"

interface UserData {
  coinbaseAccessTokens?: {
    accessToken: string
    refreshToken: string
  }
  metamaskAccessToken?: string
}
type UsersLookup = Record<ClerkId, UserData>

export const MemoryDb = Layer.effect(
  Db,
  Effect.gen(function*() {
    const users: UsersLookup = {}
    return {
      setCoinbaseAccessTokenDetails: Effect.fn(function*(
        clerkId: ClerkId,
        accessTokens: {
          accessToken: string
          refreshToken: string
        },
      ) {
        const user = ensureUser(clerkId)
        user.coinbaseAccessTokens = accessTokens
      }),
      getCoinbaseAccessTokenDetails: Effect.fn(function*(clerkId: ClerkId) {
        return ensureUser(clerkId).coinbaseAccessTokens
      }),
      setMetamaskAccessToken: Effect.fn(function*(clerkId: ClerkId, { accessToken }: {
        accessToken: string
      }) {
        const user = ensureUser(clerkId)
        user.metamaskAccessToken = accessToken
      }),
      getMetamaskAccessToken: Effect.fn(function*(clerkId: ClerkId) {
        return ensureUser(clerkId).metamaskAccessToken
      }),
    }

    function ensureUser(clerkId: ClerkId): UserData {
      if (!users[clerkId]) {
        users[clerkId] = {}
      }
      return users[clerkId]!
    }
  }),
)
