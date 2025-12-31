import { FastifyInstance, FastifyPluginOptions } from "fastify";
import rateLimit from "@fastify/rate-limit";
import { optionalAuthenticate, authenticate } from "../../middleware/auth";
import * as controller from "./controller";
import { cartSchemas } from "./schemas";

export default async function cartRoutes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions
) {
  // Rate limiting for cart operations
  await fastify.register(async function (fastify) {
    await fastify.register(rateLimit, {
      max: 100, // 100 requests
      timeWindow: 60000, // per minute
      skip: (request) => {
        return request.method === "OPTIONS";
      },
    });

    // Get cart (optional auth - supports both guest and user)
    fastify.get(
      "/",
      {
        schema: cartSchemas.getCart,
        preHandler: [optionalAuthenticate],
      },
      controller.getCart
    );

    // Add to cart (optional auth - supports both guest and user)
    fastify.post(
      "/add",
      {
        schema: cartSchemas.addToCart,
        preHandler: [optionalAuthenticate],
      },
      controller.addToCart
    );

    // Update cart item (optional auth - supports both guest and user)
    fastify.put(
      "/update",
      {
        schema: cartSchemas.updateCartItem,
        preHandler: [optionalAuthenticate],
      },
      controller.updateCartItem
    );

    // Remove cart item (optional auth - supports both guest and user)
    fastify.delete(
      "/remove",
      {
        schema: cartSchemas.removeCartItem,
        preHandler: [optionalAuthenticate],
      },
      controller.removeCartItem
    );

    // Clear cart (optional auth - supports both guest and user)
    fastify.delete(
      "/clear",
      {
        preHandler: [optionalAuthenticate],
      },
      controller.clearCart
    );

    // Recalculate cart (optional auth - supports both guest and user)
    fastify.post(
      "/recalculate",
      {
        preHandler: [optionalAuthenticate],
      },
      controller.recalculateCart
    );

    // Merge cart (requires auth - only for authenticated users)
    fastify.post(
      "/merge",
      {
        schema: cartSchemas.mergeCart,
        preHandler: [authenticate],
      },
      controller.mergeCart
    );
  });
}

