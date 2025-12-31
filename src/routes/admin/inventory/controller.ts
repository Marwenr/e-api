import { FastifyReply, FastifyRequest } from 'fastify';
import { InventoryService } from '../../../services';
import { sendSuccess, sendPaginated, sendError } from '../../../utils/response';
import { NotFoundError, ValidationError } from '../../../services/errors';
import { AuthenticatedRequest } from '../../../middleware/auth';

/**
 * Get inventory list
 */
export const getInventory = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> => {
  try {
    const query = request.query as {
      page?: string;
      limit?: string;
      productId?: string;
      lowStockOnly?: string;
      search?: string;
    };

    const options = {
      page: query.page ? parseInt(query.page, 10) : 1,
      limit: query.limit ? parseInt(query.limit, 10) : 20,
      productId: query.productId,
      lowStockOnly: query.lowStockOnly === 'true',
      search: query.search,
    };

    const result = await InventoryService.getInventory(options);
    sendPaginated(reply, result, 200);
  } catch (error: any) {
    sendError(reply, error.message || 'Failed to get inventory', 'GET_INVENTORY_ERROR', 500);
  }
};

/**
 * Get inventory by variant ID
 */
export const getInventoryByVariantId = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> => {
  try {
    const { variantId } = request.params as { variantId: string };
    const inventory = await InventoryService.getInventoryByVariantId(variantId);
    sendSuccess(reply, inventory, 200);
  } catch (error: any) {
    if (error instanceof NotFoundError) {
      sendError(reply, error.message, 'VARIANT_NOT_FOUND', 404);
    } else {
      sendError(reply, 'Failed to get inventory', 'GET_INVENTORY_ERROR', 500);
    }
  }
};

/**
 * Update stock for a variant
 */
export const updateStock = async (
  request: AuthenticatedRequest,
  reply: FastifyReply
): Promise<void> => {
  try {
    const { variantId } = request.params as { variantId: string };
    const { stock, reservedStock } = request.body as {
      stock: number;
      reservedStock?: number;
    };

    const inventory = await InventoryService.updateStock({
      variantId,
      stock,
      reservedStock,
    });

    sendSuccess(reply, inventory, 200);
  } catch (error: any) {
    if (error instanceof NotFoundError) {
      sendError(reply, error.message, 'VARIANT_NOT_FOUND', 404);
    } else if (error instanceof ValidationError) {
      sendError(reply, error.message, 'VALIDATION_ERROR', 400);
    } else {
      sendError(reply, error.message || 'Failed to update stock', 'UPDATE_STOCK_ERROR', 500);
    }
  }
};

/**
 * Bulk update stock
 */
export const bulkUpdateStock = async (
  request: AuthenticatedRequest,
  reply: FastifyReply
): Promise<void> => {
  try {
    const { updates } = request.body as {
      updates: Array<{
        variantId: string;
        stock: number;
        reservedStock?: number;
      }>;
    };

    const result = await InventoryService.bulkUpdateStock({ updates });
    sendSuccess(reply, result, 200);
  } catch (error: any) {
    if (error instanceof ValidationError) {
      sendError(reply, error.message, 'VALIDATION_ERROR', 400);
    } else {
      sendError(reply, error.message || 'Failed to update stock', 'BULK_UPDATE_STOCK_ERROR', 500);
    }
  }
};

/**
 * Get low stock alerts
 */
export const getLowStockAlerts = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> => {
  try {
    const query = request.query as { threshold?: string };
    const threshold = query.threshold ? parseInt(query.threshold, 10) : undefined;

    const alerts = await InventoryService.getLowStockAlerts(threshold);
    sendSuccess(reply, alerts, 200);
  } catch (error: any) {
    sendError(reply, error.message || 'Failed to get low stock alerts', 'GET_LOW_STOCK_ALERTS_ERROR', 500);
  }
};

