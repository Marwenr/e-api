import { FastifyInstance, FastifyPluginOptions } from "fastify";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  publishProduct,
  unpublishProduct,
  archiveProduct,
  bulkAction,
  getVariantById,
  getVariantsByProduct,
  createVariant,
  updateVariant,
  deleteVariant,
} from "./controller";
import {
  createProductSchema,
  updateProductSchema,
  getProductByIdSchema,
  deleteProductSchema,
  publishProductSchema,
  bulkActionSchema,
  adminProductListSchema,
  createVariantSchema,
  updateVariantSchema,
  getVariantByIdSchema,
  deleteVariantSchema,
  getVariantsByProductSchema,
} from "./schemas";
import { authenticate } from "../../../middleware/auth";
import { requireAdmin } from "../../../middleware/roles";

export default async function adminProductRoutes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions
) {
  // All admin product routes require authentication and admin role
  fastify.addHook("onRequest", authenticate);
  fastify.addHook("onRequest", requireAdmin);

  // Get all products (admin - with search, filters, pagination)
  fastify.get("/", { schema: adminProductListSchema }, getAllProducts);

  // Product Variants (must be before /:id routes to avoid route conflicts)
  // Get all variants for a product
  fastify.get(
    "/:productId/variants",
    { schema: getVariantsByProductSchema },
    getVariantsByProduct
  );

  // Get variant by ID
  fastify.get(
    "/variants/:id",
    { schema: getVariantByIdSchema },
    getVariantById
  );

  // Create variant
  fastify.post("/variants", { schema: createVariantSchema }, createVariant);

  // Update variant
  fastify.put("/variants/:id", { schema: updateVariantSchema }, updateVariant);

  // Delete variant
  fastify.delete(
    "/variants/:id",
    { schema: deleteVariantSchema },
    deleteVariant
  );

  // Get product by ID
  fastify.get("/:id", { schema: getProductByIdSchema }, getProductById);

  // Create product
  fastify.post("/", { schema: createProductSchema }, createProduct);

  // Update product
  fastify.put("/:id", { schema: updateProductSchema }, updateProduct);

  // Delete product (hard delete)
  fastify.delete("/:id", { schema: deleteProductSchema }, deleteProduct);

  // Publish product
  fastify.post(
    "/:id/publish",
    { schema: publishProductSchema },
    publishProduct
  );

  // Unpublish product
  fastify.post(
    "/:id/unpublish",
    { schema: publishProductSchema },
    unpublishProduct
  );

  // Archive product
  fastify.post(
    "/:id/archive",
    { schema: publishProductSchema },
    archiveProduct
  );

  // Bulk actions
  fastify.post("/bulk-action", { schema: bulkActionSchema }, bulkAction);
}
