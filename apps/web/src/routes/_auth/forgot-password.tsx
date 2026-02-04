import { createFileRoute } from "@tanstack/react-router";

import { ForgotPasswordForm } from "@/components/form/forgot-password-form";

export const Route = createFileRoute("/_auth/forgot-password")({
	component: () => <ForgotPasswordForm />,
});
