import { env } from "@flux/env/web";
import { emailOTPClient, oneTapClient, usernameClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
	baseURL: env.VITE_SERVER_URL,
	fetchOptions: {
		credentials: "include",
	},
	plugins: [
		usernameClient(),
		emailOTPClient(),
		...(import.meta.env.PROD && env.VITE_GOOGLE_CLIENT_ID
			? [oneTapClient({ clientId: env.VITE_GOOGLE_CLIENT_ID })]
			: []),
	],
});
