import { createFileRoute } from "@tanstack/react-router";

import { SignInForm } from "@/components/form/sign-in-form";

export const Route = createFileRoute("/_auth/login")({
	component: () => <SignInForm />,
});
