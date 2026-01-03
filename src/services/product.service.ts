import mongoose from "mongoose";
import { Product, ProductVariant, ProductStatus, Category } from "../models";
import { ValidationError, NotFoundError, ConflictError } from "./errors";

export interface CreateProductInput {
  name: string;
  slug?: string;
  description?: string;
  shortDescription?: string;
  categoryId: string;
  sku: string;
  basePrice: number;
  discountPrice?: number;
  stock?: number;
  images?: Array<{ url: string; alt?: string; isPrimary?: boolean }>;
  attributes?: Array<{ name: string; value: string }>;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
}

export interface UpdateProductInput {
  name?: string;
  slug?: string;
  description?: string;
  shortDescription?: string;
  categoryId?: string;
  sku?: string;
  basePrice?: number;
  discountPrice?: number;
  stock?: number;
  images?: Array<{ url: string; alt?: string; isPrimary?: boolean }>;
  attributes?: Array<{ name: string; value: string }>;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
}

export interface ProductQueryOptions {
  page?: number;
  limit?: number;
  categoryId?: string;
  status?: ProductStatus;
  minPrice?: number;
  maxPrice?: number;
}

export interface PaginatedProductResult {
  data: any[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ProductSoldCountItem {
  productId: string;
  quantity: number;
}

export interface ProductSoldCountResult {
  productId: string;
  soldCount: number;
}

export class ProductService {
  /**
   * Transform populated category from _id to id
   */
  private static transformCategory(categoryId: any): any {
    if (!categoryId) return null;
    if (typeof categoryId === "string") return categoryId;
    if (categoryId._id) {
      return {
        id: categoryId._id.toString(),
        name: categoryId.name,
        slug: categoryId.slug,
      };
    }
    // Already transformed or has id
    return categoryId;
  }

  /**
   * Generate slug from name
   */
  private static generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "") // Remove special characters
      .replace(/[\s_-]+/g, "-") // Replace spaces and underscores with hyphens
      .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
  }

  /**
   * Validate category exists
   */
  private static async validateCategory(categoryId: string): Promise<void> {
    const category = await Category.findById(categoryId).lean();
    if (!category) {
      throw new ValidationError("Category not found");
    }
    if (!category.isActive) {
      throw new ValidationError("Category is not active");
    }
  }

  /**
   * Validate SKU uniqueness
   */
  private static async validateSkuUnique(
    sku: string,
    excludeProductId?: string
  ): Promise<void> {
    const query: any = { sku: sku.toUpperCase() };
    if (excludeProductId) {
      query._id = { $ne: new mongoose.Types.ObjectId(excludeProductId) };
    }
    const existingProduct = await Product.findOne(query).lean();
    if (existingProduct) {
      throw new ConflictError("Product with this SKU already exists");
    }
  }

  /**
   * Validate slug uniqueness
   */
  private static async validateSlugUnique(
    slug: string,
    excludeProductId?: string
  ): Promise<void> {
    const query: any = { slug: slug.toLowerCase() };
    if (excludeProductId) {
      query._id = { $ne: new mongoose.Types.ObjectId(excludeProductId) };
    }
    const existingProduct = await Product.findOne(query).lean();
    if (existingProduct) {
      throw new ConflictError("Product with this slug already exists");
    }
  }

  /**
   * Create a new product
   */
  static async createProduct(input: CreateProductInput) {
    // Validate required fields
    if (
      !input.name ||
      !input.categoryId ||
      !input.sku ||
      input.basePrice === undefined
    ) {
      throw new ValidationError(
        "Name, category, SKU, and base price are required"
      );
    }

    if (input.basePrice < 0) {
      throw new ValidationError("Base price cannot be negative");
    }

    if (input.discountPrice !== undefined && input.discountPrice < 0) {
      throw new ValidationError("Discount price cannot be negative");
    }

    if (
      input.discountPrice !== undefined &&
      input.discountPrice >= input.basePrice
    ) {
      throw new ValidationError("Discount price must be less than base price");
    }

    if (input.stock !== undefined && input.stock < 0) {
      throw new ValidationError("Stock cannot be negative");
    }

    // Validate category
    await this.validateCategory(input.categoryId);

    // Generate or validate slug
    const slug = input.slug || this.generateSlug(input.name);
    await this.validateSlugUnique(slug);

    // Validate SKU uniqueness
    await this.validateSkuUnique(input.sku);

    // Validate images have at least one primary if images exist
    if (input.images && input.images.length > 0) {
      const hasPrimary = input.images.some((img) => img.isPrimary === true);
      if (!hasPrimary) {
        throw new ValidationError(
          "At least one image must be marked as primary"
        );
      }
    }

    // Create product
    const product = new Product({
      name: input.name.trim(),
      slug: slug.toLowerCase(),
      description: input.description?.trim(),
      shortDescription: input.shortDescription?.trim(),
      categoryId: new mongoose.Types.ObjectId(input.categoryId),
      sku: input.sku.toUpperCase(),
      basePrice: input.basePrice,
      discountPrice: input.discountPrice,
      stock: input.stock !== undefined ? input.stock : 0,
      status: ProductStatus.DRAFT,
      soldCount: 0,
      images: input.images || [],
      attributes: input.attributes || [],
      seoTitle: input.seoTitle?.trim(),
      seoDescription: input.seoDescription?.trim(),
      seoKeywords: input.seoKeywords,
    });

    await product.save();
    return product.toJSON();
  }

  /**
   * Update a product
   */
  static async updateProduct(productId: string, input: UpdateProductInput) {
    const product = await Product.findById(productId);
    if (!product) {
      throw new NotFoundError("Product not found");
    }

    // Validate base price if provided
    if (input.basePrice !== undefined && input.basePrice < 0) {
      throw new ValidationError("Base price cannot be negative");
    }

    // Validate discount price if provided
    if (input.discountPrice !== undefined) {
      if (input.discountPrice < 0) {
        throw new ValidationError("Discount price cannot be negative");
      }
      const basePrice =
        input.basePrice !== undefined ? input.basePrice : product.basePrice;
      if (input.discountPrice >= basePrice) {
        throw new ValidationError(
          "Discount price must be less than base price"
        );
      }
    }

    // Validate stock if provided
    if (input.stock !== undefined && input.stock < 0) {
      throw new ValidationError("Stock cannot be negative");
    }

    // Validate category if provided
    if (input.categoryId) {
      await this.validateCategory(input.categoryId);
      product.categoryId = new mongoose.Types.ObjectId(input.categoryId);
    }

    // Validate and update slug if provided
    if (input.slug) {
      await this.validateSlugUnique(input.slug, productId);
      product.slug = input.slug.toLowerCase();
    } else if (input.name && input.name !== product.name) {
      // Generate new slug if name changed but slug wasn't provided
      const newSlug = this.generateSlug(input.name);
      await this.validateSlugUnique(newSlug, productId);
      product.slug = newSlug.toLowerCase();
    }

    // Validate SKU uniqueness if provided
    if (input.sku && input.sku.toUpperCase() !== product.sku) {
      await this.validateSkuUnique(input.sku, productId);
      product.sku = input.sku.toUpperCase();
    }

    // Validate images if provided
    if (input.images) {
      if (input.images.length > 0) {
        const hasPrimary = input.images.some((img) => img.isPrimary === true);
        if (!hasPrimary) {
          throw new ValidationError(
            "At least one image must be marked as primary"
          );
        }
      }
      product.images = input.images;
    }

    // Update other fields
    if (input.name !== undefined) product.name = input.name.trim();
    if (input.description !== undefined)
      product.description = input.description?.trim();
    if (input.shortDescription !== undefined)
      product.shortDescription = input.shortDescription?.trim();
    if (input.basePrice !== undefined) product.basePrice = input.basePrice;
    if (input.discountPrice !== undefined)
      product.discountPrice = input.discountPrice ?? null;
    if (input.stock !== undefined) product.stock = input.stock;
    if (input.attributes !== undefined) product.attributes = input.attributes;
    if (input.seoTitle !== undefined) product.seoTitle = input.seoTitle?.trim();
    if (input.seoDescription !== undefined)
      product.seoDescription = input.seoDescription?.trim();
    if (input.seoKeywords !== undefined)
      product.seoKeywords = input.seoKeywords;

    await product.save();
    return product.toJSON();
  }

  /**
   * Publish a product (set status to active)
   */
  static async publishProduct(productId: string) {
    const product = await Product.findById(productId);
    if (!product) {
      throw new NotFoundError("Product not found");
    }

    if (product.status === ProductStatus.ARCHIVED) {
      throw new ValidationError("Cannot publish an archived product");
    }

    product.status = ProductStatus.ACTIVE;
    if (!product.publishedAt) {
      product.publishedAt = new Date();
    }

    await product.save();
    return product.toJSON();
  }

  /**
   * Unpublish a product (set status to draft)
   */
  static async unpublishProduct(productId: string) {
    const product = await Product.findById(productId);
    if (!product) {
      throw new NotFoundError("Product not found");
    }

    if (product.status === ProductStatus.ARCHIVED) {
      throw new ValidationError("Cannot unpublish an archived product");
    }

    product.status = ProductStatus.DRAFT;
    // Note: publishedAt is cleared by the pre-save hook

    await product.save();
    return product.toJSON();
  }

  /**
   * Soft delete a product (set status to archived)
   */
  static async archiveProduct(productId: string) {
    const product = await Product.findById(productId);
    if (!product) {
      throw new NotFoundError("Product not found");
    }

    product.status = ProductStatus.ARCHIVED;
    // Note: publishedAt is cleared by the pre-save hook

    await product.save();
    return product.toJSON();
  }

  /**
   * Increment sold count for a single product (optimized with atomic update)
   * Use this for single product updates
   */
  static async incrementSoldCount(productId: string, quantity: number = 1) {
    if (quantity < 1) {
      throw new ValidationError("Quantity must be at least 1");
    }

    // Use atomic update operation for optimal performance
    // Only update soldCount field, no need to fetch full document
    const result = await Product.findByIdAndUpdate(
      productId,
      { $inc: { soldCount: quantity } },
      { new: true, select: "soldCount" }
    ).lean();

    if (!result) {
      throw new NotFoundError("Product not found");
    }

    return {
      id: productId,
      soldCount: result.soldCount,
    };
  }

  /**
   * Bulk increment sold count for multiple products (optimized for order completion)
   *
   * Use this method when completing orders to efficiently update sold counts for multiple products.
   * This method uses MongoDB's bulkWrite operation for optimal performance.
   *
   * @param items Array of product sold count items with productId and quantity
   * @returns Array of updated product sold counts
   *
   * @example
   * // On order completion:
   * await ProductService.bulkIncrementSoldCount([
   *   { productId: '507f1f77bcf86cd799439011', quantity: 2 },
   *   { productId: '507f1f77bcf86cd799439012', quantity: 1 },
   * ]);
   */
  static async bulkIncrementSoldCount(
    items: ProductSoldCountItem[]
  ): Promise<ProductSoldCountResult[]> {
    if (!items || items.length === 0) {
      return [];
    }

    // Validate quantities
    for (const item of items) {
      if (item.quantity < 1) {
        throw new ValidationError(
          `Invalid quantity for product ${item.productId}`
        );
      }
    }

    // Build bulk write operations for optimal performance
    // Using updateOne with $inc for atomic updates
    const bulkOps = items.map((item) => ({
      updateOne: {
        filter: { _id: new mongoose.Types.ObjectId(item.productId) },
        update: { $inc: { soldCount: item.quantity } },
      },
    }));

    // Execute bulk write operation (more efficient than multiple individual updates)
    // ordered: false allows parallel execution for better performance
    const result = await Product.bulkWrite(bulkOps, { ordered: false });

    if (result.modifiedCount !== items.length) {
      // Some products might not exist, fetch updated counts for successful updates
      const productIds = items.map(
        (item) => new mongoose.Types.ObjectId(item.productId)
      );
      const updatedProducts = await Product.find({ _id: { $in: productIds } })
        .select("soldCount")
        .lean();

      const productMap = new Map(
        updatedProducts.map((p) => [p._id.toString(), p.soldCount])
      );

      return items
        .filter((item) => productMap.has(item.productId))
        .map((item) => ({
          productId: item.productId,
          soldCount: productMap.get(item.productId)!,
        }));
    }

    // Fetch updated counts for all products
    const productIds = items.map(
      (item) => new mongoose.Types.ObjectId(item.productId)
    );
    const updatedProducts = await Product.find({ _id: { $in: productIds } })
      .select("soldCount")
      .lean();

    const productMap = new Map(
      updatedProducts.map((p) => [p._id.toString(), p.soldCount])
    );

    return items.map((item) => ({
      productId: item.productId,
      soldCount: productMap.get(item.productId) || 0,
    }));
  }

  /**
   * Get product by ID
   */
  static async getProductById(
    productId: string,
    includeArchived: boolean = false
  ) {
    const query: any = { _id: productId };
    if (!includeArchived) {
      query.status = { $ne: ProductStatus.ARCHIVED };
    }

    const product = await Product.findOne(query)
      .populate("categoryId", "name slug")
      .lean();

    if (!product) {
      throw new NotFoundError("Product not found");
    }

    return {
      id: product._id.toString(),
      name: product.name,
      slug: product.slug,
      description: product.description,
      shortDescription: product.shortDescription,
      category: this.transformCategory(product.categoryId),
      sku: product.sku,
      basePrice: product.basePrice,
      discountPrice: product.discountPrice,
      status: product.status,
      soldCount: product.soldCount,
      publishedAt: product.publishedAt,
      images: product.images,
      attributes: product.attributes,
      seoTitle: product.seoTitle,
      seoDescription: product.seoDescription,
      seoKeywords: product.seoKeywords,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }

  /**
   * Get product by slug (public endpoint)
   */
  static async getProductBySlug(slug: string) {
    const product = await Product.findOne({
      slug: slug.toLowerCase(),
      status: ProductStatus.ACTIVE, // Only return active products for public access
    })
      .populate("categoryId", "name slug")
      .lean();

    if (!product) {
      throw new NotFoundError("Product not found");
    }

    return {
      id: product._id.toString(),
      name: product.name,
      slug: product.slug,
      description: product.description,
      shortDescription: product.shortDescription,
      category: this.transformCategory(product.categoryId),
      sku: product.sku,
      basePrice: product.basePrice,
      discountPrice: product.discountPrice,
      status: product.status,
      soldCount: product.soldCount,
      publishedAt: product.publishedAt,
      images: product.images,
      attributes: product.attributes,
      seoTitle: product.seoTitle,
      seoDescription: product.seoDescription,
      seoKeywords: product.seoKeywords,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }

  /**
   * Get all products with filtering and pagination
   */
  static async getAllProducts(
    options: ProductQueryOptions = {}
  ): Promise<PaginatedProductResult> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 10)); // Cap at 100 for performance
    const skip = (page - 1) * limit;

    const query: any = {
      status: options.status || ProductStatus.ACTIVE, // Default to active products
    };

    if (options.categoryId) {
      query.categoryId = new mongoose.Types.ObjectId(options.categoryId);
    }

    if (options.minPrice !== undefined || options.maxPrice !== undefined) {
      query.basePrice = {};
      if (options.minPrice !== undefined)
        query.basePrice.$gte = options.minPrice;
      if (options.maxPrice !== undefined)
        query.basePrice.$lte = options.maxPrice;
    }

    // Select only needed fields to reduce data transfer and improve performance
    const selectFields =
      "name slug shortDescription categoryId basePrice discountPrice soldCount images publishedAt createdAt status";

    // Sort by createdAt descending (newest first) by default
    const sortOrder: any = { createdAt: -1 };

    // Execute query and count in parallel for optimal performance
    const [products, total] = await Promise.all([
      Product.find(query)
        .select(selectFields)
        .populate("categoryId", "name slug")
        .sort(sortOrder)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query),
    ]);

    // Cache-friendly consistent data structure
    return {
      data: products.map((p) => ({
        id: p._id.toString(),
        name: p.name,
        slug: p.slug,
        shortDescription: p.shortDescription,
        category: this.transformCategory(p.categoryId),
        basePrice: p.basePrice,
        discountPrice: p.discountPrice,
        soldCount: p.soldCount,
        images: p.images || [],
        publishedAt: p.publishedAt,
        createdAt: p.createdAt,
        status: p.status,
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get best selling products (optimized query using index)
   * - Uses indexed queries for fast performance
   - Selects only needed fields to reduce data transfer
   * - Cache-friendly consistent data structure
   * - Supports pagination and filtering
   */
  static async getBestSellers(
    options: ProductQueryOptions = {}
  ): Promise<PaginatedProductResult> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 10)); // Cap at 100 for performance
    const skip = (page - 1) * limit;

    const query: any = {
      status: ProductStatus.ACTIVE,
      soldCount: { $gt: 0 }, // Only products with sales
    };

    if (options.categoryId) {
      query.categoryId = new mongoose.Types.ObjectId(options.categoryId);
    }

    if (options.minPrice !== undefined || options.maxPrice !== undefined) {
      query.basePrice = {};
      if (options.minPrice !== undefined)
        query.basePrice.$gte = options.minPrice;
      if (options.maxPrice !== undefined)
        query.basePrice.$lte = options.maxPrice;
    }

    // Select only needed fields to reduce data transfer and improve performance
    const selectFields =
      "name slug shortDescription categoryId basePrice discountPrice soldCount images publishedAt createdAt";

    // Determine sort order based on whether category filter is applied
    // Use compound index when categoryId is provided: { categoryId: 1, status: 1, soldCount: -1 }
    // Otherwise use: { soldCount: -1, status: 1 }
    const sortOrder: any = options.categoryId
      ? { soldCount: -1, createdAt: -1 } // Compound index: categoryId + status + soldCount
      : { soldCount: -1, createdAt: -1 }; // Index: soldCount + status

    // Execute query and count in parallel for optimal performance
    const [products, total] = await Promise.all([
      Product.find(query)
        .select(selectFields)
        .populate("categoryId", "name slug") // Only populate needed category fields
        .sort(sortOrder)
        .skip(skip)
        .limit(limit)
        .lean(), // Use lean() for better performance (returns plain JS objects)
      Product.countDocuments(query), // Fast count using index
    ]);

    // Cache-friendly consistent data structure
    return {
      data: products.map((p) => ({
        id: p._id.toString(),
        name: p.name,
        slug: p.slug,
        shortDescription: p.shortDescription,
        category: this.transformCategory(p.categoryId),
        basePrice: p.basePrice,
        discountPrice: p.discountPrice,
        soldCount: p.soldCount,
        images: p.images || [],
        publishedAt: p.publishedAt,
        createdAt: p.createdAt,
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get new arrival products (optimized query using index)
   *
   * New arrivals are defined as active products sorted by publish date (most recent first).
   * Only products with a publishedAt date are included.
   *
   * Features:
   * - Uses indexed queries for fast performance
   * - Selects only needed fields to reduce data transfer
   * - Cache-friendly consistent data structure
   * - Supports pagination and filtering
   * - Index-optimized for category filtering
   *
   * @param options Query options including pagination, category filter, and price range
   * @returns Paginated list of new arrival products
   */
  static async getNewArrivals(
    options: ProductQueryOptions = {}
  ): Promise<PaginatedProductResult> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 10)); // Cap at 100 for performance
    const skip = (page - 1) * limit;

    // Query for active products with published date (new arrivals only)
    const query: any = {
      status: ProductStatus.ACTIVE, // Only active products
      publishedAt: { $ne: null, $exists: true }, // Must have publish date
    };

    // Category filter
    if (options.categoryId) {
      query.categoryId = new mongoose.Types.ObjectId(options.categoryId);
    }

    // Price range filter
    if (options.minPrice !== undefined || options.maxPrice !== undefined) {
      query.basePrice = {};
      if (options.minPrice !== undefined)
        query.basePrice.$gte = options.minPrice;
      if (options.maxPrice !== undefined)
        query.basePrice.$lte = options.maxPrice;
    }

    // Select only needed fields to reduce data transfer and improve performance
    const selectFields =
      "name slug shortDescription categoryId basePrice discountPrice soldCount images publishedAt createdAt";

    // Use compound index when categoryId is provided: { categoryId: 1, status: 1, publishedAt: -1 }
    // Otherwise use: { publishedAt: -1, status: 1 }
    // Sort by publishedAt descending (most recent first), then createdAt as tiebreaker
    const sortOrder: any = { publishedAt: -1, createdAt: -1 };

    // Execute query and count in parallel for optimal performance
    const [products, total] = await Promise.all([
      Product.find(query)
        .select(selectFields)
        .populate("categoryId", "name slug") // Only populate needed category fields
        .sort(sortOrder) // Sort by most recent publish date first
        .skip(skip)
        .limit(limit)
        .lean(), // Use lean() for better performance (returns plain JS objects)
      Product.countDocuments(query), // Fast count using index
    ]);

    // Cache-friendly consistent data structure
    return {
      data: products.map((p) => ({
        id: p._id.toString(),
        name: p.name,
        slug: p.slug,
        shortDescription: p.shortDescription,
        category: this.transformCategory(p.categoryId),
        basePrice: p.basePrice,
        discountPrice: p.discountPrice,
        soldCount: p.soldCount,
        images: p.images || [],
        publishedAt: p.publishedAt,
        createdAt: p.createdAt,
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get discounted products (optimized query)
   */
  static async getDiscountedProducts(
    options: ProductQueryOptions = {}
  ): Promise<PaginatedProductResult> {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;

    const query: any = {
      status: ProductStatus.ACTIVE,
      discountPrice: { $exists: true, $ne: null },
    };

    if (options.categoryId) {
      query.categoryId = new mongoose.Types.ObjectId(options.categoryId);
    }

    if (options.minPrice !== undefined || options.maxPrice !== undefined) {
      query.basePrice = {};
      if (options.minPrice !== undefined)
        query.basePrice.$gte = options.minPrice;
      if (options.maxPrice !== undefined)
        query.basePrice.$lte = options.maxPrice;
    }

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate("categoryId", "name slug")
        .sort({ discountPrice: 1, createdAt: -1 }) // Sort by discount price ascending (best deals first)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query),
    ]);

    // Calculate discount percentage
    const productsWithDiscount = products.map((p) => {
      const discountPercent =
        p.discountPrice && p.basePrice
          ? Math.round(((p.basePrice - p.discountPrice) / p.basePrice) * 100)
          : 0;
      return {
        id: p._id.toString(),
        name: p.name,
        slug: p.slug,
        shortDescription: p.shortDescription,
        category: this.transformCategory(p.categoryId),
        basePrice: p.basePrice,
        discountPrice: p.discountPrice,
        discountPercent,
        soldCount: p.soldCount,
        images: p.images,
        publishedAt: p.publishedAt,
      };
    });

    return {
      data: productsWithDiscount,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get low stock products (requires ProductVariant aggregation)
   */
  static async getLowStockProducts(
    threshold: number = 10,
    options: ProductQueryOptions = {}
  ): Promise<PaginatedProductResult> {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;

    // First, find all variants with low stock
    const lowStockVariants = await ProductVariant.find({
      stock: { $lte: threshold },
    }).lean();

    if (lowStockVariants.length === 0) {
      return {
        data: [],
        meta: {
          page,
          limit,
          total: 0,
          totalPages: 0,
        },
      };
    }

    // Get unique product IDs
    const productIds = Array.from(
      new Set(lowStockVariants.map((v) => v.productId.toString()))
    );

    // Build query for products
    const productQuery: any = {
      _id: { $in: productIds.map((id) => new mongoose.Types.ObjectId(id)) },
      status: ProductStatus.ACTIVE,
    };

    if (options.categoryId) {
      productQuery.categoryId = new mongoose.Types.ObjectId(options.categoryId);
    }

    if (options.minPrice !== undefined || options.maxPrice !== undefined) {
      productQuery.basePrice = {};
      if (options.minPrice !== undefined)
        productQuery.basePrice.$gte = options.minPrice;
      if (options.maxPrice !== undefined)
        productQuery.basePrice.$lte = options.maxPrice;
    }

    // Get total count
    const total = await Product.countDocuments(productQuery);

    // Get products with pagination
    const products = await Product.find(productQuery)
      .populate("categoryId", "name slug")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Calculate stock info for each product
    const variantMap = new Map<string, typeof lowStockVariants>();
    for (const variant of lowStockVariants) {
      const productId = variant.productId.toString();
      if (!variantMap.has(productId)) {
        variantMap.set(productId, []);
      }
      variantMap.get(productId)!.push(variant as any);
    }

    // Get all variants for these products to calculate total stock
    const allProductIds = products.map((p) => p._id);
    const allVariants = await ProductVariant.find({
      productId: { $in: allProductIds },
    }).lean();

    const allVariantMap = new Map<string, typeof allVariants>();
    for (const variant of allVariants) {
      const productId = variant.productId.toString();
      if (!allVariantMap.has(productId)) {
        allVariantMap.set(productId, []);
      }
      allVariantMap.get(productId)!.push(variant as any);
    }

    const data = products.map((p) => {
      const productId = p._id.toString();
      const variants = allVariantMap.get(productId) || [];
      const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);
      const minStock = Math.min(...variants.map((v) => v.stock));

      return {
        id: productId,
        name: p.name,
        slug: p.slug,
        shortDescription: p.shortDescription,
        category: this.transformCategory(p.categoryId),
        basePrice: p.basePrice,
        discountPrice: p.discountPrice,
        totalStock,
        minStock,
        images: p.images,
        publishedAt: p.publishedAt,
      };
    });

    // Sort by minStock ascending (lowest stock first)
    data.sort((a, b) => a.minStock - b.minStock);

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
   * Get featured products (can be customized based on business logic)
   * For now, this returns active products with highest sold count
   */
  static async getFeaturedProducts(
    options: ProductQueryOptions = {}
  ): Promise<PaginatedProductResult> {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;

    const query: any = {
      status: ProductStatus.ACTIVE,
    };

    if (options.categoryId) {
      query.categoryId = new mongoose.Types.ObjectId(options.categoryId);
    }

    if (options.minPrice !== undefined || options.maxPrice !== undefined) {
      query.basePrice = {};
      if (options.minPrice !== undefined)
        query.basePrice.$gte = options.minPrice;
      if (options.maxPrice !== undefined)
        query.basePrice.$lte = options.maxPrice;
    }

    // Featured products: combination of high sold count and recent publication
    // Use optimized index: { categoryId: 1, status: 1, soldCount: -1 }
    const [products, total] = await Promise.all([
      Product.find(query)
        .populate("categoryId", "name slug")
        .sort({ soldCount: -1, publishedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query),
    ]);

    return {
      data: products.map((p) => ({
        id: p._id.toString(),
        name: p.name,
        slug: p.slug,
        shortDescription: p.shortDescription,
        category: this.transformCategory(p.categoryId),
        basePrice: p.basePrice,
        discountPrice: p.discountPrice,
        soldCount: p.soldCount,
        images: p.images,
        publishedAt: p.publishedAt,
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get all products for admin (includes all statuses, search, filters, sorting)
   */
  static async getAdminProducts(
    options: {
      page?: number;
      limit?: number;
      search?: string;
      status?: ProductStatus;
      categoryId?: string;
      minPrice?: number;
      maxPrice?: number;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    } = {}
  ): Promise<PaginatedProductResult> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 20));
    const skip = (page - 1) * limit;

    const query: any = {};

    // Status filter (admin can see all statuses)
    if (options.status) {
      query.status = options.status;
    }

    // Search filter (text search on name, description)
    if (options.search) {
      query.$or = [
        { name: { $regex: options.search, $options: "i" } },
        { description: { $regex: options.search, $options: "i" } },
        { shortDescription: { $regex: options.search, $options: "i" } },
        { sku: { $regex: options.search, $options: "i" } },
      ];
    }

    // Category filter
    if (options.categoryId) {
      query.categoryId = new mongoose.Types.ObjectId(options.categoryId);
    }

    // Price range filter
    if (options.minPrice !== undefined || options.maxPrice !== undefined) {
      query.basePrice = {};
      if (options.minPrice !== undefined)
        query.basePrice.$gte = options.minPrice;
      if (options.maxPrice !== undefined)
        query.basePrice.$lte = options.maxPrice;
    }

    // Sort order
    const sortField = options.sortBy || "createdAt";
    const sortOrder = options.sortOrder === "asc" ? 1 : -1;
    const sort: any = { [sortField]: sortOrder };

    // Execute query and count in parallel
    const [products, total] = await Promise.all([
      Product.find(query)
        .populate("categoryId", "name slug")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query),
    ]);

    return {
      data: products.map((p) => ({
        id: p._id.toString(),
        name: p.name,
        slug: p.slug,
        description: p.description,
        shortDescription: p.shortDescription,
        category: this.transformCategory(p.categoryId),
        sku: p.sku,
        basePrice: p.basePrice,
        discountPrice: p.discountPrice,
        status: p.status,
        soldCount: p.soldCount,
        publishedAt: p.publishedAt,
        images: p.images || [],
        attributes: p.attributes || [],
        seoTitle: p.seoTitle,
        seoDescription: p.seoDescription,
        seoKeywords: p.seoKeywords,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Delete a product (hard delete - admin only)
   */
  static async deleteProduct(productId: string): Promise<void> {
    const product = await Product.findById(productId);
    if (!product) {
      throw new NotFoundError("Product not found");
    }

    // Hard delete the product
    await Product.findByIdAndDelete(productId);
  }

  /**
   * Bulk actions on products
   */
  static async bulkAction(
    productIds: string[],
    action: "publish" | "unpublish" | "archive" | "delete"
  ): Promise<{ success: number; failed: number; errors?: string[] }> {
    if (!productIds || productIds.length === 0) {
      throw new ValidationError("At least one product ID is required");
    }

    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    if (action === "delete") {
      // Hard delete
      const result = await Product.deleteMany({
        _id: { $in: productIds.map((id) => new mongoose.Types.ObjectId(id)) },
      });
      success = result.deletedCount || 0;
      failed = productIds.length - success;
    } else {
      // Update status
      let status: ProductStatus;
      switch (action) {
        case "publish":
          status = ProductStatus.ACTIVE;
          break;
        case "unpublish":
          status = ProductStatus.DRAFT;
          break;
        case "archive":
          status = ProductStatus.ARCHIVED;
          break;
        default:
          throw new ValidationError(`Invalid action: ${action}`);
      }

      const updateData: any = { status };
      if (action === "publish") {
        updateData.publishedAt = new Date();
      }

      const result = await Product.updateMany(
        {
          _id: { $in: productIds.map((id) => new mongoose.Types.ObjectId(id)) },
        },
        { $set: updateData }
      );

      success = result.modifiedCount || 0;
      failed = productIds.length - success;
    }

    return { success, failed, errors: errors.length > 0 ? errors : undefined };
  }
}
