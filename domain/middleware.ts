import { Unauthorized } from "@effect/platform/HttpApiError"
import * as HttpApiMiddleware from "@effect/platform/HttpApiMiddleware"
import * as HttpApiSecurity from "@effect/platform/HttpApiSecurity"
import * as Context from "effect/Context"

export class LinkToken extends Context.Tag("LinkToken")<LinkToken, string>() {}

export class LinkTokenAuthorization extends HttpApiMiddleware.Tag<LinkTokenAuthorization>()(
  "Authorization",
  {
    failure: Unauthorized,
    provides: LinkToken,
    security: {
      bearer: HttpApiSecurity.bearer,
    },
  },
) {}
