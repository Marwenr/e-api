import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import rateLimit from '@fastify/rate-limit';

/**
 * Rate limiting configuration for authentication routes
 * More restrictive than global rate limiting
 */
export const authRateLimitConfig = {
  max: 5, // 5 requests
  timeWindow: 15 * 60 * 1000, // 15 minutes
  cache: 10000, // Cache size
  allowList: [], // IPs to allow (can be configured via env)
  skipOnError: false, // Don't skip on errors
  enableDraftSpec: true, // Enable draft spec
  errorResponseBuilder: (request: any, context: any) => {
    return {
      success: false,
      error: {
        message: 'Too many authentication attempts. Please try again later.',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil(context.ttl / 1000), // Seconds
      },
    };
  },
};

/**
 * Rate limiting for login/register endpoints
 * Very restrictive to prevent brute force attacks
 */
export const loginRateLimitConfig = {
  max: 5, // 5 attempts
  timeWindow: 15 * 60 * 1000, // 15 minutes
  cache: 10000,
  skipOnError: false,
  enableDraftSpec: true,
  errorResponseBuilder: (request: any, context: any) => {
    return {
      success: false,
      error: {
        message: 'Too many login attempts. Please try again later.',
        code: 'LOGIN_RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil(context.ttl / 1000),
      },
    };
  },
};

/**
 * Rate limiting for password reset endpoints
 */
export const passwordResetRateLimitConfig = {
  max: 3, // 3 attempts
  timeWindow: 60 * 60 * 1000, // 1 hour
  cache: 10000,
  skipOnError: false,
  enableDraftSpec: true,
  errorResponseBuilder: (request: any, context: any) => {
    return {
      success: false,
      error: {
        message: 'Too many password reset attempts. Please try again later.',
        code: 'PASSWORD_RESET_RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil(context.ttl / 1000),
      },
    };
  },
};

/**
 * Register rate limiting for auth routes
 */
export const registerAuthRateLimit = async (
  fastify: FastifyInstance,
  prefix: string = '/auth'
): Promise<void> => {
  // Rate limit for login and register
  await fastify.register(rateLimit, {
    ...loginRateLimitConfig,
    keyGenerator: (request) => {
      // Rate limit by IP + email (if provided)
      const email = (request.body as any)?.email || '';
      return `${request.ip}-${email}`;
    },
  });

  // Rate limit for password reset
  await fastify.register(rateLimit, {
    ...passwordResetRateLimitConfig,
    keyGenerator: (request) => {
      const email = (request.body as any)?.email || '';
      return `password-reset-${request.ip}-${email}`;
    },
  });
};

