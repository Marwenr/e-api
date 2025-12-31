import { Category } from "../models";
import { NotFoundError, ValidationError } from "./errors";

export interface CategoryQueryOptions {
  isActive?: boolean;
  parentId?: string;
}

export class CategoryService {
  /**
   * Get all categories with optional filtering
   * @param includeInactive - If true, includes inactive categories. If false, only active. If undefined, defaults to only active.
   */
  static async getAllCategories(
    options: CategoryQueryOptions & { includeInactive?: boolean } = {}
  ): Promise<any[]> {
    const query: any = {};

    // Filter by active status if provided
    if (options.isActive !== undefined) {
      query.isActive = options.isActive;
    } else if (options.includeInactive === true) {
      // If includeInactive is true, don't filter by isActive (get all)
      // Don't set query.isActive, so it returns all categories
    } else {
      // Default to only active categories
      query.isActive = true;
    }

    // Filter by parent ID if provided
    // If parentId is explicitly null, get top-level categories (no parent)
    // If parentId is not provided, get all categories regardless of parent
    if (options.parentId !== undefined) {
      if (options.parentId === null || options.parentId === 'null') {
        query.parentId = null;
      } else {
        query.parentId = options.parentId;
      }
    }
    // If parentId is not provided, don't filter by parentId - return all categories

    const categories = await Category.find(query)
      .select("name slug description parentId image isActive createdAt updatedAt")
      .sort({ name: 1 }) // Sort alphabetically by name
      .lean();

    return categories.map((category: any) => ({
      id: category._id.toString(),
      name: category.name,
      slug: category.slug,
      description: category.description,
      parentId: category.parentId ? category.parentId.toString() : null,
      image: category.image,
      isActive: category.isActive,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    }));
  }

  /**
   * Get category by ID
   */
  static async getCategoryById(categoryId: string): Promise<any> {
    if (!categoryId || !categoryId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new ValidationError("Invalid category ID format");
    }

    const category = await Category.findById(categoryId).lean();

    if (!category) {
      throw new NotFoundError("Category not found");
    }

    return {
      id: category._id.toString(),
      name: category.name,
      slug: category.slug,
      description: category.description,
      parentId: category.parentId ? category.parentId.toString() : null,
      image: category.image,
      isActive: category.isActive,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }

  /**
   * Get category by slug
   */
  static async getCategoryBySlug(slug: string): Promise<any> {
    if (!slug) {
      throw new ValidationError("Category slug is required");
    }

    const category = await Category.findOne({ slug, isActive: true }).lean();

    if (!category) {
      throw new NotFoundError("Category not found");
    }

    return {
      id: category._id.toString(),
      name: category.name,
      slug: category.slug,
      description: category.description,
      parentId: category.parentId ? category.parentId.toString() : null,
      image: category.image,
      isActive: category.isActive,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
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
   * Create a new category
   */
  static async createCategory(input: {
    name: string;
    slug?: string;
    description?: string;
    parentId?: string | null;
    image?: string;
    isActive?: boolean;
  }): Promise<any> {
    if (!input.name || input.name.trim().length === 0) {
      throw new ValidationError("Category name is required");
    }

    if (input.name.length > 100) {
      throw new ValidationError("Category name cannot exceed 100 characters");
    }

    if (input.description && input.description.length > 500) {
      throw new ValidationError("Description cannot exceed 500 characters");
    }

    // Validate parent category if provided
    if (input.parentId) {
      const parent = await Category.findById(input.parentId).lean();
      if (!parent) {
        throw new ValidationError("Parent category not found");
      }
    }

    // Generate slug if not provided
    const slug = input.slug || this.generateSlug(input.name);

    // Check if slug already exists
    const existingCategory = await Category.findOne({ slug }).lean();
    if (existingCategory) {
      throw new ValidationError("A category with this slug already exists");
    }

    // Create category
    const category = new Category({
      name: input.name.trim(),
      slug,
      description: input.description?.trim(),
      parentId: input.parentId || null,
      image: input.image?.trim(),
      isActive: input.isActive !== undefined ? input.isActive : true,
    });

    await category.save();

    return {
      id: category._id.toString(),
      name: category.name,
      slug: category.slug,
      description: category.description,
      parentId: category.parentId ? category.parentId.toString() : null,
      image: category.image,
      isActive: category.isActive,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }

  /**
   * Update a category
   */
  static async updateCategory(
    categoryId: string,
    input: {
      name?: string;
      slug?: string;
      description?: string;
      parentId?: string | null;
      image?: string;
      isActive?: boolean;
    }
  ): Promise<any> {
    if (!categoryId || !categoryId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new ValidationError("Invalid category ID format");
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      throw new NotFoundError("Category not found");
    }

    // Validate name if provided
    if (input.name !== undefined) {
      if (!input.name || input.name.trim().length === 0) {
        throw new ValidationError("Category name is required");
      }
      if (input.name.length > 100) {
        throw new ValidationError("Category name cannot exceed 100 characters");
      }
      category.name = input.name.trim();
    }

    // Validate description if provided
    if (input.description !== undefined) {
      if (input.description && input.description.length > 500) {
        throw new ValidationError("Description cannot exceed 500 characters");
      }
      category.description = input.description?.trim();
    }

    // Validate and update slug if provided
    if (input.slug !== undefined) {
      const slug = input.slug.trim();
      if (slug) {
        const existingCategory = await Category.findOne({
          slug,
          _id: { $ne: categoryId },
        }).lean();
        if (existingCategory) {
          throw new ValidationError("A category with this slug already exists");
        }
        category.slug = slug;
      } else if (category.name) {
        // Generate slug from name if slug is empty
        category.slug = this.generateSlug(category.name);
      }
    } else if (input.name !== undefined) {
      // Generate slug from new name if name changed but slug not provided
      category.slug = this.generateSlug(category.name);
      // Check if new slug conflicts
      const existingCategory = await Category.findOne({
        slug: category.slug,
        _id: { $ne: categoryId },
      }).lean();
      if (existingCategory) {
        throw new ValidationError(
          "A category with this slug already exists. Please provide a custom slug."
        );
      }
    }

    // Validate and update parentId if provided
    if (input.parentId !== undefined) {
      if (input.parentId) {
        // Prevent setting category as its own parent
        if (input.parentId === categoryId) {
          throw new ValidationError("A category cannot be its own parent");
        }

        const parent = await Category.findById(input.parentId).lean();
        if (!parent) {
          throw new ValidationError("Parent category not found");
        }

        // Prevent circular references (check if parent is a child of this category)
        const checkCircular = async (parentId: string): Promise<boolean> => {
          const parentCategory = await Category.findById(parentId).lean();
          if (!parentCategory || !parentCategory.parentId) {
            return false;
          }
          if (parentCategory.parentId.toString() === categoryId) {
            return true;
          }
          return checkCircular(parentCategory.parentId.toString());
        };

        const isCircular = await checkCircular(input.parentId);
        if (isCircular) {
          throw new ValidationError("Cannot set parent category: circular reference detected");
        }

        category.parentId = input.parentId;
      } else {
        category.parentId = null;
      }
    }

    // Update image if provided
    if (input.image !== undefined) {
      category.image = input.image?.trim();
    }

    // Update isActive if provided
    if (input.isActive !== undefined) {
      category.isActive = input.isActive;
    }

    await category.save();

    return {
      id: category._id.toString(),
      name: category.name,
      slug: category.slug,
      description: category.description,
      parentId: category.parentId ? category.parentId.toString() : null,
      image: category.image,
      isActive: category.isActive,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }

  /**
   * Delete a category
   */
  static async deleteCategory(categoryId: string): Promise<void> {
    if (!categoryId || !categoryId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new ValidationError("Invalid category ID format");
    }

    const category = await Category.findById(categoryId).lean();
    if (!category) {
      throw new NotFoundError("Category not found");
    }

    // Check if category has children
    const childrenCount = await Category.countDocuments({ parentId: categoryId });
    if (childrenCount > 0) {
      throw new ValidationError(
        "Cannot delete category: it has child categories. Please delete or reassign child categories first."
      );
    }

    // Check if category is used by products (you may want to add this check if you have a Product model)
    // For now, we'll just delete it
    await Category.findByIdAndDelete(categoryId);
  }
}

