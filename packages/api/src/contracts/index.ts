import { oc } from "@orpc/contract";
import { z } from "zod";

export const healthCheck = oc
	.route({
		method: "GET",
		path: "/health",
		summary: "Health check",
		tags: ["System"],
	})
	.output(z.string());

export const privateData = oc
	.route({
		method: "GET",
		path: "/private",
		summary: "Get private data",
		tags: ["User"],
	})
	.output(
		z.object({
			message: z.string(),
			user: z.object({
				id: z.string(),
				name: z.string(),
				email: z.string(),
				emailVerified: z.boolean(),
				image: z.string().nullable().optional(),
				createdAt: z.date(),
				updatedAt: z.date(),
			}),
		}),
	);

export const contract = {
	healthCheck,
	privateData,
};
