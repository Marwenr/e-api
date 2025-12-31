import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import {
  getInventory,
  getInventoryByVariantId,
  updateStock,
  bulkUpdateStock,
  getLowStockAlerts,
} from './controller';
import {
  getInventorySchema,
  getInventoryByVariantSchema,
  updateStockSchema,
  bulkUpdateStockSchema,
  getLowStockAlertsSchema,
} from './schemas';
import { authenticate } from '../../../middleware/auth';
import { requireAdmin } from '../../../middleware/roles';

export default async function adminInventoryRoutes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions
) {
  // All admin inventory routes require authentication and admin role
  fastify.addHook('onRequest', authenticate);
  fastify.addHook('onRequest', requireAdmin);

  // Get inventory list
  fastify.get('/', { schema: getInventorySchema }, getInventory);

  // Get inventory by variant ID
  fastify.get('/variant/:variantId', { schema: getInventoryByVariantSchema }, getInventoryByVariantId);

  // Update stock for a variant
  fastify.put('/variant/:variantId/stock', { schema: updateStockSchema }, updateStock);

  // Bulk update stock
  fastify.put('/bulk-update', { schema: bulkUpdateStockSchema }, bulkUpdateStock);

  // Get low stock alerts
  fastify.get('/low-stock', { schema: getLowStockAlertsSchema }, getLowStockAlerts);
}

