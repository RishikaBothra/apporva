import { pgTable, integer, timestamp } from "drizzle-orm/pg-core";
import { users } from "./user";
import { team } from "./team";

export const teamMember = pgTable("team_member", {
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),

  teamId: integer("team_id")
    .references(() => team.id)
    .notNull(),

  joineDate: timestamp("joined_date").defaultNow().notNull(),
});
