import * as PgClient from "@effect/sql-pg/PgClient"
import * as Config from "effect/Config"
import * as Console from "effect/Console"
import * as Effect from "effect/Effect"

await Effect.gen(function*() {
  yield* Console.log("Register `uuid-ossp` extension.")
  const sql = yield* PgClient.PgClient
  yield* sql`CREATE EXTENSION if NOT EXISTS "uuid-ossp";`
}).pipe(
  Effect.provide(PgClient.layerConfig({
    url: Config.redacted("DATABASE_URL"),
  })),
  Effect.runPromise,
)
