import { getRouteApi, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import { Button } from "../ui/button";
import { AuthFormLayout } from "./auth-form-layout";
import { useAppForm } from "./use-app-form";

const authRoute = getRouteApi("/_auth");

const RESEND_COOLDOWN = 60;

export function VerifyEmailForm({ email }: { email: string }) {
	const { redirect } = authRoute.useSearch();
	const navigate = useNavigate();
	const { t } = useTranslation("auth");
	const [cooldown, setCooldown] = useState(0);

	useEffect(() => {
		if (cooldown <= 0) return;
		const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
		return () => clearTimeout(timer);
	}, [cooldown]);

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
		setCooldown(RESEND_COOLDOWN);
		toast.success(t("verifyEmail.resent"));
	}

	return (
		<AuthFormLayout
			title={t("verifyEmail.title")}
			description={t("verifyEmail.description", { email })}
			footer={
				<Button
					variant="link"
					onClick={handleResend}
					disabled={cooldown > 0}
					className="text-indigo-600 hover:text-indigo-800"
				>
					{cooldown > 0 ? t("verifyEmail.cooldown", { seconds: cooldown }) : t("verifyEmail.resend")}
				</Button>
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
				<form.AppField name="otp">{(field) => <field.OTPField label={t("verifyEmail.otp")} />}</form.AppField>

				<form.AppForm>
					<form.SubmitButton label={t("verifyEmail.submit")} submittingLabel={t("verifyEmail.submitting")} />
				</form.AppForm>
			</form>
		</AuthFormLayout>
	);
}
