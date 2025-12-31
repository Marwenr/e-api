import { FastifyReply } from "fastify";
import { ApiResponse, PaginatedResponse } from "../types";

// Note: CORS headers are automatically set by the onSend hook in plugins/index.ts
// These functions don't need to set CORS headers as the hook handles all responses

export const sendSuccess = <T>(
  reply: FastifyReply,
  data: T,
  statusCode: number = 200
): FastifyReply => {
  // Ensure CORS headers are set before sending
  const origin = reply.request.headers.origin || "*";
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
  return reply.status(statusCode).send({
    success: true,
    data,
  } as ApiResponse<T>);
};

export const sendError = (
  reply: FastifyReply,
  message: string,
  code: string,
  statusCode: number = 400,
  details?: any
): FastifyReply => {
  // Ensure CORS headers are set before sending
  const origin = reply.request.headers.origin || "*";
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
  return reply.status(statusCode).send({
    success: false,
    error: {
      message,
      code,
      ...(details && { details }),
    },
  } as ApiResponse);
};

export const sendPaginated = <T>(
  reply: FastifyReply,
  paginatedData: PaginatedResponse<T>,
  statusCode: number = 200
): FastifyReply => {
  // Ensure CORS headers are set before sending
  const origin = reply.request.headers.origin || "*";
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
  return reply.status(statusCode).send({
    success: true,
    data: paginatedData.data,
    meta: paginatedData.meta,
  } as ApiResponse<T[]>);
};
