import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint"
import { AccessTokenDetails } from "../common.ts"

export const refreshCoinbaseToken = HttpApiEndpoint
  .post("refreshCoinbaseToken")`/refresh_coinbase_token`
  .setPayload(AccessTokenDetails)
  .addSuccess(AccessTokenDetails)
