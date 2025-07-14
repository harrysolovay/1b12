import { ClerkId } from "@1b1/domain"
import { verifyToken } from "@clerk/backend"
import * as HttpApiError from "@effect/platform/HttpApiError"
import * as HttpServerRequest from "@effect/platform/HttpServerRequest"
import * as Effect from "effect/Effect"
import * as Redacted from "effect/Redacted"
import * as Schema from "effect/Schema"
import { ConfigService } from "./ConfigService"

export const CurrentUserId = Effect.gen(function*() {
  const { clerkSecret } = yield* ConfigService
  const { cookies } = yield* HttpServerRequest.HttpServerRequest
  const jwt = Schema.decodeUnknownSync(
    Schema.Struct({
      __session: Schema.String.pipe(Schema.optional),
    }),
  )(cookies).__session
  if (typeof jwt === "undefined") {
    return undefined
  }
  const { sub } = yield* Effect.tryPromise({
    try: () =>
      verifyToken(jwt, {
        authorizedParties: ["http://localhost:5173"],
        secretKey: Redacted.value(clerkSecret),
      }),
    catch: () => new HttpApiError.Unauthorized(),
  })
  return ClerkId(sub)
})

// import { ApiError, Authorization, ClerkId } from "@1b1/domain"
// import { verifyToken } from "@clerk/backend"
// import { Unauthorized } from "@effect/platform/HttpApiError"
// import * as Effect from "effect/Effect"
// import * as Layer from "effect/Layer"
// import * as Redacted from "effect/Redacted"
// import { ConfigService } from "./ConfigService"

// export const AuthorizationLive = Layer.effect(
//   Authorization,
//   Effect.gen(function*() {
//     const { clerkSecret } = yield* ConfigService
//     return {
//       session: (session) =>
//         Effect.gen(function*() {
//           const { sub } = yield* Effect.tryPromise({
//             try: () =>
//               verifyToken(Redacted.value(session), {
//                 authorizedParties: ["http://localhost:5173"],
//                 secretKey: Redacted.value(clerkSecret),
//               }),
//             catch: () => new Unauthorized(),
//           })
//           return {
//             clerkId: ClerkId(sub),
//           }
//         }),
//     }
//   }),
// )
