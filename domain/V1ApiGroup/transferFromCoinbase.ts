import { BrokerType, ExecuteTransferResponse } from "@1b1/experimental_client/Generated"
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint"
import * as Schema from "effect/Schema"

export class TransferFromCoinbasePayload
  extends Schema.Class<TransferFromCoinbasePayload>("TransferFromCoinbasePayload")({
    accessToken: Schema.Redacted(Schema.String),
    brokerType: BrokerType,
    amount: Schema.Number,
  })
{}

export const transferFromCoinbase = HttpApiEndpoint
  .post("transferFromCoinbase")`/transfer_from_coinbase`
  .setPayload(TransferFromCoinbasePayload)
  .addSuccess(ExecuteTransferResponse)
