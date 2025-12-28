import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { logger } from '../utils/logger';
import { AuthError } from '../services/errors';

export interface ApiError extends FastifyError {
  statusCode?: number;
  validation?: FastifyError['validation'];
}

export const errorHandler = (
  error: ApiError,
  request: FastifyRequest,
  reply: FastifyReply
): void => {
  // Log error
  logger.error('Request error:', {
    method: request.method,
    url: request.url,
    error: error.message,
    stack: error.stack,
  });

  // Mongoose validation error
  if (error.name === 'ValidationError') {
    reply.status(400).send({
      success: false,
      error: {
        message: 'Validation error',
        code: error.code || 'VALIDATION_ERROR',
        details: error.validation || [],
      },
    });
    return;
  }

  // Mongoose cast error (invalid ID format)
  if (error.name === 'CastError') {
    reply.status(400).send({
      success: false,
      error: {
        message: 'Invalid ID format',
        code: 'INVALID_ID',
      },
    });
    return;
  }

  // Fastify validation error
  if (error.validation) {
    reply.status(400).send({
      success: false,
      error: {
        message: 'Request validation failed',
        code: 'VALIDATION_ERROR',
        details: error.validation,
      },
    });
    return;
  }

  // AuthError instances (from services)
  if (error instanceof AuthError) {
    reply.status(error.statusCode).send({
      success: false,
      error: {
        message: error.message,
        code: error.code,
        ...(process.env.NODE_ENV !== 'production' && { stack: error.stack }),
      },
    });
    return;
  }

  // Custom API errors
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal server error';

  reply.status(statusCode).send({
    success: false,
    error: {
      message,
      code: error.code || 'INTERNAL_ERROR',
      ...(process.env.NODE_ENV !== 'production' && { stack: error.stack }),
    },
  });
};

