import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import { user } from "./user";

const expense_status = pgEnum("expense_status", ["accepted", "rejected"]);

export const expense = pgTable("expense", {
  id: serial("id").primaryKey(),

  user_id: integer("user_id")
    .references(() => user.id)
    .notNull(),

  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  amount: integer("amount").notNull(),
  status: expense_status("status").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});
