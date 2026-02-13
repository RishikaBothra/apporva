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
  managerId:integer("manager_id")
  .references(()=>user.id)
  .notNull()
  .unique(),
  createdBy: integer("created_by")
    .references(() => user.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
