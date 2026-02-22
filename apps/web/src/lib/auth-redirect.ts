export const AUTH_DEFAULT_REDIRECT = "/dify";

const URL_PARSE_BASE = "https://placeholder.local";

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
		const parsed = new URL(value, URL_PARSE_BASE);
		const relative = `${parsed.pathname}${parsed.search}${parsed.hash}`;
		return isSafeRelativePath(relative) ? relative : fallback;
	} catch {
		return fallback;
	}
}

export function getRelativeRedirectFromHref(href: string, fallback = AUTH_DEFAULT_REDIRECT) {
	try {
		const parsed = new URL(href, URL_PARSE_BASE);
		const relative = `${parsed.pathname}${parsed.search}${parsed.hash}`;
		return normalizeAuthRedirect(relative, fallback);
	} catch {
		return fallback;
	}
}
