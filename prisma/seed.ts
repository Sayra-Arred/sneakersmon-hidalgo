import { PrismaClient, ProductStatus, DropStatus, CouponType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  await prisma.$connect();

  console.log("🌱 Starting seed...");

  // ─────────────────────────────────────────────
  // BRANDS
  // ─────────────────────────────────────────────

  const nike = await prisma.brand.upsert({
    where: { slug: "nike" },
    update: {},
    create: {
      name: "Nike",
      slug: "nike",
      logo: "https://cdn.sneakersmon.mx/brands/nike.svg",
      description: "Just Do It. Nike is the world's leading athletic footwear and apparel brand.",
      isActive: true,
    },
  });

  const jordan = await prisma.brand.upsert({
    where: { slug: "jordan-brand" },
    update: {},
    create: {
      name: "Jordan Brand",
      slug: "jordan-brand",
      logo: "https://cdn.sneakersmon.mx/brands/jordan.svg",
      description: "Jordan Brand is a premium footwear and athletic apparel brand inspired by the legacy of Michael Jordan.",
      isActive: true,
    },
  });

  const adidas = await prisma.brand.upsert({
    where: { slug: "adidas" },
    update: {},
    create: {
      name: "Adidas",
      slug: "adidas",
      logo: "https://cdn.sneakersmon.mx/brands/adidas.svg",
      description: "Impossible is nothing. Adidas is a global leader in sportswear and lifestyle footwear.",
      isActive: true,
    },
  });

  console.log("✅ Brands seeded:", nike.name, jordan.name, adidas.name);

  // ─────────────────────────────────────────────
  // CATEGORIES
  // ─────────────────────────────────────────────

  const catRunning = await prisma.category.upsert({
    where: { slug: "running" },
    update: {},
    create: {
      name: "Running",
      slug: "running",
      description: "Performance running shoes engineered for speed and endurance.",
      image: "https://cdn.sneakersmon.mx/categories/running.jpg",
      isActive: true,
      sortOrder: 1,
    },
  });

  const catBasketball = await prisma.category.upsert({
    where: { slug: "basketball" },
    update: {},
    create: {
      name: "Basketball",
      slug: "basketball",
      description: "Court-ready basketball shoes with superior grip and ankle support.",
      image: "https://cdn.sneakersmon.mx/categories/basketball.jpg",
      isActive: true,
      sortOrder: 2,
    },
  });

  const catLifestyle = await prisma.category.upsert({
    where: { slug: "lifestyle" },
    update: {},
    create: {
      name: "Lifestyle",
      slug: "lifestyle",
      description: "Iconic silhouettes for everyday wear and street style.",
      image: "https://cdn.sneakersmon.mx/categories/lifestyle.jpg",
      isActive: true,
      sortOrder: 3,
    },
  });

  const catLimited = await prisma.category.upsert({
    where: { slug: "limited-edition" },
    update: {},
    create: {
      name: "Limited Edition",
      slug: "limited-edition",
      description: "Exclusive drops and collaboration pieces for the true collector.",
      image: "https://cdn.sneakersmon.mx/categories/limited.jpg",
      isActive: true,
      sortOrder: 4,
    },
  });

  console.log("✅ Categories seeded:", catRunning.name, catBasketball.name, catLifestyle.name, catLimited.name);

  // ─────────────────────────────────────────────
  // PRODUCTS + VARIANTS + INVENTORY
  // ─────────────────────────────────────────────

  // Product 1 — Nike Air Max 270
  const airMax270 = await prisma.product.upsert({
    where: { slug: "nike-air-max-270" },
    update: {},
    create: {
      name: "Nike Air Max 270",
      slug: "nike-air-max-270",
      description:
        "The Nike Air Max 270 delivers unrivaled underfoot cushioning with the largest Air unit ever seen in a lifestyle shoe. The mesh upper with a neoprene inner sleeve provides a sock-like fit while keeping your foot cool. A rubber outsole adds traction and durability.",
      shortDescription: "Max Air heel cushioning for all-day comfort.",
      brandId: nike.id,
      categoryId: catLifestyle.id,
      gender: "Unisex",
      season: "SS2025",
      colorway: "Black/White",
      price: 3299,
      compareAtPrice: 3799,
      cost: 1650,
      sku: "AM270-BLK-WHT",
      status: ProductStatus.ACTIVE,
      isFeatured: true,
      isNewArrival: true,
      isBestSeller: true,
      tags: ["air-max", "cushioning", "lifestyle", "bestseller"],
      metaTitle: "Nike Air Max 270 | Sneakersmon Hidalgo",
      metaDescription: "Compra el Nike Air Max 270 con envío a todo México. El mayor Air Unit en un zapato lifestyle.",
      sortOrder: 1,
      images: {
        create: [
          {
            url: "https://cdn.sneakersmon.mx/products/am270/1.jpg",
            altText: "Nike Air Max 270 Black White - lateral view",
            order: 0,
            isPrimary: true,
          },
          {
            url: "https://cdn.sneakersmon.mx/products/am270/2.jpg",
            altText: "Nike Air Max 270 Black White - medial view",
            order: 1,
          },
          {
            url: "https://cdn.sneakersmon.mx/products/am270/3.jpg",
            altText: "Nike Air Max 270 Black White - sole view",
            order: 2,
          },
        ],
      },
      variants: {
        create: [
          { size: "25.5", sku: "AM270-BLK-WHT-255", isActive: true },
          { size: "26", sku: "AM270-BLK-WHT-260", isActive: true },
          { size: "26.5", sku: "AM270-BLK-WHT-265", isActive: true },
          { size: "27", sku: "AM270-BLK-WHT-270", isActive: true },
          { size: "27.5", sku: "AM270-BLK-WHT-275", isActive: true },
          { size: "28", sku: "AM270-BLK-WHT-280", isActive: true },
          { size: "28.5", sku: "AM270-BLK-WHT-285", isActive: true },
          { size: "29", sku: "AM270-BLK-WHT-290", isActive: true },
        ],
      },
    },
    include: { variants: true },
  });

  // Product 2 — Air Jordan 1 Retro High OG
  const aj1 = await prisma.product.upsert({
    where: { slug: "air-jordan-1-retro-high-og-chicago" },
    update: {},
    create: {
      name: "Air Jordan 1 Retro High OG Chicago",
      slug: "air-jordan-1-retro-high-og-chicago",
      description:
        "The Air Jordan 1 Retro High OG Chicago brings back one of the most iconic colorways in sneaker history. Premium leather upper, encapsulated Air-Sole unit, and the classic Wings logo on the ankle make this a must-have for any serious collector.",
      shortDescription: "The Chicago colorway that started it all.",
      brandId: jordan.id,
      categoryId: catLimited.id,
      gender: "Hombre",
      season: "FW2024",
      colorway: "Varsity Red/White/Black",
      price: 6499,
      compareAtPrice: null,
      cost: 3200,
      sku: "AJ1-CHI-2024",
      status: ProductStatus.ACTIVE,
      isFeatured: true,
      isLimitedEdition: true,
      isBestSeller: false,
      isNewArrival: false,
      tags: ["jordan", "chicago", "limited", "og", "retro"],
      metaTitle: "Air Jordan 1 Retro High OG Chicago | Sneakersmon Hidalgo",
      metaDescription: "El Air Jordan 1 Chicago en su versión OG. Stock limitado. Envío express a todo México.",
      sortOrder: 2,
      images: {
        create: [
          {
            url: "https://cdn.sneakersmon.mx/products/aj1-chi/1.jpg",
            altText: "Air Jordan 1 Chicago - lateral",
            order: 0,
            isPrimary: true,
          },
          {
            url: "https://cdn.sneakersmon.mx/products/aj1-chi/2.jpg",
            altText: "Air Jordan 1 Chicago - medial",
            order: 1,
          },
        ],
      },
      variants: {
        create: [
          { size: "26", sku: "AJ1-CHI-260", isActive: true },
          { size: "27", sku: "AJ1-CHI-270", isActive: true },
          { size: "28", sku: "AJ1-CHI-280", isActive: true },
          { size: "29", sku: "AJ1-CHI-290", isActive: true },
          { size: "30", sku: "AJ1-CHI-300", isActive: true },
        ],
      },
    },
    include: { variants: true },
  });

  // Product 3 — Adidas Yeezy Boost 350 V2
  const yeezy350 = await prisma.product.upsert({
    where: { slug: "adidas-yeezy-boost-350-v2-zebra" },
    update: {},
    create: {
      name: "Adidas Yeezy Boost 350 V2 Zebra",
      slug: "adidas-yeezy-boost-350-v2-zebra",
      description:
        "The Adidas Yeezy Boost 350 V2 in Zebra features a white Primeknit upper with black stripe detailing and a semi-translucent midsole that exposes the full-length BOOST cushioning. A SPLY-350 graphic across the lateral side completes the iconic look.",
      shortDescription: "Full-length BOOST with iconic Primeknit construction.",
      brandId: adidas.id,
      categoryId: catLifestyle.id,
      gender: "Unisex",
      season: "SS2025",
      colorway: "White/Core Black/Red",
      price: 5799,
      compareAtPrice: 6200,
      cost: 2900,
      sku: "YZY350-V2-ZBR",
      status: ProductStatus.ACTIVE,
      isFeatured: false,
      isLimitedEdition: true,
      isBestSeller: true,
      isNewArrival: false,
      tags: ["yeezy", "boost", "kanye", "primeknit", "limited"],
      metaTitle: "Yeezy Boost 350 V2 Zebra | Sneakersmon Hidalgo",
      metaDescription: "Yeezy Boost 350 V2 Zebra auténtico. Autenticidad garantizada. Envío a todo México.",
      sortOrder: 3,
      images: {
        create: [
          {
            url: "https://cdn.sneakersmon.mx/products/yeezy350-zebra/1.jpg",
            altText: "Yeezy 350 V2 Zebra - lateral",
            order: 0,
            isPrimary: true,
          },
          {
            url: "https://cdn.sneakersmon.mx/products/yeezy350-zebra/2.jpg",
            altText: "Yeezy 350 V2 Zebra - top view",
            order: 1,
          },
        ],
      },
      variants: {
        create: [
          { size: "25", sku: "YZY350-ZBR-250", isActive: true },
          { size: "25.5", sku: "YZY350-ZBR-255", isActive: true },
          { size: "26", sku: "YZY350-ZBR-260", isActive: true },
          { size: "26.5", sku: "YZY350-ZBR-265", isActive: true },
          { size: "27", sku: "YZY350-ZBR-270", isActive: true },
          { size: "27.5", sku: "YZY350-ZBR-275", isActive: true },
          { size: "28", sku: "YZY350-ZBR-280", isActive: true },
        ],
      },
    },
    include: { variants: true },
  });

  // Product 4 — Nike Pegasus 41
  const pegasus41 = await prisma.product.upsert({
    where: { slug: "nike-pegasus-41" },
    update: {},
    create: {
      name: "Nike Pegasus 41",
      slug: "nike-pegasus-41",
      description:
        "The Nike Pegasus 41 is your reliable everyday trainer, now with React X foam for a springier ride. The engineered mesh upper with a wider toe box provides a comfortable, roomy fit for long-distance runs.",
      shortDescription: "Your daily trainer just got a spring upgrade.",
      brandId: nike.id,
      categoryId: catRunning.id,
      gender: "Hombre",
      season: "SS2025",
      colorway: "Wolf Grey/White/Particle Grey",
      price: 2799,
      compareAtPrice: 3100,
      cost: 1400,
      sku: "PEG41-GRY-WHT",
      status: ProductStatus.ACTIVE,
      isFeatured: false,
      isLimitedEdition: false,
      isBestSeller: false,
      isNewArrival: true,
      tags: ["running", "pegasus", "everyday", "react"],
      metaTitle: "Nike Pegasus 41 | Sneakersmon Hidalgo",
      metaDescription: "Nike Pegasus 41 para correr todos los días. React X foam para mayor respuesta y comodidad.",
      sortOrder: 4,
      images: {
        create: [
          {
            url: "https://cdn.sneakersmon.mx/products/peg41/1.jpg",
            altText: "Nike Pegasus 41 Grey - lateral",
            order: 0,
            isPrimary: true,
          },
        ],
      },
      variants: {
        create: [
          { size: "25.5", sku: "PEG41-GRY-255", isActive: true },
          { size: "26", sku: "PEG41-GRY-260", isActive: true },
          { size: "26.5", sku: "PEG41-GRY-265", isActive: true },
          { size: "27", sku: "PEG41-GRY-270", isActive: true },
          { size: "27.5", sku: "PEG41-GRY-275", isActive: true },
          { size: "28", sku: "PEG41-GRY-280", isActive: true },
          { size: "28.5", sku: "PEG41-GRY-285", isActive: true },
          { size: "29", sku: "PEG41-GRY-290", isActive: true },
          { size: "30", sku: "PEG41-GRY-300", isActive: true },
        ],
      },
    },
    include: { variants: true },
  });

  // Product 5 — Air Jordan 11 Retro Low IE
  const aj11 = await prisma.product.upsert({
    where: { slug: "air-jordan-11-retro-low-ie-bred" },
    update: {},
    create: {
      name: "Air Jordan 11 Retro Low IE Bred",
      slug: "air-jordan-11-retro-low-ie-bred",
      description:
        "The Air Jordan 11 Retro Low IE Bred brings back the classic Black/Red colorway in a low-top silhouette. Featuring a patent leather mudguard, Phylon midsole, and full-length Air-Sole unit, this is the quintessential Jordan for basketball courts and city streets alike.",
      shortDescription: "Patent leather and Bred colors in a low-top Jordan classic.",
      brandId: jordan.id,
      categoryId: catBasketball.id,
      gender: "Hombre",
      season: "FW2024",
      colorway: "Black/True Red/White",
      price: 4999,
      compareAtPrice: 5499,
      cost: 2500,
      sku: "AJ11-LOW-BRED",
      status: ProductStatus.ACTIVE,
      isFeatured: true,
      isLimitedEdition: false,
      isBestSeller: true,
      isNewArrival: false,
      tags: ["jordan", "bred", "basketball", "patent-leather"],
      metaTitle: "Air Jordan 11 Low IE Bred | Sneakersmon Hidalgo",
      metaDescription: "Air Jordan 11 Low IE en colorway Bred. Cuero patente y Air en el talón. Stock limitado.",
      sortOrder: 5,
      images: {
        create: [
          {
            url: "https://cdn.sneakersmon.mx/products/aj11-bred/1.jpg",
            altText: "Air Jordan 11 Low Bred - lateral",
            order: 0,
            isPrimary: true,
          },
          {
            url: "https://cdn.sneakersmon.mx/products/aj11-bred/2.jpg",
            altText: "Air Jordan 11 Low Bred - top",
            order: 1,
          },
        ],
      },
      variants: {
        create: [
          { size: "26", sku: "AJ11-BRED-260", isActive: true },
          { size: "26.5", sku: "AJ11-BRED-265", isActive: true },
          { size: "27", sku: "AJ11-BRED-270", isActive: true },
          { size: "27.5", sku: "AJ11-BRED-275", isActive: true },
          { size: "28", sku: "AJ11-BRED-280", isActive: true },
          { size: "28.5", sku: "AJ11-BRED-285", isActive: true },
          { size: "29", sku: "AJ11-BRED-290", isActive: true },
        ],
      },
    },
    include: { variants: true },
  });

  // Seed Inventory for all variants
  const allProducts = [airMax270, aj1, yeezy350, pegasus41, aj11];
  const inventoryData: { variantId: string; quantity: number }[] = [
    // Air Max 270 (8 variants) — healthy stock
    { variantId: airMax270.variants[0].id, quantity: 12 },
    { variantId: airMax270.variants[1].id, quantity: 18 },
    { variantId: airMax270.variants[2].id, quantity: 15 },
    { variantId: airMax270.variants[3].id, quantity: 20 },
    { variantId: airMax270.variants[4].id, quantity: 14 },
    { variantId: airMax270.variants[5].id, quantity: 10 },
    { variantId: airMax270.variants[6].id, quantity: 8 },
    { variantId: airMax270.variants[7].id, quantity: 5 },
    // AJ1 Chicago (5 variants) — limited stock
    { variantId: aj1.variants[0].id, quantity: 3 },
    { variantId: aj1.variants[1].id, quantity: 2 },
    { variantId: aj1.variants[2].id, quantity: 4 },
    { variantId: aj1.variants[3].id, quantity: 1 },
    { variantId: aj1.variants[4].id, quantity: 2 },
    // Yeezy 350 Zebra (7 variants)
    { variantId: yeezy350.variants[0].id, quantity: 6 },
    { variantId: yeezy350.variants[1].id, quantity: 8 },
    { variantId: yeezy350.variants[2].id, quantity: 7 },
    { variantId: yeezy350.variants[3].id, quantity: 5 },
    { variantId: yeezy350.variants[4].id, quantity: 9 },
    { variantId: yeezy350.variants[5].id, quantity: 4 },
    { variantId: yeezy350.variants[6].id, quantity: 3 },
    // Pegasus 41 (9 variants) — high stock
    { variantId: pegasus41.variants[0].id, quantity: 25 },
    { variantId: pegasus41.variants[1].id, quantity: 30 },
    { variantId: pegasus41.variants[2].id, quantity: 28 },
    { variantId: pegasus41.variants[3].id, quantity: 35 },
    { variantId: pegasus41.variants[4].id, quantity: 22 },
    { variantId: pegasus41.variants[5].id, quantity: 18 },
    { variantId: pegasus41.variants[6].id, quantity: 12 },
    { variantId: pegasus41.variants[7].id, quantity: 8 },
    { variantId: pegasus41.variants[8].id, quantity: 5 },
    // AJ11 Bred (7 variants)
    { variantId: aj11.variants[0].id, quantity: 8 },
    { variantId: aj11.variants[1].id, quantity: 10 },
    { variantId: aj11.variants[2].id, quantity: 12 },
    { variantId: aj11.variants[3].id, quantity: 9 },
    { variantId: aj11.variants[4].id, quantity: 7 },
    { variantId: aj11.variants[5].id, quantity: 5 },
    { variantId: aj11.variants[6].id, quantity: 3 },
  ];

  for (const inv of inventoryData) {
    await prisma.inventory.upsert({
      where: { variantId: inv.variantId },
      update: { quantity: inv.quantity },
      create: {
        variantId: inv.variantId,
        quantity: inv.quantity,
        reserved: 0,
      },
    });
  }

  console.log("✅ Products, variants and inventory seeded:", allProducts.map((p) => p.name).join(", "));

  // ─────────────────────────────────────────────
  // ADMIN USER
  // ─────────────────────────────────────────────

  const hashedPassword = await bcrypt.hash("Admin123!", 12);

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@sneakersmon.mx" },
    update: {},
    create: {
      name: "Admin Sneakersmon",
      email: "admin@sneakersmon.mx",
      password: hashedPassword,
      role: "ADMIN",
      isActive: true,
      emailVerified: new Date(),
    },
  });

  console.log("✅ Admin user seeded:", adminUser.email);

  // ─────────────────────────────────────────────
  // COUPONS
  // ─────────────────────────────────────────────

  const coupon1 = await prisma.coupon.upsert({
    where: { code: "BIENVENIDO15" },
    update: {},
    create: {
      code: "BIENVENIDO15",
      description: "15% de descuento en tu primera compra",
      type: CouponType.PERCENTAGE,
      value: 15,
      minOrder: 1000,
      maxUses: 500,
      usedCount: 0,
      isActive: true,
      isPublic: true,
      startsAt: new Date("2025-01-01"),
      expiresAt: new Date("2025-12-31"),
    },
  });

  const coupon2 = await prisma.coupon.upsert({
    where: { code: "ENVIOGRATIS" },
    update: {},
    create: {
      code: "ENVIOGRATIS",
      description: "Envío gratis en compras mayores a $2,000 MXN",
      type: CouponType.SHIPPING,
      value: 199,
      minOrder: 2000,
      maxUses: 1000,
      usedCount: 0,
      isActive: true,
      isPublic: true,
      startsAt: new Date("2025-01-01"),
      expiresAt: new Date("2025-12-31"),
    },
  });

  const coupon3 = await prisma.coupon.upsert({
    where: { code: "VIP500" },
    update: {},
    create: {
      code: "VIP500",
      description: "$500 de descuento exclusivo para clientes VIP",
      type: CouponType.VIP,
      value: 500,
      minOrder: 3000,
      maxUses: 50,
      usedCount: 0,
      isActive: true,
      isPublic: false,
      startsAt: new Date("2025-01-01"),
      expiresAt: new Date("2025-06-30"),
    },
  });

  console.log("✅ Coupons seeded:", coupon1.code, coupon2.code, coupon3.code);

  // ─────────────────────────────────────────────
  // DROPS
  // ─────────────────────────────────────────────

  const drop1 = await prisma.drop.upsert({
    where: { slug: "nike-air-max-day-2025" },
    update: {},
    create: {
      name: "Nike Air Max Day 2025",
      slug: "nike-air-max-day-2025",
      description:
        "Celebra el Air Max Day con los lanzamientos más exclusivos de Nike. Tres colorways únicos del Air Max 1, Air Max 90, y Air Max 95 disponibles por tiempo limitado solo en Sneakersmon Hidalgo. Regístrate para asegurar tu par antes que nadie.",
      releaseDate: new Date("2025-03-26T10:00:00-06:00"),
      price: 3999,
      status: DropStatus.UPCOMING,
      coverImage: "https://cdn.sneakersmon.mx/drops/amd-2025/cover.jpg",
      images: [
        "https://cdn.sneakersmon.mx/drops/amd-2025/1.jpg",
        "https://cdn.sneakersmon.mx/drops/amd-2025/2.jpg",
        "https://cdn.sneakersmon.mx/drops/amd-2025/3.jpg",
      ],
      productIds: [airMax270.id],
      isExclusive: true,
      maxPerUser: 1,
    },
  });

  const drop2 = await prisma.drop.upsert({
    where: { slug: "jordan-retro-fest-verano-2025" },
    update: {},
    create: {
      name: "Jordan Retro Fest — Verano 2025",
      slug: "jordan-retro-fest-verano-2025",
      description:
        "El festival de retros más esperado del año. Una colección curada de los mejores Jordan Retro de todos los tiempos, incluyendo el AJ1 Chicago y el AJ11 Bred. Stock limitadísimo. Solo para miembros registrados. Pago exclusivo con Stripe o MercadoPago.",
      releaseDate: new Date("2025-07-15T09:00:00-06:00"),
      price: 5499,
      status: DropStatus.UPCOMING,
      coverImage: "https://cdn.sneakersmon.mx/drops/jordan-fest-25/cover.jpg",
      images: [
        "https://cdn.sneakersmon.mx/drops/jordan-fest-25/1.jpg",
        "https://cdn.sneakersmon.mx/drops/jordan-fest-25/2.jpg",
      ],
      productIds: [aj1.id, aj11.id],
      isExclusive: true,
      maxPerUser: 2,
    },
  });

  console.log("✅ Drops seeded:", drop1.name, drop2.name);

  console.log("🎉 Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
