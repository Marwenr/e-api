import { FastifyReply, FastifyRequest } from 'fastify';
import { CategoryService } from '../../../services';
import { sendSuccess, sendError } from '../../../utils/response';
import { NotFoundError, ValidationError } from '../../../services/errors';
import { AuthenticatedRequest } from '../../../middleware/auth';

/**
 * Get all categories for admin (includes all statuses)
 */
export const getAllCategories = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> => {
  try {
    const query = request.query as {
      isActive?: string;
      parentId?: string;
    };

    const options: any = {
      parentId: query.parentId,
      includeInactive: true, // Admin can see all categories
    };

    // Only filter by isActive if explicitly provided
    if (query.isActive === "true") {
      options.isActive = true;
    } else if (query.isActive === "false") {
      options.isActive = false;
    }

    const categories = await CategoryService.getAllCategories(options);
    sendSuccess(reply, categories, 200);
  } catch (error: any) {
    sendError(reply, error.message || 'Failed to get categories', 'GET_ADMIN_CATEGORIES_ERROR', 500);
  }
};

/**
 * Get category by ID (admin - includes all statuses)
 */
export const getCategoryById = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> => {
  try {
    const { id } = request.params as { id: string };
    const category = await CategoryService.getCategoryById(id);
    sendSuccess(reply, category, 200);
  } catch (error: any) {
    if (error instanceof NotFoundError) {
      sendError(reply, error.message, 'CATEGORY_NOT_FOUND', 404);
    } else {
      sendError(reply, error.message || 'Failed to get category', 'GET_ADMIN_CATEGORY_ERROR', 500);
    }
  }
};

/**
 * Create a new category
 */
export const createCategory = async (
  request: AuthenticatedRequest,
  reply: FastifyReply
): Promise<void> => {
  try {
    const input = request.body as any;
    const category = await CategoryService.createCategory(input);
    sendSuccess(reply, category, 201);
  } catch (error: any) {
    if (error instanceof ValidationError) {
      sendError(reply, error.message, 'VALIDATION_ERROR', 400);
    } else {
      sendError(reply, error.message || 'Failed to create category', 'CREATE_CATEGORY_ERROR', 500);
    }
  }
};

/**
 * Update a category
 */
export const updateCategory = async (
  request: AuthenticatedRequest,
  reply: FastifyReply
): Promise<void> => {
  try {
    const { id } = request.params as { id: string };
    const input = request.body as any;
    const category = await CategoryService.updateCategory(id, input);
    sendSuccess(reply, category, 200);
  } catch (error: any) {
    if (error instanceof NotFoundError) {
      sendError(reply, error.message, 'CATEGORY_NOT_FOUND', 404);
    } else if (error instanceof ValidationError) {
      sendError(reply, error.message, 'VALIDATION_ERROR', 400);
    } else {
      sendError(reply, error.message || 'Failed to update category', 'UPDATE_CATEGORY_ERROR', 500);
    }
  }
};

/**
 * Delete a category (hard delete)
 */
export const deleteCategory = async (
  request: AuthenticatedRequest,
  reply: FastifyReply
): Promise<void> => {
  try {
    const { id } = request.params as { id: string };
    await CategoryService.deleteCategory(id);
    sendSuccess(reply, { message: 'Category deleted successfully' }, 200);
  } catch (error: any) {
    if (error instanceof NotFoundError) {
      sendError(reply, error.message, 'CATEGORY_NOT_FOUND', 404);
    } else if (error instanceof ValidationError) {
      sendError(reply, error.message, 'VALIDATION_ERROR', 400);
    } else {
      sendError(reply, error.message || 'Failed to delete category', 'DELETE_CATEGORY_ERROR', 500);
    }
  }
};

