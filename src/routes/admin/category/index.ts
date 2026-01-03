import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from './controller';
import {
  createCategorySchema,
  updateCategorySchema,
  getCategoryByIdSchema,
  deleteCategorySchema,
  adminCategoryListSchema,
} from './schemas';
import { authenticate } from '../../../middleware/auth';
import { requireAdmin } from '../../../middleware/roles';

export default async function adminCategoryRoutes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions
) {
  // All admin category routes require authentication and admin role
  fastify.addHook('onRequest', authenticate);
  fastify.addHook('onRequest', requireAdmin);

  // Get all categories (admin - with filters)
  fastify.get('/', { schema: adminCategoryListSchema }, getAllCategories);

  // Get category by ID
  fastify.get('/:id', { schema: getCategoryByIdSchema }, getCategoryById);

  // Create category
  fastify.post('/', { schema: createCategorySchema }, createCategory);

  // Update category
  fastify.put('/:id', { schema: updateCategorySchema }, updateCategory);

  // Delete category (hard delete)
  fastify.delete('/:id', { schema: deleteCategorySchema }, deleteCategory);
}







