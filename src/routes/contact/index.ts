import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import * as controller from './controller';
import { contactSchemas } from './schemas';

export default async function contactRoutes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions
) {
  // Public route - no authentication required
  fastify.post('/', {
    schema: contactSchemas.create,
  }, controller.create);
}

