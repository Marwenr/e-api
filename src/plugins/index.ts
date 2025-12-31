import { FastifyInstance } from "fastify";
import helmet from "@fastify/helmet";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import { env } from "../config/env";
import { errorHandler } from "../middleware/error-handler";
import { notFoundHandler } from "../middleware/not-found-handler";

export const registerPlugins = async (
  fastify: FastifyInstance
): Promise<void> => {
  // CORS - USE PLUGIN + HOOKS TO GUARANTEE HEADERS
  await fastify.register(cors, {
    origin: (origin, callback) => {
      // ACCEPT ALL ORIGINS - NO RESTRICTIONS
      callback(null, origin || true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
      "Access-Control-Request-Method",
      "Access-Control-Request-Headers",
    ],
    exposedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
    ],
    preflightContinue: false,
    optionsSuccessStatus: 204,
    strictPreflight: false,
  });

  // CRITICAL: Force CORS headers on EVERY response
  // Use multiple hooks to ensure headers are ALWAYS set, regardless of what happens

  // Hook 1: onRequest - Set headers as early as possible
  fastify.addHook("onRequest", async (request, reply) => {
    const origin = request.headers.origin || "*";
    reply.header("Access-Control-Allow-Origin", origin);
    if (origin !== "*") {
      reply.header("Access-Control-Allow-Credentials", "true");
    }
    reply.header(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD"
    );
    reply.header(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Requested-With, Accept, Origin, Access-Control-Request-Method, Access-Control-Request-Headers"
    );
    reply.header(
      "Access-Control-Expose-Headers",
      "Content-Type, Authorization, X-Requested-With, Accept, Origin"
    );
  });

  // Hook 2: preHandler - Set headers right before route handler executes
  fastify.addHook("preHandler", async (request, reply) => {
    const origin = request.headers.origin || "*";
    reply.header("Access-Control-Allow-Origin", origin);
    if (origin !== "*") {
      reply.header("Access-Control-Allow-Credentials", "true");
    }
    reply.header(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD"
    );
    reply.header(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Requested-With, Accept, Origin, Access-Control-Request-Method, Access-Control-Request-Headers"
    );
    reply.header(
      "Access-Control-Expose-Headers",
      "Content-Type, Authorization, X-Requested-With, Accept, Origin"
    );
  });

  // Hook 3: onSend - Final backup to ensure headers are set before response is sent
  fastify.addHook("onSend", async (request, reply, payload) => {
    const origin = request.headers.origin || "*";
    reply.header("Access-Control-Allow-Origin", origin);
    if (origin !== "*") {
      reply.header("Access-Control-Allow-Credentials", "true");
    }
    reply.header(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD"
    );
    reply.header(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Requested-With, Accept, Origin, Access-Control-Request-Method, Access-Control-Request-Headers"
    );
    reply.header(
      "Access-Control-Expose-Headers",
      "Content-Type, Authorization, X-Requested-With, Accept, Origin"
    );
    return payload;
  });

  // Rate limiting
  await fastify.register(rateLimit, {
    max: env.rateLimitMax,
    timeWindow: env.rateLimitTimeWindow,
  });

  // Error handler (sets CORS headers on errors)
  fastify.setErrorHandler(errorHandler);

  // Not found handler
  fastify.setNotFoundHandler(notFoundHandler);
};
