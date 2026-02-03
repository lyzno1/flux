import { createFileRoute, isRedirect, redirect } from "@tanstack/react-router";
import { useState } from "react";
import * as z from "zod";

import { ForgotPasswordForm } from "@/components/form/forgot-password-form";
import { OtpLoginForm } from "@/components/form/otp-login-form";
import { ResetPasswordForm } from "@/components/form/reset-password-form";
import { SignInForm } from "@/components/form/sign-in-form";
import { SignUpForm } from "@/components/form/sign-up-form";
import { VerifyEmailForm } from "@/components/form/verify-email-form";
import { PageLoading } from "@/components/page-loading";
import { authClient } from "@/lib/auth-client";

type AuthView = "sign-in" | "sign-up" | "otp-login" | "verify-email" | "forgot-password" | "reset-password";

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
	const { isPending } = authClient.useSession();
	const [view, setView] = useState<AuthView>("sign-in");
	const [email, setEmail] = useState("");

	if (isPending) {
		return <PageLoading />;
	}

	switch (view) {
		case "sign-in":
			return (
				<SignInForm
					onSwitchToSignUp={() => setView("sign-up")}
					onOtpLogin={() => setView("otp-login")}
					onForgotPassword={() => setView("forgot-password")}
					redirect={redirect}
				/>
			);
		case "sign-up":
			return (
				<SignUpForm
					onSwitchToSignIn={() => setView("sign-in")}
					onVerifyEmail={(e) => {
						setEmail(e);
						setView("verify-email");
					}}
					redirect={redirect}
				/>
			);
		case "otp-login":
			return <OtpLoginForm onBack={() => setView("sign-in")} redirect={redirect} />;
		case "verify-email":
			return <VerifyEmailForm email={email} redirect={redirect} />;
		case "forgot-password":
			return (
				<ForgotPasswordForm
					onBack={() => setView("sign-in")}
					onOtpSent={(e) => {
						setEmail(e);
						setView("reset-password");
					}}
				/>
			);
		case "reset-password":
			return <ResetPasswordForm email={email} onBack={() => setView("sign-in")} />;
	}
}
