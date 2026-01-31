import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";

import SignInForm from "@/components/sign-in-form";
import SignUpForm from "@/components/sign-up-form";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/login")({
	validateSearch: (search) => ({
		redirect: (search.redirect as string) || "/dashboard",
	}),
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
