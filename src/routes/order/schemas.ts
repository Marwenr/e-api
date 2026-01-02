import { FastifySchema } from 'fastify';

export const orderSchemas = {
  createOrder: {
    description: 'Create order from cart',
    tags: ['orders'],
    summary: 'Create a new order',
    body: {
      type: 'object',
      required: ['shippingAddress', 'paymentMethod'],
      properties: {
        shippingAddress: {
          type: 'object',
          required: ['fullName', 'addressLine1', 'city', 'state', 'postalCode', 'country'],
          properties: {
            fullName: { type: 'string' },
            addressLine1: { type: 'string' },
            addressLine2: { type: 'string' },
            city: { type: 'string' },
            state: { type: 'string' },
            postalCode: { type: 'string' },
            country: { type: 'string' },
            phoneNumber: { type: 'string' },
            email: { type: 'string' },
          },
        },
        billingAddress: {
          type: 'object',
          properties: {
            fullName: { type: 'string' },
            addressLine1: { type: 'string' },
            addressLine2: { type: 'string' },
            city: { type: 'string' },
            state: { type: 'string' },
            postalCode: { type: 'string' },
            country: { type: 'string' },
            phoneNumber: { type: 'string' },
            email: { type: 'string' },
          },
        },
        paymentMethod: {
          type: 'string',
          enum: ['cash', 'card'],
        },
        notes: { type: 'string' },
      },
    },
    querystring: {
      type: 'object',
      properties: {
        sessionId: { type: 'string' },
      },
    },
  } as FastifySchema,

  getOrderById: {
    description: 'Get order by ID',
    tags: ['orders'],
    summary: 'Get order details',
    params: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'string' },
      },
    },
  } as FastifySchema,

  getOrderByNumber: {
    description: 'Get order by order number',
    tags: ['orders'],
    summary: 'Get order details by order number',
    params: {
      type: 'object',
      required: ['orderNumber'],
      properties: {
        orderNumber: { type: 'string' },
      },
    },
  } as FastifySchema,

  getUserOrders: {
    description: 'Get user orders',
    tags: ['orders'],
    summary: 'Get all orders for authenticated user',
  } as FastifySchema,

  getAllOrders: {
    description: 'Get all orders (admin)',
    tags: ['orders'],
    summary: 'Get all orders with filters',
    querystring: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['pending', 'confirmed', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
        },
        paymentStatus: {
          type: 'string',
          enum: ['pending', 'paid', 'failed', 'refunded'],
        },
        paymentMethod: {
          type: 'string',
          enum: ['cash', 'card'],
        },
        startDate: { type: 'string', format: 'date-time' },
        endDate: { type: 'string', format: 'date-time' },
        limit: { type: 'number' },
        offset: { type: 'number' },
      },
    },
  } as FastifySchema,

  updateOrderStatus: {
    description: 'Update order status (admin)',
    tags: ['orders'],
    summary: 'Update order status',
    params: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'string' },
      },
    },
    body: {
      type: 'object',
      required: ['status'],
      properties: {
        status: {
          type: 'string',
          enum: ['pending', 'confirmed', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
        },
        internalNotes: { type: 'string' },
        trackingNumber: { type: 'string' },
        cancelledReason: { type: 'string' },
      },
    },
  } as FastifySchema,

  refundOrder: {
    description: 'Refund order (admin)',
    tags: ['orders'],
    summary: 'Process order refund',
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
        amount: { type: 'number' },
        reason: { type: 'string' },
      },
    },
  } as FastifySchema,
};

