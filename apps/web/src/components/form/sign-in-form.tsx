import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import { GoogleOAuthButton, OAuthDivider } from "../google-oauth-button";
import { PageLoading } from "../page-loading";
import { Button } from "../ui/button";
import { useAppForm } from "./use-app-form";

export function SignInForm({ onSwitchToSignUp, redirect }: { onSwitchToSignUp: () => void; redirect: string }) {
	const navigate = useNavigate();
	const { t } = useTranslation("auth");
	const { isPending } = authClient.useSession();

	const form = useAppForm({
		defaultValues: {
			email: "",
			password: "",
		},
		onSubmit: async ({ value }) => {
			await authClient.signIn.email(
				{
					email: value.email,
					password: value.password,
				},
				{
					onSuccess: () => {
						navigate({ to: redirect });
						toast.success(t("signIn.success"));
					},
					onError: (error) => {
						toast.error(error.error.message || error.error.statusText);
					},
				},
			);
		},
	});

	if (isPending) {
		return <PageLoading />;
	}

	return (
		<div className="mx-auto mt-10 w-full max-w-md p-6">
			<h1 className="mb-6 text-pretty text-center font-bold text-3xl">{t("signIn.title")}</h1>

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
				<form.AppField name="email">
					{(field) => <field.EmailField label={t("signIn.email")} autoComplete="email" />}
				</form.AppField>

				<form.AppField name="password">
					{(field) => <field.PasswordField label={t("signIn.password")} autoComplete="current-password" />}
				</form.AppField>

				<form.AppForm>
					<form.SubmitButton label={t("signIn.submit")} submittingLabel={t("signIn.submitting")} />
				</form.AppForm>
			</form>

			<div className="mt-4 text-center">
				<Button variant="link" onClick={onSwitchToSignUp} className="text-indigo-600 hover:text-indigo-800">
					{t("signIn.switchToSignUp")}
				</Button>
			</div>
		</div>
	);
}
