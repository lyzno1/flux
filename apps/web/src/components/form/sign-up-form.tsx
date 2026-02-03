import { getRouteApi, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import { GoogleOAuthButton, OAuthDivider } from "../google-oauth-button";
import { Button } from "../ui/button";
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
						navigate({ to: "/verify-email", search: { email: value.email } });
					},
					onError: (error) => {
						toast.error(error.error.message || error.error.statusText);
					},
				},
			);
		},
	});

	return (
		<div className="mx-auto mt-10 w-full max-w-md p-6">
			<h1 className="mb-6 text-pretty text-center font-bold text-3xl">{t("signUp.title")}</h1>

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
				<form.AppField name="name">
					{(field) => <field.TextField label={t("signUp.name")} autoComplete="name" />}
				</form.AppField>

				<form.AppField name="username">
					{(field) => <field.TextField label={t("signUp.username")} autoComplete="username" />}
				</form.AppField>

				<form.AppField name="email">
					{(field) => <field.EmailField label={t("signUp.email")} autoComplete="email" />}
				</form.AppField>

				<form.AppField name="password">
					{(field) => <field.PasswordField label={t("signUp.password")} autoComplete="new-password" />}
				</form.AppField>

				<form.AppForm>
					<form.SubmitButton label={t("signUp.submit")} submittingLabel={t("signUp.submitting")} />
				</form.AppForm>
			</form>

			<div className="mt-4 text-center">
				<Button
					variant="link"
					onClick={() => navigate({ to: "/login" })}
					className="text-indigo-600 hover:text-indigo-800"
				>
					{t("signUp.switchToSignIn")}
				</Button>
			</div>
		</div>
	);
}
