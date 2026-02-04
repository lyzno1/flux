import { db } from "@flux/db";
import * as schema from "@flux/db/schema/auth.sql";
import { env } from "@flux/env/server";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { emailOTP } from "better-auth/plugins/email-otp";
import { username } from "better-auth/plugins/username";
import { Resend } from "resend";

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",
		schema: schema,
	}),
	trustedOrigins: [env.CORS_ORIGIN],
	rateLimit: {
		window: 60,
		max: 100,
		storage: "memory",
		customRules: {
			"/sign-in/email": { window: 60, max: 5 },
			"/sign-up/email": { window: 60, max: 3 },
			"/email-otp/send-verification-otp": { window: 60, max: 5 },
		},
	},
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: true,
	},
	emailVerification: {
		autoSignInAfterVerification: true,
	},
	socialProviders: {
		...(env.GOOGLE_CLIENT_ID &&
			env.GOOGLE_CLIENT_SECRET && {
				google: {
					clientId: env.GOOGLE_CLIENT_ID,
					clientSecret: env.GOOGLE_CLIENT_SECRET,
				},
			}),
	},
	session: {
		cookieCache: {
			enabled: true,
			maxAge: 5 * 60,
		},
	},
	advanced: {
		cookiePrefix: "flux",
		backgroundTasks: {
			handler: (promise) => {
				promise.catch(console.error);
			},
		},
		defaultCookieAttributes: {
			sameSite: "none",
			secure: true,
			httpOnly: true,
		},
	},
	plugins: [
		username(),
		emailOTP({
			otpLength: 6,
			expiresIn: 300,
			sendVerificationOnSignUp: true,
			disableSignUp: true,
			// biome-ignore lint/suspicious/useAwait: must return Promise<void> per Better-Auth plugin interface, but we intentionally fire-and-forget the email send
			async sendVerificationOTP({ email, otp, type }) {
				if (resend && env.RESEND_FROM_EMAIL) {
					const subjectMap = {
						"sign-in": "Your login code",
						"email-verification": "Verify your email",
						"forget-password": "Reset your password",
					} as const;
					void resend.emails
						.send({
							from: env.RESEND_FROM_EMAIL,
							to: email,
							subject: subjectMap[type],
							html: `<p>Your verification code: <strong>${otp}</strong></p><p>Expires in 5 minutes.</p>`,
						})
						.catch((error) => {
							console.error("[auth] Failed to send OTP email", error);
						});
				} else if (env.NODE_ENV === "development") {
					console.warn(`[auth] Email provider not configured. OTP for ${email} (${type}): ${otp}`);
				} else {
					console.error("[auth] Cannot send OTP: RESEND_API_KEY or RESEND_FROM_EMAIL is not configured");
				}
			},
		}),
	],
});
