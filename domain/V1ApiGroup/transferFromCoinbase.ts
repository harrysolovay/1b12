import { BrokerType, ExecuteTransferResponse } from "@1b1/experimental_client/Generated"
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint"
import * as Schema from "effect/Schema"

export const transferFromCoinbase = HttpApiEndpoint
  .post("transferFromCoinbase")`/transfer_from_coinbase`
  .setPayload(Schema.Struct({
    accessToken: Schema.Redacted(Schema.String),
    brokerType: BrokerType,
    amount: Schema.Number,
  }))
  .addSuccess(Schema.Union(
    Schema.TaggedStruct("mfa", {
      previewId: Schema.String,
    }),
    Schema.TaggedStruct("success", {
      content: ExecuteTransferResponse,
    }),
  ))
