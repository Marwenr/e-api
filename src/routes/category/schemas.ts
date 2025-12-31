import { createValidationSchema } from "../../utils/validation";

const categorySchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    name: { type: "string" },
    slug: { type: "string" },
    description: { type: "string", nullable: true },
    parentId: { type: "string", nullable: true },
    image: { type: "string", nullable: true },
    isActive: { type: "boolean" },
    createdAt: { type: "string" },
    updatedAt: { type: "string" },
  },
};

const categoryQuerySchema = {
  type: "object",
  properties: {
    isActive: {
      type: "string",
      enum: ["true", "false"],
      description: "Filter by active status",
    },
    parentId: {
      type: "string",
      pattern: "^[0-9a-fA-F]{24}$",
      description: "Filter by parent category ID",
    },
  },
};

export const categorySchemas = {
  getAll: {
    description: "Get all categories",
    tags: ["categories"],
    querystring: categoryQuerySchema,
    response: {
      200: {
        type: "object",
        properties: {
          success: { type: "boolean" },
          data: {
            type: "array",
            items: categorySchema,
          },
        },
      },
    },
  },
  getById: {
    description: "Get category by ID",
    tags: ["categories"],
    params: {
      type: "object",
      properties: {
        id: {
          type: "string",
          pattern: "^[0-9a-fA-F]{24}$",
          description: "Category ID",
        },
      },
      required: ["id"],
    },
    response: {
      200: {
        type: "object",
        properties: {
          success: { type: "boolean" },
          data: categorySchema,
        },
      },
    },
  },
  getBySlug: {
    description: "Get category by slug",
    tags: ["categories"],
    params: {
      type: "object",
      properties: {
        slug: {
          type: "string",
          description: "Category slug",
        },
      },
      required: ["slug"],
    },
    response: {
      200: {
        type: "object",
        properties: {
          success: { type: "boolean" },
          data: categorySchema,
        },
      },
    },
  },
};

