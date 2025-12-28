import { Document } from 'mongoose';

export enum UserRole {
  CUSTOMER = 'customer',
  ADMIN = 'admin',
  STORE_OWNER = 'store_owner',
  STORE_MANAGER = 'store_manager',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING_VERIFICATION = 'pending_verification',
}

export interface IUser extends Document {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  lastLogin?: Date;
  storeId?: string; // For multi-store support
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateEmailVerificationToken(): string;
  generatePasswordResetToken(): string;
}

export interface IRefreshToken extends Document {
  userId: string;
  token: string;
  expiresAt: Date;
  deviceInfo?: {
    userAgent?: string;
    ipAddress?: string;
  };
  storeId?: string; // For multi-store support
  revoked: boolean;
  revokedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

