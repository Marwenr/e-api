import { FastifyReply, FastifyRequest } from "fastify";
import { CategoryService } from "../../services";
import { sendSuccess, sendError } from "../../utils/response";
import { AuthError } from "../../services/errors";

/**
 * Get all categories
 */
export const getAll = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> => {
  try {
    const query = request.query as {
      isActive?: string;
      parentId?: string;
    };

    const options = {
      isActive:
        query.isActive === "true"
          ? true
          : query.isActive === "false"
          ? false
          : undefined,
      parentId: query.parentId,
    };

    const categories = await CategoryService.getAllCategories(options);
    sendSuccess(reply, categories, 200);
  } catch (error: any) {
    if (error instanceof AuthError) {
      sendError(reply, error.message, error.code, error.statusCode);
    } else {
      sendError(reply, "Failed to get categories", "GET_CATEGORIES_ERROR", 500);
    }
  }
};

/**
 * Get category by ID
 */
export const getById = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> => {
  try {
    const { id } = request.params as { id: string };

    const category = await CategoryService.getCategoryById(id);
    sendSuccess(reply, category, 200);
  } catch (error: any) {
    if (error instanceof AuthError) {
      sendError(reply, error.message, error.code, error.statusCode);
    } else {
      sendError(reply, "Failed to get category", "GET_CATEGORY_ERROR", 500);
    }
  }
};

/**
 * Get category by slug
 */
export const getBySlug = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> => {
  try {
    const { slug } = request.params as { slug: string };

    const category = await CategoryService.getCategoryBySlug(slug);
    sendSuccess(reply, category, 200);
  } catch (error: any) {
    if (error instanceof AuthError) {
      sendError(reply, error.message, error.code, error.statusCode);
    } else {
      sendError(reply, "Failed to get category", "GET_CATEGORY_ERROR", 500);
    }
  }
};
