import * as HttpApiGroup from "@effect/platform/HttpApiGroup"
import * as Schema from "effect/Schema"
import { ApiError } from "./errors.ts"
import { createLinkToken } from "./V1ApiGroup/createLinkToken.ts"
import { getCoinbaseBalance } from "./V1ApiGroup/getCoinbaseBalance.ts"
import { getNetworksAndIntegrations } from "./V1ApiGroup/getNetworksAndIntegrations.ts"
import { getWalletPortfolio } from "./V1ApiGroup/getWalletPortfolio.ts"
import { transferFromCoinbase } from "./V1ApiGroup/transferFromCoinbase.ts"
import { transferFromCoinbaseMfa } from "./V1ApiGroup/transferFromCoinbaseMfa.ts"

// TODO: use a Literal type instead / narrow
export class ConfigurePayload extends Schema.Class<ConfigurePayload>("ConfigurePayload")({
  brokerType: Schema.String,
  amount: Schema.Number,
}) {}

export class ConfigureSuccess extends Schema.Class<ConfigureSuccess>("ConfigureSuccess")({
  status: Schema.String,
}) {}

export const V1ApiGroup = HttpApiGroup
  .make("v1")
  .add(createLinkToken)
  .add(getCoinbaseBalance)
  .add(getNetworksAndIntegrations)
  .add(getWalletPortfolio)
  .add(transferFromCoinbase)
  .add(transferFromCoinbaseMfa)
  .prefix("/v1")
  .addError(ApiError)
