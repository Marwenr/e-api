import { AuthService } from '../auth.service';
import { User, RefreshToken, UserRole, UserStatus } from '../../models';
import {
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  InvalidTokenError,
  TokenExpiredError,
} from '../errors';
import { JWTUtil } from '../../utils/jwt';
import { createTestUser, createTestRefreshToken } from '../../__tests__/helpers';

describe('AuthService', () => {
  describe('register', () => {
    it('should register a new user successfully', async () => {
      const input = {
        email: 'newuser@example.com',
        password: 'SecurePassword123!',
        firstName: 'John',
        lastName: 'Doe',
      };

      const result = await AuthService.register(input);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('tokens');
      expect(result.user.email).toBe(input.email.toLowerCase());
      expect(result.user.firstName).toBe(input.firstName);
      expect(result.user.lastName).toBe(input.lastName);
      expect(result.user.role).toBe(UserRole.CUSTOMER);
      expect(result.user.status).toBe(UserStatus.PENDING_VERIFICATION);
      expect(result.user.emailVerified).toBe(false);
      expect(result.tokens).toHaveProperty('accessToken');
      expect(result.tokens).toHaveProperty('refreshToken');

      // Verify user was saved
      const user = await User.findById(result.user.id);
      expect(user).toBeTruthy();
      expect(user?.email).toBe(input.email.toLowerCase());
    });

    it('should throw ConflictError for duplicate email', async () => {
      const email = 'duplicate@example.com';
      await createTestUser({ email });

      await expect(
        AuthService.register({
          email,
          password: 'Password123!',
        })
      ).rejects.toThrow(ConflictError);
    });

    it('should throw ValidationError for missing email', async () => {
      await expect(
        AuthService.register({
          email: '',
          password: 'Password123!',
        })
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for missing password', async () => {
      await expect(
        AuthService.register({
          email: 'test@example.com',
          password: '',
        })
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for short password', async () => {
      await expect(
        AuthService.register({
          email: 'test@example.com',
          password: 'short',
        })
      ).rejects.toThrow(ValidationError);
    });

    it('should create refresh token in database', async () => {
      const result = await AuthService.register({
        email: 'tokenuser@example.com',
        password: 'Password123!',
      });

      const token = await RefreshToken.findOne({ userId: result.user.id });
      expect(token).toBeTruthy();
      expect(token?.revoked).toBe(false);
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const password = 'TestPassword123!';
      const user = await createTestUser({
        email: 'login@example.com',
        password,
        status: UserStatus.ACTIVE,
        emailVerified: true,
      });

      const result = await AuthService.login({
        email: user.email,
        password,
      });

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('tokens');
      expect(result.user.id).toBe(user._id.toString());
      expect(result.user.email).toBe(user.email);
      expect(result.tokens.accessToken).toBeTruthy();
      expect(result.tokens.refreshToken).toBeTruthy();

      // Verify lastLogin was updated
      const updatedUser = await User.findById(user._id);
      expect(updatedUser?.lastLogin).toBeTruthy();
    });

    it('should throw UnauthorizedError for invalid email', async () => {
      await expect(
        AuthService.login({
          email: 'nonexistent@example.com',
          password: 'Password123!',
        })
      ).rejects.toThrow(UnauthorizedError);
    });

    it('should throw UnauthorizedError for invalid password', async () => {
      const user = await createTestUser({
        email: 'wrongpass@example.com',
        password: 'CorrectPassword123!',
      });

      await expect(
        AuthService.login({
          email: user.email,
          password: 'WrongPassword123!',
        })
      ).rejects.toThrow(UnauthorizedError);
    });

    it('should throw ForbiddenError for suspended account', async () => {
      const password = 'TestPassword123!';
      const user = await createTestUser({
        email: 'suspended@example.com',
        password,
        status: UserStatus.SUSPENDED,
      });

      await expect(
        AuthService.login({
          email: user.email,
          password,
        })
      ).rejects.toThrow(ForbiddenError);
    });

    it('should throw ForbiddenError for inactive account', async () => {
      const password = 'TestPassword123!';
      const user = await createTestUser({
        email: 'inactive@example.com',
        password,
        status: UserStatus.INACTIVE,
      });

      await expect(
        AuthService.login({
          email: user.email,
          password,
        })
      ).rejects.toThrow(ForbiddenError);
    });

    it('should create refresh token on login', async () => {
      const password = 'TestPassword123!';
      const user = await createTestUser({
        email: 'logintoken@example.com',
        password,
        status: UserStatus.ACTIVE,
      });

      const result = await AuthService.login({
        email: user.email,
        password,
      });

      const token = await RefreshToken.findOne({ userId: user._id.toString() });
      expect(token).toBeTruthy();
      expect(token?.token).toBe(result.tokens.refreshToken);
    });
  });

  describe('refreshToken', () => {
    it('should refresh tokens successfully', async () => {
      const user = await createTestUser({
        email: 'refresh@example.com',
        status: UserStatus.ACTIVE,
      });

      const tokenPayload = {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      };

      const oldTokens = JWTUtil.generateTokenPair(tokenPayload);
      const oldRefreshToken = new RefreshToken({
        userId: user._id.toString(),
        token: oldTokens.refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        revoked: false,
      });
      await oldRefreshToken.save();

      const result = await AuthService.refreshToken({
        refreshToken: oldTokens.refreshToken,
      });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.accessToken).not.toBe(oldTokens.accessToken);
      expect(result.refreshToken).not.toBe(oldTokens.refreshToken);

      // Verify old token was revoked
      const revokedToken = await RefreshToken.findById(oldRefreshToken._id);
      expect(revokedToken?.revoked).toBe(true);

      // Verify new token was saved
      const newToken = await RefreshToken.findOne({
        token: result.refreshToken,
        revoked: false,
      });
      expect(newToken).toBeTruthy();
    });

    it('should throw ValidationError for missing refresh token', async () => {
      await expect(
        AuthService.refreshToken({
          refreshToken: '',
        })
      ).rejects.toThrow(ValidationError);
    });

    it('should throw InvalidTokenError for invalid refresh token', async () => {
      await expect(
        AuthService.refreshToken({
          refreshToken: 'invalid-token',
        })
      ).rejects.toThrow(InvalidTokenError);
    });

    it('should throw InvalidTokenError for revoked token', async () => {
      const user = await createTestUser();
      const tokenPayload = {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      };
      const tokens = JWTUtil.generateTokenPair(tokenPayload);

      const refreshToken = new RefreshToken({
        userId: user._id.toString(),
        token: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        revoked: true,
      });
      await refreshToken.save();

      await expect(
        AuthService.refreshToken({
          refreshToken: tokens.refreshToken,
        })
      ).rejects.toThrow(InvalidTokenError);
    });

    it('should throw ForbiddenError for suspended user', async () => {
      const user = await createTestUser({
        status: UserStatus.SUSPENDED,
      });

      const tokenPayload = {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      };
      const tokens = JWTUtil.generateTokenPair(tokenPayload);

      const refreshToken = new RefreshToken({
        userId: user._id.toString(),
        token: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        revoked: false,
      });
      await refreshToken.save();

      await expect(
        AuthService.refreshToken({
          refreshToken: tokens.refreshToken,
        })
      ).rejects.toThrow(ForbiddenError);
    });
  });

  describe('logout', () => {
    it('should logout user successfully', async () => {
      const user = await createTestUser();
      const refreshToken = await createTestRefreshToken(user._id.toString());

      await AuthService.logout(refreshToken.token);

      const revokedToken = await RefreshToken.findById(refreshToken._id);
      expect(revokedToken?.revoked).toBe(true);
      expect(revokedToken?.revokedAt).toBeTruthy();
    });

    it('should not throw error for non-existent token', async () => {
      await expect(
        AuthService.logout('non-existent-token')
      ).resolves.not.toThrow();
    });
  });

  describe('logoutAll', () => {
    it('should revoke all user tokens', async () => {
      const user = await createTestUser();
      await createTestRefreshToken(user._id.toString(), { token: 'token1' });
      await createTestRefreshToken(user._id.toString(), { token: 'token2' });
      await createTestRefreshToken(user._id.toString(), { token: 'token3' });

      await AuthService.logoutAll(user._id.toString());

      const tokens = await RefreshToken.find({ userId: user._id.toString() });
      tokens.forEach(token => {
        expect(token.revoked).toBe(true);
      });
    });
  });

  describe('verifyEmail', () => {
    it('should verify email successfully', async () => {
      const user = await createTestUser({
        emailVerified: false,
        status: UserStatus.PENDING_VERIFICATION,
      });

      const token = user.generateEmailVerificationToken();
      await user.save();

      await AuthService.verifyEmail(token);

      const updatedUser = await User.findById(user._id);
      expect(updatedUser?.emailVerified).toBe(true);
      expect(updatedUser?.status).toBe(UserStatus.ACTIVE);
      expect(updatedUser?.emailVerificationToken).toBeUndefined();
    });

    it('should throw InvalidTokenError for invalid token', async () => {
      await expect(
        AuthService.verifyEmail('invalid-token')
      ).rejects.toThrow(InvalidTokenError);
    });

    it('should throw InvalidTokenError for expired token', async () => {
      const user = await createTestUser({
        emailVerified: false,
      });

      // Create expired token
      const token = user.generateEmailVerificationToken();
      user.emailVerificationExpires = new Date(Date.now() - 1000); // Expired
      await user.save();

      await expect(
        AuthService.verifyEmail(token)
      ).rejects.toThrow(InvalidTokenError);
    });
  });

  describe('resendEmailVerification', () => {
    it('should generate new verification token', async () => {
      const user = await createTestUser({
        emailVerified: false,
      });

      const result = await AuthService.resendEmailVerification(user.email);

      expect(result.message).toContain('verification email');

      const updatedUser = await User.findById(user._id);
      expect(updatedUser?.emailVerificationToken).toBeTruthy();
      expect(updatedUser?.emailVerificationExpires).toBeTruthy();
    });

    it('should throw ConflictError for already verified email', async () => {
      const user = await createTestUser({
        emailVerified: true,
      });

      await expect(
        AuthService.resendEmailVerification(user.email)
      ).rejects.toThrow(ConflictError);
    });

    it('should not reveal if email exists', async () => {
      const result = await AuthService.resendEmailVerification('nonexistent@example.com');
      expect(result.message).toContain('verification email');
    });
  });

  describe('forgotPassword', () => {
    it('should generate password reset token', async () => {
      const user = await createTestUser();

      const result = await AuthService.forgotPassword(user.email);

      expect(result.message).toContain('password reset');

      const updatedUser = await User.findById(user._id).select('+passwordResetToken');
      expect(updatedUser?.passwordResetToken).toBeTruthy();
      expect(updatedUser?.passwordResetExpires).toBeTruthy();
    });

    it('should not reveal if email exists', async () => {
      const result = await AuthService.forgotPassword('nonexistent@example.com');
      expect(result.message).toContain('password reset');
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      const user = await createTestUser();
      const oldPassword = 'OldPassword123!';
      user.password = oldPassword;
      await user.save();

      const token = user.generatePasswordResetToken();
      await user.save();

      const newPassword = 'NewPassword123!';
      await AuthService.resetPassword(token, newPassword);

      const updatedUser = await User.findById(user._id).select('+password');
      expect(updatedUser?.passwordResetToken).toBeUndefined();
      expect(updatedUser?.passwordResetExpires).toBeUndefined();

      // Verify new password works
      const isValid = await updatedUser!.comparePassword(newPassword);
      expect(isValid).toBe(true);
    });

    it('should throw InvalidTokenError for invalid token', async () => {
      await expect(
        AuthService.resetPassword('invalid-token', 'NewPassword123!')
      ).rejects.toThrow(InvalidTokenError);
    });

    it('should throw ValidationError for short password', async () => {
      const user = await createTestUser();
      const token = user.generatePasswordResetToken();
      await user.save();

      await expect(
        AuthService.resetPassword(token, 'short')
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      const currentPassword = 'CurrentPassword123!';
      const user = await createTestUser({ password: currentPassword });

      const newPassword = 'NewPassword123!';
      await AuthService.changePassword({
        userId: user._id.toString(),
        currentPassword,
        newPassword,
      });

      const updatedUser = await User.findById(user._id).select('+password');
      const isValid = await updatedUser!.comparePassword(newPassword);
      expect(isValid).toBe(true);

      // Verify all tokens were revoked
      const tokens = await RefreshToken.find({ userId: user._id.toString() });
      tokens.forEach(token => {
        expect(token.revoked).toBe(true);
      });
    });

    it('should throw UnauthorizedError for wrong current password', async () => {
      const user = await createTestUser({ password: 'CorrectPassword123!' });

      await expect(
        AuthService.changePassword({
          userId: user._id.toString(),
          currentPassword: 'WrongPassword123!',
          newPassword: 'NewPassword123!',
        })
      ).rejects.toThrow(UnauthorizedError);
    });

    it('should throw NotFoundError for non-existent user', async () => {
      await expect(
        AuthService.changePassword({
          userId: '507f1f77bcf86cd799439011',
          currentPassword: 'Password123!',
          newPassword: 'NewPassword123!',
        })
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('Security Flows', () => {
    it('should implement token rotation on refresh', async () => {
      const user = await createTestUser();
      const tokenPayload = {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      };
      const oldTokens = JWTUtil.generateTokenPair(tokenPayload);

      const oldRefreshToken = new RefreshToken({
        userId: user._id.toString(),
        token: oldTokens.refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        revoked: false,
      });
      await oldRefreshToken.save();

      const newTokens = await AuthService.refreshToken({
        refreshToken: oldTokens.refreshToken,
      });

      // Old token should be revoked
      const revoked = await RefreshToken.findById(oldRefreshToken._id);
      expect(revoked?.revoked).toBe(true);

      // New token should be different
      expect(newTokens.refreshToken).not.toBe(oldTokens.refreshToken);

      // Old token should not work
      await expect(
        AuthService.refreshToken({
          refreshToken: oldTokens.refreshToken,
        })
      ).rejects.toThrow(InvalidTokenError);
    });

    it('should revoke all tokens on password change', async () => {
      const user = await createTestUser();
      await createTestRefreshToken(user._id.toString(), { token: 'token1' });
      await createTestRefreshToken(user._id.toString(), { token: 'token2' });

      await AuthService.changePassword({
        userId: user._id.toString(),
        currentPassword: 'TestPassword123!',
        newPassword: 'NewPassword123!',
      });

      const tokens = await RefreshToken.find({ userId: user._id.toString() });
      expect(tokens.length).toBeGreaterThan(0);
      tokens.forEach(token => {
        expect(token.revoked).toBe(true);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle email case insensitivity', async () => {
      await AuthService.register({
        email: 'Test@Example.COM',
        password: 'Password123!',
      });

      await expect(
        AuthService.register({
          email: 'test@example.com',
          password: 'Password123!',
        })
      ).rejects.toThrow(ConflictError);
    });

    it('should handle special characters in email', async () => {
      const result = await AuthService.register({
        email: 'test+tag@example.com',
        password: 'Password123!',
      });

      expect(result.user.email).toBe('test+tag@example.com');
    });

    it('should handle long passwords', async () => {
      const longPassword = 'A'.repeat(200) + '123!';
      const result = await AuthService.register({
        email: 'longpass@example.com',
        password: longPassword,
      });

      expect(result.user).toBeTruthy();
    });
  });
});

