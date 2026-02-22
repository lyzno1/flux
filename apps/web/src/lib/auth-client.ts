import { env } from "@flux/env/web";
import { emailOTPClient, usernameClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
	baseURL: env.VITE_SERVER_URL,
	fetchOptions: {
		credentials: "include",
	},
	plugins: [usernameClient(), emailOTPClient()],
});
