import mongoose, { Schema, Model, Document } from "mongoose";

export interface IAddress extends Document {
  userId: string;
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface IAddressModel extends Model<IAddress> {}

const addressSchema = new Schema<IAddress>(
  {
    userId: {
      type: String,
      required: [true, "User ID is required"],
      index: true,
    },
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      maxlength: [100, "Full name cannot exceed 100 characters"],
    },
    addressLine1: {
      type: String,
      required: [true, "Address line 1 is required"],
      trim: true,
      maxlength: [200, "Address line 1 cannot exceed 200 characters"],
    },
    addressLine2: {
      type: String,
      trim: true,
      maxlength: [200, "Address line 2 cannot exceed 200 characters"],
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
      maxlength: [100, "City cannot exceed 100 characters"],
    },
    state: {
      type: String,
      required: [true, "State/Province is required"],
      trim: true,
      maxlength: [100, "State/Province cannot exceed 100 characters"],
    },
    postalCode: {
      type: String,
      required: [true, "Postal code is required"],
      trim: true,
      maxlength: [20, "Postal code cannot exceed 20 characters"],
    },
    country: {
      type: String,
      required: [true, "Country is required"],
      trim: true,
      maxlength: [100, "Country cannot exceed 100 characters"],
    },
    isDefault: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret: any) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound index for user addresses
addressSchema.index({ userId: 1, isDefault: 1 });

// Ensure only one default address per user
addressSchema.pre("save", async function (next) {
  if (this.isDefault && (this.isNew || this.isModified("isDefault"))) {
    // Set all other addresses for this user to not default
    await mongoose
      .model<IAddress>("Address")
      .updateMany(
        { userId: this.userId, _id: { $ne: this._id } },
        { $set: { isDefault: false } }
      );
  }
  next();
});

export const Address = mongoose.model<IAddress, IAddressModel>(
  "Address",
  addressSchema
);
