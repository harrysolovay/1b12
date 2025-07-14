import { Api } from "@1b1/domain"
import * as MeshClient from "@1b1/experimental_client/MeshClient"
import * as NodeSdk from "@effect/opentelemetry/NodeSdk"
import * as BunHttpServer from "@effect/platform-bun/BunHttpServer"
// import {layerHttpLayerRouter} from "@effect/platform/HttpApiScalar"
import * as FetchHttpClient from "@effect/platform/FetchHttpClient"
import * as HttpApiBuilder from "@effect/platform/HttpApiBuilder"
import * as HttpApiSwagger from "@effect/platform/HttpApiSwagger"
import * as HttpServer from "@effect/platform/HttpServer"
import { BatchSpanProcessor, ConsoleSpanExporter } from "@opentelemetry/sdk-trace-base"
import * as Config from "effect/Config"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import { ApiLive } from "./ApiLive.ts"
import { ConfigService } from "./ConfigService.ts"
import { MemoryDb } from "./MemoryDb.ts"

const OtelLive = NodeSdk.layer(() => ({
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
  Layer.provide(HttpApiSwagger.layer()),
  // Layer.provide(OtelLive),
  Layer.provide(
    HttpApiBuilder.api(Api).pipe(
      Layer.provide(ApiLive),
    ),
  ),
  Layer.provide(MeshClient.layerConfig({
    clientId: Config.string("VITE_MESH_CLIENT_ID"),
    secret: Config.redacted("MESH_SECRET"),
  })),
  Layer.provide(ConfigService.Default),
  Layer.provide(FetchHttpClient.layer),
  Layer.provide(BunHttpServer.layer({
    port: 3000,
  })),
  Layer.provide(FetchHttpClient.layer),
  Layer.provide(MemoryDb),
  Layer.launch,
  Effect.runPromise,
)
