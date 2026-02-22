import { describe, expect, it } from "vitest";
import { AUTH_DEFAULT_REDIRECT, getRelativeRedirectFromHref, normalizeAuthRedirect } from "./redirect";

describe("auth-redirect", () => {
	it("keeps safe relative redirect values", () => {
		expect(normalizeAuthRedirect("/settings?tab=profile#security")).toBe("/settings?tab=profile#security");
	});

	it("converts absolute URLs to safe relative redirects", () => {
		expect(normalizeAuthRedirect("https://example.com/settings?tab=profile#security")).toBe(
			"/settings?tab=profile#security",
		);
	});

	it("falls back for unsafe redirect values", () => {
		expect(normalizeAuthRedirect("//malicious.example.com")).toBe(AUTH_DEFAULT_REDIRECT);
		expect(normalizeAuthRedirect("javascript:alert(1)")).toBe(AUTH_DEFAULT_REDIRECT);
	});

	it("extracts the current relative path from href", () => {
		expect(getRelativeRedirectFromHref("https://example.com/dify?foo=1#bar")).toBe("/dify?foo=1#bar");
	});
});
