import { env } from "@flux/env/web";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";

let didInit = false;

export function GoogleOneTap() {
	const navigate = useNavigate();
	const { data: session } = authClient.useSession();
	const isLoggedIn = !!session;

	useEffect(() => {
		if (!import.meta.env.PROD || isLoggedIn || didInit || !env.VITE_GOOGLE_CLIENT_ID) return;
		didInit = true;

		authClient.oneTap({
			fetchOptions: {
				onSuccess: () => {
					navigate({ to: "/dashboard" });
				},
			},
		});
	}, [isLoggedIn, navigate]);

	return null;
}
