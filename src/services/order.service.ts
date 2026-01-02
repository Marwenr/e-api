import mongoose from 'mongoose';
import { Order, OrderStatus, PaymentMethod, PaymentStatus, type IOrder, type IOrderItem, type IOrderAddress } from '../models';
import { Cart } from '../models';
import { Product, ProductVariant } from '../models';
import { ValidationError, NotFoundError, ForbiddenError } from './errors';

export interface CreateOrderInput {
  userId?: string;
  sessionId?: string;
  shippingAddress: IOrderAddress;
  billingAddress?: IOrderAddress;
  paymentMethod: PaymentMethod;
  notes?: string;
}

export interface UpdateOrderStatusInput {
  status: OrderStatus;
  internalNotes?: string;
  trackingNumber?: string;
  cancelledReason?: string;
}

export interface RefundOrderInput {
  amount?: number; // Partial refund, if not provided = full refund
  reason?: string;
}

export interface OrderDetails {
  id: string;
  orderNumber: string;
  userId?: string;
  sessionId?: string;
  items: Array<{
    productId: string;
    variantId?: string;
    productName: string;
    variantName?: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    image?: string;
    attributes?: Array<{ name: string; value: string }>;
  }>;
  shippingAddress: IOrderAddress;
  billingAddress?: IOrderAddress;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  currency: string;
  notes?: string;
  internalNotes?: string;
  cancelledAt?: Date;
  cancelledReason?: string;
  refundedAt?: Date;
  refundedAmount?: number;
  shippedAt?: Date;
  trackingNumber?: string;
  deliveredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class OrderService {
  /**
   * Create order from cart
   */
  static async createOrder(input: CreateOrderInput): Promise<OrderDetails> {
    // Validate input
    if (!input.shippingAddress) {
      throw new ValidationError('Shipping address is required');
    }
    if (!input.paymentMethod) {
      throw new ValidationError('Payment method is required');
    }
    if (!input.userId && !input.sessionId) {
      throw new ValidationError('Either userId or sessionId is required');
    }

    // Get cart
    let cart;
    if (input.userId) {
      cart = await Cart.findOne({ userId: new mongoose.Types.ObjectId(input.userId) });
    } else if (input.sessionId) {
      cart = await Cart.findOne({ sessionId: input.sessionId });
    }

    if (!cart || !cart.items || cart.items.length === 0) {
      throw new ValidationError('Cart is empty');
    }

    // Generate order number
    const orderNumber = await Order.generateOrderNumber();

    // Build order items with product snapshots
    const orderItems: IOrderItem[] = [];
    for (const cartItem of cart.items) {
      const product = await Product.findById(cartItem.productId).lean();
      if (!product) {
        throw new NotFoundError(`Product ${cartItem.productId} not found`);
      }

      let variant = null;
      if (cartItem.variantId) {
        variant = await ProductVariant.findById(cartItem.variantId).lean();
        if (!variant) {
          throw new NotFoundError(`Variant ${cartItem.variantId} not found`);
        }
      }

      // Get product image
      let productImage: string | undefined;
      if (variant?.images && variant.images.length > 0) {
        productImage = typeof variant.images[0] === 'string' ? variant.images[0] : variant.images[0].url;
      } else if (product.images && product.images.length > 0) {
        const primaryImage = product.images.find((img) => img.isPrimary);
        productImage = primaryImage ? primaryImage.url : product.images[0].url;
      }

      // Calculate prices
      const unitPrice = variant
        ? variant.discountPrice ?? variant.basePrice
        : product.discountPrice ?? product.basePrice;

      const sku = variant ? variant.sku : product.sku;
      const productName = product.name;
      const variantName = variant?.name;

      orderItems.push({
        productId: cartItem.productId,
        variantId: cartItem.variantId || undefined,
        productName,
        variantName,
        sku,
        quantity: cartItem.quantity,
        unitPrice,
        totalPrice: unitPrice * cartItem.quantity,
        image: productImage,
        attributes: variant?.attributes || [],
      });
    }

    // Calculate totals (using cart subtotal for consistency)
    const subtotal = cart.items.reduce((sum, item) => {
      const price = item.price;
      return sum + price * item.quantity;
    }, 0);

    const tax = 0; // TODO: Calculate tax based on address
    const shipping = 0; // TODO: Calculate shipping based on address and items
    const discount = 0; // TODO: Apply discounts/coupons
    const total = subtotal + tax + shipping - discount;

    // Determine payment status based on payment method
    let paymentStatus = PaymentStatus.PENDING;
    if (input.paymentMethod === PaymentMethod.CASH) {
      // Cash on delivery - payment pending until delivery
      paymentStatus = PaymentStatus.PENDING;
    } else if (input.paymentMethod === PaymentMethod.CARD) {
      // Card payment - will be updated via webhook when payment is processed
      paymentStatus = PaymentStatus.PENDING;
    }

    // Create order
    const order = new Order({
      orderNumber,
      userId: input.userId ? new mongoose.Types.ObjectId(input.userId) : undefined,
      sessionId: input.sessionId,
      items: orderItems,
      shippingAddress: input.shippingAddress,
      billingAddress: input.billingAddress || input.shippingAddress,
      status: OrderStatus.PENDING,
      paymentMethod: input.paymentMethod,
      paymentStatus,
      subtotal,
      tax,
      shipping,
      discount,
      total,
      currency: 'USD',
      notes: input.notes,
    });

    await order.save();

    // Clear cart after order creation
    if (input.userId) {
      await Cart.deleteOne({ userId: new mongoose.Types.ObjectId(input.userId) });
    } else if (input.sessionId) {
      await Cart.deleteOne({ sessionId: input.sessionId });
    }

    return this.transformOrder(order.toObject());
  }

  /**
   * Get order by ID
   */
  static async getOrderById(orderId: string, userId?: string): Promise<OrderDetails> {
    const order = await Order.findById(orderId).lean();
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    // Check ownership (user can only see their own orders unless admin)
    if (userId && order.userId && order.userId.toString() !== userId) {
      throw new ForbiddenError('You do not have permission to view this order');
    }

    return this.transformOrder(order);
  }

  /**
   * Get order by order number
   */
  static async getOrderByNumber(orderNumber: string, userId?: string): Promise<OrderDetails> {
    const order = await Order.findByOrderNumber(orderNumber);
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    // Check ownership
    if (userId && order.userId && order.userId.toString() !== userId) {
      throw new ForbiddenError('You do not have permission to view this order');
    }

    return this.transformOrder(order);
  }

  /**
   * Get orders by user ID
   */
  static async getOrdersByUserId(userId: string): Promise<OrderDetails[]> {
    const orders = await Order.findByUserId(userId);
    return orders.map((order) => this.transformOrder(order));
  }

  /**
   * Get all orders (admin only)
   */
  static async getAllOrders(filters?: {
    status?: OrderStatus;
    paymentStatus?: PaymentStatus;
    paymentMethod?: PaymentMethod;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }): Promise<{ orders: OrderDetails[]; total: number }> {
    const query: any = {};

    if (filters?.status) {
      query.status = filters.status;
    }
    if (filters?.paymentStatus) {
      query.paymentStatus = filters.paymentStatus;
    }
    if (filters?.paymentMethod) {
      query.paymentMethod = filters.paymentMethod;
    }
    if (filters?.startDate || filters?.endDate) {
      query.createdAt = {};
      if (filters.startDate) {
        query.createdAt.$gte = filters.startDate;
      }
      if (filters.endDate) {
        query.createdAt.$lte = filters.endDate;
      }
    }

    const limit = filters?.limit || 50;
    const offset = filters?.offset || 0;

    const [orders, total] = await Promise.all([
      Order.find(query).sort({ createdAt: -1 }).limit(limit).skip(offset).lean(),
      Order.countDocuments(query),
    ]);

    return {
      orders: orders.map((order) => this.transformOrder(order)),
      total,
    };
  }

  /**
   * Update order status (admin only)
   */
  static async updateOrderStatus(
    orderId: string,
    input: UpdateOrderStatusInput
  ): Promise<OrderDetails> {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    // Validate status transition
    const currentStatus = order.status;
    const newStatus = input.status;

    // Business rules for status transitions
    if (currentStatus === OrderStatus.CANCELLED && newStatus !== OrderStatus.CANCELLED) {
      throw new ValidationError('Cannot change status of a cancelled order');
    }
    if (currentStatus === OrderStatus.REFUNDED && newStatus !== OrderStatus.REFUNDED) {
      throw new ValidationError('Cannot change status of a refunded order');
    }
    if (currentStatus === OrderStatus.DELIVERED && newStatus !== OrderStatus.DELIVERED) {
      throw new ValidationError('Cannot change status of a delivered order');
    }

    // Update status
    order.status = newStatus;

    // Set timestamps based on status
    if (newStatus === OrderStatus.SHIPPED && !order.shippedAt) {
      order.shippedAt = new Date();
    }
    if (newStatus === OrderStatus.DELIVERED && !order.deliveredAt) {
      order.deliveredAt = new Date();
      // Auto-update payment status for cash on delivery
      if (order.paymentMethod === PaymentMethod.CASH && order.paymentStatus === PaymentStatus.PENDING) {
        order.paymentStatus = PaymentStatus.PAID;
      }
    }
    if (newStatus === OrderStatus.CANCELLED) {
      order.cancelledAt = new Date();
      order.cancelledReason = input.cancelledReason;
      // TODO: Restore stock when order is cancelled
    }

    // Update tracking number if provided
    if (input.trackingNumber) {
      order.trackingNumber = input.trackingNumber;
    }

    // Update internal notes if provided
    if (input.internalNotes) {
      order.internalNotes = input.internalNotes;
    }

    await order.save();

    return this.transformOrder(order.toObject());
  }

  /**
   * Process refund (admin only)
   */
  static async refundOrder(orderId: string, input: RefundOrderInput): Promise<OrderDetails> {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    if (order.status === OrderStatus.REFUNDED) {
      throw new ValidationError('Order is already refunded');
    }

    const refundAmount = input.amount || order.total; // Full refund if amount not specified

    if (refundAmount > order.total) {
      throw new ValidationError('Refund amount cannot exceed order total');
    }

    order.status = OrderStatus.REFUNDED;
    order.paymentStatus = PaymentStatus.REFUNDED;
    order.refundedAt = new Date();
    order.refundedAmount = refundAmount;
    order.internalNotes = order.internalNotes
      ? `${order.internalNotes}\n\nRefund: ${refundAmount} - ${input.reason || 'No reason provided'}`
      : `Refund: ${refundAmount} - ${input.reason || 'No reason provided'}`;

    await order.save();

    // TODO: Restore stock when order is refunded
    // TODO: Process actual refund through payment provider

    return this.transformOrder(order.toObject());
  }

  /**
   * Update payment status (called by webhook)
   */
  static async updatePaymentStatus(
    orderId: string,
    paymentStatus: PaymentStatus
  ): Promise<OrderDetails> {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    order.paymentStatus = paymentStatus;

    // Auto-update order status based on payment
    if (paymentStatus === PaymentStatus.PAID && order.status === OrderStatus.PENDING) {
      order.status = OrderStatus.CONFIRMED;
      // TODO: Deduct stock when payment is confirmed
    }

    await order.save();

    return this.transformOrder(order.toObject());
  }

  /**
   * Transform order document to OrderDetails
   */
  private static transformOrder(order: any): OrderDetails {
    return {
      id: order._id.toString(),
      orderNumber: order.orderNumber,
      userId: order.userId?.toString(),
      sessionId: order.sessionId,
      items: order.items.map((item: any) => ({
        productId: item.productId.toString(),
        variantId: item.variantId?.toString(),
        productName: item.productName,
        variantName: item.variantName,
        sku: item.sku,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        image: item.image,
        attributes: item.attributes,
      })),
      shippingAddress: order.shippingAddress,
      billingAddress: order.billingAddress,
      status: order.status,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      subtotal: order.subtotal,
      tax: order.tax,
      shipping: order.shipping,
      discount: order.discount,
      total: order.total,
      currency: order.currency,
      notes: order.notes,
      internalNotes: order.internalNotes,
      cancelledAt: order.cancelledAt,
      cancelledReason: order.cancelledReason,
      refundedAt: order.refundedAt,
      refundedAmount: order.refundedAmount,
      shippedAt: order.shippedAt,
      trackingNumber: order.trackingNumber,
      deliveredAt: order.deliveredAt,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }
}

