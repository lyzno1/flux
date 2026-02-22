export const AUTH_DEFAULT_REDIRECT = "/dify";

const REDIRECT_PARSE_BASE = "https://flux.local";

function isSafeRelativePath(path: string) {
	return path.startsWith("/") && !path.startsWith("//");
}

export function normalizeAuthRedirect(value: string | null | undefined, fallback = AUTH_DEFAULT_REDIRECT) {
	if (!value) {
		return fallback;
	}
	if (value.startsWith("//")) {
		return fallback;
	}

	if (isSafeRelativePath(value)) {
		return value;
	}

	try {
		const parsed = new URL(value, REDIRECT_PARSE_BASE);
		const relative = `${parsed.pathname}${parsed.search}${parsed.hash}`;
		return isSafeRelativePath(relative) ? relative : fallback;
	} catch {
		return fallback;
	}
}

export function getRelativeRedirectFromHref(href: string, fallback = AUTH_DEFAULT_REDIRECT) {
	try {
		const parsed = new URL(href, REDIRECT_PARSE_BASE);
		const relative = `${parsed.pathname}${parsed.search}${parsed.hash}`;
		return normalizeAuthRedirect(relative, fallback);
	} catch {
		return fallback;
	}
}

export function getRedirectParamFromHref(href: string, fallback = AUTH_DEFAULT_REDIRECT) {
	try {
		const parsed = new URL(href, REDIRECT_PARSE_BASE);
		return normalizeAuthRedirect(parsed.searchParams.get("redirect"), fallback);
	} catch {
		return fallback;
	}
}
