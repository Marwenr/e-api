import { createValidationSchema } from '../../../utils/validation';

// Get inventory list schema
export const getInventorySchema = createValidationSchema({
  querystring: {
    type: 'object',
    properties: {
      page: {
        type: 'string',
        pattern: '^[1-9]\\d*$',
      },
      limit: {
        type: 'string',
        pattern: '^[1-9]\\d*$',
      },
      productId: {
        type: 'string',
        pattern: '^[0-9a-fA-F]{24}$',
      },
      lowStockOnly: {
        type: 'string',
        enum: ['true', 'false'],
      },
      search: {
        type: 'string',
      },
    },
  },
});

// Get inventory by variant ID schema
export const getInventoryByVariantSchema = createValidationSchema({
  params: {
    type: 'object',
    required: ['variantId'],
    properties: {
      variantId: {
        type: 'string',
        pattern: '^[0-9a-fA-F]{24}$',
      },
    },
  },
});

// Update stock schema
export const updateStockSchema = createValidationSchema({
  params: {
    type: 'object',
    required: ['variantId'],
    properties: {
      variantId: {
        type: 'string',
        pattern: '^[0-9a-fA-F]{24}$',
      },
    },
  },
  body: {
    type: 'object',
    required: ['stock'],
    properties: {
      stock: {
        type: 'number',
        minimum: 0,
      },
      reservedStock: {
        type: 'number',
        minimum: 0,
      },
    },
  },
});

// Bulk update stock schema
export const bulkUpdateStockSchema = createValidationSchema({
  body: {
    type: 'object',
    required: ['updates'],
    properties: {
      updates: {
        type: 'array',
        items: {
          type: 'object',
          required: ['variantId', 'stock'],
          properties: {
            variantId: {
              type: 'string',
              pattern: '^[0-9a-fA-F]{24}$',
            },
            stock: {
              type: 'number',
              minimum: 0,
            },
            reservedStock: {
              type: 'number',
              minimum: 0,
            },
          },
        },
        minItems: 1,
      },
    },
  },
});

// Get low stock alerts schema
export const getLowStockAlertsSchema = createValidationSchema({
  querystring: {
    type: 'object',
    properties: {
      threshold: {
        type: 'string',
        pattern: '^[1-9]\\d*$',
      },
    },
  },
});
