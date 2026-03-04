import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

const sql = connectionString ? postgres(connectionString, { prepare: false }) : null;

export const db = sql ? drizzle(sql, { schema }) : null;
