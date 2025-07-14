import { Api } from "@1b1/domain"
import * as BunHttpServer from "@effect/platform-bun/BunHttpServer"
import * as FetchHttpClient from "@effect/platform/FetchHttpClient"
import * as HttpApiBuilder from "@effect/platform/HttpApiBuilder"
import * as HttpApiSwagger from "@effect/platform/HttpApiSwagger"
import * as HttpServer from "@effect/platform/HttpServer"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import { ConfigService } from "./ConfigService.ts"
import { CorsLive } from "./live/CorsLive.ts"
import { OtelLive } from "./live/OtelLive.ts"
import { V1ApiGroupLive } from "./live/V1ApiGroupLive.ts"

const ApiLive = HttpApiBuilder.api(Api).pipe(
  Layer.provide(V1ApiGroupLive),
)

HttpApiBuilder.serve().pipe(
  HttpServer.withLogAddress,
  Layer.provide(HttpApiBuilder.middlewareCors()),
  Layer.provide(HttpApiSwagger.layer()),
  // Layer.provide(OtelLive),
  Layer.provide(ApiLive),
  Layer.provide(CorsLive),
  Layer.provide(ConfigService.Default),
  Layer.provide(FetchHttpClient.layer),
  Layer.provide(BunHttpServer.layer({
    port: 3000,
  })),
  Layer.provide(FetchHttpClient.layer),
  Layer.launch,
  Effect.runPromise,
)
