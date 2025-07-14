// import { Unauthorized } from "@effect/platform/HttpApiError"
// import * as HttpApiMiddleware from "@effect/platform/HttpApiMiddleware"
// import * as HttpApiSecurity from "@effect/platform/HttpApiSecurity"
import * as Brand from "effect/Brand"
import * as Context from "effect/Context"
import * as Schema from "effect/Schema"

export type ClerkId = string & Brand.Brand<"ClerkId">
export const ClerkId = Brand.nominal<ClerkId>()

export class AccessTokenDetails extends Schema.Class<AccessTokenDetails>("TokenDetails")({
  accessToken: Schema.String,
  refreshToken: Schema.String,
}) {}

export class ApiError extends Schema.TaggedError<ApiError>("ApiError")("ApiError", {
  inner: Schema.Unknown.pipe(Schema.optional),
}) {}

// export class CurrentUser extends Context.Tag("CurrentUser")<CurrentUser, {
//   clerkId: ClerkId
// }>() {}

// export class Authorization extends HttpApiMiddleware.Tag<Authorization>()(
//   "Authorization",
//   {
//     provides: CurrentUser,
//     failure: Unauthorized,
//     security: {
//       session: HttpApiSecurity.apiKey({
//         in: "cookie",
//         key: "__session",
//       }),
//     },
//   },
// ) {}
