import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core"
import { Pk } from "./tables_common/Pk.ts"
import { users } from "./users.ts"

export const meshAccessTokens = pgTable("mesh_access_tokens", {
  id: Pk(),
  userId: integer().notNull().references(() => users.id),
  token: text().notNull(),
  expiresAt: timestamp().notNull(),
  refresh: text(),
})
