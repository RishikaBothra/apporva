import {
  integer,
  pgTable,
  timestamp,
  varchar,
  serial,
} from "drizzle-orm/pg-core";
import { users } from "./user";

export const team = pgTable("team", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  managerId: integer("manager_id")
    .references(() => users.id)
    .notNull()
    .unique(),
  createdBy: integer("created_by")
    .references(() => users.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),

});
