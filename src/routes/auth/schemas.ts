import { createValidationSchema } from '../../utils/validation';

export const authSchemas = {
  register: createValidationSchema({
    body: {
      type: 'object',
      required: ['email', 'password'],
      properties: {
        email: {
          type: 'string',
          format: 'email',
          minLength: 5,
          maxLength: 255,
        },
        password: {
          type: 'string',
          minLength: 8,
          maxLength: 128,
        },
        firstName: {
          type: 'string',
          minLength: 1,
          maxLength: 50,
        },
        lastName: {
          type: 'string',
          minLength: 1,
          maxLength: 50,
        },
        storeId: {
          type: 'string',
          minLength: 1,
          maxLength: 100,
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
              user: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  email: { type: 'string' },
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                  role: { type: 'string' },
                  status: { type: 'string' },
                  emailVerified: { type: 'boolean' },
                  storeId: { type: 'string' },
                },
              },
              tokens: {
                type: 'object',
                properties: {
                  accessToken: { type: 'string' },
                  refreshToken: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
  }),

  login: createValidationSchema({
    body: {
      type: 'object',
      required: ['email', 'password'],
      properties: {
        email: {
          type: 'string',
          format: 'email',
        },
        password: {
          type: 'string',
          minLength: 1,
        },
        storeId: {
          type: 'string',
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
              user: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  email: { type: 'string' },
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                  role: { type: 'string' },
                  status: { type: 'string' },
                  emailVerified: { type: 'boolean' },
                  storeId: { type: 'string' },
                },
              },
              tokens: {
                type: 'object',
                properties: {
                  accessToken: { type: 'string' },
                  refreshToken: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
  }),

  refresh: createValidationSchema({
    body: {
      type: 'object',
      required: ['refreshToken'],
      properties: {
        refreshToken: {
          type: 'string',
          minLength: 1,
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
              accessToken: { type: 'string' },
              refreshToken: { type: 'string' },
            },
          },
        },
      },
    },
  }),

  logout: createValidationSchema({
    body: {
      type: 'object',
      required: ['refreshToken'],
      properties: {
        refreshToken: {
          type: 'string',
          minLength: 1,
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
              message: { type: 'string' },
            },
          },
        },
      },
    },
  }),

  verifyEmail: createValidationSchema({
    body: {
      type: 'object',
      required: ['token'],
      properties: {
        token: {
          type: 'string',
          minLength: 1,
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
              message: { type: 'string' },
            },
          },
        },
      },
    },
  }),

  resendVerification: createValidationSchema({
    body: {
      type: 'object',
      required: ['email'],
      properties: {
        email: {
          type: 'string',
          format: 'email',
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
              message: { type: 'string' },
            },
          },
        },
      },
    },
  }),

  forgotPassword: createValidationSchema({
    body: {
      type: 'object',
      required: ['email'],
      properties: {
        email: {
          type: 'string',
          format: 'email',
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
              message: { type: 'string' },
            },
          },
        },
      },
    },
  }),

  resetPassword: createValidationSchema({
    body: {
      type: 'object',
      required: ['token', 'newPassword'],
      properties: {
        token: {
          type: 'string',
          minLength: 1,
        },
        newPassword: {
          type: 'string',
          minLength: 8,
          maxLength: 128,
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
              message: { type: 'string' },
            },
          },
        },
      },
    },
  }),

  changePassword: createValidationSchema({
    body: {
      type: 'object',
      required: ['currentPassword', 'newPassword'],
      properties: {
        currentPassword: {
          type: 'string',
          minLength: 1,
        },
        newPassword: {
          type: 'string',
          minLength: 8,
          maxLength: 128,
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
              message: { type: 'string' },
            },
          },
        },
      },
    },
  }),
};

