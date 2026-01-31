import { authed, pub } from "../index";
import { difyRouter } from "./dify";

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
	dify: difyRouter,
});

export type AppRouter = typeof appRouter;
