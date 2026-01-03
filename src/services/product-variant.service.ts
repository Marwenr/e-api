import mongoose from "mongoose";
import { ProductVariant, Product } from "../models";
import { ValidationError, NotFoundError, ConflictError } from "./errors";

export interface CreateProductVariantInput {
  productId: string;
  sku: string;
  name?: string;
  basePrice: number;
  discountPrice?: number;
  stock: number;
  attributes: Array<{ name: string; value: string }>;
  images?: string[];
  isDefault?: boolean;
}

export interface UpdateProductVariantInput {
  sku?: string;
  name?: string;
  basePrice?: number;
  discountPrice?: number;
  stock?: number;
  attributes?: Array<{ name: string; value: string }>;
  images?: string[];
  isDefault?: boolean;
}

export class ProductVariantService {
  /**
   * Validate product exists
   */
  private static async validateProduct(productId: string): Promise<void> {
    const product = await Product.findById(productId).lean();
    if (!product) {
      throw new ValidationError("Product not found");
    }
  }

  /**
   * Validate SKU uniqueness
   */
  private static async validateSkuUnique(
    sku: string,
    excludeVariantId?: string
  ): Promise<void> {
    const query: any = { sku: sku.toUpperCase() };
    if (excludeVariantId) {
      query._id = { $ne: new mongoose.Types.ObjectId(excludeVariantId) };
    }
    const existingVariant = await ProductVariant.findOne(query).lean();
    if (existingVariant) {
      throw new ConflictError("Variant with this SKU already exists");
    }
  }

  /**
   * Create a new product variant
   */
  static async createVariant(
    input: CreateProductVariantInput
  ): Promise<any> {
    // Validate required fields
    if (
      !input.productId ||
      !input.sku ||
      input.basePrice === undefined ||
      input.stock === undefined ||
      !input.attributes ||
      input.attributes.length === 0
    ) {
      throw new ValidationError(
        "Product ID, SKU, base price, stock, and attributes are required"
      );
    }

    if (input.basePrice < 0) {
      throw new ValidationError("Base price cannot be negative");
    }

    if (input.stock < 0) {
      throw new ValidationError("Stock cannot be negative");
    }

    if (
      input.discountPrice !== undefined &&
      input.discountPrice >= input.basePrice
    ) {
      throw new ValidationError(
        "Discount price must be less than base price"
      );
    }

    // Validate product exists
    await this.validateProduct(input.productId);

    // Validate SKU uniqueness
    await this.validateSkuUnique(input.sku);

    // Create variant
    const variant = new ProductVariant({
      productId: new mongoose.Types.ObjectId(input.productId),
      sku: input.sku.toUpperCase(),
      name: input.name?.trim(),
      basePrice: input.basePrice,
      discountPrice: input.discountPrice,
      stock: input.stock,
      attributes: input.attributes,
      images: input.images || [],
      isDefault: input.isDefault || false,
    });

    await variant.save();
    return variant.toJSON();
  }

  /**
   * Update a product variant
   */
  static async updateVariant(
    variantId: string,
    input: UpdateProductVariantInput
  ): Promise<any> {
    const variant = await ProductVariant.findById(variantId);
    if (!variant) {
      throw new NotFoundError("Variant not found");
    }

    // Validate base price if provided
    if (input.basePrice !== undefined && input.basePrice < 0) {
      throw new ValidationError("Base price cannot be negative");
    }

    // Validate stock if provided
    if (input.stock !== undefined && input.stock < 0) {
      throw new ValidationError("Stock cannot be negative");
    }

    // Validate discount price if provided
    if (input.discountPrice !== undefined) {
      if (input.discountPrice < 0) {
        throw new ValidationError("Discount price cannot be negative");
      }
      const basePrice =
        input.basePrice !== undefined ? input.basePrice : variant.basePrice;
      if (input.discountPrice >= basePrice) {
        throw new ValidationError(
          "Discount price must be less than base price"
        );
      }
    }

    // Validate SKU uniqueness if provided
    if (input.sku && input.sku.toUpperCase() !== variant.sku) {
      await this.validateSkuUnique(input.sku, variantId);
      variant.sku = input.sku.toUpperCase();
    }

    // Update other fields
    if (input.name !== undefined) variant.name = input.name?.trim();
    if (input.basePrice !== undefined) variant.basePrice = input.basePrice;
    if (input.discountPrice !== undefined)
      variant.discountPrice = input.discountPrice ?? null;
    if (input.stock !== undefined) variant.stock = input.stock;
    if (input.attributes !== undefined) variant.attributes = input.attributes;
    if (input.images !== undefined) variant.images = input.images;
    if (input.isDefault !== undefined) variant.isDefault = input.isDefault;

    await variant.save();
    return variant.toJSON();
  }

  /**
   * Get variant by ID
   */
  static async getVariantById(variantId: string): Promise<any> {
    const variant = await ProductVariant.findById(variantId)
      .populate("productId", "name sku")
      .lean();

    if (!variant) {
      throw new NotFoundError("Variant not found");
    }

    return {
      id: variant._id.toString(),
      productId: (variant as any).productId._id.toString(),
      product: {
        id: (variant as any).productId._id.toString(),
        name: (variant as any).productId.name,
        sku: (variant as any).productId.sku,
      },
      sku: variant.sku,
      name: variant.name,
      basePrice: variant.basePrice,
      discountPrice: variant.discountPrice,
      stock: variant.stock,
      attributes: variant.attributes,
      images: variant.images || [],
      isDefault: variant.isDefault,
      createdAt: variant.createdAt,
      updatedAt: variant.updatedAt,
    };
  }

  /**
   * Get all variants for a product
   */
  static async getVariantsByProductId(productId: string): Promise<any[]> {
    await this.validateProduct(productId);

    const variants = await ProductVariant.find({
      productId: new mongoose.Types.ObjectId(productId),
    })
      .sort({ isDefault: -1, createdAt: 1 })
      .lean();

    return variants.map((v) => ({
      id: v._id.toString(),
      productId: v.productId.toString(),
      sku: v.sku,
      name: v.name,
      basePrice: v.basePrice,
      discountPrice: v.discountPrice,
      stock: v.stock,
      attributes: v.attributes,
      images: v.images || [],
      isDefault: v.isDefault,
      createdAt: v.createdAt,
      updatedAt: v.updatedAt,
    }));
  }

  /**
   * Delete a product variant
   */
  static async deleteVariant(variantId: string): Promise<void> {
    const variant = await ProductVariant.findById(variantId);
    if (!variant) {
      throw new NotFoundError("Variant not found");
    }

    await ProductVariant.findByIdAndDelete(variantId);
  }
}

