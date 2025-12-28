import { FastifyInstance } from 'fastify';
import healthRoutes from './health';
import authRoutes from './auth';

export const registerRoutes = async (fastify: FastifyInstance): Promise<void> => {
  // Register all route modules
  await fastify.register(healthRoutes);
  await fastify.register(authRoutes, { prefix: '/auth' });
  
  // Additional routes will be registered here
  // Example: await fastify.register(productRoutes);
  // Example: await fastify.register(userRoutes);
};

