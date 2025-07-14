import { defineConfig } from "drizzle-kit"
import { Config, Effect, Redacted } from "effect"

export default defineConfig({
  schema: "server/tables/**/*.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: Redacted.value(
      Config.redacted("DATABASE_URL").pipe(Effect.runSync),
    ),
  },
  out: "migrations",
})
