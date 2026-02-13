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

export const expense = pgTable("expense", {
  id: serial("id").primaryKey(),

  userId: integer("user_id")
    .references(() => user.id)
    .notNull(),

  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  amount: integer("amount").notNull(),
  status: text("status", {
    enum: ["draft", "submitted", "accepted", "rejected"],
  })
    .notNull()
    .default("draft"),
    
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
