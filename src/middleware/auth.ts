import { FastifyRequest, FastifyReply } from "fastify";
import { JWTUtil } from "../utils/jwt";
import { UnauthorizedError, ForbiddenError } from "../services/errors";
import { RefreshToken } from "../models";

export interface AuthenticatedRequest extends FastifyRequest {
  user?: {
    userId: string;
    email: string;
    role: string;
    storeId?: string;
  };
}

/**
 * Authentication middleware
 * Verifies JWT access token and attaches user info to request
 * Includes security checks: token validation, blacklist check, etc.
 */
export const authenticate = async (
  request: AuthenticatedRequest,
  reply: FastifyReply
): Promise<void> => {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError("No token provided");
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token structure
    if (!token || token.length < 10) {
      throw new UnauthorizedError("Invalid token format");
    }

    try {
      // Verify and decode token
      const payload = JWTUtil.verifyAccessToken(token);

      // Check if token is blacklisted (check refresh token table for revoked tokens)
      // Note: For production, consider implementing a token blacklist cache
      const tokenId = JWTUtil.getTokenId(token);
      if (tokenId) {
        // Check if this token ID was part of a revoked refresh token
        // This is a simplified check - in production, use Redis or similar
        const revokedToken = await RefreshToken.findOne({
          token: { $regex: tokenId },
          revoked: true,
        });

        if (revokedToken) {
          throw new UnauthorizedError("Token has been revoked");
        }
      }

      // Attach user info to request
      request.user = payload;
    } catch (error: any) {
      if (error instanceof UnauthorizedError) {
        throw error;
      }
      if (error.message.includes("expired")) {
        throw new UnauthorizedError("Token has expired");
      }
      if (error.message.includes("revoked")) {
        throw new UnauthorizedError("Token has been revoked");
      }
      throw new UnauthorizedError("Invalid token");
    }
  } catch (error: any) {
    if (error instanceof UnauthorizedError || error instanceof ForbiddenError) {
      throw error;
    }
    throw new UnauthorizedError("Authentication failed");
  }
};

/**
 * Optional authentication middleware
 * Attaches user info if token is valid, but doesn't require it
 */
export const optionalAuthenticate = async (
  request: AuthenticatedRequest,
  reply: FastifyReply
): Promise<void> => {
  try {
    const authHeader = request.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      try {
        const payload = JWTUtil.verifyAccessToken(token);
        request.user = payload;
      } catch (error) {
        // Silently fail for optional auth
      }
    }
  } catch (error) {
    // Silently fail for optional auth
  }
};
