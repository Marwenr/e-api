import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import adminProductRoutes from './product';
import adminInventoryRoutes from './inventory';
import adminCategoryRoutes from './category';

export default async function adminRoutes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions
) {
  // Register admin sub-routes
  await fastify.register(adminProductRoutes, { prefix: '/products' });
  await fastify.register(adminInventoryRoutes, { prefix: '/inventory' });
  await fastify.register(adminCategoryRoutes, { prefix: '/categories' });
}

