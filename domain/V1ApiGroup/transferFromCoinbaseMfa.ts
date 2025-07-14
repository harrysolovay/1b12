import { BrokerType, ExecuteTransferResponse } from "@1b1/experimental_client/Generated"
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint"
import * as Schema from "effect/Schema"

export const transferFromCoinbaseMfa = HttpApiEndpoint
  .post("transferFromCoinbaseMfa")`/transfer_from_coinbase_mfa`
  .setHeaders(Schema.Struct({
    authorization: Schema.String,
  }))
  .setPayload(Schema.Struct({
    accessToken: Schema.Redacted(Schema.String),
    brokerType: BrokerType,
    previewId: Schema.String,
    mfaCode: Schema.String,
  }))
  .addSuccess(ExecuteTransferResponse)
