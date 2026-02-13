import {
  integer,
  pgTable,
  timestamp,
  varchar,
  serial,
} from "drizzle-orm/pg-core";
import { user } from "./user";

export const team = pgTable("team", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  created_by: integer("created_by")
    .references(() => user.id)
    .notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});
