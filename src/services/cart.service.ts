import mongoose from 'mongoose';
import { Cart, Product, ProductVariant, ProductStatus } from '../models';
import { ValidationError, NotFoundError, ConflictError } from './errors';

export interface AddToCartInput {
  productId: string;
  variantId?: string;
  quantity: number;
}

export interface UpdateCartItemInput {
  itemIndex: number;
  quantity: number;
}

export interface CartItem {
  productId: string;
  variantId?: string;
  quantity: number;
  price: number;
  addedAt: Date;
  product?: {
    id: string;
    name: string;
    slug: string;
    images: Array<{ url: string; alt?: string; isPrimary?: boolean }>;
    basePrice: number;
    discountPrice?: number;
    status: string;
  };
  variant?: {
    id: string;
    sku: string;
    name?: string;
    basePrice: number;
    discountPrice?: number;
    stock: number;
    attributes: Array<{ name: string; value: string }>;
  };
}

export interface CartDetails {
  id: string;
  userId?: string;
  sessionId?: string;
  items: CartItem[];
  subtotal: number;
  itemCount: number;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class CartService {
  /**
   * Get cart for user or guest
   */
  static async getCart(userId?: string, sessionId?: string): Promise<CartDetails | null> {
    let cart;

    if (userId) {
      cart = await Cart.findByUserId(userId);
    } else if (sessionId) {
      cart = await Cart.findBySessionId(sessionId);
    } else {
      return null;
    }

    if (!cart) {
      return null;
    }

    return this.transformCart(cart);
  }

  /**
   * Add item to cart
   */
  static async addToCart(
    input: AddToCartInput,
    userId?: string,
    sessionId?: string
  ): Promise<CartDetails> {
    // Validate input
    if (!input.productId || !input.quantity || input.quantity < 1) {
      throw new ValidationError('Product ID and quantity (min 1) are required');
    }

    // Get or create cart
    let cart;
    if (userId) {
      cart = await Cart.findOrCreateForUser(userId);
    } else if (sessionId) {
      cart = await Cart.findOrCreateForGuest(sessionId);
    } else {
      throw new ValidationError('Either userId or sessionId is required');
    }

    // Validate product exists and is active
    const product = await Product.findById(input.productId).lean();
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    if (product.status !== ProductStatus.ACTIVE) {
      throw new ValidationError('Product is not available for purchase');
    }

    // Handle variant if provided
    let variant = null;
    if (input.variantId) {
      variant = await ProductVariant.findById(input.variantId).lean();
      if (!variant) {
        throw new NotFoundError('Product variant not found');
      }

      if (variant.productId.toString() !== input.productId) {
        throw new ValidationError('Variant does not belong to the specified product');
      }

      // Check stock for variant
      if (variant.stock < input.quantity) {
        throw new ValidationError(
          `Insufficient stock. Only ${variant.stock} items available.`
        );
      }
    } else {
      // For products without variants, check if product has variants
      const productVariants = await ProductVariant.find({
        productId: new mongoose.Types.ObjectId(input.productId),
      }).lean();

      if (productVariants.length > 0) {
        throw new ValidationError('Product variant is required for this product');
      }
    }

    // Calculate price (use variant price if available, otherwise product price)
    const price = variant
      ? variant.discountPrice ?? variant.basePrice
      : product.discountPrice ?? product.basePrice;

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex((item) => {
      const itemProductId = item.productId.toString();
      const itemVariantId = item.variantId?.toString() || null;
      const inputVariantId = input.variantId || null;

      return itemProductId === input.productId && itemVariantId === inputVariantId;
    });

    if (existingItemIndex !== -1) {
      // Update existing item quantity
      const existingItem = cart.items[existingItemIndex];
      const newQuantity = existingItem.quantity + input.quantity;

      // Re-validate stock
      if (variant && variant.stock < newQuantity) {
        throw new ValidationError(
          `Insufficient stock. Only ${variant.stock} items available.`
        );
      }

      cart.items[existingItemIndex].quantity = newQuantity;
      cart.items[existingItemIndex].price = price; // Update price in case it changed
    } else {
      // Add new item
      cart.items.push({
        productId: new mongoose.Types.ObjectId(input.productId),
        variantId: input.variantId
          ? new mongoose.Types.ObjectId(input.variantId)
          : undefined,
        quantity: input.quantity,
        price,
        addedAt: new Date(),
      });
    }

    await cart.save();

    // Return populated cart
    const populatedCart = await Cart.findById(cart._id)
      .populate('items.productId', 'name slug images basePrice discountPrice status')
      .populate('items.variantId', 'sku name basePrice discountPrice stock attributes')
      .lean();

    if (!populatedCart) {
      throw new NotFoundError('Cart not found after update');
    }

    return this.transformCart(populatedCart);
  }

  /**
   * Update cart item quantity
   */
  static async updateCartItem(
    input: UpdateCartItemInput,
    userId?: string,
    sessionId?: string
  ): Promise<CartDetails> {
    if (input.quantity < 1) {
      throw new ValidationError('Quantity must be at least 1');
    }

    // Get cart (non-lean for modifications)
    let cart;
    if (userId) {
      cart = await Cart.findByUserIdForUpdate(userId);
    } else if (sessionId) {
      cart = await Cart.findBySessionIdForUpdate(sessionId);
    } else {
      throw new ValidationError('Either userId or sessionId is required');
    }

    if (!cart) {
      throw new NotFoundError('Cart not found');
    }

    if (input.itemIndex < 0 || input.itemIndex >= cart.items.length) {
      throw new ValidationError('Invalid item index');
    }

    const item = cart.items[input.itemIndex];

    // Validate stock if variant exists
    if (item.variantId) {
      const variant = await ProductVariant.findById(item.variantId).lean();
      if (!variant) {
        throw new NotFoundError('Product variant not found');
      }

      if (variant.stock < input.quantity) {
        throw new ValidationError(
          `Insufficient stock. Only ${variant.stock} items available.`
        );
      }
    }

    // Update quantity
    cart.items[input.itemIndex].quantity = input.quantity;

    await cart.save();

    // Return populated cart
    const populatedCart = await Cart.findById(cart._id)
      .populate('items.productId', 'name slug images basePrice discountPrice status')
      .populate('items.variantId', 'sku name basePrice discountPrice stock attributes')
      .lean();

    if (!populatedCart) {
      throw new NotFoundError('Cart not found after update');
    }

    return this.transformCart(populatedCart);
  }

  /**
   * Remove item from cart
   */
  static async removeCartItem(
    itemIndex: number,
    userId?: string,
    sessionId?: string
  ): Promise<CartDetails> {
    // Get cart (non-lean for modifications)
    let cart;
    if (userId) {
      cart = await Cart.findByUserIdForUpdate(userId);
    } else if (sessionId) {
      cart = await Cart.findBySessionIdForUpdate(sessionId);
    } else {
      throw new ValidationError('Either userId or sessionId is required');
    }

    if (!cart) {
      throw new NotFoundError('Cart not found');
    }

    if (itemIndex < 0 || itemIndex >= cart.items.length) {
      throw new ValidationError('Invalid item index');
    }

    // Remove item
    cart.items.splice(itemIndex, 1);

    await cart.save();

    // Return populated cart
    const populatedCart = await Cart.findById(cart._id)
      .populate('items.productId', 'name slug images basePrice discountPrice status')
      .populate('items.variantId', 'sku name basePrice discountPrice stock attributes')
      .lean();

    if (!populatedCart) {
      throw new NotFoundError('Cart not found after update');
    }

    return this.transformCart(populatedCart);
  }

  /**
   * Clear cart
   */
  static async clearCart(userId?: string, sessionId?: string): Promise<void> {
    // Use findOneAndUpdate to clear items directly (more efficient)
    if (userId) {
      await Cart.findOneAndUpdate(
        {
          userId: new mongoose.Types.ObjectId(userId),
          expiresAt: { $gt: new Date() },
        },
        { $set: { items: [] } }
      );
    } else if (sessionId) {
      await Cart.findOneAndUpdate(
        {
          sessionId,
          expiresAt: { $gt: new Date() },
        },
        { $set: { items: [] } }
      );
    } else {
      throw new ValidationError('Either userId or sessionId is required');
    }
  }

  /**
   * Merge guest cart into user cart
   */
  static async mergeCarts(
    guestSessionId: string,
    userId: string
  ): Promise<CartDetails> {
    // Get both carts
    const guestCart = await Cart.findBySessionId(guestSessionId);
    const userCart = await Cart.findOrCreateForUser(userId);

    if (!guestCart || guestCart.items.length === 0) {
      // No guest cart or empty, return user cart
      const populatedCart = await Cart.findById(userCart._id)
        .populate('items.productId', 'name slug images basePrice discountPrice status')
        .populate('items.variantId', 'sku name basePrice discountPrice stock attributes')
        .lean();

      if (!populatedCart) {
        throw new NotFoundError('Cart not found');
      }

      return this.transformCart(populatedCart);
    }

    // Merge items from guest cart into user cart
    for (const guestItem of guestCart.items) {
      // Check if item already exists in user cart
      const existingItemIndex = userCart.items.findIndex((item) => {
        const itemProductId = item.productId.toString();
        const itemVariantId = item.variantId?.toString() || null;
        const guestVariantId = guestItem.variantId?.toString() || null;

        return itemProductId === guestItem.productId.toString() && itemVariantId === guestVariantId;
      });

      if (existingItemIndex !== -1) {
        // Merge quantities (add guest quantity to existing)
        userCart.items[existingItemIndex].quantity += guestItem.quantity;
        // Update price to latest
        userCart.items[existingItemIndex].price = guestItem.price;
      } else {
        // Add new item
        userCart.items.push({
          productId: guestItem.productId,
          variantId: guestItem.variantId,
          quantity: guestItem.quantity,
          price: guestItem.price,
          addedAt: guestItem.addedAt,
        });
      }
    }

    // Validate stock for all items after merge
    for (const item of userCart.items) {
      if (item.variantId) {
        const variant = await ProductVariant.findById(item.variantId).lean();
        if (variant && variant.stock < item.quantity) {
          // Adjust quantity to available stock
          item.quantity = Math.min(item.quantity, variant.stock);
        }
      }
    }

    // Remove items with quantity 0
    userCart.items = userCart.items.filter((item) => item.quantity > 0);

    await userCart.save();

    // Delete guest cart
    await Cart.findByIdAndDelete(guestCart._id);

    // Return populated cart
    const populatedCart = await Cart.findById(userCart._id)
      .populate('items.productId', 'name slug images basePrice discountPrice status')
      .populate('items.variantId', 'sku name basePrice discountPrice stock attributes')
      .lean();

    if (!populatedCart) {
      throw new NotFoundError('Cart not found after merge');
    }

    return this.transformCart(populatedCart);
  }

  /**
   * Recalculate cart prices and validate stock
   */
  static async recalculateCart(
    userId?: string,
    sessionId?: string
  ): Promise<CartDetails> {
    // Get cart (non-lean for modifications)
    let cart;
    if (userId) {
      cart = await Cart.findByUserIdForUpdate(userId);
    } else if (sessionId) {
      cart = await Cart.findBySessionIdForUpdate(sessionId);
    } else {
      throw new ValidationError('Either userId or sessionId is required');
    }

    if (!cart) {
      throw new NotFoundError('Cart not found');
    }

    // Recalculate prices and validate stock for each item
    const validItems = [];

    for (const item of cart.items) {
      const product = await Product.findById(item.productId).lean();
      if (!product || product.status !== ProductStatus.ACTIVE) {
        continue; // Skip inactive/unavailable products
      }

      let variant = null;
      if (item.variantId) {
        variant = await ProductVariant.findById(item.variantId).lean();
        if (!variant) {
          continue; // Skip if variant doesn't exist
        }

        // Check stock
        if (variant.stock < item.quantity) {
          item.quantity = Math.min(item.quantity, variant.stock); // Adjust to available stock
        }

        if (item.quantity === 0) {
          continue; // Skip if no stock available
        }
      }

      // Update price
      const newPrice = variant
        ? variant.discountPrice ?? variant.basePrice
        : product.discountPrice ?? product.basePrice;

      item.price = newPrice;
      validItems.push(item);
    }

    cart.items = validItems;
    await cart.save();

    // Return populated cart
    const populatedCart = await Cart.findById(cart._id)
      .populate('items.productId', 'name slug images basePrice discountPrice status')
      .populate('items.variantId', 'sku name basePrice discountPrice stock attributes')
      .lean();

    if (!populatedCart) {
      throw new NotFoundError('Cart not found after recalculation');
    }

    return this.transformCart(populatedCart);
  }

  /**
   * Transform cart document to CartDetails
   */
  private static transformCart(cart: any): CartDetails {
    const items: CartItem[] = (cart.items || []).map((item: any) => {
      const product = item.productId;
      const variant = item.variantId;

      return {
        productId: product?._id?.toString() || product?.id || product?.toString(),
        variantId: variant?._id?.toString() || variant?.id || variant?.toString() || undefined,
        quantity: item.quantity,
        price: item.price,
        addedAt: item.addedAt,
        product: product && typeof product === 'object'
          ? {
              id: product._id?.toString() || product.id,
              name: product.name,
              slug: product.slug,
              images: product.images || [],
              basePrice: product.basePrice,
              discountPrice: product.discountPrice,
              status: product.status,
            }
          : undefined,
        variant: variant && typeof variant === 'object'
          ? {
              id: variant._id?.toString() || variant.id,
              sku: variant.sku,
              name: variant.name,
              basePrice: variant.basePrice,
              discountPrice: variant.discountPrice,
              stock: variant.stock,
              attributes: variant.attributes || [],
            }
          : undefined,
      };
    });

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      id: cart._id?.toString() || cart.id,
      userId: cart.userId?.toString() || cart.userId || undefined,
      sessionId: cart.sessionId || undefined,
      items,
      subtotal,
      itemCount,
      expiresAt: cart.expiresAt,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
    };
  }
}

