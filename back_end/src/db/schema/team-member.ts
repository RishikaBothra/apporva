import { pgTable, integer, timestamp } from "drizzle-orm/pg-core";
import { user } from "./user";
import { team } from "./team";

export const teamMember = pgTable("team_member", {
  userId: integer("user_id")
    .references(() => user.id)
    .notNull(),

  teamId: integer("team_id")
    .references(() => team.id)
    .notNull(),

  joineDate: timestamp("joined_date").defaultNow().notNull(),
});
