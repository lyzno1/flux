import { createServer } from "node:http";
import fastifyCors from "@fastify/cors";
import { createContext } from "@flux/api/context";
import { appRouter } from "@flux/api/routers/index";
import { auth } from "@flux/auth";
import { env } from "@flux/env/server";
import { OpenAPIHandler } from "@orpc/openapi/node";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/node";
import { CORSPlugin } from "@orpc/server/plugins";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import Fastify from "fastify";

const baseCorsConfig = {
	origin: env.CORS_ORIGIN,
	methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
	allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
	credentials: true,
	maxAge: 86400,
};

const rpcHandler = new RPCHandler(appRouter, {
	plugins: [
		new CORSPlugin({
			origin: env.CORS_ORIGIN,
			credentials: true,
			allowHeaders: ["Content-Type", "Authorization"],
		}),
	],
	interceptors: [
		onError((error) => {
			// biome-ignore lint/suspicious/noConsole: server error logging
			console.error(error);
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
			// biome-ignore lint/suspicious/noConsole: server error logging
			console.error(error);
		}),
	],
});

const fastify = Fastify({
	logger: true,
	serverFactory: (fastifyHandler) => {
		const server = createServer(async (req, res) => {
			const { matched } = await rpcHandler.handle(req, res, {
				context: await createContext(req.headers),
				prefix: "/rpc",
			});

			if (matched) {
				return;
			}

			const apiResult = await apiHandler.handle(req, res, {
				context: await createContext(req.headers),
				prefix: "/api-reference",
			});

			if (apiResult.matched) {
				return;
			}

			fastifyHandler(req, res);
		});

		return server;
	},
});

fastify.register(fastifyCors, baseCorsConfig);

fastify.route({
	method: ["GET", "POST"],
	url: "/api/auth/*",
	async handler(request, reply) {
		try {
			const url = new URL(request.url, `http://${request.headers.host}`);
			const headers = new Headers();
			for (const [key, value] of Object.entries(request.headers)) {
				if (value) headers.append(key, value.toString());
			}
			const req = new Request(url.toString(), {
				method: request.method,
				headers,
				body: request.body ? JSON.stringify(request.body) : undefined,
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
