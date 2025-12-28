import { FastifyReply, FastifyRequest } from 'fastify';

export const notFoundHandler = (
  request: FastifyRequest,
  reply: FastifyReply
): void => {
  reply.status(404).send({
    success: false,
    error: {
      message: `Route ${request.method} ${request.url} not found`,
      code: 'NOT_FOUND',
    },
  });
};

