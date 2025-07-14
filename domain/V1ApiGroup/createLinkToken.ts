import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint"
import * as Schema from "effect/Schema"

export const createLinkToken = HttpApiEndpoint
  .post("createLinkToken")`/create_link_token`
  .setPayload(Schema.Union(
    Schema.TaggedStruct("metamask", {}),
    Schema.TaggedStruct("coinbase", {}),
  ))
  .addSuccess(Schema.String)
