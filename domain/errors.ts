import * as Schema from "effect/Schema"

export class ApiError extends Schema.TaggedError<ApiError>("ApiError")("ApiError", {
  inner: Schema.Unknown.pipe(Schema.optional),
}) {}
