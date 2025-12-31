import mongoose from "mongoose";

export interface SeedCategory {
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
}

export interface SeedProduct {
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  sku: string;
  basePrice: number;
  discountPrice?: number;
  status: "draft" | "active" | "archived";
  soldCount: number;
  publishedAt?: Date;
  images: Array<{
    url: string;
    alt?: string;
    isPrimary?: boolean;
  }>;
  attributes: Array<{
    name: string;
    value: string;
  }>;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  categorySlug: string; // Will be replaced with categoryId
}

export interface SeedProductVariant {
  sku: string;
  name?: string;
  basePrice: number;
  discountPrice?: number;
  stock: number;
  attributes: Array<{
    name: string;
    value: string;
  }>;
  images?: string[];
  isDefault: boolean;
  productSlug: string; // Will be replaced with productId
}

// Categories data
export const categoriesData: SeedCategory[] = [
  {
    name: "Men's Clothing",
    slug: "mens-clothing",
    description: "Discover our collection of men's fashion and clothing",
    isActive: true,
  },
  {
    name: "Women's Clothing",
    slug: "womens-clothing",
    description: "Elegant and trendy women's fashion collection",
    isActive: true,
  },
  {
    name: "Accessories",
    slug: "accessories",
    description: "Complete your look with our accessories",
    isActive: true,
  },
  {
    name: "Shoes",
    slug: "shoes",
    description: "Comfortable and stylish footwear",
    isActive: true,
  },
];

// Products data
export const productsData: SeedProduct[] = [
  {
    name: "Classic White Cotton T-Shirt",
    slug: "classic-white-cotton-t-shirt",
    description:
      "A timeless classic white cotton t-shirt made from premium 100% organic cotton. Perfect for everyday wear, this comfortable and breathable t-shirt features a relaxed fit and soft texture. Great for layering or wearing on its own.",
    shortDescription: "Premium 100% organic cotton t-shirt with relaxed fit",
    sku: "TSH-001-WHT",
    basePrice: 29.99,
    discountPrice: 19.99,
    status: "active",
    soldCount: 1250,
    publishedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
    images: [
      {
        url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop",
        alt: "Classic White Cotton T-Shirt front view",
        isPrimary: true,
      },
      {
        url: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&h=800&fit=crop",
        alt: "Classic White Cotton T-Shirt side view",
        isPrimary: false,
      },
    ],
    attributes: [
      { name: "Material", value: "100% Organic Cotton" },
      { name: "Fit", value: "Regular Fit" },
      { name: "Color", value: "White" },
      { name: "Size", value: "S, M, L, XL, XXL" },
    ],
    seoTitle: "Classic White Cotton T-Shirt - Premium Quality",
    seoDescription:
      "Shop premium white cotton t-shirts. 100% organic cotton, relaxed fit.",
    seoKeywords: [
      "t-shirt",
      "white t-shirt",
      "cotton t-shirt",
      "organic cotton",
    ],
    categorySlug: "mens-clothing",
  },
  {
    name: "Slim Fit Blue Denim Jeans",
    slug: "slim-fit-blue-denim-jeans",
    description:
      "Modern slim-fit blue denim jeans crafted from premium denim fabric. Features a classic five-pocket design, comfortable stretch material, and a versatile wash that pairs with everything. Perfect for both casual and smart-casual occasions.",
    shortDescription: "Premium slim-fit denim jeans with stretch comfort",
    sku: "JEA-001-BLU",
    basePrice: 89.99,
    status: "active",
    soldCount: 850,
    publishedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
    images: [
      {
        url: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&h=800&fit=crop",
        alt: "Slim Fit Blue Denim Jeans front view",
        isPrimary: true,
      },
    ],
    attributes: [
      { name: "Material", value: "98% Cotton, 2% Elastane" },
      { name: "Fit", value: "Slim Fit" },
      { name: "Size", value: "28, 30, 32, 34, 36, 38" },
    ],
    seoTitle: "Slim Fit Blue Denim Jeans - Premium Quality",
    seoDescription:
      "Shop premium slim-fit blue denim jeans. Comfortable stretch fabric.",
    seoKeywords: ["jeans", "denim", "slim fit jeans", "blue jeans"],
    categorySlug: "mens-clothing",
  },
  {
    name: "Floral Print Summer Dress",
    slug: "floral-print-summer-dress",
    description:
      "Beautiful floral print summer dress perfect for warm weather. Made from lightweight, breathable fabric with a flattering A-line silhouette. Features a comfortable fit, elegant floral pattern, and perfect for both casual and dressy occasions.",
    shortDescription: "Lightweight floral print dress for summer",
    sku: "DRS-001-FLR",
    basePrice: 79.99,
    discountPrice: 59.99,
    status: "active",
    soldCount: 680,
    publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago (NEW)
    images: [
      {
        url: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&h=800&fit=crop",
        alt: "Floral Print Summer Dress front view",
        isPrimary: true,
      },
    ],
    attributes: [
      { name: "Material", value: "100% Polyester" },
      { name: "Fit", value: "A-Line" },
      { name: "Size", value: "XS, S, M, L, XL" },
    ],
    seoTitle: "Floral Print Summer Dress - Women's Fashion",
    seoDescription:
      "Shop beautiful floral print summer dresses. Lightweight, comfortable.",
    seoKeywords: ["dress", "summer dress", "floral dress", "women's dress"],
    categorySlug: "womens-clothing",
  },
  {
    name: "Casual Canvas Sneakers",
    slug: "casual-canvas-sneakers",
    description:
      "Comfortable casual canvas sneakers perfect for everyday wear. Classic design with modern comfort features. Versatile style that pairs with jeans, shorts, or casual dresses.",
    shortDescription: "Classic canvas sneakers for everyday comfort",
    sku: "SHO-002-CNV",
    basePrice: 49.99,
    status: "active",
    soldCount: 2100,
    publishedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    images: [
      {
        url: "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800&h=800&fit=crop",
        alt: "Casual Canvas Sneakers",
        isPrimary: true,
      },
    ],
    attributes: [
      { name: "Material", value: "Canvas" },
      { name: "Size", value: "6, 7, 8, 9, 10, 11" },
    ],
    seoTitle: "Casual Canvas Sneakers - Everyday Comfort",
    seoDescription:
      "Shop comfortable canvas sneakers. Classic design, versatile style.",
    seoKeywords: ["sneakers", "canvas shoes", "casual shoes"],
    categorySlug: "shoes",
  },
  {
    name: "Black Leather Jacket",
    slug: "black-leather-jacket",
    description:
      "Iconic black leather jacket made from genuine leather. Features a classic biker style with a zippered front, adjustable cuffs, and multiple pockets. This timeless piece adds an edge to any outfit and is built to last for years.",
    shortDescription: "Classic black leather biker jacket in genuine leather",
    sku: "JAC-001-BLK",
    basePrice: 299.99,
    discountPrice: 229.99,
    status: "active",
    soldCount: 450,
    publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    images: [
      {
        url: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=800&fit=crop",
        alt: "Black Leather Jacket front view",
        isPrimary: true,
      },
    ],
    attributes: [
      { name: "Material", value: "Genuine Leather" },
      { name: "Color", value: "Black" },
      { name: "Size", value: "S, M, L, XL" },
    ],
    seoTitle: "Black Leather Jacket - Genuine Leather",
    seoDescription: "Shop premium black leather jackets. Classic biker style.",
    seoKeywords: ["leather jacket", "black jacket", "biker jacket"],
    categorySlug: "mens-clothing",
  },
  {
    name: "Wireless Bluetooth Headphones",
    slug: "wireless-bluetooth-headphones",
    description:
      "Premium wireless Bluetooth headphones with active noise cancellation. Features long battery life, comfortable over-ear design, and superior sound quality. Perfect for music lovers, gamers, and professionals.",
    shortDescription: "Premium wireless headphones with noise cancellation",
    sku: "ACC-001-HPH",
    basePrice: 199.99,
    discountPrice: 149.99,
    status: "active",
    soldCount: 320,
    publishedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000), // 25 days ago
    images: [
      {
        url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop",
        alt: "Wireless Bluetooth Headphones",
        isPrimary: true,
      },
    ],
    attributes: [
      { name: "Connectivity", value: "Bluetooth 5.0" },
      { name: "Battery Life", value: "30 hours" },
      { name: "Color", value: "Black" },
    ],
    seoTitle: "Wireless Bluetooth Headphones - Premium Audio",
    seoDescription:
      "Shop premium wireless headphones. Noise cancellation, long battery life.",
    seoKeywords: ["headphones", "wireless", "bluetooth", "noise cancellation"],
    categorySlug: "accessories",
  },
  {
    name: "Navy Blue Blazer",
    slug: "navy-blue-blazer",
    description:
      "Elegant navy blue blazer perfect for business and formal occasions. Made from premium wool blend fabric, this classic piece features a single-breasted design with notch lapels and two-button closure. Versatile enough for office wear or special events.",
    shortDescription: "Elegant navy blue blazer for business and formal wear",
    sku: "BLA-001-NVY",
    basePrice: 249.99,
    discountPrice: 199.99,
    status: "active",
    soldCount: 320,
    publishedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
    images: [
      {
        url: "https://images.unsplash.com/photo-1594938291221-94ad1c1e5b62?w=800&h=800&fit=crop",
        alt: "Navy Blue Blazer front view",
        isPrimary: true,
      },
    ],
    attributes: [
      { name: "Material", value: "Wool Blend" },
      { name: "Fit", value: "Regular Fit" },
      { name: "Color", value: "Navy Blue" },
      { name: "Size", value: "S, M, L, XL" },
    ],
    seoTitle: "Navy Blue Blazer - Classic Business Wear",
    seoDescription:
      "Shop elegant navy blue blazers. Premium wool blend, perfect for formal occasions.",
    seoKeywords: ["blazer", "navy blue", "business wear", "formal jacket"],
    categorySlug: "mens-clothing",
  },
  {
    name: "Floral Midi Skirt",
    slug: "floral-midi-skirt",
    description:
      "Beautiful floral print midi skirt with a flattering A-line silhouette. Made from lightweight, flowy fabric that moves elegantly. Perfect for spring and summer, pairs beautifully with blouses, t-shirts, or crop tops.",
    shortDescription: "Elegant floral midi skirt with A-line silhouette",
    sku: "SKT-001-FLR",
    basePrice: 59.99,
    status: "active",
    soldCount: 420,
    publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago (NEW)
    images: [
      {
        url: "https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=800&h=800&fit=crop",
        alt: "Floral Midi Skirt",
        isPrimary: true,
      },
    ],
    attributes: [
      { name: "Material", value: "Polyester" },
      { name: "Length", value: "Midi" },
      { name: "Size", value: "XS, S, M, L, XL" },
    ],
    seoTitle: "Floral Midi Skirt - Elegant Spring Wear",
    seoDescription:
      "Shop beautiful floral midi skirts. Lightweight, flowy fabric for spring and summer.",
    seoKeywords: ["skirt", "midi skirt", "floral skirt", "spring fashion"],
    categorySlug: "womens-clothing",
  },
  {
    name: "Leather Ankle Boots",
    slug: "leather-ankle-boots",
    description:
      "Stylish leather ankle boots with a comfortable block heel. Features a side zipper for easy wear, cushioned insole for all-day comfort, and a durable rubber sole. Perfect for both casual and semi-formal occasions.",
    shortDescription: "Comfortable leather ankle boots with block heel",
    sku: "SHO-003-ANK",
    basePrice: 129.99,
    discountPrice: 99.99,
    status: "active",
    soldCount: 580,
    publishedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), // 12 days ago
    images: [
      {
        url: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&h=800&fit=crop",
        alt: "Leather Ankle Boots",
        isPrimary: true,
      },
    ],
    attributes: [
      { name: "Material", value: "Genuine Leather" },
      { name: "Heel Height", value: "2 inches" },
      { name: "Size", value: "6, 7, 8, 9, 10, 11" },
    ],
    seoTitle: "Leather Ankle Boots - Comfortable & Stylish",
    seoDescription:
      "Shop leather ankle boots. Comfortable block heel, perfect for everyday wear.",
    seoKeywords: ["boots", "ankle boots", "leather boots", "casual boots"],
    categorySlug: "shoes",
  },
  {
    name: "Wool Scarf",
    slug: "wool-scarf",
    description:
      "Warm and soft wool scarf in a classic plaid pattern. Perfect for cold weather, this versatile accessory adds style and warmth to any outfit. Long enough to wrap multiple times for extra coziness.",
    shortDescription: "Warm wool scarf in classic plaid pattern",
    sku: "ACC-002-SCR",
    basePrice: 39.99,
    status: "active",
    soldCount: 950,
    publishedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000), // 18 days ago
    images: [
      {
        url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=800&fit=crop",
        alt: "Wool Scarf",
        isPrimary: true,
      },
    ],
    attributes: [
      { name: "Material", value: "100% Wool" },
      { name: "Pattern", value: "Plaid" },
      { name: "Length", value: "180 cm" },
    ],
    seoTitle: "Wool Scarf - Classic Plaid Pattern",
    seoDescription:
      "Shop warm wool scarves. Classic plaid pattern, perfect for cold weather.",
    seoKeywords: ["scarf", "wool scarf", "plaid scarf", "winter accessory"],
    categorySlug: "accessories",
  },
  {
    name: "Oversized Denim Jacket",
    slug: "oversized-denim-jacket",
    description:
      "Trendy oversized denim jacket with a relaxed fit. Features a classic denim wash, multiple pockets, and a comfortable oversized silhouette. Perfect for layering over t-shirts, dresses, or hoodies.",
    shortDescription: "Trendy oversized denim jacket with relaxed fit",
    sku: "JAC-002-DNM",
    basePrice: 79.99,
    discountPrice: 64.99,
    status: "active",
    soldCount: 670,
    publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    images: [
      {
        url: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=800&fit=crop",
        alt: "Oversized Denim Jacket",
        isPrimary: true,
      },
    ],
    attributes: [
      { name: "Material", value: "100% Cotton Denim" },
      { name: "Fit", value: "Oversized" },
      { name: "Size", value: "S, M, L, XL" },
    ],
    seoTitle: "Oversized Denim Jacket - Trendy & Comfortable",
    seoDescription:
      "Shop oversized denim jackets. Relaxed fit, perfect for casual wear.",
    seoKeywords: ["denim jacket", "oversized", "casual jacket", "denim"],
    categorySlug: "womens-clothing",
  },
  {
    name: "Chino Pants",
    slug: "chino-pants",
    description:
      "Classic chino pants in khaki color. Made from comfortable cotton twill fabric, these versatile pants feature a flat front design and can be dressed up or down. Perfect for business casual or everyday wear.",
    shortDescription: "Classic khaki chino pants for business casual",
    sku: "PAN-001-KHK",
    basePrice: 69.99,
    status: "active",
    soldCount: 890,
    publishedAt: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000), // 22 days ago
    images: [
      {
        url: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800&h=800&fit=crop",
        alt: "Chino Pants",
        isPrimary: true,
      },
    ],
    attributes: [
      { name: "Material", value: "Cotton Twill" },
      { name: "Color", value: "Khaki" },
      { name: "Size", value: "28, 30, 32, 34, 36, 38" },
    ],
    seoTitle: "Chino Pants - Classic Khaki Style",
    seoDescription:
      "Shop classic chino pants. Cotton twill fabric, perfect for business casual.",
    seoKeywords: ["chinos", "khaki pants", "business casual", "trousers"],
    categorySlug: "mens-clothing",
  },
  {
    name: "Silk Blouse",
    slug: "silk-blouse",
    description:
      "Elegant silk blouse with a flattering fit. Features a classic collar, button-down front, and long sleeves with cuff details. Made from premium silk fabric that feels luxurious against the skin. Perfect for office wear or special occasions.",
    shortDescription: "Elegant silk blouse with classic collar design",
    sku: "BLU-001-SLK",
    basePrice: 149.99,
    discountPrice: 119.99,
    status: "active",
    soldCount: 380,
    publishedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
    images: [
      {
        url: "https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=800&h=800&fit=crop",
        alt: "Silk Blouse",
        isPrimary: true,
      },
    ],
    attributes: [
      { name: "Material", value: "100% Silk" },
      { name: "Fit", value: "Regular Fit" },
      { name: "Size", value: "XS, S, M, L, XL" },
    ],
    seoTitle: "Silk Blouse - Elegant Office Wear",
    seoDescription:
      "Shop elegant silk blouses. Premium silk fabric, perfect for professional wear.",
    seoKeywords: ["blouse", "silk blouse", "office wear", "professional"],
    categorySlug: "womens-clothing",
  },
  {
    name: "Running Sneakers",
    slug: "running-sneakers",
    description:
      "High-performance running sneakers designed for comfort and durability. Features breathable mesh upper, cushioned midsole for shock absorption, and a grippy rubber outsole. Perfect for jogging, gym workouts, or daily active wear.",
    shortDescription: "High-performance running sneakers with cushioning",
    sku: "SHO-004-RUN",
    basePrice: 89.99,
    status: "active",
    soldCount: 1250,
    publishedAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000), // 28 days ago
    images: [
      {
        url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=800&fit=crop",
        alt: "Running Sneakers",
        isPrimary: true,
      },
    ],
    attributes: [
      { name: "Material", value: "Mesh & Synthetic" },
      { name: "Type", value: "Running" },
      { name: "Size", value: "6, 7, 8, 9, 10, 11, 12" },
    ],
    seoTitle: "Running Sneakers - High Performance",
    seoDescription:
      "Shop high-performance running sneakers. Comfortable cushioning, perfect for active wear.",
    seoKeywords: ["sneakers", "running shoes", "athletic shoes", "gym shoes"],
    categorySlug: "shoes",
  },
  {
    name: "Leather Belt",
    slug: "leather-belt",
    description:
      "Classic leather belt with a simple buckle design. Made from genuine leather that will age beautifully over time. Adjustable sizing with multiple holes, perfect for both casual and formal wear.",
    shortDescription: "Classic genuine leather belt with simple buckle",
    sku: "ACC-003-BLT",
    basePrice: 49.99,
    discountPrice: 39.99,
    status: "active",
    soldCount: 720,
    publishedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
    images: [
      {
        url: "https://images.unsplash.com/photo-1624222247344-550fb60583fd?w=800&h=800&fit=crop",
        alt: "Leather Belt",
        isPrimary: true,
      },
    ],
    attributes: [
      { name: "Material", value: "Genuine Leather" },
      { name: "Width", value: "1.5 inches" },
      { name: "Size", value: "32, 34, 36, 38, 40, 42" },
    ],
    seoTitle: "Leather Belt - Classic Accessory",
    seoDescription:
      "Shop genuine leather belts. Classic design, perfect for everyday wear.",
    seoKeywords: ["belt", "leather belt", "accessories", "men's belt"],
    categorySlug: "accessories",
  },
  {
    name: "Polo Shirt",
    slug: "polo-shirt",
    description:
      "Classic polo shirt in navy blue. Made from breathable piqué cotton fabric, this versatile shirt features a three-button placket and ribbed collar. Perfect for casual Fridays, weekends, or smart casual occasions.",
    shortDescription: "Classic navy blue polo shirt in piqué cotton",
    sku: "POL-001-NVY",
    basePrice: 45.99,
    status: "active",
    soldCount: 1100,
    publishedAt: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000), // 16 days ago
    images: [
      {
        url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop",
        alt: "Polo Shirt",
        isPrimary: true,
      },
    ],
    attributes: [
      { name: "Material", value: "Piqué Cotton" },
      { name: "Color", value: "Navy Blue" },
      { name: "Size", value: "S, M, L, XL, XXL" },
    ],
    seoTitle: "Polo Shirt - Classic Navy Blue",
    seoDescription:
      "Shop classic polo shirts. Piqué cotton fabric, perfect for casual wear.",
    seoKeywords: ["polo", "polo shirt", "casual shirt", "navy blue"],
    categorySlug: "mens-clothing",
  },
  {
    name: "Maxi Dress",
    slug: "maxi-dress",
    description:
      "Elegant maxi dress in a beautiful floral pattern. Made from lightweight, flowy fabric that drapes beautifully. Features a v-neckline, adjustable straps, and an empire waist for a flattering silhouette. Perfect for summer events or beach vacations.",
    shortDescription: "Elegant floral maxi dress with v-neckline",
    sku: "DRS-002-MAX",
    basePrice: 89.99,
    discountPrice: 74.99,
    status: "active",
    soldCount: 540,
    publishedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago (NEW)
    images: [
      {
        url: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&h=800&fit=crop",
        alt: "Maxi Dress",
        isPrimary: true,
      },
    ],
    attributes: [
      { name: "Material", value: "Polyester" },
      { name: "Length", value: "Maxi" },
      { name: "Size", value: "XS, S, M, L, XL" },
    ],
    seoTitle: "Maxi Dress - Elegant Floral Design",
    seoDescription:
      "Shop elegant maxi dresses. Flowing fabric, perfect for summer occasions.",
    seoKeywords: ["maxi dress", "floral dress", "summer dress", "beach dress"],
    categorySlug: "womens-clothing",
  },
  {
    name: "High-Top Sneakers",
    slug: "high-top-sneakers",
    description:
      "Stylish high-top sneakers with a retro design. Features a canvas upper, padded collar for ankle support, and a classic rubber outsole. Versatile style that pairs with jeans, shorts, or casual pants. Perfect for street style enthusiasts.",
    shortDescription: "Retro-style high-top canvas sneakers",
    sku: "SHO-005-HGT",
    basePrice: 64.99,
    status: "active",
    soldCount: 830,
    publishedAt: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000), // 19 days ago
    images: [
      {
        url: "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800&h=800&fit=crop",
        alt: "High-Top Sneakers",
        isPrimary: true,
      },
    ],
    attributes: [
      { name: "Material", value: "Canvas" },
      { name: "Style", value: "High-Top" },
      { name: "Size", value: "7, 8, 9, 10, 11" },
    ],
    seoTitle: "High-Top Sneakers - Retro Style",
    seoDescription:
      "Shop retro-style high-top sneakers. Canvas upper, perfect for casual wear.",
    seoKeywords: ["sneakers", "high-top", "canvas shoes", "retro style"],
    categorySlug: "shoes",
  },
  {
    name: "Wristwatch",
    slug: "wristwatch",
    description:
      "Classic analog wristwatch with a leather strap. Features a minimalist dial design, date window, and water resistance up to 50 meters. Powered by reliable quartz movement. Perfect for everyday wear, combining style and functionality.",
    shortDescription: "Classic analog wristwatch with leather strap",
    sku: "ACC-004-WTC",
    basePrice: 159.99,
    discountPrice: 129.99,
    status: "active",
    soldCount: 290,
    publishedAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000), // 11 days ago
    images: [
      {
        url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=800&fit=crop",
        alt: "Wristwatch",
        isPrimary: true,
      },
    ],
    attributes: [
      { name: "Movement", value: "Quartz" },
      { name: "Water Resistance", value: "50 meters" },
      { name: "Strap Material", value: "Leather" },
    ],
    seoTitle: "Wristwatch - Classic Analog Design",
    seoDescription:
      "Shop classic wristwatches. Leather strap, perfect for everyday wear.",
    seoKeywords: ["watch", "wristwatch", "analog watch", "leather strap"],
    categorySlug: "accessories",
  },
  {
    name: "Hooded Sweatshirt",
    slug: "hooded-sweatshirt",
    description:
      "Comfortable hooded sweatshirt in gray color. Made from soft cotton blend fabric with a cozy fleece lining. Features a drawstring hood, front kangaroo pocket, and ribbed cuffs and hem. Perfect for casual wear, lounging, or layering.",
    shortDescription: "Cozy hooded sweatshirt with fleece lining",
    sku: "HOD-001-GRY",
    basePrice: 54.99,
    status: "active",
    soldCount: 1450,
    publishedAt: new Date(Date.now() - 24 * 24 * 60 * 60 * 1000), // 24 days ago
    images: [
      {
        url: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=800&fit=crop",
        alt: "Hooded Sweatshirt",
        isPrimary: true,
      },
    ],
    attributes: [
      { name: "Material", value: "Cotton Blend" },
      { name: "Color", value: "Gray" },
      { name: "Size", value: "S, M, L, XL, XXL" },
    ],
    seoTitle: "Hooded Sweatshirt - Comfortable & Cozy",
    seoDescription:
      "Shop comfortable hooded sweatshirts. Fleece lining, perfect for casual wear.",
    seoKeywords: ["hoodie", "sweatshirt", "hooded", "casual wear"],
    categorySlug: "mens-clothing",
  },
];

// Product Variants data
export const productVariantsData: SeedProductVariant[] = [
  // T-Shirt variants
  {
    sku: "TSH-001-WHT-S",
    name: "White - Small",
    basePrice: 29.99,
    stock: 50,
    attributes: [
      { name: "Color", value: "White" },
      { name: "Size", value: "Small" },
    ],
    isDefault: true,
    productSlug: "classic-white-cotton-t-shirt",
  },
  {
    sku: "TSH-001-WHT-M",
    name: "White - Medium",
    basePrice: 29.99,
    stock: 75,
    attributes: [
      { name: "Color", value: "White" },
      { name: "Size", value: "Medium" },
    ],
    isDefault: false,
    productSlug: "classic-white-cotton-t-shirt",
  },
  {
    sku: "TSH-001-WHT-L",
    name: "White - Large",
    basePrice: 29.99,
    stock: 60,
    attributes: [
      { name: "Color", value: "White" },
      { name: "Size", value: "Large" },
    ],
    isDefault: false,
    productSlug: "classic-white-cotton-t-shirt",
  },
  {
    sku: "TSH-001-BLK-S",
    name: "Black - Small",
    basePrice: 29.99,
    stock: 40,
    attributes: [
      { name: "Color", value: "Black" },
      { name: "Size", value: "Small" },
    ],
    isDefault: false,
    productSlug: "classic-white-cotton-t-shirt",
  },
  {
    sku: "TSH-001-BLK-M",
    name: "Black - Medium",
    basePrice: 29.99,
    stock: 55,
    attributes: [
      { name: "Color", value: "Black" },
      { name: "Size", value: "Medium" },
    ],
    isDefault: false,
    productSlug: "classic-white-cotton-t-shirt",
  },
  // Jeans variants
  {
    sku: "JEA-001-BLU-30",
    name: "Blue - Waist 30",
    basePrice: 89.99,
    discountPrice: 79.99,
    stock: 25,
    attributes: [
      { name: "Size", value: "30" },
      { name: "Length", value: "32" },
    ],
    isDefault: true,
    productSlug: "slim-fit-blue-denim-jeans",
  },
  {
    sku: "JEA-001-BLU-32",
    name: "Blue - Waist 32",
    basePrice: 89.99,
    discountPrice: 79.99,
    stock: 35,
    attributes: [
      { name: "Size", value: "32" },
      { name: "Length", value: "32" },
    ],
    isDefault: false,
    productSlug: "slim-fit-blue-denim-jeans",
  },
  {
    sku: "JEA-001-BLU-34",
    name: "Blue - Waist 34",
    basePrice: 89.99,
    stock: 30,
    attributes: [
      { name: "Size", value: "34" },
      { name: "Length", value: "32" },
    ],
    isDefault: false,
    productSlug: "slim-fit-blue-denim-jeans",
  },
  // Sneakers variants
  {
    sku: "SHO-002-CNV-8",
    name: "Canvas Sneakers - Size 8",
    basePrice: 49.99,
    stock: 100,
    attributes: [
      { name: "Size", value: "8" },
      { name: "Color", value: "White" },
    ],
    isDefault: true,
    productSlug: "casual-canvas-sneakers",
  },
  {
    sku: "SHO-002-CNV-9",
    name: "Canvas Sneakers - Size 9",
    basePrice: 49.99,
    stock: 85,
    attributes: [
      { name: "Size", value: "9" },
      { name: "Color", value: "White" },
    ],
    isDefault: false,
    productSlug: "casual-canvas-sneakers",
  },
  {
    sku: "SHO-002-CNV-10",
    name: "Canvas Sneakers - Size 10",
    basePrice: 49.99,
    stock: 90,
    attributes: [
      { name: "Size", value: "10" },
      { name: "Color", value: "White" },
    ],
    isDefault: false,
    productSlug: "casual-canvas-sneakers",
  },
];
