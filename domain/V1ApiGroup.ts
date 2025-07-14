import { BrokerType } from "@1b1/experimental_client/Generated"
import * as HttpApiGroup from "@effect/platform/HttpApiGroup"
import * as Schema from "effect/Schema"
import { ApiError } from "./errors.ts"
import { createLinkToken } from "./V1ApiGroup/createLinkToken.ts"
import { getBalances } from "./V1ApiGroup/getBalances.ts"
import { refreshCoinbaseToken } from "./V1ApiGroup/refreshCoinbaseToken.ts"
import { transferFromCoinbase } from "./V1ApiGroup/transferFromCoinbase.ts"
import { transferFromCoinbaseMfa } from "./V1ApiGroup/transferFromCoinbaseMfa.ts"

export class ConfigurePayload extends Schema.Class<ConfigurePayload>("ConfigurePayload")({
  brokerType: BrokerType,
  amount: Schema.Number,
}) {}

export class ConfigureSuccess extends Schema.Class<ConfigureSuccess>("ConfigureSuccess")({
  status: Schema.String,
}) {}

export const V1ApiGroup = HttpApiGroup
  .make("v1")
  .add(createLinkToken)
  .add(getBalances)
  .add(transferFromCoinbase)
  .add(transferFromCoinbaseMfa)
  .add(refreshCoinbaseToken)
  .prefix("/v1")
  .addError(ApiError)
