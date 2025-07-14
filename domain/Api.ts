import { BrokerType, ExecuteTransferResponse } from "@1b1/experimental_client/Generated"
import * as HttpApi from "@effect/platform/HttpApi"
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint"
import * as HttpApiError from "@effect/platform/HttpApiError"
import * as HttpApiGroup from "@effect/platform/HttpApiGroup"
import * as Schema from "effect/Schema"
import { ApiError } from "./common.ts"

export class Api extends HttpApi.make("api").add(
  HttpApiGroup
    .make("v1")
    .add(
      HttpApiEndpoint
        .get("getUserInfo")`/get_user_info`
        .addSuccess(Schema.Struct({
          coinbase: Schema.Struct({
            connected: Schema.Boolean,
            balance: Schema.Number,
          }),
          metamask: Schema.Struct({
            connected: Schema.Boolean,
            balance: Schema.Number,
          }),
        })),
    )
    .add(
      HttpApiEndpoint
        .post("saveCoinbaseTokens")`/save_coinbase_tokens`
        .setPayload(Schema.Struct({
          accessToken: Schema.String,
          refreshToken: Schema.String,
        })),
    )
    .add(
      HttpApiEndpoint
        .post("saveMetamaskToken")`/save_metamask_token`
        .setPayload(Schema.Struct({
          accessToken: Schema.String,
        })),
    )
    .add(
      HttpApiEndpoint
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
        )),
    )
    .add(
      HttpApiEndpoint
        .post("transferFromCoinbaseMfa")`/transfer_from_coinbase_mfa`
        .setPayload(Schema.Struct({
          accessToken: Schema.Redacted(Schema.String),
          brokerType: BrokerType,
          previewId: Schema.String,
          mfaCode: Schema.String,
        }))
        .addSuccess(ExecuteTransferResponse),
    )
    .add(
      HttpApiEndpoint
        .post("createLinkToken")`/create_link_token`
        .setPayload(Schema.Union(
          Schema.TaggedStruct("metamask", {}),
          Schema.TaggedStruct("coinbase", {}),
        ))
        .addSuccess(Schema.String),
    )
    .prefix("/v1")
    .addError(HttpApiError.Unauthorized)
    .addError(ApiError),
) {}
