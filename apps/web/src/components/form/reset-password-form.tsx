import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import { Button } from "../ui/button";
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
			navigate({ to: "/login" });
		},
	});

	return (
		<div className="mx-auto mt-10 w-full max-w-md p-6">
			<h1 className="mb-6 text-pretty text-center font-bold text-3xl">{t("resetPassword.title")}</h1>

			<form
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
				className="space-y-4"
			>
				<form.AppField name="otp">{(field) => <field.OTPField label={t("resetPassword.otp")} />}</form.AppField>

				<form.AppField name="password">
					{(field) => <field.PasswordField label={t("resetPassword.password")} autoComplete="new-password" />}
				</form.AppField>

				<form.AppForm>
					<form.SubmitButton label={t("resetPassword.submit")} submittingLabel={t("resetPassword.submitting")} />
				</form.AppForm>
			</form>

			<div className="mt-4 text-center">
				<Button
					variant="link"
					onClick={() => navigate({ to: "/login" })}
					className="text-indigo-600 hover:text-indigo-800"
				>
					{t("resetPassword.back")}
				</Button>
			</div>
		</div>
	);
}
