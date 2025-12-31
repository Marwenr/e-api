import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import rateLimit from '@fastify/rate-limit';
import { authenticate } from '../../middleware/auth';
import { loginRateLimitConfig, passwordResetRateLimitConfig } from '../../middleware/rate-limit';
import * as controller from './controller';
import { authSchemas } from './schemas';

export default async function authRoutes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions
) {
  // Rate limiting for login/register (brute force protection)
  await fastify.register(async function (fastify) {
    await fastify.register(rateLimit, {
      ...loginRateLimitConfig,
      skip: (request) => {
        // Skip rate limiting for OPTIONS requests (CORS preflight)
        return request.method === 'OPTIONS';
      },
      keyGenerator: (request) => {
        const email = (request.body as any)?.email || '';
        return `auth-${request.ip}-${email}`;
      },
    });

    // Public routes with rate limiting
    fastify.post('/register', {
      schema: authSchemas.register,
    }, controller.register);

    fastify.post('/login', {
      schema: authSchemas.login,
    }, controller.login);
  });

  // Other public routes without special rate limiting
  fastify.post('/refresh', {
    schema: authSchemas.refresh,
  }, controller.refresh);

  fastify.post('/logout', {
    schema: authSchemas.logout,
  }, controller.logout);

  fastify.post('/verify-email', {
    schema: authSchemas.verifyEmail,
  }, controller.verifyEmail);

  fastify.post('/resend-verification', {
    schema: authSchemas.resendVerification,
  }, controller.resendVerification);

  // Rate limiting for password reset
  await fastify.register(async function (fastify) {
    await fastify.register(rateLimit, {
      ...passwordResetRateLimitConfig,
      skip: (request) => {
        // Skip rate limiting for OPTIONS requests (CORS preflight)
        return request.method === 'OPTIONS';
      },
      keyGenerator: (request) => {
        const email = (request.body as any)?.email || '';
        return `password-reset-${request.ip}-${email}`;
      },
    });

    fastify.post('/forgot-password', {
      schema: authSchemas.forgotPassword,
    }, controller.forgotPassword);

    fastify.post('/reset-password', {
      schema: authSchemas.resetPassword,
    }, controller.resetPassword);
  });

  // Protected routes (require authentication)
  fastify.get('/me', {
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                email: { type: 'string' },
                firstName: { type: 'string' },
                lastName: { type: 'string' },
                role: { type: 'string' },
                status: { type: 'string' },
                emailVerified: { type: 'boolean' },
                storeId: { type: 'string' },
              },
            },
          },
        },
      },
    },
    preHandler: [authenticate],
  }, controller.getCurrentUser);

  fastify.patch('/profile', {
    schema: authSchemas.updateProfile,
    preHandler: [authenticate],
  }, controller.updateProfile);

  fastify.post('/logout-all', {
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                message: { type: 'string' },
              },
            },
          },
        },
      },
    },
    preHandler: [authenticate],
  }, controller.logoutAll);

  fastify.post('/change-password', {
    schema: authSchemas.changePassword,
    preHandler: [authenticate],
  }, controller.changePassword);
}

