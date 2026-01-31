import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/_authenticated/dashboard")({
	component: RouteComponent,
	loader: ({ context }) => context.queryClient.ensureQueryData(orpc.privateData.queryOptions()),
});

function RouteComponent() {
	const { session } = Route.useRouteContext();
	const { data } = useSuspenseQuery(orpc.privateData.queryOptions());
	const { t } = useTranslation("dashboard");

	return (
		<div>
			<h1>{t("title")}</h1>
			<p>{t("welcome", { name: session.data?.user.name })}</p>
			<p>{t("apiMessage", { message: data.message })}</p>
		</div>
	);
}
