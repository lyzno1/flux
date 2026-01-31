import { env } from "@flux/env/server";
import { drizzle } from "drizzle-orm/node-postgres";

import * as schema from "./schema";

export const db: ReturnType<typeof drizzle<typeof schema>> = drizzle({
	connection: {
		connectionString: env.DATABASE_URL,
		max: env.DB_POOL_MAX,
		min: 2,
		idleTimeoutMillis: env.DB_POOL_IDLE_TIMEOUT,
		connectionTimeoutMillis: 10_000,
		maxUses: 7500,
		maxLifetimeSeconds: 1800,
	},
	schema,
});
