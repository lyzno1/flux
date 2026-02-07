import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	beforeLoad: ({ context }) => {
		if (context.auth.data) {
			throw redirect({ to: "/dify" });
		}
	},
	component: () => null,
});
