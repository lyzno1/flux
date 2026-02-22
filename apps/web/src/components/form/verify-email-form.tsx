import { useNavigate } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { useAuthRedirect } from "@/hooks/use-auth-redirect";
import { authClient } from "@/lib/auth-client";
import { createOtpSchema } from "@/lib/auth-validation";
import { Button } from "../ui/button";
import { AuthFormLayout } from "./auth-form-layout";
import { AUTH_PRIMARY_SUBMIT_BUTTON_CLASS } from "./auth-form-primitives";
import { useAppForm } from "./use-app-form";

const RESEND_COOLDOWN = 60;

export function VerifyEmailForm({ email }: { email: string }) {
	const redirect = useAuthRedirect();
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
					className="h-auto p-0 font-semibold text-[13px] hover:underline disabled:text-muted-foreground disabled:no-underline"
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
				className="space-y-5"
			>
				<form.AppField name="otp" validators={{ onBlur: createOtpSchema(t("validation.otpLength")) }}>
					{(field) => <field.OTPField label={t("verifyEmail.otp")} />}
				</form.AppField>

				<form.AppForm>
					<form.SubmitButton
						label={t("verifyEmail.submit")}
						submittingLabel={t("verifyEmail.submitting")}
						className={AUTH_PRIMARY_SUBMIT_BUTTON_CLASS}
					>
						<ArrowRight />
					</form.SubmitButton>
				</form.AppForm>
			</form>
		</AuthFormLayout>
	);
}
