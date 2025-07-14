import { ExecuteTransferResponse, PreviewTransferResult } from "@1b1/experimental_client/Generated"
import * as HttpApi from "@effect/platform/HttpApi"
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint"
import * as HttpApiError from "@effect/platform/HttpApiError"
import * as HttpApiGroup from "@effect/platform/HttpApiGroup"
import * as Schema from "effect/Schema"
import { ApiError, FundsSource } from "./common.ts"

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
        .post("configureAndPreviewTransfer")`/configure_and_preview_transfer`
        .setPayload(Schema.Struct({
          source: FundsSource,
        }))
        .addSuccess(PreviewTransferResult),
    )
    .add(
      HttpApiEndpoint
        .post("executeTransfer")`/execute_transfer`
        .setPayload(Schema.Struct({
          source: FundsSource,
          previewId: Schema.String,
          mfaCode: Schema.String.pipe(Schema.optional),
        }))
        .addSuccess(ExecuteTransferResponse),
    )
    .add(
      HttpApiEndpoint
        .post("createLinkToken")`/create_link_token`
        .setPayload(Schema.Struct({
          source: FundsSource,
        }))
        .addSuccess(Schema.String),
    )
    .prefix("/v1")
    .addError(HttpApiError.Unauthorized)
    .addError(ApiError),
) {}
