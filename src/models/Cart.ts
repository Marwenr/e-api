import mongoose, { Schema, Model, Document } from 'mongoose';

export interface ICartItem {
  productId: mongoose.Types.ObjectId;
  variantId?: mongoose.Types.ObjectId; // Optional: for products with variants
  quantity: number;
  price: number; // Price at time of adding (snapshot)
  addedAt: Date;
}

export interface ICart extends Document {
  userId?: mongoose.Types.ObjectId; // For authenticated users
  sessionId?: string; // For guest users (session/cookie-based)
  items: ICartItem[];
  expiresAt: Date; // Cart expiration (e.g., 30 days for users, 7 days for guests)
  createdAt: Date;
  updatedAt: Date;
}

interface ICartModel extends Model<ICart> {
  findByUserId(userId: string): Promise<ICart | null>;
  findByUserIdForUpdate(userId: string): Promise<ICart | null>;
  findBySessionId(sessionId: string): Promise<ICart | null>;
  findBySessionIdForUpdate(sessionId: string): Promise<ICart | null>;
  findOrCreateForUser(userId: string): Promise<ICart>;
  findOrCreateForGuest(sessionId: string): Promise<ICart>;
  cleanupExpiredCarts(): Promise<number>;
}

const cartItemSchema = new Schema<ICartItem>(
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
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
      default: 1,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const cartSchema = new Schema<ICart>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
      sparse: true, // Index only documents that have this field
    },
    sessionId: {
      type: String,
      default: null,
      index: true,
      sparse: true, // Index only documents that have this field
    },
    items: {
      type: [cartItemSchema],
      default: [],
      validate: {
        validator: function (items: ICartItem[]) {
          // Ensure no duplicate product+variant combinations
          const seen = new Set<string>();
          for (const item of items) {
            const key = `${item.productId}-${item.variantId || 'none'}`;
            if (seen.has(key)) {
              return false;
            }
            seen.add(key);
          }
          return true;
        },
        message: 'Cart cannot contain duplicate product+variant combinations',
      },
    },
    expiresAt: {
      type: Date,
      required: [true, 'Expiration date is required'],
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

// Compound indexes for fast lookups
cartSchema.index({ userId: 1, expiresAt: 1 }); // For user carts
cartSchema.index({ sessionId: 1, expiresAt: 1 }); // For guest carts
cartSchema.index({ expiresAt: 1 }); // For cleanup queries

// Ensure either userId or sessionId is set, but not both
cartSchema.pre('save', function (next) {
  if (!this.userId && !this.sessionId) {
    return next(new Error('Cart must have either userId or sessionId'));
  }
  if (this.userId && this.sessionId) {
    return next(new Error('Cart cannot have both userId and sessionId'));
  }
  next();
});

// Set expiration date before saving
cartSchema.pre('save', function (next) {
  if (this.isNew || this.isModified('userId') || this.isModified('sessionId')) {
    // User carts expire in 30 days, guest carts in 7 days
    const daysUntilExpiry = this.userId ? 30 : 7;
    this.expiresAt = new Date(Date.now() + daysUntilExpiry * 24 * 60 * 60 * 1000);
  }
  next();
});

// Static method to find cart by user ID (lean for read-only)
cartSchema.statics.findByUserId = function (userId: string) {
  return this.findOne({
    userId: new mongoose.Types.ObjectId(userId),
    expiresAt: { $gt: new Date() }, // Only non-expired carts
  })
    .populate('items.productId', 'name slug images basePrice discountPrice status')
    .populate('items.variantId', 'sku name basePrice discountPrice stock attributes')
    .lean();
};

// Static method to find cart by user ID (non-lean for modifications)
cartSchema.statics.findByUserIdForUpdate = function (userId: string) {
  return this.findOne({
    userId: new mongoose.Types.ObjectId(userId),
    expiresAt: { $gt: new Date() }, // Only non-expired carts
  });
};

// Static method to find cart by session ID (lean for read-only)
cartSchema.statics.findBySessionId = function (sessionId: string) {
  return this.findOne({
    sessionId,
    expiresAt: { $gt: new Date() }, // Only non-expired carts
  })
    .populate('items.productId', 'name slug images basePrice discountPrice status')
    .populate('items.variantId', 'sku name basePrice discountPrice stock attributes')
    .lean();
};

// Static method to find cart by session ID (non-lean for modifications)
cartSchema.statics.findBySessionIdForUpdate = function (sessionId: string) {
  return this.findOne({
    sessionId,
    expiresAt: { $gt: new Date() }, // Only non-expired carts
  });
};

// Static method to find or create cart for user
cartSchema.statics.findOrCreateForUser = async function (userId: string): Promise<ICart> {
  let cart = await this.findOne({
    userId: new mongoose.Types.ObjectId(userId),
    expiresAt: { $gt: new Date() },
  });

  if (!cart) {
    const daysUntilExpiry = 30;
    cart = await this.create({
      userId: new mongoose.Types.ObjectId(userId),
      items: [],
      expiresAt: new Date(Date.now() + daysUntilExpiry * 24 * 60 * 60 * 1000),
    });
  }

  return cart;
};

// Static method to find or create cart for guest
cartSchema.statics.findOrCreateForGuest = async function (sessionId: string): Promise<ICart> {
  let cart = await this.findOne({
    sessionId,
    expiresAt: { $gt: new Date() },
  });

  if (!cart) {
    const daysUntilExpiry = 7;
    cart = await this.create({
      sessionId,
      items: [],
      expiresAt: new Date(Date.now() + daysUntilExpiry * 24 * 60 * 60 * 1000),
    });
  }

  return cart;
};

// Static method to cleanup expired carts
cartSchema.statics.cleanupExpiredCarts = async function (): Promise<number> {
  const result = await this.deleteMany({
    expiresAt: { $lt: new Date() },
  });
  return result.deletedCount || 0;
};

export const Cart = mongoose.model<ICart, ICartModel>('Cart', cartSchema);

