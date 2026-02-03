import { createFileRoute } from "@tanstack/react-router";

import { OtpLoginForm } from "@/components/form/otp-login-form";

export const Route = createFileRoute("/_auth/otp")({
	component: () => <OtpLoginForm />,
});
