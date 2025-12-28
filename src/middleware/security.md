# Authentication Security Layer

## Overview

This document describes the security features implemented for the authentication module.

## Features

### 1. JWT Token Generation

**Enhanced Security:**
- JWT ID (jti) for token tracking
- Issued at (iat) timestamp
- Expiration (exp) timestamp
- Algorithm specification (HS256)
- Issuer and audience validation

**Token Structure:**
```typescript
{
  userId: string;
  email: string;
  role: string;
  storeId?: string;
  jti: string;      // Unique token ID
  iat: number;      // Issued at
  exp: number;      // Expiration
}
```

### 2. Token Rotation

**Implementation:**
- Old refresh token is revoked before issuing new one
- Prevents token reuse attacks
- Automatic token rotation on refresh
- Token ID tracking for revocation

**Flow:**
1. User requests token refresh
2. Old refresh token is verified and revoked
3. New token pair is generated
4. New refresh token is saved to database

### 3. Authentication Middleware

**Features:**
- JWT token verification
- Token format validation
- Token blacklist checking
- User info attachment to request

**Usage:**
```typescript
import { authenticate } from '../middleware/auth';

fastify.get('/protected', {
  preHandler: [authenticate],
}, async (request, reply) => {
  // request.user is available
  const userId = request.user.userId;
});
```

### 4. Role-Based Access Control

**Available Middleware:**
- `requireAdmin` - Admin only
- `requireStoreOwner` - Store owner or admin
- `requireStoreManager` - Store manager, owner, or admin
- `requireRole(...roles)` - Custom role requirement
- `requireAnyAuth` - Any authenticated user

**Usage:**
```typescript
import { requireAdmin, requireRole } from '../middleware/roles';
import { UserRole } from '../models/types';

// Admin only route
fastify.get('/admin/users', {
  preHandler: [authenticate, requireAdmin],
}, handler);

// Custom role requirement
fastify.get('/store/products', {
  preHandler: [authenticate, requireRole(UserRole.STORE_OWNER, UserRole.ADMIN)],
}, handler);
```

**Helper Functions:**
```typescript
import { hasRole, isAdmin, canManageStore } from '../middleware/roles';

// Check roles in code
if (isAdmin(user.role)) {
  // Admin logic
}

if (canManageStore(user.role)) {
  // Store management logic
}
```

### 5. Rate Limiting

**Configurations:**

**Login/Register Rate Limit:**
- Max: 5 requests
- Time window: 15 minutes
- Key: IP + email
- Purpose: Prevent brute force attacks

**Password Reset Rate Limit:**
- Max: 3 requests
- Time window: 1 hour
- Key: IP + email
- Purpose: Prevent abuse

**Implementation:**
Rate limiting is automatically applied to auth routes:
- `/auth/register`
- `/auth/login`
- `/auth/forgot-password`
- `/auth/reset-password`

**Error Response:**
```json
{
  "success": false,
  "error": {
    "message": "Too many login attempts. Please try again later.",
    "code": "LOGIN_RATE_LIMIT_EXCEEDED",
    "retryAfter": 900
  }
}
```

## Security Best Practices

### 1. Token Security
- ✅ Short-lived access tokens (15 minutes default)
- ✅ Long-lived refresh tokens (7 days default)
- ✅ Token rotation on refresh
- ✅ Token revocation support
- ✅ Token blacklist checking

### 2. Authentication
- ✅ Bearer token authentication
- ✅ Token format validation
- ✅ Token expiration checking
- ✅ Revoked token detection

### 3. Authorization
- ✅ Role-based access control
- ✅ Hierarchical role system
- ✅ Flexible role checking

### 4. Rate Limiting
- ✅ Per-endpoint rate limits
- ✅ IP + email based limiting
- ✅ Configurable limits
- ✅ Clear error messages

### 5. Input Validation
- ✅ JSON Schema validation
- ✅ Email format validation
- ✅ Password strength requirements
- ✅ Required field validation

## Performance Optimizations

1. **Token Verification:**
   - Fast JWT verification
   - Minimal database queries
   - Efficient token ID extraction

2. **Rate Limiting:**
   - In-memory caching
   - Efficient key generation
   - Minimal overhead

3. **Role Checking:**
   - Fast enum comparisons
   - No database queries
   - Cached role checks

## Production Considerations

### Recommended Enhancements:

1. **Token Blacklist:**
   - Use Redis for distributed token blacklist
   - Implement token revocation cache
   - Add token expiration cleanup

2. **Rate Limiting:**
   - Use Redis for distributed rate limiting
   - Implement sliding window algorithm
   - Add IP whitelist support

3. **Monitoring:**
   - Log authentication attempts
   - Track failed login attempts
   - Monitor token refresh patterns

4. **Security Headers:**
   - Already implemented via Helmet
   - CORS configuration
   - Content Security Policy

## Example: Protected Route with Role Check

```typescript
import { FastifyInstance } from 'fastify';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/roles';

export default async function adminRoutes(fastify: FastifyInstance) {
  fastify.get('/admin/users', {
    preHandler: [authenticate, requireAdmin],
  }, async (request, reply) => {
    // Only admins can access this route
    const user = request.user; // Guaranteed to exist
    return { message: 'Admin access granted' };
  });
}
```

## Example: Custom Role Requirement

```typescript
import { authenticate, requireRole } from '../middleware';
import { UserRole } from '../models/types';

fastify.get('/store/manage', {
  preHandler: [
    authenticate,
    requireRole(UserRole.STORE_OWNER, UserRole.STORE_MANAGER, UserRole.ADMIN)
  ],
}, handler);
```

