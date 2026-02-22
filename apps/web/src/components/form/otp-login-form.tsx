import { useNavigate } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { useAuthRedirect } from "@/hooks/use-auth-redirect";
import { authClient } from "@/lib/auth-client";
import { createEmailSchema, createOtpSchema } from "@/lib/auth-validation";
import { Button } from "../ui/button";
import { AuthFormLayout } from "./auth-form-layout";
import { AUTH_PRIMARY_SUBMIT_BUTTON_CLASS, AuthFooterLinkRow } from "./auth-form-primitives";
import { useAppForm } from "./use-app-form";

const RESEND_COOLDOWN = 60;

function handleChangeEmail(navigate: ReturnType<typeof useNavigate>) {
	navigate({
		to: "/otp",
		search: (prev) => {
			const { email: _email, ...rest } = prev as Record<string, unknown>;
			return rest;
		},
		replace: true,
	});
}

export function OtpLoginForm({ email }: { email?: string }) {
	const redirect = useAuthRedirect();
	const navigate = useNavigate();
	const { t } = useTranslation("auth");
	const [cooldown, setCooldown] = useState(0);

	useEffect(() => {
		if (cooldown <= 0) return;
		const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
		return () => clearTimeout(timer);
	}, [cooldown]);

	const emailForm = useAppForm({
		defaultValues: { email: "" },
		onSubmit: async ({ value }) => {
			const result = await authClient.emailOtp.sendVerificationOtp({
				email: value.email,
				type: "sign-in",
			});
			if (result.error) {
				toast.error(result.error.message || result.error.statusText);
				return;
			}
			toast.success(t("otpLogin.codeSent"));
			setCooldown(RESEND_COOLDOWN);
			navigate({ to: "/otp", search: (prev) => ({ ...prev, email: value.email }), replace: true });
		},
	});

	const otpForm = useAppForm({
		defaultValues: { otp: "" },
		onSubmit: async ({ value }) => {
			const result = await authClient.signIn.emailOtp({
				email: email ?? "",
				otp: value.otp,
			});
			if (result.error) {
				toast.error(result.error.message || result.error.statusText);
				return;
			}
			navigate({ to: redirect });
			toast.success(t("otpLogin.success"));
		},
	});

	async function handleResend() {
		if (!email) return;
		const result = await authClient.emailOtp.sendVerificationOtp({
			email,
			type: "sign-in",
		});
		if (result.error) {
			toast.error(result.error.message || result.error.statusText);
			return;
		}
		setCooldown(RESEND_COOLDOWN);
		toast.success(t("otpLogin.resent"));
	}

	if (email) {
		return (
			<AuthFormLayout
				title={t("otpLogin.title")}
				footer={<AuthFooterLinkRow prefix={t("otpLogin.backPrefix")} to="/login" label={t("otpLogin.back")} />}
			>
				<div className="flex items-center justify-between">
					<p className="text-[13px] text-muted-foreground">{t("otpLogin.sendingTo", { email })}</p>
					<Button
						variant="link"
						onClick={() => handleChangeEmail(navigate)}
						className="h-auto p-0 font-semibold text-[13px] hover:underline"
					>
						{t("otpLogin.changeEmail")}
					</Button>
				</div>

				<form
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						otpForm.handleSubmit();
					}}
					className="space-y-5"
				>
					<otpForm.AppField name="otp" validators={{ onBlur: createOtpSchema(t("validation.otpLength")) }}>
						{(field) => <field.OTPField label={t("otpLogin.otp")} />}
					</otpForm.AppField>

					<otpForm.AppForm>
						<otpForm.SubmitButton
							label={t("otpLogin.submit")}
							submittingLabel={t("otpLogin.submitting")}
							className={AUTH_PRIMARY_SUBMIT_BUTTON_CLASS}
						>
							<ArrowRight />
						</otpForm.SubmitButton>
					</otpForm.AppForm>
				</form>

				<div className="text-center">
					<Button
						variant="link"
						onClick={handleResend}
						disabled={cooldown > 0}
						className="h-auto p-0 font-semibold text-[13px] hover:underline disabled:text-muted-foreground disabled:no-underline"
					>
						{cooldown > 0 ? t("otpLogin.cooldown", { seconds: cooldown }) : t("otpLogin.resend")}
					</Button>
				</div>
			</AuthFormLayout>
		);
	}

	return (
		<AuthFormLayout
			title={t("otpLogin.title")}
			description={t("otpLogin.description")}
			footer={<AuthFooterLinkRow prefix={t("otpLogin.backPrefix")} to="/login" label={t("otpLogin.back")} />}
		>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					emailForm.handleSubmit();
				}}
				className="space-y-5"
			>
				<emailForm.AppField name="email" validators={{ onBlur: createEmailSchema(t("validation.emailInvalid")) }}>
					{(field) => (
						<field.IconEmailField label={t("otpLogin.email")} placeholder="name@example.com" autoComplete="email" />
					)}
				</emailForm.AppField>

				<emailForm.AppForm>
					<emailForm.SubmitButton
						label={t("otpLogin.sendCode")}
						submittingLabel={t("otpLogin.sendingCode")}
						className={AUTH_PRIMARY_SUBMIT_BUTTON_CLASS}
					>
						<ArrowRight />
					</emailForm.SubmitButton>
				</emailForm.AppForm>
			</form>
		</AuthFormLayout>
	);
}
