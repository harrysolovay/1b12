import { ExecuteTransferResponse } from "@1b1/experimental_client/Generated"
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint"
import * as Schema from "effect/Schema"

export class TransferFromCoinbaseMfaPayload
  extends Schema.Class<TransferFromCoinbaseMfaPayload>("TransferFromCoinbaseMfaPayload")({
    accessToken: Schema.Redacted(Schema.String),
    brokerType: Schema.String, // TODO: narrow
    previewId: Schema.String,
    mfaCode: Schema.String,
  })
{}

export const transferFromCoinbaseMfa = HttpApiEndpoint
  .post("transferFromCoinbaseMfa")`/transfer_from_coinbase_mfa`
  .setPayload(TransferFromCoinbaseMfaPayload)
  .addSuccess(ExecuteTransferResponse)
