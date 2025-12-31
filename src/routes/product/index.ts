import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import * as controller from './controller';
import { productSchemas } from './schemas';

export default async function productRoutes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions
) {
  // All product routes are public (no authentication required)
  
  // Get all products with filtering and pagination
  fastify.get('/', {
    schema: productSchemas.getAll,
  }, controller.getAll);

  // Get product by slug
  fastify.get('/slug/:slug', {
    schema: productSchemas.getBySlug,
  }, controller.getBySlug);

  // Get best selling products
  fastify.get('/best-sellers', {
    schema: productSchemas.getBestSellers,
  }, controller.getBestSellers);

  // Get new arrival products
  fastify.get('/new-arrivals', {
    schema: productSchemas.getNewArrivals,
  }, controller.getNewArrivals);

  // Get featured products
  fastify.get('/featured', {
    schema: productSchemas.getFeatured,
  }, controller.getFeatured);

  // Get discounted products
  fastify.get('/discounted', {
    schema: productSchemas.getDiscounted,
  }, controller.getDiscounted);
}

