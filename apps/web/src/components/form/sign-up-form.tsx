import { getRouteApi, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import { createEmailSchema, createNameSchema, createPasswordSchema, createUsernameSchema } from "@/lib/auth-validation";
import { GoogleOAuthButton, OAuthDivider } from "../google-oauth-button";
import { AuthFormLayout } from "./auth-form-layout";
import { AUTH_PRIMARY_SUBMIT_BUTTON_CLASS, AuthFooterLinkRow } from "./auth-form-primitives";
import { useAppForm } from "./use-app-form";

const authRoute = getRouteApi("/_auth");

export function SignUpForm() {
	const { redirect } = authRoute.useSearch();
	const navigate = useNavigate();
	const { t } = useTranslation("auth");

	const form = useAppForm({
		defaultValues: {
			name: "",
			username: "",
			email: "",
			password: "",
		},
		onSubmit: async ({ value }) => {
			await authClient.signUp.email(
				{
					email: value.email,
					password: value.password,
					name: value.name,
					username: value.username,
				},
				{
					onSuccess: () => {
						toast.success(t("signUp.success"));
						navigate({ to: "/verify-email", search: (prev) => ({ ...prev, email: value.email }) });
					},
					onError: (error) => {
						toast.error(error.error.message || error.error.statusText);
					},
				},
			);
		},
	});

	return (
		<AuthFormLayout
			title={t("signUp.title")}
			description={t("signUp.description")}
			footer={<AuthFooterLinkRow prefix={t("signUp.hasAccount")} to="/login" label={t("signUp.switchToSignIn")} />}
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
				<form.AppField name="name" validators={{ onBlur: createNameSchema(t("validation.nameMin")) }}>
					{(field) => <field.TextField label={t("signUp.name")} autoComplete="name" />}
				</form.AppField>

				<form.AppField
					name="username"
					validators={{
						onBlur: createUsernameSchema(t("validation.usernameMin"), t("validation.usernamePattern")),
					}}
				>
					{(field) => <field.TextField label={t("signUp.username")} autoComplete="username" />}
				</form.AppField>

				<form.AppField name="email" validators={{ onBlur: createEmailSchema(t("validation.emailInvalid")) }}>
					{(field) => (
						<field.IconEmailField label={t("signUp.email")} placeholder="name@example.com" autoComplete="email" />
					)}
				</form.AppField>

				<form.AppField name="password" validators={{ onBlur: createPasswordSchema(t("validation.passwordMin")) }}>
					{(field) => (
						<field.IconPasswordField
							label={t("signUp.password")}
							autoComplete="new-password"
							toggleLabels={{ show: t("password.show"), hide: t("password.hide") }}
						/>
					)}
				</form.AppField>

				<form.AppForm>
					<form.SubmitButton
						label={t("signUp.submit")}
						submittingLabel={t("signUp.submitting")}
						className={AUTH_PRIMARY_SUBMIT_BUTTON_CLASS}
					/>
				</form.AppForm>
			</form>
		</AuthFormLayout>
	);
}
