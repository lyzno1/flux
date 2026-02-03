import { Link, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import { AuthFormLayout } from "./auth-form-layout";
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
			navigate({ to: "/reset-password", search: { email: value.email } });
		},
	});

	return (
		<AuthFormLayout
			title={t("forgotPassword.title")}
			footer={
				<Link to="/login" className="text-indigo-600 text-sm hover:text-indigo-800">
					{t("forgotPassword.back")}
				</Link>
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
				<form.AppField name="email">
					{(field) => <field.EmailField label={t("forgotPassword.email")} autoComplete="email" />}
				</form.AppField>

				<form.AppForm>
					<form.SubmitButton label={t("forgotPassword.submit")} submittingLabel={t("forgotPassword.submitting")} />
				</form.AppForm>
			</form>
		</AuthFormLayout>
	);
}
