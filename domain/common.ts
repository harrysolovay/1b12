import * as Schema from "effect/Schema"

export class AccessTokenDetails extends Schema.Class<AccessTokenDetails>("TokenDetails")({
  accessToken: Schema.String,
  refreshToken: Schema.String,
}) {}
