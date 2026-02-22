import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { authClient } from "@/lib/auth/client";
import { createEmailSchema } from "@/lib/auth/validation";
import { AuthFormLayout } from "./auth-form-layout";
import { AUTH_PRIMARY_SUBMIT_BUTTON_CLASS, AuthFooterLinkRow } from "./auth-form-primitives";
import { useAppForm } from "./use-app-form";

export function ForgotPasswordForm() {
	const navigate = useNavigate();
	const { t } = useTranslation("auth");

	const form = useAppForm({
		defaultValues: { email: "" },
		onSubmit: async ({ value }) => {
			const result = await authClient.emailOtp.sendVerificationOtp({
				email: value.email,
				type: "forget-password",
			});
			if (result.error) {
				toast.error(result.error.message || result.error.statusText);
				return;
			}
			toast.success(t("forgotPassword.success"));
			navigate({ to: "/reset-password", search: (prev) => ({ ...prev, email: value.email }) });
		},
	});

	return (
		<AuthFormLayout
			title={t("forgotPassword.title")}
			description={t("forgotPassword.description")}
			footer={
				<AuthFooterLinkRow prefix={t("forgotPassword.backPrefix")} to="/login" label={t("forgotPassword.back")} />
			}
		>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
				className="space-y-4"
			>
				<form.AppField name="email" validators={{ onBlur: createEmailSchema(t("validation.emailInvalid")) }}>
					{(field) => (
						<field.IconEmailField
							label={t("forgotPassword.email")}
							placeholder="name@example.com"
							autoComplete="email"
						/>
					)}
				</form.AppField>

				<form.AppForm>
					<form.SubmitButton
						label={t("forgotPassword.submit")}
						submittingLabel={t("forgotPassword.submitting")}
						className={AUTH_PRIMARY_SUBMIT_BUTTON_CLASS}
					/>
				</form.AppForm>
			</form>
		</AuthFormLayout>
	);
}
