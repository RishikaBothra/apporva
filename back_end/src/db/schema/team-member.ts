import { pgTable, integer, timestamp } from "drizzle-orm/pg-core";
import { user } from "./user";
import { team } from "./team";

export const team_member = pgTable("team_member", {
  user_id: integer("user_id")
    .references(() => user.id)
    .notNull(),

  team_id: integer("team_id")
    .references(() => team.id)
    .notNull(),

  joined_date: timestamp("joined_date").defaultNow().notNull(),
});
