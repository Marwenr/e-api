import mongoose, { Schema, Model, Document } from 'mongoose';

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PAID = 'paid',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export enum PaymentMethod {
  CASH = 'cash',
  CARD = 'card',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export interface IOrderAddress {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phoneNumber?: string;
  email?: string;
}

export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  variantId?: mongoose.Types.ObjectId;
  productName: string;
  variantName?: string;
  sku: string;
  quantity: number;
  unitPrice: number; // Snapshot price at order time
  totalPrice: number; // unitPrice * quantity
  image?: string;
  attributes?: Array<{ name: string; value: string }>;
}

export interface IOrder extends Document {
  orderNumber: string; // Unique order number (e.g., ORD-2024-001234)
  userId?: mongoose.Types.ObjectId; // For authenticated users
  sessionId?: string; // For guest users
  items: IOrderItem[];
  shippingAddress: IOrderAddress;
  billingAddress?: IOrderAddress; // Optional, defaults to shipping
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  currency: string; // Default: USD
  notes?: string; // Customer notes
  internalNotes?: string; // Admin internal notes
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

interface IOrderModel extends Model<IOrder> {
  generateOrderNumber(): Promise<string>;
  findByUserId(userId: string): Promise<IOrder[]>;
  findByOrderNumber(orderNumber: string): Promise<IOrder | null>;
}

const orderAddressSchema = new Schema<IOrderAddress>(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    addressLine1: {
      type: String,
      required: [true, 'Address line 1 is required'],
      trim: true,
    },
    addressLine2: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    state: {
      type: String,
      required: [true, 'State/Province is required'],
      trim: true,
    },
    postalCode: {
      type: String,
      required: [true, 'Postal code is required'],
      trim: true,
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const orderItemSchema = new Schema<IOrderItem>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product ID is required'],
      index: true,
    },
    variantId: {
      type: Schema.Types.ObjectId,
      ref: 'ProductVariant',
      default: null,
      index: true,
    },
    productName: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    variantName: {
      type: String,
      trim: true,
    },
    sku: {
      type: String,
      required: [true, 'SKU is required'],
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
    },
    unitPrice: {
      type: Number,
      required: [true, 'Unit price is required'],
      min: [0, 'Unit price cannot be negative'],
    },
    totalPrice: {
      type: Number,
      required: [true, 'Total price is required'],
      min: [0, 'Total price cannot be negative'],
    },
    image: {
      type: String,
      trim: true,
    },
    attributes: {
      type: [
        {
          name: String,
          value: String,
        },
      ],
      default: [],
    },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      required: [true, 'Order number is required'],
      unique: true,
      index: true,
      uppercase: true,
      trim: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
      sparse: true,
    },
    sessionId: {
      type: String,
      default: null,
      index: true,
      sparse: true,
    },
    items: {
      type: [orderItemSchema],
      required: [true, 'Order items are required'],
      validate: {
        validator: function (items: IOrderItem[]) {
          return items.length > 0;
        },
        message: 'Order must have at least one item',
      },
    },
    shippingAddress: {
      type: orderAddressSchema,
      required: [true, 'Shipping address is required'],
    },
    billingAddress: {
      type: orderAddressSchema,
      default: null,
    },
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.PENDING,
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: Object.values(PaymentMethod),
      required: [true, 'Payment method is required'],
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
      index: true,
    },
    subtotal: {
      type: Number,
      required: [true, 'Subtotal is required'],
      min: [0, 'Subtotal cannot be negative'],
    },
    tax: {
      type: Number,
      default: 0,
      min: [0, 'Tax cannot be negative'],
    },
    shipping: {
      type: Number,
      default: 0,
      min: [0, 'Shipping cannot be negative'],
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative'],
    },
    total: {
      type: Number,
      required: [true, 'Total is required'],
      min: [0, 'Total cannot be negative'],
    },
    currency: {
      type: String,
      default: 'USD',
      uppercase: true,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    },
    internalNotes: {
      type: String,
      trim: true,
      maxlength: [2000, 'Internal notes cannot exceed 2000 characters'],
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    cancelledReason: {
      type: String,
      trim: true,
      maxlength: [500, 'Cancellation reason cannot exceed 500 characters'],
    },
    refundedAt: {
      type: Date,
      default: null,
    },
    refundedAmount: {
      type: Number,
      default: null,
      min: [0, 'Refunded amount cannot be negative'],
    },
    shippedAt: {
      type: Date,
      default: null,
    },
    trackingNumber: {
      type: String,
      trim: true,
    },
    deliveredAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret: any) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes for optimized queries
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ sessionId: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });

// Generate unique order number
orderSchema.statics.generateOrderNumber = async function (): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `ORD-${year}-`;
  
  // Find the latest order number for this year
  const latestOrder = await this.findOne({
    orderNumber: { $regex: `^${prefix}` },
  })
    .sort({ orderNumber: -1 })
    .select('orderNumber')
    .lean();

  let sequence = 1;
  if (latestOrder) {
    const match = latestOrder.orderNumber.match(/\d+$/);
    if (match) {
      sequence = parseInt(match[0], 10) + 1;
    }
  }

  // Format: ORD-2024-000001
  const orderNumber = `${prefix}${sequence.toString().padStart(6, '0')}`;
  return orderNumber;
};

// Find orders by user ID
orderSchema.statics.findByUserId = function (userId: string) {
  return this.find({ userId: new mongoose.Types.ObjectId(userId) })
    .sort({ createdAt: -1 })
    .lean();
};

// Find order by order number
orderSchema.statics.findByOrderNumber = function (orderNumber: string) {
  return this.findOne({ orderNumber: orderNumber.toUpperCase() }).lean();
};

export const Order = mongoose.model<IOrder, IOrderModel>('Order', orderSchema);

