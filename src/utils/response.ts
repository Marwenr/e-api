import { FastifyReply } from 'fastify';
import { ApiResponse, PaginatedResponse } from '../types';

export const sendSuccess = <T>(
  reply: FastifyReply,
  data: T,
  statusCode: number = 200
): FastifyReply => {
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
  return reply.status(statusCode).send({
    success: true,
    data: paginatedData.data,
    meta: paginatedData.meta,
  } as ApiResponse<T[]>);
};

