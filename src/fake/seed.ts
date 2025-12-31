import mongoose from "mongoose";
import dotenv from "dotenv";
import { Category } from "../models/Category";
import { Product } from "../models/Product";
import { ProductVariant } from "../models/ProductVariant";
import {
  categoriesData,
  productsData,
  productVariantsData,
  SeedProduct,
  SeedProductVariant,
} from "./seedData";

// Load environment variables
dotenv.config();

async function seedDatabase() {
  try {
    console.log("🌱 Starting database seed...");

    // Connect to MongoDB - Use MONGO_URI from .env (same as the app uses)
    const mongoUri =
      process.env.MONGO_URI || "mongodb://localhost:27017/ecommerce";
    const dbName = process.env.MONGO_DB_NAME || "ecommerce";

    if (!mongoUri) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }

    await mongoose.connect(mongoUri, {
      dbName: dbName,
    });
    console.log(`✅ Connected to MongoDB (database: ${dbName})`);

    // Clear existing data (optional - remove if you want to keep existing data)
    console.log("🗑️  Clearing existing data...");
    await Category.deleteMany({});
    await Product.deleteMany({});
    await ProductVariant.deleteMany({});
    console.log("✅ Existing data cleared");

    // Insert Categories
    console.log("📦 Inserting categories...");
    const categories = await Category.insertMany(categoriesData);
    console.log(`✅ Inserted ${categories.length} categories`);

    // Create category slug to ID mapping
    const categoryMap = new Map<string, mongoose.Types.ObjectId>();
    categories.forEach((cat) => {
      categoryMap.set(cat.slug, cat._id);
    });

    // Insert Products
    console.log("📦 Inserting products...");
    const productsToInsert = productsData.map((productData: SeedProduct) => {
      const categoryId = categoryMap.get(productData.categorySlug);
      if (!categoryId) {
        throw new Error(
          `Category not found for slug: ${productData.categorySlug}`
        );
      }

      // Remove categorySlug and add categoryId
      const { categorySlug, ...productDataWithoutSlug } = productData;
      return {
        ...productDataWithoutSlug,
        categoryId,
      };
    });

    const products = await Product.insertMany(productsToInsert);
    console.log(`✅ Inserted ${products.length} products`);

    // Create product slug to ID mapping
    const productMap = new Map<string, mongoose.Types.ObjectId>();
    products.forEach((prod) => {
      productMap.set(prod.slug, prod._id);
    });

    // Insert Product Variants
    console.log("📦 Inserting product variants...");
    const variantsToInsert = productVariantsData.map(
      (variantData: SeedProductVariant) => {
        const productId = productMap.get(variantData.productSlug);
        if (!productId) {
          throw new Error(
            `Product not found for slug: ${variantData.productSlug}`
          );
        }

        // Remove productSlug and add productId
        const { productSlug, ...variantDataWithoutSlug } = variantData;
        return {
          ...variantDataWithoutSlug,
          productId,
        };
      }
    );

    const variants = await ProductVariant.insertMany(variantsToInsert);
    console.log(`✅ Inserted ${variants.length} product variants`);

    // Summary
    console.log("\n📊 Seed Summary:");
    console.log(`   Categories: ${categories.length}`);
    console.log(`   Products: ${products.length}`);
    console.log(`   Product Variants: ${variants.length}`);
    console.log("\n✅ Database seed completed successfully!");

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run the seed function
seedDatabase();
