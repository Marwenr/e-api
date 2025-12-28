import { FastifyInstance } from 'fastify';
import helmet from '@fastify/helmet';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import { env } from '../config/env';
import { errorHandler } from '../middleware/error-handler';
import { notFoundHandler } from '../middleware/not-found-handler';

export const registerPlugins = async (fastify: FastifyInstance): Promise<void> => {
  // Security headers
  await fastify.register(helmet, {
    contentSecurityPolicy: env.nodeEnv === 'production',
  });

  // CORS
  await fastify.register(cors, {
    origin: env.corsOrigin === '*' ? true : env.corsOrigin.split(','),
    credentials: true,
  });

  // Rate limiting
  await fastify.register(rateLimit, {
    max: env.rateLimitMax,
    timeWindow: env.rateLimitTimeWindow,
  });

  // Error handler
  fastify.setErrorHandler(errorHandler);

  // Not found handler
  fastify.setNotFoundHandler(notFoundHandler);
};

