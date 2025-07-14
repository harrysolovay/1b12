import * as BunContext from "@effect/platform-bun/BunContext"
import * as Command from "@effect/platform/Command"
import * as FetchHttpClient from "@effect/platform/FetchHttpClient"
import * as FileSystem from "@effect/platform/FileSystem"
import * as HttpClient from "@effect/platform/HttpClient"
import * as HttpClientRequest from "@effect/platform/HttpClientRequest"
import * as HttpClientResponse from "@effect/platform/HttpClientResponse"
import * as Console from "effect/Console"
import * as Effect from "effect/Effect"

const OPENAPI_SPEC_PATH = "experimental_client/openapi.json"

await Effect.gen(function*() {
  yield* Console.log("Generating `experimental_client/Generated.ts`.")
  const client = yield* HttpClient.HttpClient
  const spec = yield* HttpClientRequest.get("https://integration-api.meshconnect.com/swagger/v1/swagger.json").pipe(
    HttpClientRequest.accept("text/plain"),
    client.execute,
    Effect.flatMap(HttpClientResponse.filterStatusOk),
    Effect.flatMap((v) => v.text),
  )
  const fs = yield* FileSystem.FileSystem
  yield* fs.writeFileString(OPENAPI_SPEC_PATH, spec)
  const code = yield* Command.string(
    Command.make(`./node_modules/.bin/openapi-gen`, "-s", OPENAPI_SPEC_PATH),
  )
  yield* fs.writeFileString("experimental_client/Generated.ts", code)
}).pipe(
  Effect.provide(BunContext.layer),
  Effect.provide(FetchHttpClient.layer),
  Effect.runPromise,
)
