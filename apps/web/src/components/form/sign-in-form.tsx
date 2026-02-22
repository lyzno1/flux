import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Mail } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { useAuthRedirect } from "@/hooks/use-auth-redirect";
import { authClient } from "@/lib/auth-client";
import { createRequiredSchema } from "@/lib/auth-validation";
import { GoogleOAuthButton, OAuthDivider } from "../google-oauth-button";
import { AuthFormLayout } from "./auth-form-layout";
import {
	AUTH_MUTED_TEXT_LINK_CLASS,
	AUTH_PRIMARY_SUBMIT_BUTTON_CLASS,
	AuthFooterLinkRow,
} from "./auth-form-primitives";
import { useAppForm } from "./use-app-form";

type SignInError = {
	message?: string;
	status?: number;
	statusText: string;
};

function isForbiddenSignInError(error: SignInError) {
	return error.status === 403 || error.statusText === "Forbidden";
}

export function SignInForm() {
	const redirect = useAuthRedirect();
	const navigate = useNavigate();
	const { t } = useTranslation("auth");

	const showSignInError = (error: Pick<SignInError, "message" | "statusText">) => {
		toast.error(error.message || error.statusText);
	};

	const handleEmailVerificationRequired = async (email: string) => {
		const verificationOtpResult = await authClient.emailOtp.sendVerificationOtp({
			email,
			type: "email-verification",
		});
		if (verificationOtpResult.error) {
			showSignInError(verificationOtpResult.error);
			return;
		}
		toast.error(t("signIn.verifyEmailRequired"));
		navigate({
			to: "/verify-email",
			search: (prev) => ({ ...prev, email }),
		});
	};

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

			if (!result.error) {
				navigate({ to: redirect });
				toast.success(t("signIn.success"));
				return;
			}

			if (!isForbiddenSignInError(result.error as SignInError)) {
				showSignInError(result.error);
				return;
			}

			if (!isEmail) {
				toast.error(t("signIn.verifyEmailRequiredUsername"));
				return;
			}

			await handleEmailVerificationRequired(value.identifier);
		},
	});

	return (
		<AuthFormLayout
			title={t("signIn.title")}
			description={t("signIn.description")}
			footer={<AuthFooterLinkRow prefix={t("signIn.noAccount")} to="/sign-up" label={t("signIn.switchToSignUp")} />}
		>
			<GoogleOAuthButton redirect={redirect} />
			<OAuthDivider />

			<form
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
				className="space-y-5"
			>
				<form.AppField name="identifier" validators={{ onSubmit: createRequiredSchema(t("validation.required")) }}>
					{(field) => (
						<field.IconTextField
							label={t("signIn.email")}
							placeholder="name@example.com"
							autoComplete="username"
							icon={<Mail />}
						/>
					)}
				</form.AppField>

				<div className="space-y-1.5">
					<form.AppField name="password" validators={{ onSubmit: createRequiredSchema(t("validation.required")) }}>
						{(field) => (
							<field.IconPasswordField
								label={t("signIn.password")}
								placeholder="Enter your password"
								autoComplete="current-password"
								toggleLabels={{ show: t("password.show"), hide: t("password.hide") }}
								labelExtra={
									<Link to="/forgot-password" search={true} className={AUTH_MUTED_TEXT_LINK_CLASS}>
										{t("signIn.forgotPassword")}
									</Link>
								}
							/>
						)}
					</form.AppField>
					<div className="flex justify-end">
						<Link to="/otp" search={true} className={AUTH_MUTED_TEXT_LINK_CLASS}>
							{t("signIn.otpLogin")}
						</Link>
					</div>
				</div>

				<form.AppForm>
					<form.SubmitButton
						label={t("signIn.submit")}
						submittingLabel={t("signIn.submitting")}
						className={AUTH_PRIMARY_SUBMIT_BUTTON_CLASS}
					>
						<ArrowRight />
					</form.SubmitButton>
				</form.AppForm>
			</form>
		</AuthFormLayout>
	);
}
