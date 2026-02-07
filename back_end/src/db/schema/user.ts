import { pgTable, varchar, timestamp, serial } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: serial().primaryKey(),
    fullName: varchar("full_name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    password: varchar("password", { length: 60 }).notNull(),
    created_at: timestamp("created_at").defaultNow().notNull(),
    updated_at: timestamp("updated_at").defaultNow().notNull(),
    role: varchar("role", { length: 20 }).notNull(),
});
