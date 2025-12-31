import { createValidationSchema } from "../../utils/validation";

export const cartSchemas = {
  addToCart: createValidationSchema({
    body: {
      type: "object",
      required: ["productId", "quantity"],
      properties: {
        productId: {
          type: "string",
          pattern: "^[0-9a-fA-F]{24}$",
        },
        variantId: {
          type: "string",
          pattern: "^[0-9a-fA-F]{24}$",
          nullable: true,
        },
        quantity: {
          type: "number",
          minimum: 1,
          maximum: 1000,
        },
      },
    },
  }),

  updateCartItem: createValidationSchema({
    body: {
      type: "object",
      required: ["itemIndex", "quantity"],
      properties: {
        itemIndex: {
          type: "number",
          minimum: 0,
        },
        quantity: {
          type: "number",
          minimum: 1,
          maximum: 1000,
        },
      },
    },
  }),

  removeCartItem: createValidationSchema({
    querystring: {
      type: "object",
      required: ["itemIndex"],
      properties: {
        itemIndex: {
          type: "string",
          pattern: "^[0-9]+$",
        },
        sessionId: {
          type: "string",
        },
      },
    },
  }),

  getCart: createValidationSchema({
    querystring: {
      type: "object",
      properties: {
        sessionId: { type: "string" },
      },
    },
  }),

  mergeCart: createValidationSchema({
    body: {
      type: "object",
      required: ["sessionId"],
      properties: {
        sessionId: { type: "string" },
      },
    },
  }),
};

