import { getRouteApi, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import { createEmailSchema, createOtpSchema } from "@/lib/auth-validation";
import { Button } from "../ui/button";
import { AuthFormLayout } from "./auth-form-layout";
import { useAppForm } from "./use-app-form";

const authRoute = getRouteApi("/_auth");

const RESEND_COOLDOWN = 60;

export function OtpLoginForm({ email }: { email?: string }) {
	const { redirect } = authRoute.useSearch();
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

	function handleChangeEmail() {
		navigate({
			to: "/otp",
			search: (prev) => {
				const { email: _email, ...rest } = prev as Record<string, unknown>;
				return rest;
			},
			replace: true,
		});
	}

	return (
		<AuthFormLayout
			title={t("otpLogin.title")}
			footer={
				<Link to="/login" search={true} className="text-primary text-sm hover:text-primary/80">
					{t("otpLogin.back")}
				</Link>
			}
		>
			{!email ? (
				<form
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						emailForm.handleSubmit();
					}}
					className="space-y-4"
				>
					<emailForm.AppField name="email" validators={{ onBlur: createEmailSchema(t("validation.emailInvalid")) }}>
						{(field) => <field.EmailField label={t("otpLogin.email")} autoComplete="email" />}
					</emailForm.AppField>

					<emailForm.AppForm>
						<emailForm.SubmitButton label={t("otpLogin.sendCode")} submittingLabel={t("otpLogin.sendingCode")} />
					</emailForm.AppForm>
				</form>
			) : (
				<>
					<div className="mb-4 flex items-center justify-between">
						<p className="text-muted-foreground text-sm">{t("otpLogin.sendingTo", { email })}</p>
						<Button
							variant="link"
							onClick={handleChangeEmail}
							className="h-auto p-0 text-primary text-sm hover:text-primary/80"
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
						className="space-y-4"
					>
						<otpForm.AppField name="otp" validators={{ onBlur: createOtpSchema(t("validation.otpLength")) }}>
							{(field) => <field.OTPField label={t("otpLogin.otp")} />}
						</otpForm.AppField>

						<otpForm.AppForm>
							<otpForm.SubmitButton label={t("otpLogin.submit")} submittingLabel={t("otpLogin.submitting")} />
						</otpForm.AppForm>
					</form>
					<div className="mt-3 text-center">
						<Button
							variant="link"
							onClick={handleResend}
							disabled={cooldown > 0}
							className="text-primary text-sm hover:text-primary/80"
						>
							{cooldown > 0 ? t("otpLogin.cooldown", { seconds: cooldown }) : t("otpLogin.resend")}
						</Button>
					</div>
				</>
			)}
		</AuthFormLayout>
	);
}
