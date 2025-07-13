import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint"
import * as Schema from "effect/Schema"

export class GetWalletPortfolioPayload extends Schema.Class<GetWalletPortfolioPayload>("GetWalletPortfolioPayload")({
  accessToken: Schema.Redacted(Schema.String),
}) {}

export class GetWalletPortfolioSuccess extends Schema.Class<GetWalletPortfolioSuccess>("GetWalletPortfolioSuccess")({
  balance: Schema.Number,
}) {}

export const getWalletPortfolio = HttpApiEndpoint
  .post("getWalletPortfolio")`/get_wallet_portfolio`
  .setPayload(GetWalletPortfolioPayload)
  .addSuccess(GetWalletPortfolioSuccess)
