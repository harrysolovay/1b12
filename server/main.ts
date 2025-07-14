import { Api } from "@1b1/domain"
import * as NodeSdk from "@effect/opentelemetry/NodeSdk"
import * as BunHttpServer from "@effect/platform-bun/BunHttpServer"
import * as FetchHttpClient from "@effect/platform/FetchHttpClient"
import * as HttpApiBuilder from "@effect/platform/HttpApiBuilder"
import * as HttpApiSwagger from "@effect/platform/HttpApiSwagger"
import * as HttpServer from "@effect/platform/HttpServer"
import * as PgDrizzle from "@effect/sql-drizzle/Pg"
import * as PgClient from "@effect/sql-pg/PgClient"
import { BatchSpanProcessor, ConsoleSpanExporter } from "@opentelemetry/sdk-trace-base"
import * as Config from "effect/Config"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import { ConfigService } from "./ConfigService.ts"
import { V1ApiGroupLive } from "./V1Live.ts"

// TODO: enable
const _OtelLive = NodeSdk.layer(() => ({
  resource: { serviceName: "example" },
  spanProcessor: new BatchSpanProcessor(new ConsoleSpanExporter()),
}))

const CorsLive = Layer.unwrapEffect(
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

HttpApiBuilder.serve().pipe(
  HttpServer.withLogAddress,
  Layer.provide(CorsLive),
  Layer.provide(HttpApiBuilder.middlewareCors()),
  Layer.provide(HttpApiSwagger.layer()),
  // Layer.provide(OtelLive),
  Layer.provide(
    HttpApiBuilder.api(Api).pipe(
      Layer.provide(V1ApiGroupLive),
    ),
  ),
  Layer.provide(ConfigService.Default),
  Layer.provide(FetchHttpClient.layer),
  Layer.provide(BunHttpServer.layer({
    port: 3000,
  })),
  Layer.provide(FetchHttpClient.layer),
  Layer.provide(PgDrizzle.layer.pipe(
    Layer.provide(PgClient.layerConfig({
      url: Config.redacted("DATABASE_URL"),
    })),
  )),
  Layer.launch,
  Effect.runPromise,
)
