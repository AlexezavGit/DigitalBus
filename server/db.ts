import dotenv from "dotenv";
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// If DATABASE_URL not set yet, load .env here.
const envPath = new URL("../.env", import.meta.url).pathname;
const result = dotenv.config({ path: envPath });
if (result.error) {
  console.warn("dotenv config in db.ts failed:", result.error);
}

neonConfig.webSocketConstructor = ws;

const databaseUrl = process.env.DATABASE_URL;
console.log("DB: DATABASE_URL:", databaseUrl);

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: databaseUrl });
export const db = drizzle({ client: pool, schema });