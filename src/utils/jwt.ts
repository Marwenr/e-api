import * as jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  storeId?: string;
  jti?: string; // JWT ID for token tracking
  iat?: number; // Issued at
  exp?: number; // Expiration
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export class JWTUtil {
  /**
   * Generate access token with security enhancements
   */
  static generateAccessToken(payload: TokenPayload): string {
    const jti = crypto.randomBytes(16).toString('hex');
    const now = Math.floor(Date.now() / 1000);

    return jwt.sign(
      {
        ...payload,
        jti,
        iat: now,
      },
      env.jwtSecret,
      {
        expiresIn: env.jwtAccessTokenExpiresIn as string | number,
        issuer: 'ecommerce-api',
        audience: 'ecommerce-client',
        algorithm: 'HS256',
      } as jwt.SignOptions
    );
  }

  /**
   * Generate refresh token with security enhancements
   */
  static generateRefreshToken(payload: TokenPayload, tokenId?: string): string {
    const jti = tokenId || crypto.randomBytes(16).toString('hex');
    const now = Math.floor(Date.now() / 1000);

    return jwt.sign(
      {
        ...payload,
        type: 'refresh',
        jti,
        iat: now,
      },
      env.jwtSecret,
      {
        expiresIn: env.jwtRefreshTokenExpiresIn as string | number,
        issuer: 'ecommerce-api',
        audience: 'ecommerce-client',
        algorithm: 'HS256',
      } as jwt.SignOptions
    );
  }

  /**
   * Generate token pair (access + refresh) with token rotation support
   */
  static generateTokenPair(payload: TokenPayload, refreshTokenId?: string): TokenPair {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload, refreshTokenId),
    };
  }

  /**
   * Extract JWT ID from token
   */
  static getTokenId(token: string): string | null {
    try {
      const decoded = jwt.decode(token) as any;
      return decoded?.jti || null;
    } catch {
      return null;
    }
  }

  /**
   * Verify access token
   */
  static verifyAccessToken(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, env.jwtSecret, {
        issuer: 'ecommerce-api',
        audience: 'ecommerce-client',
      }) as TokenPayload;

      return decoded;
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Token has expired');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid token');
      }
      throw new Error('Token verification failed');
    }
  }

  /**
   * Verify refresh token
   */
  static verifyRefreshToken(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, env.jwtSecret, {
        issuer: 'ecommerce-api',
        audience: 'ecommerce-client',
      }) as TokenPayload & { type?: string };

      if (decoded.type !== 'refresh') {
        throw new Error('Invalid token type');
      }

      // Remove type from payload
      const { type, ...payload } = decoded;
      return payload;
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Token has expired');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid token');
      }
      throw error;
    }
  }

  /**
   * Decode token without verification (for debugging)
   */
  static decodeToken(token: string): any {
    return jwt.decode(token);
  }
}

