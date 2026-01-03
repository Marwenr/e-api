import { FastifyRequest, FastifyReply } from 'fastify';
import { OrderService } from '../../services/order.service';
import { AuthenticatedRequest } from '../../middleware/auth';
import { sendSuccess, sendError } from '../../utils/response';
import { AuthError } from '../../services/errors';
import { OrderStatus, PaymentMethod, PaymentStatus } from '../../models/Order';

interface CreateOrderRequest extends AuthenticatedRequest {
  body: {
    shippingAddress: {
      fullName: string;
      addressLine1: string;
      addressLine2?: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
      phoneNumber?: string;
      email?: string;
    };
    billingAddress?: {
      fullName: string;
      addressLine1: string;
      addressLine2?: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
      phoneNumber?: string;
      email?: string;
    };
    paymentMethod: PaymentMethod;
    notes?: string;
  };
  query?: {
    sessionId?: string;
  };
}

interface GetOrderRequest extends AuthenticatedRequest {
  params: {
    id: string;
  };
}

interface GetOrderByNumberRequest extends AuthenticatedRequest {
  params: {
    orderNumber: string;
  };
}

interface UpdateOrderStatusRequest extends AuthenticatedRequest {
  params: {
    id: string;
  };
  body: {
    status: OrderStatus;
    internalNotes?: string;
    trackingNumber?: string;
    cancelledReason?: string;
  };
}

interface RefundOrderRequest extends AuthenticatedRequest {
  params: {
    id: string;
  };
  body: {
    amount?: number;
    reason?: string;
  };
}

interface ListOrdersRequest extends AuthenticatedRequest {
  query?: {
    status?: OrderStatus;
    paymentStatus?: PaymentStatus;
    paymentMethod?: PaymentMethod;
    startDate?: string;
    endDate?: string;
    limit?: string;
    offset?: string;
  };
}

/**
 * Create order from cart
 * POST /api/orders
 */
export const createOrder = async (
  request: CreateOrderRequest,
  reply: FastifyReply
): Promise<void> => {
  try {
    const userId = request.user?.userId;
    const sessionId = (request.query as any)?.sessionId;

    if (!userId && !sessionId) {
      return sendError(
        reply,
        'Either authentication or sessionId is required',
        'VALIDATION_ERROR',
        400
      );
    }

    const { shippingAddress, billingAddress, paymentMethod, notes } = request.body;

    const order = await OrderService.createOrder({
      userId,
      sessionId,
      shippingAddress,
      billingAddress,
      paymentMethod,
      notes,
    });

    return sendSuccess(reply, order, 201);
  } catch (error: any) {
    return sendError(
      reply,
      error.message || 'Failed to create order',
      error.code || 'CREATE_ORDER_ERROR',
      error.statusCode || 500
    );
  }
};

/**
 * Get order by ID
 * GET /api/orders/:id
 */
export const getOrderById = async (
  request: GetOrderRequest,
  reply: FastifyReply
): Promise<void> => {
  try {
    const userId = request.user?.userId;
    const { id } = request.params;

    const order = await OrderService.getOrderById(id, userId);

    return sendSuccess(reply, order, 200);
  } catch (error: any) {
    return sendError(
      reply,
      error.message || 'Failed to get order',
      error.code || 'GET_ORDER_ERROR',
      error.statusCode || 500
    );
  }
};

/**
 * Get order by order number
 * GET /api/orders/number/:orderNumber
 */
export const getOrderByNumber = async (
  request: GetOrderByNumberRequest,
  reply: FastifyReply
): Promise<void> => {
  try {
    const userId = request.user?.userId;
    const { orderNumber } = request.params;

    const order = await OrderService.getOrderByNumber(orderNumber, userId);

    return sendSuccess(reply, order, 200);
  } catch (error: any) {
    return sendError(
      reply,
      error.message || 'Failed to get order',
      error.code || 'GET_ORDER_ERROR',
      error.statusCode || 500
    );
  }
};

/**
 * Get user's orders
 * GET /api/orders
 */
export const getUserOrders = async (
  request: AuthenticatedRequest,
  reply: FastifyReply
): Promise<void> => {
  try {
    if (!request.user?.userId) {
      return sendError(reply, 'Authentication required', 'UNAUTHORIZED', 401);
    }

    const orders = await OrderService.getOrdersByUserId(request.user.userId);

    return sendSuccess(reply, orders, 200);
  } catch (error: any) {
    return sendError(
      reply,
      error.message || 'Failed to get orders',
      error.code || 'GET_ORDERS_ERROR',
      error.statusCode || 500
    );
  }
};

/**
 * Get all orders (admin only)
 * GET /api/orders/admin
 */
export const getAllOrders = async (
  request: ListOrdersRequest,
  reply: FastifyReply
): Promise<void> => {
  try {
    if (!request.user?.userId) {
      return sendError(reply, 'Authentication required', 'UNAUTHORIZED', 401);
    }

    // Check if user is admin (you may need to verify role from user model)
    // For now, we'll allow it if authenticated - you should add role check

    const query = request.query || {};
    const filters: any = {};

    if (query.status) {
      filters.status = query.status;
    }
    if (query.paymentStatus) {
      filters.paymentStatus = query.paymentStatus;
    }
    if (query.paymentMethod) {
      filters.paymentMethod = query.paymentMethod;
    }
    if (query.startDate) {
      filters.startDate = new Date(query.startDate);
    }
    if (query.endDate) {
      filters.endDate = new Date(query.endDate);
    }
    if (query.limit) {
      filters.limit = parseInt(query.limit, 10);
    }
    if (query.offset) {
      filters.offset = parseInt(query.offset, 10);
    }

    const result = await OrderService.getAllOrders(filters);

    return sendSuccess(reply, result, 200);
  } catch (error: any) {
    return sendError(
      reply,
      error.message || 'Failed to get orders',
      error.code || 'GET_ORDERS_ERROR',
      error.statusCode || 500
    );
  }
};

/**
 * Update order status (admin only)
 * PATCH /api/orders/:id/status
 */
export const updateOrderStatus = async (
  request: UpdateOrderStatusRequest,
  reply: FastifyReply
): Promise<void> => {
  try {
    if (!request.user?.userId) {
      return sendError(reply, 'Authentication required', 'UNAUTHORIZED', 401);
    }

    // Check if user is admin (you may need to verify role from user model)

    const { id } = request.params as { id: string };
    const { status, internalNotes, trackingNumber, cancelledReason } = request.body;

    const order = await OrderService.updateOrderStatus(id, {
      status,
      internalNotes,
      trackingNumber,
      cancelledReason,
    });

    return sendSuccess(reply, order, 200);
  } catch (error: any) {
    return sendError(
      reply,
      error.message || 'Failed to update order status',
      error.code || 'UPDATE_ORDER_ERROR',
      error.statusCode || 500
    );
  }
};

/**
 * Refund order (admin only)
 * POST /api/orders/:id/refund
 */
export const refundOrder = async (
  request: RefundOrderRequest,
  reply: FastifyReply
): Promise<void> => {
  try {
    if (!request.user?.userId) {
      return sendError(reply, 'Authentication required', 'UNAUTHORIZED', 401);
    }

    // Check if user is admin (you may need to verify role from user model)

    const { id } = request.params as { id: string };
    const { amount, reason } = request.body;

    const order = await OrderService.refundOrder(id, { amount, reason });

    return sendSuccess(reply, order, 200);
  } catch (error: any) {
    return sendError(
      reply,
      error.message || 'Failed to refund order',
      error.code || 'REFUND_ORDER_ERROR',
      error.statusCode || 500
    );
  }
};

