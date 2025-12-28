import { User, UserRole, UserStatus } from '../models';
import { RefreshToken } from '../models';

export const createTestUser = async (overrides: Partial<{
  email: string;
  password: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  storeId: string;
}> = {}) => {
  const defaultUser = {
    email: 'test@example.com',
    password: 'TestPassword123!',
    role: UserRole.CUSTOMER,
    status: UserStatus.ACTIVE,
    emailVerified: true,
    ...overrides,
  };

  // Create user - password will be hashed automatically by pre-save hook
  const user = new User(defaultUser);
  await user.save();
  
  // Return user with password accessible for testing
  return user;
};

export const createTestRefreshToken = async (userId: string, overrides: Partial<{
  token: string;
  expiresAt: Date;
  revoked: boolean;
  storeId: string;
}> = {}) => {
  const expiresAt = overrides.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  const token = overrides.token || 'test-refresh-token-' + Date.now();

  const refreshToken = new RefreshToken({
    userId,
    token,
    expiresAt,
    revoked: false,
    ...overrides,
  });

  await refreshToken.save();
  return refreshToken;
};

export const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

