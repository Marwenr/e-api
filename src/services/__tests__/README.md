# Auth Service Tests

Comprehensive test suite for the authentication service module.

## Test Coverage

### Register Flow
- ✅ Successful registration
- ✅ Duplicate email handling
- ✅ Validation errors (missing fields, short password)
- ✅ Refresh token creation

### Login Flow
- ✅ Successful login
- ✅ Invalid credentials handling
- ✅ Suspended account handling
- ✅ Inactive account handling
- ✅ Last login update
- ✅ Token generation

### Token Refresh
- ✅ Successful token refresh
- ✅ Token rotation (old token revoked)
- ✅ Invalid token handling
- ✅ Revoked token handling
- ✅ Suspended user handling

### Logout
- ✅ Single device logout
- ✅ All devices logout
- ✅ Non-existent token handling

### Email Verification
- ✅ Successful email verification
- ✅ Invalid token handling
- ✅ Expired token handling
- ✅ Status update after verification

### Password Reset
- ✅ Password reset request
- ✅ Password reset with token
- ✅ Invalid token handling
- ✅ Expired token handling
- ✅ Security (doesn't reveal if email exists)

### Change Password
- ✅ Successful password change
- ✅ Wrong current password handling
- ✅ Token revocation on password change
- ✅ Non-existent user handling

### Security Flows
- ✅ Token rotation on refresh
- ✅ Token revocation on password change
- ✅ All tokens revoked on password change

### Edge Cases
- ✅ Email case insensitivity
- ✅ Special characters in email
- ✅ Long passwords

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Test Setup

Tests use a separate test database (`ecommerce_test`) to avoid affecting development data.

### Environment Variables

Create `.env.test` file (see `.env.test.example`):

```env
TEST_MONGO_URI=mongodb://localhost:27017
MONGO_DB_NAME=ecommerce_test
JWT_SECRET=test-jwt-secret-key-for-testing-only
```

## Test Structure

- **Setup**: Database connection and cleanup
- **Helpers**: Test data creation utilities
- **Tests**: Comprehensive test cases for all auth flows

## Best Practices

1. Each test is isolated and independent
2. Database is cleaned before each test
3. Tests use helper functions for consistency
4. Tests verify both success and error cases
5. Security flows are explicitly tested

