import type { contract } from "@flux/api/contracts/index";
import { env } from "@flux/env/web";
import { createORPCClient, ORPCError } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { ContractRouterClient } from "@orpc/contract";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import i18n from "i18next";
import { toast } from "sonner";
import { getRelativeRedirectFromHref } from "@/lib/auth/redirect";

const NO_RETRY_STATUSES = new Set([400, 401, 403, 404, 409, 422, 429]);

let last401 = 0;

function handleUnauthorized() {
	const now = Date.now();
	if (now - last401 > 5_000) {
		last401 = now;
		queryClient.clear();
		import("../router")
			.then(({ router }) => {
				return router.navigate({
					to: "/login",
					search: { redirect: getRelativeRedirectFromHref(router.state.location.href) },
				});
			})
			.catch(console.error);
	}
}

function handleGlobalError(error: Error) {
	if (error instanceof ORPCError && error.status === 401) {
		handleUnauthorized();
		return;
	}
	toast.error(i18n.t("error.generic", { message: error.message }));
}

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 5 * 60 * 1000,
			refetchOnWindowFocus: false,
			retry(failureCount, error) {
				if (error instanceof ORPCError && NO_RETRY_STATUSES.has(error.status)) {
					return false;
				}
				return failureCount < 3;
			},
		},
	},
	queryCache: new QueryCache({
		onError: handleGlobalError,
	}),
	mutationCache: new MutationCache({
		onError: handleGlobalError,
	}),
});

export const link = new RPCLink({
	url: `${env.VITE_SERVER_URL}/rpc`,
	fetch(request, init) {
		return fetch(request, { ...init, credentials: "include" });
	},
});

export const client: ContractRouterClient<typeof contract> = createORPCClient(link);

export const orpc = createTanstackQueryUtils(client);
