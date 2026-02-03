import { getRouteApi, Link, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import { GoogleOAuthButton, OAuthDivider } from "../google-oauth-button";
import { AuthFormLayout } from "./auth-form-layout";
import { useAppForm } from "./use-app-form";

const authRoute = getRouteApi("/_auth");

export function SignInForm() {
	const { redirect } = authRoute.useSearch();
	const navigate = useNavigate();
	const { t } = useTranslation("auth");

	const form = useAppForm({
		defaultValues: {
			identifier: "",
			password: "",
		},
		onSubmit: async ({ value }) => {
			const isEmail = value.identifier.includes("@");
			const result = isEmail
				? await authClient.signIn.email({
						email: value.identifier,
						password: value.password,
					})
				: await authClient.signIn.username({
						username: value.identifier,
						password: value.password,
					});

			if (result.error) {
				toast.error(result.error.message || result.error.statusText);
				return;
			}
			navigate({ to: redirect });
			toast.success(t("signIn.success"));
		},
	});

	return (
		<AuthFormLayout
			title={t("signIn.title")}
			footer={
				<div className="flex flex-col items-center gap-1">
					<Link to="/otp" search={true} className="text-indigo-600 text-sm hover:text-indigo-800">
						{t("signIn.otpLogin")}
					</Link>
					<Link to="/sign-up" search={true} className="text-indigo-600 text-sm hover:text-indigo-800">
						{t("signIn.switchToSignUp")}
					</Link>
				</div>
			}
		>
			<GoogleOAuthButton redirect={redirect} />
			<OAuthDivider />

			<form
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
				className="space-y-4"
			>
				<form.AppField name="identifier">
					{(field) => <field.TextField label={t("signIn.email")} autoComplete="username" />}
				</form.AppField>

				<form.AppField name="password">
					{(field) => <field.PasswordField label={t("signIn.password")} autoComplete="current-password" />}
				</form.AppField>

				<div className="flex justify-end">
					<Link to="/forgot-password" search={true} className="text-sm hover:underline">
						{t("signIn.forgotPassword")}
					</Link>
				</div>

				<form.AppForm>
					<form.SubmitButton label={t("signIn.submit")} submittingLabel={t("signIn.submitting")} />
				</form.AppForm>
			</form>
		</AuthFormLayout>
	);
}
