import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import * as z from "zod";

import SignInForm from "@/components/sign-in-form";
import SignUpForm from "@/components/sign-up-form";
import { authClient } from "@/lib/auth-client";

const loginSearchSchema = z.object({
	redirect: z
		.string()
		.catch("/dashboard")
		.transform((v) => (v.startsWith("/") && !v.startsWith("//") ? v : "/dashboard")),
});

export const Route = createFileRoute("/login")({
	validateSearch: (search) => loginSearchSchema.parse(search),
	beforeLoad: async ({ search }) => {
		const session = await authClient.getSession();
		if (session.data) {
			throw redirect({ to: search.redirect });
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
