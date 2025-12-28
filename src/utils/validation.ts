import { FastifySchema } from 'fastify';

export interface ValidationSchema {
  body?: FastifySchema['body'];
  querystring?: FastifySchema['querystring'];
  params?: FastifySchema['params'];
  headers?: FastifySchema['headers'];
  response?: FastifySchema['response'];
}

export const createValidationSchema = (
  schema: ValidationSchema
): FastifySchema => {
  return {
    ...schema,
  };
};

// Common validation schemas
export const commonSchemas = {
  idParam: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        pattern: '^[0-9a-fA-F]{24}$',
        description: 'MongoDB ObjectId',
      },
    },
    required: ['id'],
  } as const,

  pagination: {
    type: 'object',
    properties: {
      page: {
        type: 'integer',
        minimum: 1,
        default: 1,
        description: 'Page number',
      },
      limit: {
        type: 'integer',
        minimum: 1,
        maximum: 100,
        default: 10,
        description: 'Items per page',
      },
    },
  } as const,
};

