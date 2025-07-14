import * as HttpApiBuilder from "@effect/platform/HttpApiBuilder"
import * as Config from "effect/Config"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"

export const CorsLive = Layer.unwrapEffect(
  Config.string("APP_URL").pipe(
    Effect.map((url) =>
      HttpApiBuilder.middlewareCors({
        allowedOrigins: [url],
        allowedMethods: ["DELETE", "GET", "OPTIONS", "PATCH", "POST", "PUT"],
        allowedHeaders: ["Content-Type", "Authorization", "B3", "traceparent"],
        credentials: true,
      })
    ),
  ),
)
