import * as z from "zod";

// Client-side validation schemas that mirror Better Auth server-side defaults.
// These must be a subset of (never stricter than) the server rules.
// See: https://www.better-auth.com/docs/reference/options
// See: https://www.better-auth.com/docs/plugins/username

// Better Auth default: standard email validation
export function createEmailSchema(message: string) {
	return z.string().email(message);
}

// Better Auth default: minPasswordLength = 8, maxPasswordLength = 128
export function createPasswordSchema(message: string) {
	return z.string().min(8, message).max(128);
}

// Better Auth signUp.email requires name as non-empty string.
// min(2) is a project-level UX rule (stricter than server).
export function createNameSchema(message: string) {
	return z.string().min(2, message);
}

// Better Auth username plugin: minUsernameLength = 3, maxUsernameLength = 30
// Default usernameValidator: alphanumeric, underscores, and dots only
export function createUsernameSchema(minMessage: string, patternMessage: string) {
	return z
		.string()
		.min(3, minMessage)
		.max(30)
		.regex(/^[a-zA-Z0-9_.]+$/, patternMessage);
}

// Better Auth emailOTP plugin: otpLength = 6
export function createOtpSchema(message: string) {
	return z.string().length(6, message);
}

export function createRequiredSchema(message: string) {
	return z.string().min(1, message);
}
