import type { contract } from "@flux/api/contracts/index";
import { env } from "@flux/env/web";
import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { ContractRouterClient } from "@orpc/contract";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import { QueryCache, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 5 * 60 * 1000,
		},
	},
	queryCache: new QueryCache({
		onError: (error, query) => {
			toast.error(`Error: ${error.message}`, {
				action: {
					label: "retry",
					onClick: query.invalidate,
				},
			});
		},
	}),
});

const DEFAULT_TIMEOUT = 30_000;

export const link = new RPCLink({
	url: `${env.VITE_SERVER_URL}/rpc`,
	fetch(request, init) {
		const signal = AbortSignal.any([request.signal, AbortSignal.timeout(DEFAULT_TIMEOUT)]);

		return fetch(request, {
			...init,
			credentials: "include",
			signal,
		});
	},
});

export const client: ContractRouterClient<typeof contract> = createORPCClient(link);

export const orpc = createTanstackQueryUtils(client);
