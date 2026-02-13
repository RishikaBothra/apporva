import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./user";
import { expense } from "./expense";

export const comment = pgTable("comment", {
  id: serial("id").primaryKey(),

  expense_id: integer("expense_id")
    .references(() => expense.id)
    .notNull(),

  user_id: integer("user_id")
    .references(() => user.id)
    .notNull(),

  content: text("content").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});
