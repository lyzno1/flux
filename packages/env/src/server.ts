import "dotenv/config";
import { createEnv } from "@t3-oss/env-core";
import * as z from "zod";

export const env = createEnv({
	server: {
		DATABASE_URL: z.string().min(1),
		DB_POOL_MAX: z.coerce.number().int().positive().default(10),
		DB_POOL_IDLE_TIMEOUT: z.coerce.number().int().positive().default(30_000),
		BETTER_AUTH_SECRET: z.string().min(32),
		BETTER_AUTH_URL: z.url(),
		CORS_ORIGIN: z.url(),
		NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
		DIFY_API_URL: z.url().optional(),
		DIFY_API_KEY: z.string().min(1).optional(),
		GOOGLE_CLIENT_ID: z.string().min(1).optional(),
		GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),
		RESEND_API_KEY: z.string().min(1).optional(),
		RESEND_FROM_EMAIL: z.string().min(1).optional(),
	},
	runtimeEnv: process.env,
	emptyStringAsUndefined: true,
});
