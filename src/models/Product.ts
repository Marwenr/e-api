import mongoose, { Schema, Model, Document } from "mongoose";
import { ProductStatus } from "./types";

export interface IProductImage {
  url: string;
  alt?: string;
  isPrimary?: boolean;
}

export interface IProductAttribute {
  name: string;
  value: string;
}

export interface IProduct extends Document {
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  categoryId: mongoose.Types.ObjectId;
  sku: string;
  basePrice: number;
  discountPrice?: number;
  status: ProductStatus;
  soldCount: number;
  publishedAt?: Date;
  images: IProductImage[];
  attributes: IProductAttribute[];
  // SEO fields
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface IProductModel extends Model<IProduct> {}

const productImageSchema = new Schema<IProductImage>(
  {
    url: {
      type: String,
      required: [true, "Image URL is required"],
      trim: true,
    },
    alt: {
      type: String,
      trim: true,
      maxlength: [200, "Alt text cannot exceed 200 characters"],
    },
    isPrimary: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const productAttributeSchema = new Schema<IProductAttribute>(
  {
    name: {
      type: String,
      required: [true, "Attribute name is required"],
      trim: true,
      maxlength: [100, "Attribute name cannot exceed 100 characters"],
    },
    value: {
      type: String,
      required: [true, "Attribute value is required"],
      trim: true,
      maxlength: [200, "Attribute value cannot exceed 200 characters"],
    },
  },
  { _id: false }
);

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [200, "Product name cannot exceed 200 characters"],
      index: "text", // Text index for search
    },
    slug: {
      type: String,
      required: [true, "Product slug is required"],
      unique: true, // unique: true already creates an index
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    shortDescription: {
      type: String,
      trim: true,
      maxlength: [500, "Short description cannot exceed 500 characters"],
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
      index: true,
    },
    sku: {
      type: String,
      required: [true, "SKU is required"],
      unique: true, // unique: true already creates an index
      uppercase: true,
      trim: true,
    },
    basePrice: {
      type: Number,
      required: [true, "Base price is required"],
      min: [0, "Base price cannot be negative"],
      index: true,
    },
    discountPrice: {
      type: Number,
      min: [0, "Discount price cannot be negative"],
      default: null,
      validate: {
        validator: function (this: IProduct, value: number | null | undefined) {
          if (value === null || value === undefined) return true;
          return value < this.basePrice;
        },
        message: "Discount price must be less than base price",
      },
    },
    status: {
      type: String,
      enum: Object.values(ProductStatus),
      default: ProductStatus.DRAFT,
      index: true,
    },
    soldCount: {
      type: Number,
      default: 0,
      min: [0, "Sold count cannot be negative"],
      index: true,
    },
    publishedAt: {
      type: Date,
      default: null,
      index: true,
    },
    images: {
      type: [productImageSchema],
      default: [],
      validate: {
        validator: function (images: IProductImage[]) {
          // At least one primary image if images exist
          if (images.length > 0) {
            return images.some((img) => img.isPrimary === true);
          }
          return true;
        },
        message: "At least one image must be marked as primary",
      },
    },
    attributes: {
      type: [productAttributeSchema],
      default: [],
    },
    seoTitle: {
      type: String,
      trim: true,
      maxlength: [70, "SEO title cannot exceed 70 characters"],
    },
    seoDescription: {
      type: String,
      trim: true,
      maxlength: [160, "SEO description cannot exceed 160 characters"],
    },
    seoKeywords: {
      type: [String],
      default: [],
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

// Text index for full-text search (name and description)
productSchema.index({ name: "text", description: "text", shortDescription: "text" });

// Index for best sellers (soldCount descending)
productSchema.index({ soldCount: -1, status: 1 });

// Index for new arrivals (publishedAt descending, then createdAt)
productSchema.index({ publishedAt: -1, status: 1 });
productSchema.index({ createdAt: -1, status: 1 }); // Fallback for draft products

// Index for category listing (categoryId + status + publishedAt)
productSchema.index({ categoryId: 1, status: 1, publishedAt: -1 });

// Index for filtering (status + basePrice range queries)
productSchema.index({ status: 1, basePrice: 1 });

// Compound index for active products by category (most common query)
productSchema.index({ categoryId: 1, status: 1, soldCount: -1 });

// Index for SKU lookup (already has unique index, but adding compound for status)
productSchema.index({ sku: 1, status: 1 });

// Index for slug lookup (already has index, but adding compound for status)
productSchema.index({ slug: 1, status: 1 });

// Pre-save middleware to set publishedAt when status changes to active
productSchema.pre("save", function (next) {
  if (this.isModified("status") && this.status === ProductStatus.ACTIVE && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  // Clear publishedAt if status is not active
  if (this.isModified("status") && this.status !== ProductStatus.ACTIVE && this.publishedAt) {
    this.publishedAt = undefined;
  }
  next();
});

export const Product = mongoose.model<IProduct, IProductModel>("Product", productSchema);

