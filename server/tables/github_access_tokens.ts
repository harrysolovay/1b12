import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core"
import { users } from "./users.ts"

export const githubOauthTokens = pgTable("github_oauth_tokens", {
  id: integer().notNull().references(() => users.id),
  token: text().notNull(),
  expiresAt: timestamp().notNull(),
  refreshToken: text().notNull(),
  refreshTokenExpiresAt: timestamp().notNull(),
})
