import { FastifyReply, FastifyRequest } from "fastify";
import { ProductService, ProductVariantService } from "../../../services";
import { sendSuccess, sendPaginated, sendError } from "../../../utils/response";
import {
  NotFoundError,
  ValidationError,
  ConflictError,
} from "../../../services/errors";
import { AuthenticatedRequest } from "../../../middleware/auth";

/**
 * Get all products for admin (includes all statuses)
 */
export const getAllProducts = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> => {
  try {
    const query = request.query as {
      page?: string;
      limit?: string;
      search?: string;
      status?: string;
      categoryId?: string;
      minPrice?: string;
      maxPrice?: string;
      sortBy?: string;
      sortOrder?: string;
    };

    const options = {
      page: query.page ? parseInt(query.page, 10) : 1,
      limit: query.limit ? parseInt(query.limit, 10) : 20,
      search: query.search,
      status: query.status as any,
      categoryId: query.categoryId,
      minPrice: query.minPrice ? parseFloat(query.minPrice) : undefined,
      maxPrice: query.maxPrice ? parseFloat(query.maxPrice) : undefined,
      sortBy: query.sortBy || "createdAt",
      sortOrder: (query.sortOrder === "asc" ? "asc" : "desc") as "asc" | "desc",
    };

    const result = await ProductService.getAdminProducts(options);
    sendPaginated(reply, result, 200);
  } catch (error: any) {
    sendError(
      reply,
      error.message || "Failed to get products",
      "GET_ADMIN_PRODUCTS_ERROR",
      500
    );
  }
};

/**
 * Get product by ID (admin - includes all statuses)
 */
export const getProductById = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> => {
  try {
    const { id } = request.params as { id: string };
    const product = await ProductService.getProductById(id, true); // includeArchived = true
    sendSuccess(reply, product, 200);
  } catch (error: any) {
    if (error instanceof NotFoundError) {
      sendError(reply, error.message, "PRODUCT_NOT_FOUND", 404);
    } else {
      sendError(reply, "Failed to get product", "GET_PRODUCT_ERROR", 500);
    }
  }
};

/**
 * Create a new product
 */
export const createProduct = async (
  request: AuthenticatedRequest,
  reply: FastifyReply
): Promise<void> => {
  try {
    const input = request.body as any;
    const product = await ProductService.createProduct(input);
    sendSuccess(reply, product, 201);
  } catch (error: any) {
    if (error instanceof ValidationError) {
      sendError(reply, error.message, "VALIDATION_ERROR", 400);
    } else {
      sendError(
        reply,
        error.message || "Failed to create product",
        "CREATE_PRODUCT_ERROR",
        500
      );
    }
  }
};

/**
 * Update a product
 */
export const updateProduct = async (
  request: AuthenticatedRequest,
  reply: FastifyReply
): Promise<void> => {
  try {
    const { id } = request.params as { id: string };
    const input = request.body as any;
    const product = await ProductService.updateProduct(id, input);
    sendSuccess(reply, product, 200);
  } catch (error: any) {
    if (error instanceof NotFoundError) {
      sendError(reply, error.message, "PRODUCT_NOT_FOUND", 404);
    } else if (error instanceof ValidationError) {
      sendError(reply, error.message, "VALIDATION_ERROR", 400);
    } else {
      sendError(
        reply,
        error.message || "Failed to update product",
        "UPDATE_PRODUCT_ERROR",
        500
      );
    }
  }
};

/**
 * Delete a product (hard delete)
 */
export const deleteProduct = async (
  request: AuthenticatedRequest,
  reply: FastifyReply
): Promise<void> => {
  try {
    const { id } = request.params as { id: string };
    await ProductService.deleteProduct(id);
    sendSuccess(reply, { message: "Product deleted successfully" }, 200);
  } catch (error: any) {
    if (error instanceof NotFoundError) {
      sendError(reply, error.message, "PRODUCT_NOT_FOUND", 404);
    } else {
      sendError(
        reply,
        error.message || "Failed to delete product",
        "DELETE_PRODUCT_ERROR",
        500
      );
    }
  }
};

/**
 * Publish a product
 */
export const publishProduct = async (
  request: AuthenticatedRequest,
  reply: FastifyReply
): Promise<void> => {
  try {
    const { id } = request.params as { id: string };
    const product = await ProductService.publishProduct(id);
    sendSuccess(reply, product, 200);
  } catch (error: any) {
    if (error instanceof NotFoundError) {
      sendError(reply, error.message, "PRODUCT_NOT_FOUND", 404);
    } else if (error instanceof ValidationError) {
      sendError(reply, error.message, "VALIDATION_ERROR", 400);
    } else {
      sendError(
        reply,
        error.message || "Failed to publish product",
        "PUBLISH_PRODUCT_ERROR",
        500
      );
    }
  }
};

/**
 * Unpublish a product
 */
export const unpublishProduct = async (
  request: AuthenticatedRequest,
  reply: FastifyReply
): Promise<void> => {
  try {
    const { id } = request.params as { id: string };
    const product = await ProductService.unpublishProduct(id);
    sendSuccess(reply, product, 200);
  } catch (error: any) {
    if (error instanceof NotFoundError) {
      sendError(reply, error.message, "PRODUCT_NOT_FOUND", 404);
    } else if (error instanceof ValidationError) {
      sendError(reply, error.message, "VALIDATION_ERROR", 400);
    } else {
      sendError(
        reply,
        error.message || "Failed to unpublish product",
        "UNPUBLISH_PRODUCT_ERROR",
        500
      );
    }
  }
};

/**
 * Archive a product
 */
export const archiveProduct = async (
  request: AuthenticatedRequest,
  reply: FastifyReply
): Promise<void> => {
  try {
    const { id } = request.params as { id: string };
    const product = await ProductService.archiveProduct(id);
    sendSuccess(reply, product, 200);
  } catch (error: any) {
    if (error instanceof NotFoundError) {
      sendError(reply, error.message, "PRODUCT_NOT_FOUND", 404);
    } else if (error instanceof ValidationError) {
      sendError(reply, error.message, "VALIDATION_ERROR", 400);
    } else {
      sendError(
        reply,
        error.message || "Failed to archive product",
        "ARCHIVE_PRODUCT_ERROR",
        500
      );
    }
  }
};

/**
 * Bulk actions on products
 */
export const bulkAction = async (
  request: AuthenticatedRequest,
  reply: FastifyReply
): Promise<void> => {
  try {
    const { productIds, action } = request.body as {
      productIds: string[];
      action: "publish" | "unpublish" | "archive" | "delete";
    };

    const results = await ProductService.bulkAction(productIds, action);
    sendSuccess(reply, results, 200);
  } catch (error: any) {
    if (error instanceof ValidationError) {
      sendError(reply, error.message, "VALIDATION_ERROR", 400);
    } else {
      sendError(
        reply,
        error.message || "Failed to perform bulk action",
        "BULK_ACTION_ERROR",
        500
      );
    }
  }
};

// ==================== Product Variant Controllers ====================

/**
 * Get variant by ID
 */
export const getVariantById = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> => {
  try {
    const { id } = request.params as { id: string };
    const variant = await ProductVariantService.getVariantById(id);
    sendSuccess(reply, variant, 200);
  } catch (error: any) {
    if (error instanceof NotFoundError) {
      sendError(reply, error.message, "VARIANT_NOT_FOUND", 404);
    } else {
      sendError(reply, "Failed to get variant", "GET_VARIANT_ERROR", 500);
    }
  }
};

/**
 * Get all variants for a product
 */
export const getVariantsByProduct = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> => {
  try {
    const { productId } = request.params as { productId: string };
    const variants = await ProductVariantService.getVariantsByProductId(
      productId
    );
    sendSuccess(reply, variants, 200);
  } catch (error: any) {
    if (error instanceof NotFoundError || error instanceof ValidationError) {
      sendError(reply, error.message, "GET_VARIANTS_ERROR", 404);
    } else {
      sendError(reply, "Failed to get variants", "GET_VARIANTS_ERROR", 500);
    }
  }
};

/**
 * Create a new variant
 */
export const createVariant = async (
  request: AuthenticatedRequest,
  reply: FastifyReply
): Promise<void> => {
  try {
    const input = request.body as any;
    const variant = await ProductVariantService.createVariant(input);
    sendSuccess(reply, variant, 201);
  } catch (error: any) {
    if (error instanceof ValidationError || error instanceof ConflictError) {
      sendError(reply, error.message, "VALIDATION_ERROR", 400);
    } else {
      sendError(
        reply,
        error.message || "Failed to create variant",
        "CREATE_VARIANT_ERROR",
        500
      );
    }
  }
};

/**
 * Update a variant
 */
export const updateVariant = async (
  request: AuthenticatedRequest,
  reply: FastifyReply
): Promise<void> => {
  try {
    const { id } = request.params as { id: string };
    const input = request.body as any;
    const variant = await ProductVariantService.updateVariant(id, input);
    sendSuccess(reply, variant, 200);
  } catch (error: any) {
    if (error instanceof NotFoundError) {
      sendError(reply, error.message, "VARIANT_NOT_FOUND", 404);
    } else if (
      error instanceof ValidationError ||
      error instanceof ConflictError
    ) {
      sendError(reply, error.message, "VALIDATION_ERROR", 400);
    } else {
      sendError(
        reply,
        error.message || "Failed to update variant",
        "UPDATE_VARIANT_ERROR",
        500
      );
    }
  }
};

/**
 * Delete a variant
 */
export const deleteVariant = async (
  request: AuthenticatedRequest,
  reply: FastifyReply
): Promise<void> => {
  try {
    const { id } = request.params as { id: string };
    await ProductVariantService.deleteVariant(id);
    sendSuccess(reply, { message: "Variant deleted successfully" }, 200);
  } catch (error: any) {
    if (error instanceof NotFoundError) {
      sendError(reply, error.message, "VARIANT_NOT_FOUND", 404);
    } else {
      sendError(
        reply,
        error.message || "Failed to delete variant",
        "DELETE_VARIANT_ERROR",
        500
      );
    }
  }
};
