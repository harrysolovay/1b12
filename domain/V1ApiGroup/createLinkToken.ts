import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint"
import * as Schema from "effect/Schema"

export class CreateLinkTokenPayload extends Schema.Class<CreateLinkTokenPayload>("CreateLinkTokenPayload")({
  userId: Schema.String,
  integrationId: Schema.String,
  enableTransfers: Schema.Boolean,
  transferOptions: Schema.Struct({
    toAddresses: Schema
      .Array(
        Schema.Struct({
          networkId: Schema.String,
          symbol: Schema.String,
          address: Schema.String,
        }),
      )
      .pipe(Schema.mutable),
  }).pipe(Schema.optional),
}) {}

export class CreateLinkTokenSuccess extends Schema.Class<CreateLinkTokenSuccess>("CreateLinkTokenSuccess")({
  linkToken: Schema.String,
}) {}

export const createLinkToken = HttpApiEndpoint
  .post("createLinkToken")`/create_link_token`
  .setPayload(CreateLinkTokenPayload)
  .addSuccess(CreateLinkTokenSuccess)
