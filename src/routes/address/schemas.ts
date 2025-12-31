import { createValidationSchema } from '../../utils/validation';

export const addressSchemas = {
  getAll: createValidationSchema({
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                userId: { type: 'string' },
                fullName: { type: 'string' },
                addressLine1: { type: 'string' },
                addressLine2: { type: 'string' },
                city: { type: 'string' },
                state: { type: 'string' },
                postalCode: { type: 'string' },
                country: { type: 'string' },
                isDefault: { type: 'boolean' },
                createdAt: { type: 'string' },
                updatedAt: { type: 'string' },
              },
            },
          },
        },
      },
    },
  }),

  getById: createValidationSchema({
    params: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'string' },
      },
    },
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              userId: { type: 'string' },
              fullName: { type: 'string' },
              addressLine1: { type: 'string' },
              addressLine2: { type: 'string' },
              city: { type: 'string' },
              state: { type: 'string' },
              postalCode: { type: 'string' },
              country: { type: 'string' },
              isDefault: { type: 'boolean' },
              createdAt: { type: 'string' },
              updatedAt: { type: 'string' },
            },
          },
        },
      },
    },
  }),

  create: createValidationSchema({
    body: {
      type: 'object',
      required: ['fullName', 'addressLine1', 'city', 'state', 'postalCode', 'country'],
      properties: {
        fullName: {
          type: 'string',
          minLength: 1,
          maxLength: 100,
        },
        addressLine1: {
          type: 'string',
          minLength: 1,
          maxLength: 200,
        },
        addressLine2: {
          type: 'string',
          maxLength: 200,
        },
        city: {
          type: 'string',
          minLength: 1,
          maxLength: 100,
        },
        state: {
          type: 'string',
          minLength: 1,
          maxLength: 100,
        },
        postalCode: {
          type: 'string',
          minLength: 1,
          maxLength: 20,
        },
        country: {
          type: 'string',
          minLength: 1,
          maxLength: 100,
        },
        isDefault: {
          type: 'boolean',
        },
      },
    },
    response: {
      201: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              userId: { type: 'string' },
              fullName: { type: 'string' },
              addressLine1: { type: 'string' },
              addressLine2: { type: 'string' },
              city: { type: 'string' },
              state: { type: 'string' },
              postalCode: { type: 'string' },
              country: { type: 'string' },
              isDefault: { type: 'boolean' },
            },
          },
        },
      },
    },
  }),

  update: createValidationSchema({
    params: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'string' },
      },
    },
    body: {
      type: 'object',
      properties: {
        fullName: {
          type: 'string',
          minLength: 1,
          maxLength: 100,
        },
        addressLine1: {
          type: 'string',
          minLength: 1,
          maxLength: 200,
        },
        addressLine2: {
          type: 'string',
          maxLength: 200,
        },
        city: {
          type: 'string',
          minLength: 1,
          maxLength: 100,
        },
        state: {
          type: 'string',
          minLength: 1,
          maxLength: 100,
        },
        postalCode: {
          type: 'string',
          minLength: 1,
          maxLength: 20,
        },
        country: {
          type: 'string',
          minLength: 1,
          maxLength: 100,
        },
        isDefault: {
          type: 'boolean',
        },
      },
    },
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              userId: { type: 'string' },
              fullName: { type: 'string' },
              addressLine1: { type: 'string' },
              addressLine2: { type: 'string' },
              city: { type: 'string' },
              state: { type: 'string' },
              postalCode: { type: 'string' },
              country: { type: 'string' },
              isDefault: { type: 'boolean' },
            },
          },
        },
      },
    },
  }),

  delete: createValidationSchema({
    params: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'string' },
      },
    },
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: {
            type: 'object',
            properties: {
              message: { type: 'string' },
            },
          },
        },
      },
    },
  }),
};

