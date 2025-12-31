import { createValidationSchema, commonSchemas } from "../../utils/validation";

const productSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    name: { type: "string" },
    slug: { type: "string" },
    description: { type: "string" },
    shortDescription: { type: "string" },
    category: {
      oneOf: [
        { type: "string" },
        {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            slug: { type: "string" },
          },
          required: ["id", "name", "slug"],
        },
      ],
    },
    sku: { type: "string" },
    basePrice: { type: "number" },
    discountPrice: { type: "number", nullable: true },
    status: { type: "string" },
    soldCount: { type: "number" },
    publishedAt: { type: "string", nullable: true },
    images: {
      type: "array",
      items: {
        type: "object",
        properties: {
          url: { type: "string" },
          alt: { type: "string" },
          isPrimary: { type: "boolean" },
        },
      },
    },
    attributes: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          value: { type: "string" },
        },
      },
    },
    seoTitle: { type: "string", nullable: true },
    seoDescription: { type: "string", nullable: true },
    seoKeywords: { type: "array", items: { type: "string" } },
    createdAt: { type: "string" },
    updatedAt: { type: "string" },
  },
};

const productListItemSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    name: { type: "string" },
    slug: { type: "string" },
    shortDescription: { type: "string", nullable: true },
    category: {
      oneOf: [
        { type: "string" },
        {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            slug: { type: "string" },
          },
          required: ["id", "name", "slug"],
        },
      ],
    },
    basePrice: { type: "number" },
    discountPrice: { type: "number", nullable: true },
    discountPercent: { type: "number", nullable: true },
    soldCount: { type: "number" },
    images: {
      type: "array",
      items: {
        type: "object",
        properties: {
          url: { type: "string" },
          alt: { type: "string" },
          isPrimary: { type: "boolean" },
        },
      },
    },
    publishedAt: { type: "string", nullable: true },
    createdAt: { type: "string" },
    status: { type: "string" },
  },
};

const paginationQuerySchema = {
  type: "object",
  properties: {
    page: {
      type: "string",
      pattern: "^[1-9]\\d*$",
      description: "Page number (minimum 1)",
    },
    limit: {
      type: "string",
      pattern: "^[1-9]\\d*$",
      description: "Items per page (minimum 1, maximum 100)",
    },
    categoryId: {
      type: "string",
      pattern: "^[0-9a-fA-F]{24}$",
      description: "Filter by category ID",
    },
    minPrice: {
      type: "string",
      pattern: "^\\d+(\\.\\d{1,2})?$",
      description: "Minimum price filter",
    },
    maxPrice: {
      type: "string",
      pattern: "^\\d+(\\.\\d{1,2})?$",
      description: "Maximum price filter",
    },
    status: {
      type: "string",
      enum: ["draft", "active", "archived"],
      description: "Filter by product status",
    },
  },
};

const paginatedResponseSchema = {
  type: "object",
  properties: {
    success: { type: "boolean" },
    data: {
      type: "array",
      items: productListItemSchema,
    },
    meta: {
      type: "object",
      properties: {
        page: { type: "number" },
        limit: { type: "number" },
        total: { type: "number" },
        totalPages: { type: "number" },
      },
    },
  },
};

export const productSchemas = {
  getAll: createValidationSchema({
    querystring: paginationQuerySchema,
    response: {
      200: paginatedResponseSchema,
      400: {
        type: "object",
        properties: {
          success: { type: "boolean" },
          error: {
            type: "object",
            properties: {
              message: { type: "string" },
              code: { type: "string" },
            },
          },
        },
      },
      500: {
        type: "object",
        properties: {
          success: { type: "boolean" },
          error: {
            type: "object",
            properties: {
              message: { type: "string" },
              code: { type: "string" },
            },
          },
        },
      },
    },
  }),

  getBySlug: createValidationSchema({
    params: {
      type: "object",
      required: ["slug"],
      properties: {
        slug: {
          type: "string",
          minLength: 1,
          description: "Product slug",
        },
      },
    },
    response: {
      200: {
        type: "object",
        properties: {
          success: { type: "boolean" },
          data: productSchema,
        },
      },
      404: {
        type: "object",
        properties: {
          success: { type: "boolean" },
          error: {
            type: "object",
            properties: {
              message: { type: "string" },
              code: { type: "string" },
            },
          },
        },
      },
      500: {
        type: "object",
        properties: {
          success: { type: "boolean" },
          error: {
            type: "object",
            properties: {
              message: { type: "string" },
              code: { type: "string" },
            },
          },
        },
      },
    },
  }),

  getBestSellers: createValidationSchema({
    querystring: {
      type: "object",
      properties: {
        page: {
          type: "string",
          pattern: "^[1-9]\\d*$",
          description: "Page number (minimum 1)",
        },
        limit: {
          type: "string",
          pattern: "^[1-9]\\d*$",
          description: "Items per page (minimum 1, maximum 100)",
        },
        categoryId: {
          type: "string",
          pattern: "^[0-9a-fA-F]{24}$",
          description: "Filter by category ID",
        },
        minPrice: {
          type: "string",
          pattern: "^\\d+(\\.\\d{1,2})?$",
          description: "Minimum price filter",
        },
        maxPrice: {
          type: "string",
          pattern: "^\\d+(\\.\\d{1,2})?$",
          description: "Maximum price filter",
        },
      },
    },
    response: {
      200: paginatedResponseSchema,
      400: {
        type: "object",
        properties: {
          success: { type: "boolean" },
          error: {
            type: "object",
            properties: {
              message: { type: "string" },
              code: { type: "string" },
            },
          },
        },
      },
      500: {
        type: "object",
        properties: {
          success: { type: "boolean" },
          error: {
            type: "object",
            properties: {
              message: { type: "string" },
              code: { type: "string" },
            },
          },
        },
      },
    },
  }),

  getNewArrivals: createValidationSchema({
    querystring: {
      type: "object",
      properties: {
        page: {
          type: "string",
          pattern: "^[1-9]\\d*$",
          description: "Page number (minimum 1)",
        },
        limit: {
          type: "string",
          pattern: "^[1-9]\\d*$",
          description: "Items per page (minimum 1, maximum 100)",
        },
        categoryId: {
          type: "string",
          pattern: "^[0-9a-fA-F]{24}$",
          description: "Filter by category ID",
        },
        minPrice: {
          type: "string",
          pattern: "^\\d+(\\.\\d{1,2})?$",
          description: "Minimum price filter",
        },
        maxPrice: {
          type: "string",
          pattern: "^\\d+(\\.\\d{1,2})?$",
          description: "Maximum price filter",
        },
      },
    },
    response: {
      200: paginatedResponseSchema,
      400: {
        type: "object",
        properties: {
          success: { type: "boolean" },
          error: {
            type: "object",
            properties: {
              message: { type: "string" },
              code: { type: "string" },
            },
          },
        },
      },
      500: {
        type: "object",
        properties: {
          success: { type: "boolean" },
          error: {
            type: "object",
            properties: {
              message: { type: "string" },
              code: { type: "string" },
            },
          },
        },
      },
    },
  }),

  getFeatured: createValidationSchema({
    querystring: {
      type: "object",
      properties: {
        page: {
          type: "string",
          pattern: "^[1-9]\\d*$",
          description: "Page number (minimum 1)",
        },
        limit: {
          type: "string",
          pattern: "^[1-9]\\d*$",
          description: "Items per page (minimum 1, maximum 100)",
        },
        categoryId: {
          type: "string",
          pattern: "^[0-9a-fA-F]{24}$",
          description: "Filter by category ID",
        },
        minPrice: {
          type: "string",
          pattern: "^\\d+(\\.\\d{1,2})?$",
          description: "Minimum price filter",
        },
        maxPrice: {
          type: "string",
          pattern: "^\\d+(\\.\\d{1,2})?$",
          description: "Maximum price filter",
        },
      },
    },
    response: {
      200: paginatedResponseSchema,
      400: {
        type: "object",
        properties: {
          success: { type: "boolean" },
          error: {
            type: "object",
            properties: {
              message: { type: "string" },
              code: { type: "string" },
            },
          },
        },
      },
      500: {
        type: "object",
        properties: {
          success: { type: "boolean" },
          error: {
            type: "object",
            properties: {
              message: { type: "string" },
              code: { type: "string" },
            },
          },
        },
      },
    },
  }),

  getDiscounted: createValidationSchema({
    querystring: {
      type: "object",
      properties: {
        page: {
          type: "string",
          pattern: "^[1-9]\\d*$",
          description: "Page number (minimum 1)",
        },
        limit: {
          type: "string",
          pattern: "^[1-9]\\d*$",
          description: "Items per page (minimum 1, maximum 100)",
        },
        categoryId: {
          type: "string",
          pattern: "^[0-9a-fA-F]{24}$",
          description: "Filter by category ID",
        },
        minPrice: {
          type: "string",
          pattern: "^\\d+(\\.\\d{1,2})?$",
          description: "Minimum price filter",
        },
        maxPrice: {
          type: "string",
          pattern: "^\\d+(\\.\\d{1,2})?$",
          description: "Maximum price filter",
        },
      },
    },
    response: {
      200: paginatedResponseSchema,
      400: {
        type: "object",
        properties: {
          success: { type: "boolean" },
          error: {
            type: "object",
            properties: {
              message: { type: "string" },
              code: { type: "string" },
            },
          },
        },
      },
      500: {
        type: "object",
        properties: {
          success: { type: "boolean" },
          error: {
            type: "object",
            properties: {
              message: { type: "string" },
              code: { type: "string" },
            },
          },
        },
      },
    },
  }),
};
