import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { authenticate } from '../../middleware/auth';
import * as controller from './controller';
import { addressSchemas } from './schemas';

export default async function addressRoutes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions
) {
  // All routes require authentication
  fastify.addHook('preHandler', authenticate);

  fastify.get('/', {
    schema: addressSchemas.getAll,
  }, controller.getAll);

  fastify.get('/:id', {
    schema: addressSchemas.getById,
  }, controller.getById);

  fastify.post('/', {
    schema: addressSchemas.create,
  }, controller.create);

  fastify.patch('/:id', {
    schema: addressSchemas.update,
  }, controller.update);

  fastify.delete('/:id', {
    schema: addressSchemas.delete,
  }, controller.deleteAddress);
}

