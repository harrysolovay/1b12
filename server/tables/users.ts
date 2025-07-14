import { integer, pgTable } from "drizzle-orm/pg-core"

export const users = pgTable("entities", {
  id: integer().primaryKey(),
})
