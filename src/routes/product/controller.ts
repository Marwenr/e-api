import { FastifyReply, FastifyRequest } from 'fastify';
import { ProductService } from '../../services';
import { sendSuccess, sendPaginated, sendError } from '../../utils/response';
import { AuthError } from '../../services/errors';

/**
 * Get all products with filtering and pagination
 */
export const getAll = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> => {
  try {
    const query = request.query as {
      page?: string;
      limit?: string;
      categoryId?: string;
      minPrice?: string;
      maxPrice?: string;
      status?: string;
    };

    const options = {
      page: query.page ? parseInt(query.page, 10) : undefined,
      limit: query.limit ? parseInt(query.limit, 10) : undefined,
      categoryId: query.categoryId,
      minPrice: query.minPrice ? parseFloat(query.minPrice) : undefined,
      maxPrice: query.maxPrice ? parseFloat(query.maxPrice) : undefined,
      status: query.status as any,
    };

    const result = await ProductService.getAllProducts(options);
    sendPaginated(reply, result, 200);
  } catch (error: any) {
    if (error instanceof AuthError) {
      sendError(reply, error.message, error.code, error.statusCode);
    } else {
      sendError(reply, 'Failed to get products', 'GET_PRODUCTS_ERROR', 500);
    }
  }
};

/**
 * Get product by slug
 */
export const getBySlug = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> => {
  try {
    const { slug } = request.params as { slug: string };
    const product = await ProductService.getProductBySlug(slug);
    sendSuccess(reply, product, 200);
  } catch (error: any) {
    if (error instanceof AuthError) {
      sendError(reply, error.message, error.code, error.statusCode);
    } else {
      sendError(reply, 'Failed to get product', 'GET_PRODUCT_ERROR', 500);
    }
  }
};

/**
 * Get best selling products
 */
export const getBestSellers = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> => {
  try {
    const query = request.query as {
      page?: string;
      limit?: string;
      categoryId?: string;
      minPrice?: string;
      maxPrice?: string;
    };

    const options = {
      page: query.page ? parseInt(query.page, 10) : undefined,
      limit: query.limit ? parseInt(query.limit, 10) : undefined,
      categoryId: query.categoryId,
      minPrice: query.minPrice ? parseFloat(query.minPrice) : undefined,
      maxPrice: query.maxPrice ? parseFloat(query.maxPrice) : undefined,
    };

    const result = await ProductService.getBestSellers(options);
    sendPaginated(reply, result, 200);
  } catch (error: any) {
    if (error instanceof AuthError) {
      sendError(reply, error.message, error.code, error.statusCode);
    } else {
      sendError(reply, 'Failed to get best sellers', 'GET_BEST_SELLERS_ERROR', 500);
    }
  }
};

/**
 * Get new arrival products
 */
export const getNewArrivals = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> => {
  try {
    const query = request.query as {
      page?: string;
      limit?: string;
      categoryId?: string;
      minPrice?: string;
      maxPrice?: string;
    };

    const options = {
      page: query.page ? parseInt(query.page, 10) : undefined,
      limit: query.limit ? parseInt(query.limit, 10) : undefined,
      categoryId: query.categoryId,
      minPrice: query.minPrice ? parseFloat(query.minPrice) : undefined,
      maxPrice: query.maxPrice ? parseFloat(query.maxPrice) : undefined,
    };

    const result = await ProductService.getNewArrivals(options);
    sendPaginated(reply, result, 200);
  } catch (error: any) {
    if (error instanceof AuthError) {
      sendError(reply, error.message, error.code, error.statusCode);
    } else {
      sendError(reply, 'Failed to get new arrivals', 'GET_NEW_ARRIVALS_ERROR', 500);
    }
  }
};

/**
 * Get featured products
 */
export const getFeatured = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> => {
  try {
    const query = request.query as {
      page?: string;
      limit?: string;
      categoryId?: string;
      minPrice?: string;
      maxPrice?: string;
    };

    const options = {
      page: query.page ? parseInt(query.page, 10) : undefined,
      limit: query.limit ? parseInt(query.limit, 10) : undefined,
      categoryId: query.categoryId,
      minPrice: query.minPrice ? parseFloat(query.minPrice) : undefined,
      maxPrice: query.maxPrice ? parseFloat(query.maxPrice) : undefined,
    };

    const result = await ProductService.getFeaturedProducts(options);
    sendPaginated(reply, result, 200);
  } catch (error: any) {
    if (error instanceof AuthError) {
      sendError(reply, error.message, error.code, error.statusCode);
    } else {
      sendError(reply, 'Failed to get featured products', 'GET_FEATURED_PRODUCTS_ERROR', 500);
    }
  }
};

/**
 * Get discounted products
 */
export const getDiscounted = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> => {
  try {
    const query = request.query as {
      page?: string;
      limit?: string;
      categoryId?: string;
      minPrice?: string;
      maxPrice?: string;
    };

    const options = {
      page: query.page ? parseInt(query.page, 10) : undefined,
      limit: query.limit ? parseInt(query.limit, 10) : undefined,
      categoryId: query.categoryId,
      minPrice: query.minPrice ? parseFloat(query.minPrice) : undefined,
      maxPrice: query.maxPrice ? parseFloat(query.maxPrice) : undefined,
    };

    const result = await ProductService.getDiscountedProducts(options);
    sendPaginated(reply, result, 200);
  } catch (error: any) {
    if (error instanceof AuthError) {
      sendError(reply, error.message, error.code, error.statusCode);
    } else {
      sendError(reply, 'Failed to get discounted products', 'GET_DISCOUNTED_PRODUCTS_ERROR', 500);
    }
  }
};

