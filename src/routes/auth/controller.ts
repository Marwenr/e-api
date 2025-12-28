import { FastifyReply } from 'fastify';
import { AuthenticatedRequest } from '../../middleware/auth';
import { AuthService } from '../../services';
import { sendSuccess, sendError } from '../../utils/response';
import { AuthError } from '../../services/errors';

/**
 * Register a new user
 */
export const register = async (
  request: AuthenticatedRequest,
  reply: FastifyReply
): Promise<void> => {
  try {
    const { email, password, firstName, lastName, storeId } = request.body as {
      email: string;
      password: string;
      firstName?: string;
      lastName?: string;
      storeId?: string;
    };

    const result = await AuthService.register({
      email,
      password,
      firstName,
      lastName,
      storeId,
    });

    sendSuccess(reply, result, 201);
  } catch (error: any) {
    if (error instanceof AuthError) {
      sendError(reply, error.message, error.code, error.statusCode);
    } else {
      sendError(reply, 'Registration failed', 'REGISTRATION_ERROR', 500);
    }
  }
};

/**
 * Login user
 */
export const login = async (
  request: AuthenticatedRequest,
  reply: FastifyReply
): Promise<void> => {
  try {
    const { email, password, storeId } = request.body as {
      email: string;
      password: string;
      storeId?: string;
    };

    const deviceInfo = {
      userAgent: request.headers['user-agent'],
      ipAddress: request.ip || request.socket.remoteAddress,
    };

    const result = await AuthService.login({
      email,
      password,
      storeId,
      deviceInfo,
    });

    sendSuccess(reply, result, 200);
  } catch (error: any) {
    if (error instanceof AuthError) {
      sendError(reply, error.message, error.code, error.statusCode);
    } else {
      sendError(reply, 'Login failed', 'LOGIN_ERROR', 500);
    }
  }
};

/**
 * Refresh access token
 */
export const refresh = async (
  request: AuthenticatedRequest,
  reply: FastifyReply
): Promise<void> => {
  try {
    const { refreshToken } = request.body as { refreshToken: string };

    const deviceInfo = {
      userAgent: request.headers['user-agent'],
      ipAddress: request.ip || request.socket.remoteAddress,
    };

    const tokens = await AuthService.refreshToken({
      refreshToken,
      deviceInfo,
    });

    sendSuccess(reply, tokens, 200);
  } catch (error: any) {
    if (error instanceof AuthError) {
      sendError(reply, error.message, error.code, error.statusCode);
    } else {
      sendError(reply, 'Token refresh failed', 'REFRESH_ERROR', 500);
    }
  }
};

/**
 * Logout user (revoke refresh token)
 */
export const logout = async (
  request: AuthenticatedRequest,
  reply: FastifyReply
): Promise<void> => {
  try {
    const { refreshToken } = request.body as { refreshToken: string };

    await AuthService.logout(refreshToken);

    sendSuccess(reply, { message: 'Logged out successfully' }, 200);
  } catch (error: any) {
    if (error instanceof AuthError) {
      sendError(reply, error.message, error.code, error.statusCode);
    } else {
      sendError(reply, 'Logout failed', 'LOGOUT_ERROR', 500);
    }
  }
};

/**
 * Logout from all devices
 */
export const logoutAll = async (
  request: AuthenticatedRequest,
  reply: FastifyReply
): Promise<void> => {
  try {
    if (!request.user) {
      sendError(reply, 'Unauthorized', 'UNAUTHORIZED', 401);
      return;
    }

    await AuthService.logoutAll(request.user.userId);

    sendSuccess(reply, { message: 'Logged out from all devices successfully' }, 200);
  } catch (error: any) {
    if (error instanceof AuthError) {
      sendError(reply, error.message, error.code, error.statusCode);
    } else {
      sendError(reply, 'Logout failed', 'LOGOUT_ERROR', 500);
    }
  }
};

/**
 * Verify email with token
 */
export const verifyEmail = async (
  request: AuthenticatedRequest,
  reply: FastifyReply
): Promise<void> => {
  try {
    const { token } = request.body as { token: string };

    await AuthService.verifyEmail(token);

    sendSuccess(reply, { message: 'Email verified successfully' }, 200);
  } catch (error: any) {
    if (error instanceof AuthError) {
      sendError(reply, error.message, error.code, error.statusCode);
    } else {
      sendError(reply, 'Email verification failed', 'VERIFICATION_ERROR', 500);
    }
  }
};

/**
 * Resend email verification
 */
export const resendVerification = async (
  request: AuthenticatedRequest,
  reply: FastifyReply
): Promise<void> => {
  try {
    const { email } = request.body as { email: string };

    const result = await AuthService.resendEmailVerification(email);

    sendSuccess(reply, result, 200);
  } catch (error: any) {
    if (error instanceof AuthError) {
      sendError(reply, error.message, error.code, error.statusCode);
    } else {
      sendError(reply, 'Failed to resend verification email', 'RESEND_ERROR', 500);
    }
  }
};

/**
 * Forgot password - request password reset
 */
export const forgotPassword = async (
  request: AuthenticatedRequest,
  reply: FastifyReply
): Promise<void> => {
  try {
    const { email } = request.body as { email: string };

    const result = await AuthService.forgotPassword(email);

    sendSuccess(reply, result, 200);
  } catch (error: any) {
    if (error instanceof AuthError) {
      sendError(reply, error.message, error.code, error.statusCode);
    } else {
      sendError(reply, 'Failed to process password reset request', 'FORGOT_PASSWORD_ERROR', 500);
    }
  }
};

/**
 * Reset password with token
 */
export const resetPassword = async (
  request: AuthenticatedRequest,
  reply: FastifyReply
): Promise<void> => {
  try {
    const { token, newPassword } = request.body as {
      token: string;
      newPassword: string;
    };

    await AuthService.resetPassword(token, newPassword);

    sendSuccess(reply, { message: 'Password reset successfully' }, 200);
  } catch (error: any) {
    if (error instanceof AuthError) {
      sendError(reply, error.message, error.code, error.statusCode);
    } else {
      sendError(reply, 'Password reset failed', 'RESET_PASSWORD_ERROR', 500);
    }
  }
};

/**
 * Change password (authenticated users)
 */
export const changePassword = async (
  request: AuthenticatedRequest,
  reply: FastifyReply
): Promise<void> => {
  try {
    if (!request.user) {
      sendError(reply, 'Unauthorized', 'UNAUTHORIZED', 401);
      return;
    }

    const { currentPassword, newPassword } = request.body as {
      currentPassword: string;
      newPassword: string;
    };

    await AuthService.changePassword({
      userId: request.user.userId,
      currentPassword,
      newPassword,
    });

    sendSuccess(reply, { message: 'Password changed successfully' }, 200);
  } catch (error: any) {
    if (error instanceof AuthError) {
      sendError(reply, error.message, error.code, error.statusCode);
    } else {
      sendError(reply, 'Password change failed', 'CHANGE_PASSWORD_ERROR', 500);
    }
  }
};

