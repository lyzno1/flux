import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import { Button } from "../ui/button";
import { useAppForm } from "./use-app-form";

export function OtpLoginForm({ onBack, redirect }: { onBack: () => void; redirect: string }) {
	const navigate = useNavigate();
	const { t } = useTranslation("auth");
	const [email, setEmail] = useState("");
	const [codeSent, setCodeSent] = useState(false);

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
			setEmail(value.email);
			setCodeSent(true);
			toast.success(t("otpLogin.codeSent"));
		},
	});

	const otpForm = useAppForm({
		defaultValues: { otp: "" },
		onSubmit: async ({ value }) => {
			const result = await authClient.signIn.emailOtp({
				email,
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

	return (
		<div className="mx-auto mt-10 w-full max-w-md p-6">
			<h1 className="mb-6 text-pretty text-center font-bold text-3xl">{t("otpLogin.title")}</h1>

			{!codeSent ? (
				<form
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						emailForm.handleSubmit();
					}}
					className="space-y-4"
				>
					<emailForm.AppField name="email">
						{(field) => <field.EmailField label={t("otpLogin.email")} autoComplete="email" />}
					</emailForm.AppField>

					<emailForm.AppForm>
						<emailForm.SubmitButton label={t("otpLogin.sendCode")} submittingLabel={t("otpLogin.sendingCode")} />
					</emailForm.AppForm>
				</form>
			) : (
				<form
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						otpForm.handleSubmit();
					}}
					className="space-y-4"
				>
					<otpForm.AppField name="otp">{(field) => <field.OTPField label={t("otpLogin.otp")} />}</otpForm.AppField>

					<otpForm.AppForm>
						<otpForm.SubmitButton label={t("otpLogin.submit")} submittingLabel={t("otpLogin.submitting")} />
					</otpForm.AppForm>
				</form>
			)}

			<div className="mt-4 text-center">
				<Button variant="link" onClick={onBack} className="text-indigo-600 hover:text-indigo-800">
					{t("otpLogin.back")}
				</Button>
			</div>
		</div>
	);
}
