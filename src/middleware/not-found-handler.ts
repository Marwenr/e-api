import { FastifyReply, FastifyRequest } from "fastify";

export const notFoundHandler = (
  request: FastifyRequest,
  reply: FastifyReply
): void => {
  // ALWAYS set CORS headers - ACCEPT ALL ORIGINS, ALL METHODS, ALL HEADERS
  const origin = request.headers.origin;
  if (origin) {
    reply.header("Access-Control-Allow-Origin", origin);
    reply.header("Access-Control-Allow-Credentials", "true");
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
  } else {
    // Even if no origin, set CORS headers
    reply.header("Access-Control-Allow-Origin", "*");
    reply.header(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD"
    );
    reply.header(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Requested-With, Accept, Origin, Access-Control-Request-Method, Access-Control-Request-Headers"
    );
  }

  reply.status(404).send({
    success: false,
    error: {
      message: `Route ${request.method} ${request.url} not found`,
      code: "NOT_FOUND",
    },
  });
};
