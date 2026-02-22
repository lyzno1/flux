import { env } from "@flux/env/web";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef } from "react";
import { authClient } from "@/lib/auth-client";
import { getRedirectParamFromHref } from "@/lib/auth-redirect";

export function GoogleOneTap() {
	const navigate = useNavigate();
	const location = useLocation();
	const { data: session } = authClient.useSession();
	const isLoggedIn = !!session;
	const didInitRef = useRef(false);
	const redirect = useMemo(() => getRedirectParamFromHref(location.href), [location.href]);
	const redirectRef = useRef(redirect);

	useEffect(() => {
		redirectRef.current = redirect;
	}, [redirect]);

	useEffect(() => {
		if (!import.meta.env.PROD || !env.VITE_GOOGLE_CLIENT_ID) {
			return;
		}
		if (isLoggedIn) {
			didInitRef.current = false;
			return;
		}
		if (didInitRef.current) {
			return;
		}
		didInitRef.current = true;
		void authClient.oneTap({
			fetchOptions: {
				onSuccess: () => {
					navigate({ to: redirectRef.current });
				},
			},
		});
	}, [isLoggedIn, navigate]);

	return null;
}
