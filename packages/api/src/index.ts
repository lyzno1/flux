import { auth } from "@flux/auth";
import { implement, ORPCError } from "@orpc/server";

import type { Context } from "./context";
import { contract } from "./contracts/index";

export const pub = implement(contract).$context<Context>();

export const authed = pub.use(async ({ context, next }) => {
	const session = await auth.api.getSession({
		headers: context.headers,
	});

	if (!session?.user) {
		throw new ORPCError("UNAUTHORIZED");
	}

	return next({
		context: { session },
	});
});
