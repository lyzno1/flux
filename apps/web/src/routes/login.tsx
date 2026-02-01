import { createFileRoute, isRedirect, redirect } from "@tanstack/react-router";
import { useState } from "react";
import * as z from "zod";

import { SignInForm } from "@/components/form/sign-in-form";
import { SignUpForm } from "@/components/form/sign-up-form";
import { authClient } from "@/lib/auth-client";

const loginSearchSchema = z.object({
	redirect: z
		.string()
		.default("/dashboard")
		.catch("/dashboard")
		.transform((v) => (v.startsWith("/") && !v.startsWith("//") ? v : "/dashboard")),
});

export const Route = createFileRoute("/login")({
	validateSearch: loginSearchSchema,
	beforeLoad: async ({ context, search }) => {
		try {
			const session = context.auth.data ?? (await authClient.getSession()).data;
			if (session) {
				throw redirect({ to: search.redirect });
			}
		} catch (error) {
			if (isRedirect(error)) throw error;
		}
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { redirect } = Route.useSearch();
	const [showSignIn, setShowSignIn] = useState(false);

	return showSignIn ? (
		<SignInForm onSwitchToSignUp={() => setShowSignIn(false)} redirect={redirect} />
	) : (
		<SignUpForm onSwitchToSignIn={() => setShowSignIn(true)} redirect={redirect} />
	);
}
