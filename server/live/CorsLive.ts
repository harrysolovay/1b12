import * as HttpApiBuilder from "@effect/platform/HttpApiBuilder"
import * as Config from "effect/Config"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"

export const CorsLive = Layer.unwrapEffect(
  Config.all({
    env: Config.literal("development", "production")("ENV"),
    url: Config.string("APP_URL"),
  }).pipe(
    Effect.map(({ env, url }) =>
      HttpApiBuilder.middlewareCors({
        allowedOrigins: [env === "development" ? "*" : url],
        allowedMethods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        allowedHeaders: ["Content-Type", "Authorization", "B3", "traceparent"],
        credentials: true,
      })
    ),
  ),
)
