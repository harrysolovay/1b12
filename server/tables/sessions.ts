import { sql } from "drizzle-orm"
import { boolean, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core"
import { Pk } from "./tables_common/Pk.ts"
import { users } from "./users.ts"

export const sessions = pgTable("sessions", {
  id: Pk(),
  userId: integer().notNull().references(() => users.id),
  token_encoding: text().notNull(),
  expiry: timestamp({ withTimezone: true }).notNull().default(sql`now() + interval '1 month'`),
  loggedOut: boolean().default(false),
})
