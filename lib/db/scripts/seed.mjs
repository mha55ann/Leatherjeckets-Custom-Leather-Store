import pg from "pg";

const { Pool } = pg;
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL must be set before seeding the catalog.");
}

const products = [
  {
    id: "heritage-biker",
    slug: "heritage-biker",
    name: "The Heritage Biker",
    category: "Biker",
    description:
      "A clean, hand-cut motorcycle jacket in full-grain cowhide. Finished with polished hardware and a shape that wears in beautifully.",
    priceCents: 24800,
    leatherType: "Full-grain cowhide",
    color: "Onyx black",
    imageUrl: "/images/biker-jacket.jpg",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    productionDays: 12,
    badge: "Bestseller",
    featured: true,
  },
  {
    id: "atelier-bomber",
    slug: "atelier-bomber",
    name: "The Atelier Bomber",
    category: "Bomber",
    description:
      "An easy, refined bomber in supple cognac leather, made in small batches by our workshop team.",
    priceCents: 22800,
    leatherType: "Supple sheepskin",
    color: "Cognac",
    imageUrl: "/images/bomber-jacket.jpg",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    productionDays: 10,
    badge: "Made to order",
    featured: true,
  },
  {
    id: "aviator-shearling",
    slug: "aviator-shearling",
    name: "The Shearling Aviator",
    category: "Aviator",
    description:
      "A substantial aviator silhouette with a warm shearling collar and deep espresso leather, crafted for colder days.",
    priceCents: 29500,
    leatherType: "Espresso cowhide",
    color: "Espresso",
    imageUrl: "/images/aviator-jacket.jpg",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    productionDays: 16,
    badge: "Cold-weather",
    featured: true,
  },
  {
    id: "tailored-moto",
    slug: "tailored-moto",
    name: "The Tailored Moto",
    category: "Moto",
    description:
      "A pared-back moto jacket with a close, considered fit. Choose your leather, hardware, and made-to-measure options.",
    priceCents: 23500,
    leatherType: "Premium goatskin",
    color: "Onyx black",
    imageUrl: "/images/moto-jacket.jpg",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    productionDays: 14,
    badge: null,
    featured: false,
  },
];

const pool = new Pool({ connectionString });

try {
  const client = await pool.connect();
  try {
    for (const product of products) {
      await client.query(
        `INSERT INTO products
          (id, slug, name, category, description, price_cents, currency, leather_type, color, image_url, sizes, production_days, badge, featured)
         VALUES
          ($1, $2, $3, $4, $5, $6, 'USD', $7, $8, $9, $10, $11, $12, $13)
         ON CONFLICT (id) DO NOTHING`,
        [
          product.id,
          product.slug,
          product.name,
          product.category,
          product.description,
          product.priceCents,
          product.leatherType,
          product.color,
          product.imageUrl,
          product.sizes,
          product.productionDays,
          product.badge,
          product.featured,
        ],
      );
    }
    process.stdout.write(`Seeded ${products.length} sample Leatherjeckets products.\n`);
  } finally {
    client.release();
  }
} finally {
  await pool.end();
}
