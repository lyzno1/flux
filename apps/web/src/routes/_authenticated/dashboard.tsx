import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/_authenticated/dashboard")({
	component: RouteComponent,
	loader: ({ context }) => context.queryClient.ensureQueryData(orpc.privateData.queryOptions()),
});

function RouteComponent() {
	const { session } = Route.useRouteContext();
	const { data } = useSuspenseQuery(orpc.privateData.queryOptions());

	return (
		<div>
			<h1>Dashboard</h1>
			<p>Welcome {session.data?.user.name}</p>
			<p>API: {data.message}</p>
		</div>
	);
}
