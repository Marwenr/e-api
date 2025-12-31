import { createValidationSchema } from "../../utils/validation";

export const contactSchemas = {
  create: createValidationSchema({
    body: {
      type: "object",
      required: ["name", "email", "message"],
      properties: {
        name: {
          type: "string",
          minLength: 1,
          maxLength: 100,
        },
        email: {
          type: "string",
          format: "email",
          maxLength: 255,
        },
        message: {
          type: "string",
          minLength: 1,
          maxLength: 5000,
        },
      },
    },
    response: {
      201: {
        type: "object",
        properties: {
          success: { type: "boolean" },
          data: {
            type: "object",
            properties: {
              id: { type: "string" },
              name: { type: "string" },
              email: { type: "string" },
              message: { type: "string" },
              createdAt: { type: "string" },
              updatedAt: { type: "string" },
            },
          },
        },
      },
    },
  }),
};
