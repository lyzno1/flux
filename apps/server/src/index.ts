import fastifyCors from "@fastify/cors";
import { createContext } from "@flux/api/context";
import { appRouter } from "@flux/api/routers/index";
import { auth } from "@flux/auth";
import { env } from "@flux/env/server";
import { OpenAPIHandler } from "@orpc/openapi/fastify";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fastify";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import Fastify, { type RouteHandlerMethod } from "fastify";

function toWebHeaders(raw: Record<string, string | string[] | undefined>): Headers {
	const headers = new Headers();
	for (const [key, value] of Object.entries(raw)) {
		if (value !== undefined) headers.append(key, Array.isArray(value) ? value.join(", ") : value);
	}
	return headers;
}

const fastify = Fastify({ logger: true });

const rpcHandler = new RPCHandler(appRouter, {
	interceptors: [
		onError((error) => {
			fastify.log.error(error);
		}),
	],
});

const apiHandler = new OpenAPIHandler(appRouter, {
	plugins: [
		new OpenAPIReferencePlugin({
			schemaConverters: [new ZodToJsonSchemaConverter()],
		}),
	],
	interceptors: [
		onError((error) => {
			fastify.log.error(error);
		}),
	],
});

fastify.register(fastifyCors, {
	origin: env.CORS_ORIGIN,
	methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
	allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
	credentials: true,
	maxAge: 86400,
});

fastify.register((app, _opts, done) => {
	app.addContentTypeParser("*", (_request, _payload, done) => {
		done(null, undefined);
	});

	app.all("/rpc/*", async (request, reply) => {
		const { matched } = await rpcHandler.handle(request, reply, {
			prefix: "/rpc",
			context: createContext(toWebHeaders(request.headers)),
		});

		if (!matched) {
			reply.status(404).send("Not found");
		}
	});

	const handleApiReference: RouteHandlerMethod = async (request, reply) => {
		const { matched } = await apiHandler.handle(request, reply, {
			prefix: "/api-reference",
			context: createContext(toWebHeaders(request.headers)),
		});

		if (!matched) {
			reply.status(404).send("Not found");
		}
	};

	app.all("/api-reference", handleApiReference);
	app.all("/api-reference/*", handleApiReference);

	done();
});

fastify.route({
	method: ["GET", "POST"],
	url: "/api/auth/*",
	async handler(request, reply) {
		try {
			const url = new URL(request.url, `http://${request.headers.host}`);
			const webHeaders = toWebHeaders(request.headers);
			const req = new Request(url.toString(), {
				method: request.method,
				headers: webHeaders,
				body:
					request.method !== "GET" && request.method !== "HEAD" && request.body
						? JSON.stringify(request.body)
						: undefined,
			});
			const response = await auth.handler(req);
			reply.status(response.status);
			for (const [key, value] of response.headers.entries()) {
				reply.header(key, value);
			}
			reply.send(response.body ? await response.text() : null);
		} catch (error) {
			fastify.log.error({ err: error }, "Authentication Error:");
			reply.status(500).send({
				error: "Internal authentication error",
				code: "AUTH_FAILURE",
			});
		}
	},
});

fastify.get("/", () => {
	return "OK";
});

fastify.listen({ port: 3000 }, (err) => {
	if (err) {
		fastify.log.error(err);
		process.exit(1);
	}
	fastify.log.info("Server running on port 3000");
});
