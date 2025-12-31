import { FastifyInstance, FastifyPluginOptions } from "fastify";
import * as controller from "./controller";
import { categorySchemas } from "./schemas";

export default async function categoryRoutes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions
) {
  // All category routes are public (no authentication required)

  // Get all categories
  fastify.get(
    "/",
    {
      schema: categorySchemas.getAll,
    },
    controller.getAll
  );

  // Get category by ID
  fastify.get(
    "/:id",
    {
      schema: categorySchemas.getById,
    },
    controller.getById
  );

  // Get category by slug
  fastify.get(
    "/slug/:slug",
    {
      schema: categorySchemas.getBySlug,
    },
    controller.getBySlug
  );
}
