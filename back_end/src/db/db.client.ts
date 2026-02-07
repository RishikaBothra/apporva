import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import postgres from "postgres";
import { env } from "src/config/env";

let dbInstance: NodePgDatabase | null = null;

export const db = (): NodePgDatabase => {
    if (!dbInstance) {
        const sql = postgres(env.DATABASE_URL);
        dbInstance = drizzle(sql);
    }
    return dbInstance;
};
