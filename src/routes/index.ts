import { FastifyInstance } from 'fastify';
import healthRoutes from './health';
import authRoutes from './auth';
import addressRoutes from './address';
import productRoutes from './product';
import categoryRoutes from './category';
import contactRoutes from './contact';
import cartRoutes from './cart';
import orderRoutes from './order';
import adminRoutes from './admin';

export const registerRoutes = async (fastify: FastifyInstance): Promise<void> => {
  // Register all route modules
  await fastify.register(healthRoutes);
  await fastify.register(authRoutes, { prefix: '/auth' });
  await fastify.register(addressRoutes, { prefix: '/addresses' });
  await fastify.register(productRoutes, { prefix: '/products' });
  await fastify.register(categoryRoutes, { prefix: '/categories' });
  await fastify.register(contactRoutes, { prefix: '/contact' });
  await fastify.register(cartRoutes, { prefix: '/cart' });
  await fastify.register(orderRoutes, { prefix: '/orders' });
  
  // Admin routes (protected by authentication and admin role)
  await fastify.register(adminRoutes, { prefix: '/admin' });
};

