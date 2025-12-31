import mongoose, { Schema, Model, Document } from "mongoose";

export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  parentId?: mongoose.Types.ObjectId;
  image?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface ICategoryModel extends Model<ICategory> {}

const categorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      maxlength: [100, "Category name cannot exceed 100 characters"],
      index: true,
    },
    slug: {
      type: String,
      required: [true, "Category slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      default: null,
      index: true,
    },
    image: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
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

// Indexes for category queries
categorySchema.index({ slug: 1, isActive: 1 });
categorySchema.index({ parentId: 1, isActive: 1 }); // For hierarchical category listing

export const Category = mongoose.model<ICategory, ICategoryModel>(
  "Category",
  categorySchema
);

