import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../db/schema/index";
import { env } from "../config/env";

let dbInstance: ReturnType<typeof drizzle> | null = null;

export const db = () => {
  if (!dbInstance) {
    const sql = postgres(env.DATABASE_URL);
    dbInstance = drizzle(sql, { schema });
  }

  return dbInstance;
};
