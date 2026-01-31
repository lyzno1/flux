import { env } from "@flux/env/server";
import { drizzle } from "drizzle-orm/node-postgres";

import * as schema from "./schema";

export const db: ReturnType<typeof drizzle<typeof schema>> = drizzle(
	env.DATABASE_URL,
	{ schema },
);
