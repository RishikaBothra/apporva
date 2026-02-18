import { pgTable, varchar, timestamp, serial, pgEnum } from "drizzle-orm/pg-core";
export const roleEnum = pgEnum("role", ["employee", "manager", "admin"]);

export const user = pgTable("user", {
    id: serial().primaryKey(),
    fullName: varchar("full_name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    password: varchar("password", { length: 60 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    role: roleEnum("role").notNull().default("employee"),
});
export type UserRole = (typeof roleEnum.enumValues)[number];