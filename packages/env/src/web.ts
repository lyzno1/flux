import { createEnv } from "@t3-oss/env-core";
import * as z from "zod";

export const env = createEnv({
	clientPrefix: "VITE_",
	client: {
		VITE_SERVER_URL: z.url(),
		VITE_GOOGLE_CLIENT_ID: z.string().min(1).optional(),
	},
	// biome-ignore lint/suspicious/noExplicitAny: Vite import.meta.env typing
	runtimeEnv: (import.meta as any).env,
	emptyStringAsUndefined: true,
});
