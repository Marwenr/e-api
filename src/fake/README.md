# Fake Data Seeder

Script pour insérer des données factices dans la base de données pour tester l'application.

## Structure

- `seedData.ts` - Contient toutes les données factices (categories, products, variants)
- `seed.ts` - Script principal pour insérer les données dans MongoDB

## Utilisation

### Option 1: Avec npm script (recommandé)

```bash
# Avec ts-node
npm run seed

# Avec tsx (si installé)
npm run seed:dev
```

### Option 2: Exécution directe

```bash
# Avec ts-node
npx ts-node -r dotenv/config src/fake/seed.ts

# Avec tsx
npx tsx src/fake/seed.ts
```

## Ce qui est inséré

1. **Categories** (4 catégories)

   - Men's Clothing
   - Women's Clothing
   - Accessories
   - Shoes

2. **Products** (6 produits)

   - Classic White Cotton T-Shirt
   - Slim Fit Blue Denim Jeans
   - Floral Print Summer Dress
   - Casual Canvas Sneakers
   - Black Leather Jacket
   - Wireless Bluetooth Headphones

3. **Product Variants** (11 variants)
   - Variants pour les t-shirts (tailles et couleurs)
   - Variants pour les jeans (tailles)
   - Variants pour les sneakers (tailles)

## ⚠️ Attention

**Le script supprime toutes les données existantes** avant d'insérer les nouvelles données. Si vous voulez garder vos données existantes, modifiez le script pour commenter la section de suppression.

## Configuration

Assurez-vous que `MONGODB_URI` est défini dans votre fichier `.env` :

```env
MONGODB_URI=mongodb://localhost:27017/ecommerce
```

## Ajouter plus de données

Pour ajouter plus de données, modifiez les fichiers :

- `seedData.ts` - Ajoutez vos données dans les tableaux `categoriesData`, `productsData`, `productVariantsData`

## Exemple de données

### Category

```typescript
{
  name: "Category Name",
  slug: "category-slug",
  description: "Category description",
  isActive: true,
}
```

### Product

```typescript
{
  name: "Product Name",
  slug: "product-slug",
  description: "Full description",
  shortDescription: "Short description",
  sku: "SKU-001",
  basePrice: 99.99,
  discountPrice: 79.99, // optional
  status: "active", // "draft" | "active" | "archived"
  soldCount: 100,
  publishedAt: new Date(), // optional
  images: [
    {
      url: "https://example.com/image.jpg",
      alt: "Image description",
      isPrimary: true,
    }
  ],
  attributes: [
    { name: "Material", value: "Cotton" }
  ],
  categorySlug: "mens-clothing", // Will be converted to categoryId
  seoTitle: "SEO Title", // optional
  seoDescription: "SEO Description", // optional
  seoKeywords: ["keyword1", "keyword2"], // optional
}
```

### Product Variant

```typescript
{
  sku: "SKU-001-VAR-1",
  name: "Variant Name", // optional
  basePrice: 99.99,
  discountPrice: 79.99, // optional
  stock: 50,
  attributes: [
    { name: "Size", value: "Large" },
    { name: "Color", value: "Red" }
  ],
  images: ["https://example.com/variant.jpg"], // optional
  isDefault: true, // Only one variant per product can be default
  productSlug: "product-slug", // Will be converted to productId
}
```
