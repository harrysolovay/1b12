import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint"
import * as Schema from "effect/Schema"

export const getBalances = HttpApiEndpoint
  .post("getBalances")`/get_balances`
  .setPayload(Schema.Struct({
    coinbase: Schema.String.pipe(Schema.optional),
    metamask: Schema.String.pipe(Schema.optional),
  }))
  .addSuccess(Schema.Struct({
    coinbase: Schema.Number,
    metamask: Schema.Number,
  }))
