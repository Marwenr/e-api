import { FastifyRequest, FastifyReply } from "fastify";
import { CartService } from "../../services/cart.service";
import { AuthenticatedRequest } from "../../middleware/auth";
import { sendSuccess, sendError } from "../../utils/response";

interface AddToCartRequest extends FastifyRequest {
  body: {
    productId: string;
    variantId?: string;
    quantity: number;
  };
  query?: {
    sessionId?: string;
  };
}

interface UpdateCartItemRequest extends FastifyRequest {
  body: {
    itemIndex: number;
    quantity: number;
  };
  query?: {
    sessionId?: string;
  };
}

interface RemoveCartItemRequest extends FastifyRequest {
  query?: {
    itemIndex: string;
    sessionId?: string;
  };
}

interface GetCartRequest extends FastifyRequest {
  query?: {
    sessionId?: string;
  };
}

interface MergeCartRequest extends FastifyRequest {
  body: {
    sessionId: string;
  };
}

/**
 * Get cart
 * GET /api/cart
 */
export async function getCart(
  request: AuthenticatedRequest & GetCartRequest,
  reply: FastifyReply
) {
  try {
    const userId = request.user?.userId;
    const sessionId = (request.query as any)?.sessionId;

    if (!userId && !sessionId) {
      return sendError(
        reply,
        "Either authentication or sessionId is required",
        "VALIDATION_ERROR",
        400
      );
    }

    const cart = await CartService.getCart(userId, sessionId);

    if (!cart) {
      return sendSuccess(reply, {
        cart: null,
        message: "Cart is empty",
      });
    }

    return sendSuccess(reply, { cart });
  } catch (error: any) {
    return sendError(
      reply,
      error.message || "Failed to get cart",
      error.code || "GET_CART_ERROR",
      error.statusCode || 500
    );
  }
}

/**
 * Add item to cart
 * POST /api/cart/add
 */
export async function addToCart(
  request: AuthenticatedRequest & AddToCartRequest,
  reply: FastifyReply
) {
  try {
    const userId = request.user?.userId;
    const sessionId = (request.query as any)?.sessionId;

    if (!userId && !sessionId) {
      return sendError(
        reply,
        "Either authentication or sessionId is required",
        "VALIDATION_ERROR",
        400
      );
    }

    const { productId, variantId, quantity } = request.body;

    const cart = await CartService.addToCart(
      { productId, variantId, quantity },
      userId,
      sessionId
    );

    return sendSuccess(reply, {
      cart,
      message: "Item added to cart",
    });
  } catch (error: any) {
    return sendError(
      reply,
      error.message || "Failed to add item to cart",
      error.code || "ADD_TO_CART_ERROR",
      error.statusCode || 500
    );
  }
}

/**
 * Update cart item quantity
 * PUT /api/cart/update
 */
export async function updateCartItem(
  request: AuthenticatedRequest & UpdateCartItemRequest,
  reply: FastifyReply
) {
  try {
    const userId = request.user?.userId;
    const sessionId = (request.query as any)?.sessionId;

    if (!userId && !sessionId) {
      return sendError(
        reply,
        "Either authentication or sessionId is required",
        "VALIDATION_ERROR",
        400
      );
    }

    const { itemIndex, quantity } = request.body;

    const cart = await CartService.updateCartItem(
      { itemIndex, quantity },
      userId,
      sessionId
    );

    return sendSuccess(reply, {
      cart,
      message: "Cart item updated",
    });
  } catch (error: any) {
    return sendError(
      reply,
      error.message || "Failed to update cart item",
      error.code || "UPDATE_CART_ITEM_ERROR",
      error.statusCode || 500
    );
  }
}

/**
 * Remove item from cart
 * DELETE /api/cart/remove
 */
export async function removeCartItem(
  request: AuthenticatedRequest & RemoveCartItemRequest,
  reply: FastifyReply
) {
  try {
    const userId = request.user?.userId;
    const query = request.query as any;
    const sessionId = query?.sessionId;
    const itemIndex = parseInt(query?.itemIndex, 10);

    if (!userId && !sessionId) {
      return sendError(
        reply,
        "Either authentication or sessionId is required",
        "VALIDATION_ERROR",
        400
      );
    }

    if (isNaN(itemIndex) || itemIndex < 0) {
      return sendError(
        reply,
        "Invalid itemIndex",
        "VALIDATION_ERROR",
        400
      );
    }

    const cart = await CartService.removeCartItem(itemIndex, userId, sessionId);

    return sendSuccess(reply, {
      cart,
      message: "Item removed from cart",
    });
  } catch (error: any) {
    return sendError(
      reply,
      error.message || "Failed to remove item from cart",
      error.code || "REMOVE_CART_ITEM_ERROR",
      error.statusCode || 500
    );
  }
}

/**
 * Clear cart
 * DELETE /api/cart/clear
 */
export async function clearCart(
  request: AuthenticatedRequest,
  reply: FastifyReply
) {
  try {
    const userId = request.user?.userId;
    const sessionId = (request.query as any)?.sessionId;

    if (!userId && !sessionId) {
      return sendError(
        reply,
        "Either authentication or sessionId is required",
        "VALIDATION_ERROR",
        400
      );
    }

    await CartService.clearCart(userId, sessionId);

    return sendSuccess(reply, {
      message: "Cart cleared",
    });
  } catch (error: any) {
    return sendError(
      reply,
      error.message || "Failed to clear cart",
      error.code || "CLEAR_CART_ERROR",
      error.statusCode || 500
    );
  }
}

/**
 * Merge guest cart into user cart
 * POST /api/cart/merge
 */
export async function mergeCart(
  request: AuthenticatedRequest & MergeCartRequest,
  reply: FastifyReply
) {
  try {
    const userId = request.user?.userId;

    if (!userId) {
      return sendError(reply, "Authentication required", "UNAUTHORIZED", 401);
    }

    const { sessionId } = request.body;

    if (!sessionId) {
      return sendError(reply, "Session ID is required", "VALIDATION_ERROR", 400);
    }

    const cart = await CartService.mergeCarts(sessionId, userId);

    return sendSuccess(reply, {
      cart,
      message: "Cart merged successfully",
    });
  } catch (error: any) {
    return sendError(
      reply,
      error.message || "Failed to merge cart",
      error.code || "MERGE_CART_ERROR",
      error.statusCode || 500
    );
  }
}

/**
 * Recalculate cart (validate stock, update prices)
 * POST /api/cart/recalculate
 */
export async function recalculateCart(
  request: AuthenticatedRequest,
  reply: FastifyReply
) {
  try {
    const userId = request.user?.userId;
    const sessionId = (request.query as any)?.sessionId;

    if (!userId && !sessionId) {
      return sendError(
        reply,
        "Either authentication or sessionId is required",
        "VALIDATION_ERROR",
        400
      );
    }

    const cart = await CartService.recalculateCart(userId, sessionId);

    return sendSuccess(reply, {
      cart,
      message: "Cart recalculated",
    });
  } catch (error: any) {
    return sendError(
      reply,
      error.message || "Failed to recalculate cart",
      error.code || "RECALCULATE_CART_ERROR",
      error.statusCode || 500
    );
  }
}

