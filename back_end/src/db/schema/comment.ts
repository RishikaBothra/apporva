import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./user";
import { expense } from "./expense";

export const comment = pgTable("comment", {
  id: serial("id").primaryKey(),

  expenseId: integer("expense_id")
    .references(() => expense.id)
    .notNull(),

  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),

  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
