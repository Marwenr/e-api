import { createValidationSchema } from '../../../utils/validation';

// Create product schema
export const createProductSchema = createValidationSchema({
  body: {
    type: 'object',
    required: ['name', 'categoryId', 'sku', 'basePrice'],
    properties: {
      name: {
        type: 'string',
        minLength: 1,
        maxLength: 200,
      },
      slug: {
        type: 'string',
      },
      description: {
        type: 'string',
      },
      shortDescription: {
        type: 'string',
        maxLength: 500,
      },
      categoryId: {
        type: 'string',
        pattern: '^[0-9a-fA-F]{24}$',
      },
      sku: {
        type: 'string',
        minLength: 1,
      },
      basePrice: {
        type: 'number',
        minimum: 0,
      },
      discountPrice: {
        type: 'number',
        minimum: 0,
      },
      status: {
        type: 'string',
        enum: ['draft', 'active', 'archived'],
      },
      images: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
            },
            alt: {
              type: 'string',
            },
            isPrimary: {
              type: 'boolean',
            },
          },
          required: ['url'],
        },
      },
      attributes: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              minLength: 1,
            },
            value: {
              type: 'string',
              minLength: 1,
            },
          },
          required: ['name', 'value'],
        },
      },
      seoTitle: {
        type: 'string',
        maxLength: 70,
      },
      seoDescription: {
        type: 'string',
        maxLength: 160,
      },
      seoKeywords: {
        type: 'array',
        items: {
          type: 'string',
        },
      },
    },
  },
});

// Update product schema
export const updateProductSchema = createValidationSchema({
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: {
        type: 'string',
        pattern: '^[0-9a-fA-F]{24}$',
      },
    },
  },
  body: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        minLength: 1,
        maxLength: 200,
      },
      slug: {
        type: 'string',
      },
      description: {
        type: 'string',
      },
      shortDescription: {
        type: 'string',
        maxLength: 500,
      },
      categoryId: {
        type: 'string',
        pattern: '^[0-9a-fA-F]{24}$',
      },
      sku: {
        type: 'string',
        minLength: 1,
      },
      basePrice: {
        type: 'number',
        minimum: 0,
      },
      discountPrice: {
        type: 'number',
        minimum: 0,
      },
      status: {
        type: 'string',
        enum: ['draft', 'active', 'archived'],
      },
      images: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
            },
            alt: {
              type: 'string',
            },
            isPrimary: {
              type: 'boolean',
            },
          },
          required: ['url'],
        },
      },
      attributes: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              minLength: 1,
            },
            value: {
              type: 'string',
              minLength: 1,
            },
          },
          required: ['name', 'value'],
        },
      },
      seoTitle: {
        type: 'string',
        maxLength: 70,
      },
      seoDescription: {
        type: 'string',
        maxLength: 160,
      },
      seoKeywords: {
        type: 'array',
        items: {
          type: 'string',
        },
      },
    },
  },
});

// Get product by ID schema
export const getProductByIdSchema = createValidationSchema({
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: {
        type: 'string',
        pattern: '^[0-9a-fA-F]{24}$',
      },
    },
  },
});

// Delete product schema
export const deleteProductSchema = createValidationSchema({
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: {
        type: 'string',
        pattern: '^[0-9a-fA-F]{24}$',
      },
    },
  },
});

// Publish/Unpublish product schema
export const publishProductSchema = createValidationSchema({
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: {
        type: 'string',
        pattern: '^[0-9a-fA-F]{24}$',
      },
    },
  },
});

// Bulk actions schema
export const bulkActionSchema = createValidationSchema({
  body: {
    type: 'object',
    required: ['productIds', 'action'],
    properties: {
      productIds: {
        type: 'array',
        items: {
          type: 'string',
          pattern: '^[0-9a-fA-F]{24}$',
        },
        minItems: 1,
      },
      action: {
        type: 'string',
        enum: ['publish', 'unpublish', 'archive', 'delete'],
      },
    },
  },
});

// Admin product list schema (with search and filters)
export const adminProductListSchema = createValidationSchema({
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
      search: {
        type: 'string',
      },
      status: {
        type: 'string',
        enum: ['draft', 'active', 'archived'],
      },
      categoryId: {
        type: 'string',
        pattern: '^[0-9a-fA-F]{24}$',
      },
      minPrice: {
        type: 'string',
        pattern: '^\\d+(\\.\\d{1,2})?$',
      },
      maxPrice: {
        type: 'string',
        pattern: '^\\d+(\\.\\d{1,2})?$',
      },
      sortBy: {
        type: 'string',
        enum: ['name', 'createdAt', 'updatedAt', 'basePrice', 'soldCount'],
      },
      sortOrder: {
        type: 'string',
        enum: ['asc', 'desc'],
      },
    },
  },
});

// Product Variant Schemas
export const createVariantSchema = createValidationSchema({
  body: {
    type: 'object',
    required: ['productId', 'sku', 'basePrice', 'stock', 'attributes'],
    properties: {
      productId: {
        type: 'string',
        pattern: '^[0-9a-fA-F]{24}$',
      },
      sku: {
        type: 'string',
        minLength: 1,
      },
      name: {
        type: 'string',
        maxLength: 200,
      },
      basePrice: {
        type: 'number',
        minimum: 0,
      },
      discountPrice: {
        type: 'number',
        minimum: 0,
      },
      stock: {
        type: 'number',
        minimum: 0,
      },
      attributes: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              minLength: 1,
            },
            value: {
              type: 'string',
              minLength: 1,
            },
          },
          required: ['name', 'value'],
        },
        minItems: 1,
      },
      images: {
        type: 'array',
        items: {
          type: 'string',
        },
      },
      isDefault: {
        type: 'boolean',
      },
    },
  },
});

export const updateVariantSchema = createValidationSchema({
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: {
        type: 'string',
        pattern: '^[0-9a-fA-F]{24}$',
      },
    },
  },
  body: {
    type: 'object',
    properties: {
      sku: {
        type: 'string',
        minLength: 1,
      },
      name: {
        type: 'string',
        maxLength: 200,
      },
      basePrice: {
        type: 'number',
        minimum: 0,
      },
      discountPrice: {
        type: 'number',
        minimum: 0,
      },
      stock: {
        type: 'number',
        minimum: 0,
      },
      attributes: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              minLength: 1,
            },
            value: {
              type: 'string',
              minLength: 1,
            },
          },
          required: ['name', 'value'],
        },
      },
      images: {
        type: 'array',
        items: {
          type: 'string',
        },
      },
      isDefault: {
        type: 'boolean',
      },
    },
  },
});

export const getVariantByIdSchema = createValidationSchema({
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: {
        type: 'string',
        pattern: '^[0-9a-fA-F]{24}$',
      },
    },
  },
});

export const deleteVariantSchema = createValidationSchema({
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: {
        type: 'string',
        pattern: '^[0-9a-fA-F]{24}$',
      },
    },
  },
});

export const getVariantsByProductSchema = createValidationSchema({
  params: {
    type: 'object',
    required: ['productId'],
    properties: {
      productId: {
        type: 'string',
        pattern: '^[0-9a-fA-F]{24}$',
      },
    },
  },
});
