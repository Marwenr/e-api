import mongoose, { Schema, Model } from 'mongoose';
import crypto from 'crypto';
import { IRefreshToken } from './types';

// Interface for RefreshToken model static methods
interface IRefreshTokenModel extends Model<IRefreshToken> {
  generateToken(): string;
  findActiveToken(token: string): Promise<IRefreshToken | null>;
  revokeAllUserTokens(userId: string): Promise<any>;
  revokeToken(tokenId: string): Promise<IRefreshToken | null>;
  cleanupExpiredTokens(): Promise<any>;
  // Optimized methods
  findActiveTokenLean(token: string): Promise<Partial<IRefreshToken> | null>;
  revokeTokenById(tokenId: string): Promise<void>;
}

const refreshTokenSchema = new Schema<IRefreshToken>(
  {
    userId: {
      type: String,
      required: [true, 'User ID is required'],
      ref: 'User',
      index: true,
    },
    token: {
      type: String,
      required: [true, 'Token is required'],
      unique: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: [true, 'Expiration date is required'],
      index: { expireAfterSeconds: 0 }, // TTL index for automatic cleanup
    },
    deviceInfo: {
      userAgent: {
        type: String,
        maxlength: [500, 'User agent cannot exceed 500 characters'],
      },
      ipAddress: {
        type: String,
        maxlength: [45, 'IP address cannot exceed 45 characters'], // IPv6 max length
      },
    },
    storeId: {
      type: String,
      index: true,
      sparse: true,
    },
    revoked: {
      type: Boolean,
      default: false,
      index: true,
    },
    revokedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret: any) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound indexes for optimized queries
refreshTokenSchema.index({ userId: 1, revoked: 1 });
refreshTokenSchema.index({ userId: 1, storeId: 1, revoked: 1 });
refreshTokenSchema.index({ token: 1, revoked: 1 });
refreshTokenSchema.index({ expiresAt: 1, revoked: 1 });
refreshTokenSchema.index({ createdAt: -1 });

// Static method to generate refresh token
refreshTokenSchema.statics.generateToken = function (): string {
  return crypto.randomBytes(64).toString('hex');
};

// Static method to find active token
// Optimized: Only fetches necessary fields, uses compound index
refreshTokenSchema.statics.findActiveToken = function (token: string) {
  const now = new Date();
  return this.findOne({
    token,
    revoked: false,
    expiresAt: { $gt: now },
  })
    .select('_id userId token expiresAt revoked storeId')
    .lean(); // Use lean for read-only operation
};

// Static method to revoke all tokens for a user
refreshTokenSchema.statics.revokeAllUserTokens = function (userId: string) {
  return this.updateMany(
    { userId, revoked: false },
    {
      $set: {
        revoked: true,
        revokedAt: new Date(),
      },
    }
  );
};

// Static method to revoke token by ID
refreshTokenSchema.statics.revokeToken = function (tokenId: string) {
  return this.findByIdAndUpdate(
    tokenId,
    {
      $set: {
        revoked: true,
        revokedAt: new Date(),
      },
    },
    { new: true }
  );
};

// Optimized: Revoke token without returning document
refreshTokenSchema.statics.revokeTokenById = function (tokenId: string) {
  return this.findByIdAndUpdate(
    tokenId,
    {
      $set: {
        revoked: true,
        revokedAt: new Date(),
      },
    },
    { new: false } // Don't return document
  ).lean();
};

// Optimized: Find active token with lean (read-only)
refreshTokenSchema.statics.findActiveTokenLean = function (token: string) {
  const now = new Date();
  return this.findOne({
    token,
    revoked: false,
    expiresAt: { $gt: now },
  })
    .select('_id userId expiresAt')
    .lean();
};

// Static method to cleanup expired tokens (optional, TTL index handles this automatically)
refreshTokenSchema.statics.cleanupExpiredTokens = function () {
  return this.deleteMany({
    expiresAt: { $lt: new Date() },
  });
};

export const RefreshToken = mongoose.model<IRefreshToken, IRefreshTokenModel>(
  'RefreshToken',
  refreshTokenSchema
);

