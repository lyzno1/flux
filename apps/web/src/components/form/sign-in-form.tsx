import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import { GoogleOAuthButton, OAuthDivider } from "../google-oauth-button";
import { PageLoading } from "../page-loading";
import { Button } from "../ui/button";
import { useAppForm } from "./use-app-form";

export function SignInForm({
	onSwitchToSignUp,
	onOtpLogin,
	onForgotPassword,
	redirect,
}: {
	onSwitchToSignUp: () => void;
	onOtpLogin: () => void;
	onForgotPassword: () => void;
	redirect: string;
}) {
	const navigate = useNavigate();
	const { t } = useTranslation("auth");
	const { isPending } = authClient.useSession();

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
				<form.AppField name="identifier">
					{(field) => <field.TextField label={t("signIn.email")} autoComplete="username" />}
				</form.AppField>

				<form.AppField name="password">
					{(field) => <field.PasswordField label={t("signIn.password")} autoComplete="current-password" />}
				</form.AppField>

				<div className="flex justify-end">
					<Button type="button" variant="link" onClick={onForgotPassword} className="h-auto p-0 text-sm">
						{t("signIn.forgotPassword")}
					</Button>
				</div>

				<form.AppForm>
					<form.SubmitButton label={t("signIn.submit")} submittingLabel={t("signIn.submitting")} />
				</form.AppForm>
			</form>

			<div className="mt-4 flex flex-col items-center gap-1">
				<Button variant="link" onClick={onOtpLogin} className="text-indigo-600 hover:text-indigo-800">
					{t("signIn.otpLogin")}
				</Button>
				<Button variant="link" onClick={onSwitchToSignUp} className="text-indigo-600 hover:text-indigo-800">
					{t("signIn.switchToSignUp")}
				</Button>
			</div>
		</div>
	);
}
