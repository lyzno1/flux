import { createFileRoute } from "@tanstack/react-router";

import { OtpLoginForm } from "@/components/form/otp-login-form";
import { optionalEmailSearchSchema } from "@/lib/auth-search-schema";

export const Route = createFileRoute("/_auth/otp")({
	validateSearch: optionalEmailSearchSchema,
	component: RouteComponent,
});

function RouteComponent() {
	const { email } = Route.useSearch();
	return <OtpLoginForm email={email} />;
}
