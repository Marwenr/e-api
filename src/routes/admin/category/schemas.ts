import { createValidationSchema } from '../../../utils/validation';

// Create category schema
export const createCategorySchema = createValidationSchema({
  body: {
    type: 'object',
    required: ['name'],
    properties: {
      name: {
        type: 'string',
        minLength: 1,
        maxLength: 100,
      },
      slug: {
        type: 'string',
        minLength: 1,
      },
      description: {
        type: 'string',
        maxLength: 500,
      },
      parentId: {
        type: ['string', 'null'],
        pattern: '^[0-9a-fA-F]{24}$',
      },
      image: {
        type: 'string',
      },
      isActive: {
        type: 'boolean',
      },
    },
  },
});

// Update category schema
export const updateCategorySchema = createValidationSchema({
  params: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        pattern: '^[0-9a-fA-F]{24}$',
      },
    },
    required: ['id'],
  },
  body: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        minLength: 1,
        maxLength: 100,
      },
      slug: {
        type: 'string',
        minLength: 1,
      },
      description: {
        type: 'string',
        maxLength: 500,
      },
      parentId: {
        type: ['string', 'null'],
        pattern: '^[0-9a-fA-F]{24}$',
      },
      image: {
        type: 'string',
      },
      isActive: {
        type: 'boolean',
      },
    },
  },
});

// Get category by ID schema
export const getCategoryByIdSchema = createValidationSchema({
  params: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        pattern: '^[0-9a-fA-F]{24}$',
      },
    },
    required: ['id'],
  },
});

// Delete category schema
export const deleteCategorySchema = createValidationSchema({
  params: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        pattern: '^[0-9a-fA-F]{24}$',
      },
    },
    required: ['id'],
  },
});

// Get all categories schema (admin)
export const adminCategoryListSchema = createValidationSchema({
  querystring: {
    type: 'object',
    properties: {
      isActive: {
        type: 'string',
        enum: ['true', 'false'],
      },
      parentId: {
        type: 'string',
        pattern: '^[0-9a-fA-F]{24}$',
      },
    },
  },
});








