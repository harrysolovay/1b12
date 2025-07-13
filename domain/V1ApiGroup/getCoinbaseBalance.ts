import { BrokerType } from "@1b1/experimental_client/Generated"
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint"
import * as Schema from "effect/Schema"

export class GetCoinbaseBalancePayload extends Schema.Class<GetCoinbaseBalancePayload>("GetCoinbaseBalancePayload")({
  accessToken: Schema.Redacted(Schema.String),
  brokerType: BrokerType,
}) {}

export class GetCoinbaseBalanceSuccess extends Schema.Class<GetCoinbaseBalanceSuccess>("GetCoinbaseBalanceSuccess")({
  balance: Schema.Number,
}) {}

export const getCoinbaseBalance = HttpApiEndpoint
  .post("getCoinbaseBalance")`/get_coinbase_balance`
  .setPayload(GetCoinbaseBalancePayload)
  .addSuccess(GetCoinbaseBalanceSuccess)
