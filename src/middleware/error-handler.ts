import { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { logger } from "../utils/logger";
import { AuthError } from "../services/errors";
import { env } from "../config/env";

export interface ApiError extends FastifyError {
  statusCode?: number;
  validation?: FastifyError["validation"];
}

export const errorHandler = (
  error: ApiError,
  request: FastifyRequest,
  reply: FastifyReply
): void => {
  // Log error
  logger.error("Request error:", {
    method: request.method,
    url: request.url,
    error: error.message,
    stack: error.stack,
  });

  // ALWAYS set CORS headers for error responses - ACCEPT ALL ORIGINS, ALL METHODS, ALL HEADERS
  const origin = request.headers.origin;
  if (origin) {
    // ACCEPT ALL ORIGINS - no validation, no restrictions
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

  // Mongoose validation error
  if (error.name === "ValidationError") {
    reply.status(400);
    reply.send({
      success: false,
      error: {
        message: "Validation error",
        code: error.code || "VALIDATION_ERROR",
        details: error.validation || [],
      },
    });
    return;
  }

  // Mongoose cast error (invalid ID format)
  if (error.name === "CastError") {
    reply.status(400);
    reply.send({
      success: false,
      error: {
        message: "Invalid ID format",
        code: "INVALID_ID",
      },
    });
    return;
  }

  // Fastify validation error
  if (error.validation) {
    reply.status(400);
    reply.send({
      success: false,
      error: {
        message: "Request validation failed",
        code: "VALIDATION_ERROR",
        details: error.validation,
      },
    });
    return;
  }

  // AuthError instances (from services)
  if (error instanceof AuthError) {
    reply.status(error.statusCode);
    reply.send({
      success: false,
      error: {
        message: error.message,
        code: error.code,
        ...(process.env.NODE_ENV !== "production" && { stack: error.stack }),
      },
    });
    return;
  }

  // Custom API errors
  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal server error";

  reply.status(statusCode);
  reply.send({
    success: false,
    error: {
      message,
      code: error.code || "INTERNAL_ERROR",
      ...(process.env.NODE_ENV !== "production" && { stack: error.stack }),
    },
  });
};
