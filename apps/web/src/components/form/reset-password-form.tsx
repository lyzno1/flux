import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import { createOtpSchema, createPasswordSchema } from "@/lib/auth-validation";
import { AuthFormLayout } from "./auth-form-layout";
import { AUTH_PRIMARY_SUBMIT_BUTTON_CLASS, AuthFooterLinkRow } from "./auth-form-primitives";
import { useAppForm } from "./use-app-form";

export function ResetPasswordForm({ email }: { email: string }) {
	const navigate = useNavigate();
	const { t } = useTranslation("auth");

	const form = useAppForm({
		defaultValues: {
			otp: "",
			password: "",
		},
		onSubmit: async ({ value }) => {
			const result = await authClient.emailOtp.resetPassword({
				email,
				otp: value.otp,
				password: value.password,
			});
			if (result.error) {
				toast.error(result.error.message || result.error.statusText);
				return;
			}
			toast.success(t("resetPassword.success"));
			navigate({ to: "/login", search: true });
		},
	});

	return (
		<AuthFormLayout
			title={t("resetPassword.title")}
			description={t("resetPassword.description")}
			footer={<AuthFooterLinkRow prefix={t("resetPassword.backPrefix")} to="/login" label={t("resetPassword.back")} />}
		>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
				className="space-y-4"
			>
				<form.AppField name="otp" validators={{ onBlur: createOtpSchema(t("validation.otpLength")) }}>
					{(field) => <field.OTPField label={t("resetPassword.otp")} />}
				</form.AppField>

				<form.AppField name="password" validators={{ onBlur: createPasswordSchema(t("validation.passwordMin")) }}>
					{(field) => (
						<field.IconPasswordField
							label={t("resetPassword.password")}
							autoComplete="new-password"
							toggleLabels={{ show: t("password.show"), hide: t("password.hide") }}
						/>
					)}
				</form.AppField>

				<form.AppForm>
					<form.SubmitButton
						label={t("resetPassword.submit")}
						submittingLabel={t("resetPassword.submitting")}
						className={AUTH_PRIMARY_SUBMIT_BUTTON_CLASS}
					/>
				</form.AppForm>
			</form>
		</AuthFormLayout>
	);
}
