import { User, RefreshToken, UserRole, UserStatus } from '../models';
import { JWTUtil, TokenPayload } from '../utils/jwt';
import {
  AuthError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  TokenExpiredError,
  InvalidTokenError,
} from './errors';

export interface RegisterInput {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  storeId?: string;
}

export interface LoginInput {
  email: string;
  password: string;
  storeId?: string;
  deviceInfo?: {
    userAgent?: string;
    ipAddress?: string;
  };
}

export interface AuthResult {
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role: UserRole;
    status: UserStatus;
    emailVerified: boolean;
    storeId?: string;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface RefreshTokenInput {
  refreshToken: string;
  deviceInfo?: {
    userAgent?: string;
    ipAddress?: string;
  };
}

export interface ChangePasswordInput {
  userId: string;
  currentPassword: string;
  newPassword: string;
}

export class AuthService {
  /**
   * Register a new user
   */
  static async register(input: RegisterInput): Promise<AuthResult> {
    // Validate input
    if (!input.email || !input.password) {
      throw new ValidationError('Email and password are required');
    }

    if (input.password.length < 8) {
      throw new ValidationError('Password must be at least 8 characters');
    }

    // Fast check if email exists (optimized: only checks existence, doesn't fetch document)
    const emailExists = await User.checkEmailExists(input.email.toLowerCase());
    if (emailExists) {
      throw new ConflictError('User with this email already exists');
    }

    // Create new user
    const user = new User({
      email: input.email.toLowerCase(),
      password: input.password,
      firstName: input.firstName,
      lastName: input.lastName,
      role: UserRole.CUSTOMER,
      status: UserStatus.PENDING_VERIFICATION,
      storeId: input.storeId,
    });

    // Generate email verification token
    const verificationToken = user.generateEmailVerificationToken();
    await user.save();

    // Generate tokens
    const tokenPayload: TokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      storeId: user.storeId,
    };

    const tokens = JWTUtil.generateTokenPair(tokenPayload);

    // Save refresh token
    await this.saveRefreshToken(
      user._id.toString(),
      tokens.refreshToken,
      user.storeId,
      undefined
    );

    return {
      user: {
        id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
        emailVerified: user.emailVerified,
        storeId: user.storeId,
      },
      tokens,
    };
  }

  /**
   * Login user
   */
  static async login(input: LoginInput): Promise<AuthResult> {
    // Validate input
    if (!input.email || !input.password) {
      throw new ValidationError('Email and password are required');
    }

    // Find user with password (optimized: excludes suspended/inactive in query for fast-fail)
    const user = await User.findByEmailWithPasswordForAuth(input.email.toLowerCase());
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(input.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Update last login (optimized: only updates lastLogin field, doesn't fetch document)
    await User.updateLastLogin(user._id.toString());

    // Generate tokens
    const tokenPayload: TokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      storeId: input.storeId || user.storeId,
    };

    const tokens = JWTUtil.generateTokenPair(tokenPayload);

    // Save refresh token
    await this.saveRefreshToken(
      user._id.toString(),
      tokens.refreshToken,
      tokenPayload.storeId,
      input.deviceInfo
    );

    return {
      user: {
        id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
        emailVerified: user.emailVerified,
        storeId: tokenPayload.storeId,
      },
      tokens,
    };
  }

  /**
   * Refresh access token
   */
  static async refreshToken(input: RefreshTokenInput): Promise<{ accessToken: string; refreshToken: string }> {
    if (!input.refreshToken) {
      throw new ValidationError('Refresh token is required');
    }

    // Verify refresh token
    let payload: TokenPayload;
    try {
      payload = JWTUtil.verifyRefreshToken(input.refreshToken);
    } catch (error: any) {
      if (error.message.includes('expired')) {
        throw new TokenExpiredError('Refresh token has expired');
      }
      throw new InvalidTokenError('Invalid refresh token');
    }

    // Check if token exists in database and is not revoked (optimized: lean query)
    const storedToken = await RefreshToken.findActiveTokenLean(input.refreshToken);
    if (!storedToken || !storedToken._id) {
      throw new InvalidTokenError('Refresh token not found or revoked');
    }

    // Verify user still exists and is active (optimized: lean query with projection)
    const user = await User.findByIdLean(payload.userId, '_id email role status storeId');
    if (!user || !user._id) {
      throw new NotFoundError('User not found');
    }

    if (user.status === UserStatus.SUSPENDED || user.status === UserStatus.INACTIVE) {
      throw new ForbiddenError('Account is suspended or inactive');
    }

    // Token rotation: Revoke old token before issuing new one (optimized: no document return)
    await RefreshToken.revokeTokenById(storedToken._id.toString());

    // Generate new token pair with token rotation
    const newTokenPayload: TokenPayload = {
      userId: user._id.toString(),
      email: user.email || payload.email,
      role: user.role || payload.role,
      storeId: payload.storeId || user.storeId,
    };

    // Generate new token pair (token rotation ensures old refresh token is invalid)
    const tokens = JWTUtil.generateTokenPair(newTokenPayload);

    // Save new refresh token
    await this.saveRefreshToken(
      user._id.toString(),
      tokens.refreshToken,
      newTokenPayload.storeId,
      input.deviceInfo
    );

    return tokens;
  }

  /**
   * Logout user (revoke refresh token)
   */
  static async logout(refreshToken: string): Promise<void> {
    if (!refreshToken) {
      throw new ValidationError('Refresh token is required');
    }

    // Optimized: Use lean query and revoke without returning document
    const storedToken = await RefreshToken.findActiveTokenLean(refreshToken);
    if (storedToken && storedToken._id) {
      await RefreshToken.revokeTokenById(storedToken._id.toString());
    }
  }

  /**
   * Logout all devices (revoke all user tokens)
   */
  static async logoutAll(userId: string): Promise<void> {
    if (!userId) {
      throw new ValidationError('User ID is required');
    }

    await RefreshToken.revokeAllUserTokens(userId);
  }

  /**
   * Verify email
   */
  static async verifyEmail(token: string): Promise<void> {
    if (!token) {
      throw new ValidationError('Verification token is required');
    }

    const user = await User.findByEmailVerificationToken(token);
    if (!user) {
      throw new InvalidTokenError('Invalid or expired verification token');
    }

    // Verify email
    user.emailVerified = true;
    user.status = UserStatus.ACTIVE;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();
  }

  /**
   * Resend email verification
   */
  static async resendEmailVerification(email: string): Promise<{ message: string }> {
    if (!email) {
      throw new ValidationError('Email is required');
    }

    // Optimized: Only fetch necessary fields for verification check
    const user = await User.findOne({ email: email.toLowerCase() })
      .select('_id email emailVerified')
      .lean();
    
    if (!user || !user._id) {
      // Don't reveal if user exists for security
      return { message: 'If an account exists, a verification email will be sent' };
    }

    if (user.emailVerified) {
      throw new ConflictError('Email is already verified');
    }

    // Fetch full document only when needed for token generation
    const fullUser = await User.findById(user._id.toString());
    if (!fullUser) {
      return { message: 'If an account exists, a verification email will be sent' };
    }

    // Generate new verification token
    fullUser.generateEmailVerificationToken();
    await fullUser.save();

    // In production, send email here
    // await emailService.sendVerificationEmail(user.email, verificationToken);

    return { message: 'If an account exists, a verification email will be sent' };
  }

  /**
   * Forgot password - generate reset token
   */
  static async forgotPassword(email: string): Promise<{ message: string }> {
    if (!email) {
      throw new ValidationError('Email is required');
    }

    // Optimized: Fast check if user exists, then fetch only when needed
    const userExists = await User.checkEmailExists(email.toLowerCase());
    if (!userExists) {
      // Don't reveal if user exists for security
      return { message: 'If an account exists, a password reset email will be sent' };
    }

    // Fetch user only when we know it exists (optimized: only fetch necessary fields)
    const user = await User.findOne({ email: email.toLowerCase() })
      .select('_id email passwordResetToken passwordResetExpires')
      .lean(false); // Need full document for token generation

    if (!user) {
      return { message: 'If an account exists, a password reset email will be sent' };
    }

    // Generate password reset token
    const resetToken = user.generatePasswordResetToken();
    await user.save();

    // In production, send email here
    // await emailService.sendPasswordResetEmail(user.email, resetToken);

    return { message: 'If an account exists, a password reset email will be sent' };
  }

  /**
   * Reset password using token
   */
  static async resetPassword(token: string, newPassword: string): Promise<void> {
    if (!token || !newPassword) {
      throw new ValidationError('Token and new password are required');
    }

    if (newPassword.length < 8) {
      throw new ValidationError('Password must be at least 8 characters');
    }

    const user = await User.findByPasswordResetToken(token);
    if (!user) {
      throw new InvalidTokenError('Invalid or expired password reset token');
    }

    // Update password
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
  }

  /**
   * Change password (for authenticated users)
   */
  static async changePassword(input: ChangePasswordInput): Promise<void> {
    if (!input.userId || !input.currentPassword || !input.newPassword) {
      throw new ValidationError('User ID, current password, and new password are required');
    }

    if (input.newPassword.length < 8) {
      throw new ValidationError('New password must be at least 8 characters');
    }

    // Find user with password (optimized: only fetch necessary fields)
    const user = await User.findById(input.userId)
      .select('+password _id email')
      .lean(false); // Need full document for password comparison and update
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(input.currentPassword);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    // Update password
    user.password = input.newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // Revoke all refresh tokens for security
    await RefreshToken.revokeAllUserTokens(input.userId);
  }

  /**
   * Save refresh token to database
   */
  private static async saveRefreshToken(
    userId: string,
    token: string,
    storeId?: string,
    deviceInfo?: { userAgent?: string; ipAddress?: string }
  ): Promise<void> {
    // Calculate expiration date from token
    const decoded = JWTUtil.decodeToken(token) as any;
    const expiresAt = new Date(decoded.exp * 1000);

    const refreshToken = new RefreshToken({
      userId,
      token,
      expiresAt,
      storeId,
      deviceInfo,
      revoked: false,
    });

    await refreshToken.save();
  }
}

