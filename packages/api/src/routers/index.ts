import { authed, pub } from "../index";

const healthCheck = pub.healthCheck.handler(() => {
	return "OK";
});

const privateData = authed.privateData.handler(({ context }) => {
	return {
		message: "This is private",
		user: context.session.user,
	};
});

export const appRouter = pub.router({
	healthCheck,
	privateData,
});

export type AppRouter = typeof appRouter;
