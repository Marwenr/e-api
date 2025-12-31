import mongoose, { Schema, Model, Document } from "mongoose";

export interface IProductVariantAttribute {
  name: string;
  value: string;
}

export interface IProductVariant extends Document {
  productId: mongoose.Types.ObjectId;
  sku: string;
  name?: string; // Variant name (e.g., "Red - Large", "Blue - Small")
  basePrice: number;
  discountPrice?: number;
  stock: number;
  attributes: IProductVariantAttribute[];
  images?: string[]; // Optional variant-specific images
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface IProductVariantModel extends Model<IProductVariant> {}

const productVariantAttributeSchema = new Schema<IProductVariantAttribute>(
  {
    name: {
      type: String,
      required: [true, "Variant attribute name is required"],
      trim: true,
      maxlength: [100, "Attribute name cannot exceed 100 characters"],
    },
    value: {
      type: String,
      required: [true, "Variant attribute value is required"],
      trim: true,
      maxlength: [200, "Attribute value cannot exceed 200 characters"],
    },
  },
  { _id: false }
);

const productVariantSchema = new Schema<IProductVariant>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product ID is required"],
      index: true,
    },
    sku: {
      type: String,
      required: [true, "Variant SKU is required"],
      unique: true, // unique: true already creates an index
      uppercase: true,
      trim: true,
    },
    name: {
      type: String,
      trim: true,
      maxlength: [200, "Variant name cannot exceed 200 characters"],
    },
    basePrice: {
      type: Number,
      required: [true, "Base price is required"],
      min: [0, "Base price cannot be negative"],
    },
    discountPrice: {
      type: Number,
      min: [0, "Discount price cannot be negative"],
      default: null,
      validate: {
        validator: function (
          this: IProductVariant,
          value: number | null | undefined
        ) {
          if (value === null || value === undefined) return true;
          return value < this.basePrice;
        },
        message: "Discount price must be less than base price",
      },
    },
    stock: {
      type: Number,
      required: [true, "Stock is required"],
      min: [0, "Stock cannot be negative"],
      index: true,
      default: 0,
    },
    attributes: {
      type: [productVariantAttributeSchema],
      required: [true, "At least one attribute is required"],
      validate: {
        validator: function (attributes: IProductVariantAttribute[]) {
          return attributes.length > 0;
        },
        message: "At least one variant attribute is required",
      },
    },
    images: {
      type: [String],
      default: [],
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

// Index for product variants lookup
productVariantSchema.index({ productId: 1, isDefault: 1 });
productVariantSchema.index({ productId: 1, stock: 1 }); // For stock availability queries

// Index for SKU lookup (already has unique index)
productVariantSchema.index({ sku: 1 });

// Ensure only one default variant per product
productVariantSchema.pre("save", async function (next) {
  if (this.isDefault && (this.isNew || this.isModified("isDefault"))) {
    await mongoose
      .model<IProductVariant>("ProductVariant")
      .updateMany(
        { productId: this.productId, _id: { $ne: this._id } },
        { $set: { isDefault: false } }
      );
  }
  next();
});

export const ProductVariant = mongoose.model<
  IProductVariant,
  IProductVariantModel
>("ProductVariant", productVariantSchema);
