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
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: true,
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
			async sendVerificationOTP({ email, otp, type }) {
				if (resend && env.RESEND_FROM_EMAIL) {
					const subjectMap = {
						"sign-in": "Your login code",
						"email-verification": "Verify your email",
						"forget-password": "Reset your password",
					} as const;
					await resend.emails.send({
						from: env.RESEND_FROM_EMAIL,
						to: email,
						subject: subjectMap[type],
						html: `<p>Your verification code: <strong>${otp}</strong></p><p>Expires in 5 minutes.</p>`,
					});
				} else {
					throw new Error("Email service not configured");
				}
			},
		}),
	],
});
