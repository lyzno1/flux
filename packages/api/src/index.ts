import { implement, ORPCError } from "@orpc/server";

import type { Context } from "./context";
import { contract } from "./contracts/index";

export const pub = implement(contract).$context<Context>();

export const authed = pub.use(({ context, next }) => {
	if (!context.session?.user) {
		throw new ORPCError("UNAUTHORIZED");
	}
	return next({
		context: {
			session: context.session,
		},
	});
});
