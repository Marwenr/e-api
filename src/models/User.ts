import mongoose, { Schema, Model } from 'mongoose';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { IUser, UserRole, UserStatus } from './types';

// Interface for User model static methods
interface IUserModel extends Model<IUser> {
  findByEmailWithPassword(email: string): Promise<IUser | null>;
  findByEmailWithPasswordForAuth(email: string): Promise<IUser | null>;
  findByEmailVerificationToken(token: string): Promise<IUser | null>;
  findByPasswordResetToken(token: string): Promise<IUser | null>;
  // Optimized query methods
  findByIdLean(userId: string, fields?: string): Promise<Partial<IUser> | null>;
  updateLastLogin(userId: string): Promise<void>;
  checkEmailExists(email: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Don't return password by default
    },
    firstName: {
      type: String,
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters'],
    },
    lastName: {
      type: String,
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters'],
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.CUSTOMER,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(UserStatus),
      default: UserStatus.PENDING_VERIFICATION,
      index: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
      index: true,
    },
    emailVerificationToken: {
      type: String,
      select: false,
    },
    emailVerificationExpires: {
      type: Date,
      select: false,
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
    lastLogin: {
      type: Date,
    },
    storeId: {
      type: String,
      index: true,
      sparse: true, // Index only documents that have this field
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret: any) {
        delete ret.password;
        delete ret.emailVerificationToken;
        delete ret.emailVerificationExpires;
        delete ret.passwordResetToken;
        delete ret.passwordResetExpires;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound indexes for optimized queries
userSchema.index({ email: 1, storeId: 1 }, { unique: true, sparse: true });
userSchema.index({ status: 1, role: 1 });
userSchema.index({ storeId: 1, status: 1 });
userSchema.index({ createdAt: -1 });

// Indexes for authentication queries
userSchema.index({ email: 1, status: 1 }); // For login with status check
userSchema.index({ emailVerificationToken: 1, emailVerificationExpires: 1 }); // For email verification
userSchema.index({ passwordResetToken: 1, passwordResetExpires: 1 }); // For password reset
userSchema.index({ email: 1, emailVerified: 1 }); // For resend verification check

// Hash password before saving
userSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  if (!this.password) {
    return false;
  }
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to generate email verification token
userSchema.methods.generateEmailVerificationToken = function (): string {
  const token = crypto.randomBytes(32).toString('hex');
  
  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  
  // Token expires in 24 hours
  this.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  
  return token;
};

// Method to generate password reset token
userSchema.methods.generatePasswordResetToken = function (): string {
  const token = crypto.randomBytes(32).toString('hex');
  
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  
  // Token expires in 1 hour
  this.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
  
  return token;
};

// Static method to find user by email (including password for auth)
// Optimized: Only fetches necessary fields, includes status for fast-fail
userSchema.statics.findByEmailWithPassword = function (email: string) {
  return this.findOne({ email })
    .select('+password +emailVerificationToken +passwordResetToken')
    .lean({ virtuals: false }); // Use lean for better performance, but need to handle password comparison differently
};

// Alternative: Non-lean version for password comparison (needed for bcrypt)
userSchema.statics.findByEmailWithPasswordForAuth = function (email: string) {
  return this.findOne({ 
    email,
    status: { $nin: [UserStatus.SUSPENDED, UserStatus.INACTIVE] } // Fast-fail: exclude suspended/inactive
  })
    .select('_id email password role status emailVerified storeId firstName lastName lastLogin')
    .lean(false); // Need full document for password comparison
};

// Static method to find user by email verification token
// Optimized: Only fetches necessary fields, checks expiration in query
userSchema.statics.findByEmailVerificationToken = function (token: string) {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const now = new Date();
  
  return this.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: now },
  })
    .select('_id email emailVerified status emailVerificationToken emailVerificationExpires')
    .lean(); // Use lean for read-only operation
};

// Static method to find user by password reset token
// Optimized: Only fetches necessary fields, checks expiration in query
userSchema.statics.findByPasswordResetToken = function (token: string) {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const now = new Date();
  
  return this.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: now },
  })
    .select('+password _id email passwordResetToken passwordResetExpires')
    .lean(false); // Need full document for password update
};

// Additional optimized static methods
userSchema.statics.findByIdLean = function (userId: string, fields?: string) {
  const query = this.findById(userId);
  if (fields) {
    return query.select(fields).lean();
  }
  return query.select('_id email role status emailVerified storeId firstName lastName').lean();
};

// Optimized: Update only lastLogin field
userSchema.statics.updateLastLogin = function (userId: string) {
  return this.findByIdAndUpdate(
    userId,
    { $set: { lastLogin: new Date() } },
    { new: false } // Don't return updated document
  ).lean();
};

// Fast check if email exists (for registration)
userSchema.statics.checkEmailExists = function (email: string) {
  return this.exists({ email: email.toLowerCase() }).lean();
};

export const User = mongoose.model<IUser, IUserModel>('User', userSchema);

