import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import rateLimit from '@fastify/rate-limit';
import { optionalAuthenticate, authenticate } from '../../middleware/auth';
import * as controller from './controller';
import { orderSchemas } from './schemas';

export default async function orderRoutes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions
) {
  // Rate limiting for order operations
  await fastify.register(async function (fastify) {
    await fastify.register(rateLimit, {
      max: 50, // 50 requests
      timeWindow: 60000, // per minute
      skip: (request) => {
        return request.method === 'OPTIONS';
      },
    });

    // Create order (optional auth - supports both guest and user)
    fastify.post(
      '/',
      {
        schema: orderSchemas.createOrder,
        preHandler: [optionalAuthenticate],
      },
      controller.createOrder
    );

    // Get user's orders (requires auth)
    fastify.get(
      '/',
      {
        schema: orderSchemas.getUserOrders,
        preHandler: [authenticate],
      },
      controller.getUserOrders
    );

    // Get order by ID (requires auth - user can only see their own orders)
    fastify.get(
      '/:id',
      {
        schema: orderSchemas.getOrderById,
        preHandler: [authenticate],
      },
      controller.getOrderById
    );

    // Get order by order number (requires auth - user can only see their own orders)
    fastify.get(
      '/number/:orderNumber',
      {
        schema: orderSchemas.getOrderByNumber,
        preHandler: [authenticate],
      },
      controller.getOrderByNumber
    );

    // Admin routes
    // Get all orders (admin only)
    fastify.get(
      '/admin',
      {
        schema: orderSchemas.getAllOrders,
        preHandler: [authenticate],
      },
      controller.getAllOrders
    );

    // Update order status (admin only)
    fastify.patch(
      '/:id/status',
      {
        schema: orderSchemas.updateOrderStatus,
        preHandler: [authenticate],
      },
      controller.updateOrderStatus
    );

    // Refund order (admin only)
    fastify.post(
      '/:id/refund',
      {
        schema: orderSchemas.refundOrder,
        preHandler: [authenticate],
      },
      controller.refundOrder
    );
  });
}

