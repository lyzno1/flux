import { createFileRoute } from "@tanstack/react-router";
import * as z from "zod";

import { OtpLoginForm } from "@/components/form/otp-login-form";

const searchSchema = z.object({
	email: z.string().email().optional().catch(undefined),
});

export const Route = createFileRoute("/_auth/otp")({
	validateSearch: searchSchema,
	component: RouteComponent,
});

function RouteComponent() {
	const { email } = Route.useSearch();
	return <OtpLoginForm email={email} />;
}
