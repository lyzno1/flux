import { getRouteApi, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import { Button } from "../ui/button";
import { useAppForm } from "./use-app-form";

const authRoute = getRouteApi("/_auth");

export function VerifyEmailForm({ email }: { email: string }) {
	const { redirect } = authRoute.useSearch();
	const navigate = useNavigate();
	const { t } = useTranslation("auth");

	const form = useAppForm({
		defaultValues: { otp: "" },
		onSubmit: async ({ value }) => {
			const result = await authClient.emailOtp.verifyEmail({
				email,
				otp: value.otp,
			});
			if (result.error) {
				toast.error(result.error.message || result.error.statusText);
				return;
			}
			toast.success(t("verifyEmail.success"));
			navigate({ to: redirect });
		},
	});

	async function handleResend() {
		const result = await authClient.emailOtp.sendVerificationOtp({
			email,
			type: "email-verification",
		});
		if (result.error) {
			toast.error(result.error.message || result.error.statusText);
			return;
		}
		toast.success(t("verifyEmail.resent"));
	}

	return (
		<div className="mx-auto mt-10 w-full max-w-md p-6">
			<h1 className="mb-6 text-pretty text-center font-bold text-3xl">{t("verifyEmail.title")}</h1>
			<p className="mb-6 text-center text-muted-foreground text-sm">{t("verifyEmail.description")}</p>

			<form
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
				className="space-y-4"
			>
				<form.AppField name="otp">{(field) => <field.OTPField label={t("verifyEmail.otp")} />}</form.AppField>

				<form.AppForm>
					<form.SubmitButton label={t("verifyEmail.submit")} submittingLabel={t("verifyEmail.submitting")} />
				</form.AppForm>
			</form>

			<div className="mt-4 text-center">
				<Button variant="link" onClick={handleResend} className="text-indigo-600 hover:text-indigo-800">
					{t("verifyEmail.resend")}
				</Button>
			</div>
		</div>
	);
}
