import mongoose from 'mongoose';
import { ProductVariant, Product } from '../models';
import { NotFoundError, ValidationError } from './errors';

export interface UpdateStockInput {
  variantId: string;
  stock: number;
  reservedStock?: number;
}

export interface BulkUpdateStockInput {
  updates: Array<{
    variantId: string;
    stock: number;
    reservedStock?: number;
  }>;
}

export interface InventoryItem {
  id: string;
  productId: string;
  productName: string;
  variantId: string;
  variantSku: string;
  variantName?: string;
  stock: number;
  reservedStock: number;
  availableStock: number;
  lowStockAlert: boolean;
}

export interface InventoryQueryOptions {
  page?: number;
  limit?: number;
  productId?: string;
  lowStockOnly?: boolean;
  search?: string;
}

export interface PaginatedInventoryResult {
  data: InventoryItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class InventoryService {
  private static readonly LOW_STOCK_THRESHOLD = 10;

  /**
   * Get inventory list with pagination and filters
   */
  static async getInventory(
    options: InventoryQueryOptions = {}
  ): Promise<PaginatedInventoryResult> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 20));
    const skip = (page - 1) * limit;

    const query: any = {};

    if (options.productId) {
      query.productId = new mongoose.Types.ObjectId(options.productId);
    }

    if (options.lowStockOnly) {
      query.stock = { $lte: this.LOW_STOCK_THRESHOLD };
    }

    // Search by product name or SKU
    if (options.search) {
      // First find products matching search
      const products = await Product.find({
        $or: [
          { name: { $regex: options.search, $options: 'i' } },
          { sku: { $regex: options.search, $options: 'i' } },
        ],
      }).select('_id').lean();

      const productIds = products.map((p) => p._id);
      if (productIds.length > 0) {
        query.$or = [
          { productId: { $in: productIds } },
          { sku: { $regex: options.search, $options: 'i' } },
        ];
      } else {
        query.sku = { $regex: options.search, $options: 'i' };
      }
    }

    // Get variants with product info
    const [variants, total] = await Promise.all([
      ProductVariant.find(query)
        .populate('productId', 'name sku')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ProductVariant.countDocuments(query),
    ]);

    const data: InventoryItem[] = variants
      .filter((variant: any) => variant.productId) // Filter out variants with null productId
      .map((variant: any) => {
        const product = variant.productId;
        const stock = variant.stock || 0;
        const reservedStock = 0; // TODO: Implement reserved stock tracking
        const availableStock = stock - reservedStock;

        return {
          id: variant._id.toString(),
          productId: product._id.toString(),
          productName: product.name,
          variantId: variant._id.toString(),
          variantSku: variant.sku,
          variantName: variant.name,
          stock,
          reservedStock,
          availableStock,
          lowStockAlert: stock <= this.LOW_STOCK_THRESHOLD,
        };
      });

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get inventory by variant ID
   */
  static async getInventoryByVariantId(variantId: string): Promise<InventoryItem> {
    const variant = await ProductVariant.findById(variantId)
      .populate('productId', 'name sku')
      .lean();

    if (!variant) {
      throw new NotFoundError('Variant not found');
    }

    const product = (variant as any).productId;
    if (!product) {
      throw new NotFoundError('Product not found for this variant');
    }

    const stock = (variant as any).stock || 0;
    const reservedStock = 0; // TODO: Implement reserved stock tracking
    const availableStock = stock - reservedStock;

    return {
      id: variant._id.toString(),
      productId: product._id.toString(),
      productName: product.name,
      variantId: variant._id.toString(),
      variantSku: variant.sku,
      variantName: variant.name,
      stock,
      reservedStock,
      availableStock,
      lowStockAlert: stock <= this.LOW_STOCK_THRESHOLD,
    };
  }

  /**
   * Update stock for a variant
   */
  static async updateStock(input: UpdateStockInput): Promise<InventoryItem> {
    if (input.stock < 0) {
      throw new ValidationError('Stock cannot be negative');
    }

    const variant = await ProductVariant.findById(input.variantId);
    if (!variant) {
      throw new NotFoundError('Variant not found');
    }

    variant.stock = input.stock;
    // TODO: Update reservedStock when implemented
    await variant.save();

    return this.getInventoryByVariantId(input.variantId);
  }

  /**
   * Bulk update stock for multiple variants
   */
  static async bulkUpdateStock(input: BulkUpdateStockInput): Promise<{
    success: number;
    failed: number;
    errors?: string[];
  }> {
    if (!input.updates || input.updates.length === 0) {
      throw new ValidationError('At least one update is required');
    }

    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const update of input.updates) {
      try {
        if (update.stock < 0) {
          throw new ValidationError('Stock cannot be negative');
        }

        const variant = await ProductVariant.findById(update.variantId);
        if (!variant) {
          throw new NotFoundError(`Variant ${update.variantId} not found`);
        }

        variant.stock = update.stock;
        await variant.save();
        success++;
      } catch (error: any) {
        failed++;
        errors.push(`Variant ${update.variantId}: ${error.message}`);
      }
    }

    return {
      success,
      failed,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  /**
   * Get low stock alerts
   */
  static async getLowStockAlerts(threshold?: number): Promise<InventoryItem[]> {
    const stockThreshold = threshold || this.LOW_STOCK_THRESHOLD;

    const variants = await ProductVariant.find({
      stock: { $lte: stockThreshold },
    })
      .populate('productId', 'name sku')
      .sort({ stock: 1 })
      .lean();

    return variants
      .filter((variant: any) => variant.productId) // Filter out variants with null productId
      .map((variant: any) => {
        const stock = variant.stock || 0;
        const reservedStock = 0;
        const availableStock = stock - reservedStock;

        return {
          id: variant._id.toString(),
          productId: variant.productId._id.toString(),
          productName: variant.productId.name,
          variantId: variant._id.toString(),
          variantSku: variant.sku,
          variantName: variant.name,
          stock,
          reservedStock,
          availableStock,
          lowStockAlert: true,
        };
      });
  }
}

