import { db } from "./db";
import { categories, menuItems } from "@shared/schema";

async function seed() {
  console.log("🌱 Starting comprehensive menu seed...");

  // 1. Clear existing data to prevent duplicates
  await db.delete(menuItems);
  await db.delete(categories);

  // 2. Insert Categories and capture IDs
  const [
    catSalad,
    catDessert,
    catJuice,
    catSoup,
    catSnacks,
    catBiryani,
    catFriedRice,
    catMain,
  ] = await db
    .insert(categories)
    .values([
      { name: "Salad", slug: "salad" },
      { name: "Dessert", slug: "dessert" },
      { name: "Juice", slug: "juice" },
      { name: "Soup", slug: "soup" },
      { name: "Snacks", slug: "snacks" },
      { name: "Biryani", slug: "biryani" },
      { name: "Fried Rice", slug: "fried-rice" },
      { name: "Main Course", slug: "main-course" },
    ])
    .returning();

  // 3. Insert Menu Items with JSONB Prices
  await db.insert(menuItems).values([
    // === SALAD ===
    {
      categoryId: catSalad.id,
      name: "Green Salad",
      prices: { full: 60 },
      imageUrl:
        "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800",
    },
    {
      categoryId: catSalad.id,
      name: "Corn Salad",
      prices: { full: 80 },
      imageUrl:
        "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=800",
    },
    {
      categoryId: catSalad.id,
      name: "Khimchi Salad",
      prices: { full: 120 },
      imageUrl:
        "https://images.unsplash.com/photo-1583137704476-82f19d9b4f9a?w=800",
    },
    {
      categoryId: catSalad.id,
      name: "Plain Curd",
      prices: { full: 20 },
      imageUrl:
        "https://images.unsplash.com/photo-1484417894907-623942c8ee29?w=800",
    },
    {
      categoryId: catSalad.id,
      name: "Mix Veg Raita",
      prices: { full: 80 },
      imageUrl:
        "https://images.unsplash.com/photo-1596797038530-2c39ca917a17?w=800",
    },

    // === DESSERT ===
    {
      categoryId: catDessert.id,
      name: "Shahi Tukada",
      prices: { full: 120 },
      imageUrl:
        "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=800",
    },
    {
      categoryId: catDessert.id,
      name: "Gajar Ka Halwa",
      prices: { full: 100 },
      imageUrl:
        "https://images.unsplash.com/photo-1621348332194-d92290449a58?w=800",
    },
    {
      categoryId: catDessert.id,
      name: "Browny Sunday",
      prices: { full: 250 },
      imageUrl:
        "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800",
    },
    {
      categoryId: catDessert.id,
      name: "Spl. Sizzler",
      prices: { full: 350 },
      imageUrl:
        "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800",
    },

    // === JUICE ===
    {
      categoryId: catJuice.id,
      name: "Fresh Lime Soda",
      prices: { full: 50 },
      imageUrl:
        "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800",
    },
    {
      categoryId: catJuice.id,
      name: "Fresh Lime Juice",
      prices: { full: 40 },
      imageUrl:
        "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800",
    },
    {
      categoryId: catJuice.id,
      name: "Butter Milk",
      prices: { full: 30 },
      imageUrl:
        "https://images.unsplash.com/photo-1600718374662-0483d2b9d40d?w=800",
    },
    {
      categoryId: catJuice.id,
      name: "Lassi",
      prices: { full: 60 },
      imageUrl:
        "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800",
    },
    {
      categoryId: catJuice.id,
      name: "Mint Majento",
      prices: { full: 80 },
      imageUrl:
        "https://images.unsplash.com/photo-1536935338788-846bb9981813?w=800",
    },
    {
      categoryId: catJuice.id,
      name: "Pink Panther",
      prices: { full: 100 },
      imageUrl:
        "https://images.unsplash.com/photo-1497534446932-c94c44f66ad3?w=800",
    },

    // === SOUP ===
    {
      categoryId: catSoup.id,
      name: "Cream Of Tomato Soup",
      prices: { full: 90 },
      imageUrl:
        "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800",
    },
    {
      categoryId: catSoup.id,
      name: "Talmal Soup",
      prices: { full: 90 },
      imageUrl:
        "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800",
    },
    {
      categoryId: catSoup.id,
      name: "Chet Corn Soup",
      prices: { full: 100 },
      imageUrl:
        "https://images.unsplash.com/photo-1614104030967-5ca8363e27e2?w=800",
    },
    {
      categoryId: catSoup.id,
      name: "Veg Manchow Soup",
      prices: { full: 90 },
      imageUrl:
        "https://images.unsplash.com/photo-1614104030967-5ca8363e27e2?w=800",
    },
    {
      categoryId: catSoup.id,
      name: "Veg Tamyam Soup",
      prices: { full: 90 },
      imageUrl:
        "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800",
    },
    {
      categoryId: catSoup.id,
      name: "Veg Clear Soup",
      prices: { full: 60 },
      imageUrl:
        "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800",
    },
    {
      categoryId: catSoup.id,
      name: "Lemon Corriender Soup",
      prices: { full: 100 },
      imageUrl:
        "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800",
    },
    {
      categoryId: catSoup.id,
      name: "Veg Sweetcorn Soup",
      prices: { full: 90 },
      imageUrl:
        "https://images.unsplash.com/photo-1614104030967-5ca8363e27e2?w=800",
    },
    {
      categoryId: catSoup.id,
      name: "Veg Hot Garlic Soup",
      prices: { full: 90 },
      imageUrl:
        "https://images.unsplash.com/photo-1614104030967-5ca8363e27e2?w=800",
    },

    // === SNACKS ===
    {
      categoryId: catSnacks.id,
      name: "Dry Pappad",
      prices: { full: 25 },
      imageUrl:
        "https://images.unsplash.com/photo-1601050633722-62624449039a?w=800",
    },
    {
      categoryId: catSnacks.id,
      name: "Fry Pappad",
      prices: { full: 30 },
      imageUrl:
        "https://images.unsplash.com/photo-1601050633722-62624449039a?w=800",
    },
    {
      categoryId: catSnacks.id,
      name: "Masala Pappad",
      prices: { full: 40 },
      imageUrl:
        "https://images.unsplash.com/photo-1601050633722-62624449039a?w=800",
    },
    {
      categoryId: catSnacks.id,
      name: "Finger Chips",
      prices: { full: 100 },
      imageUrl:
        "https://images.unsplash.com/photo-1573082833942-f06637ba2bd9?w=800",
    },
    {
      categoryId: catSnacks.id,
      name: "Hara Bhara Kabab",
      prices: { full: 150 },
      imageUrl:
        "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=800",
    },
    {
      categoryId: catSnacks.id,
      name: "Sammi Kabab",
      prices: { full: 160 },
      imageUrl:
        "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=800",
    },
    {
      categoryId: catSnacks.id,
      name: "Paneer Cheese Tikka",
      prices: { full: 170 },
      imageUrl:
        "https://images.unsplash.com/photo-1567184109191-37762dfa10b7?w=800",
    },
    {
      categoryId: catSnacks.id,
      name: "Dahi Ki Sholey Kabab",
      prices: { full: 250 },
      imageUrl:
        "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=800",
    },

    // === BIRYANI ===
    {
      categoryId: catBiryani.id,
      name: "Veg Tawa Biryani",
      prices: { full: 150 },
      imageUrl:
        "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800",
    },
    {
      categoryId: catBiryani.id,
      name: "Veg Delux Biryani",
      prices: { full: 230 },
      imageUrl:
        "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=800",
    },
    {
      categoryId: catBiryani.id,
      name: "Veg Dilkush Biryani",
      prices: { full: 210 },
      imageUrl:
        "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800",
    },

    // === FRIED RICE ===
    {
      categoryId: catFriedRice.id,
      name: "Veg Fried Rice",
      prices: { full: 110 },
      imageUrl:
        "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800",
    },
    {
      categoryId: catFriedRice.id,
      name: "Veg Sezwan Fried Rice",
      prices: { full: 140 },
      imageUrl:
        "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800",
    },
    {
      categoryId: catFriedRice.id,
      name: "Veg Singapuri Fried Rice",
      prices: { full: 150 },
      imageUrl:
        "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800",
    },
    {
      categoryId: catFriedRice.id,
      name: "Veg Tripal Fried Rice",
      prices: { full: 200 },
      imageUrl:
        "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800",
    },
    {
      categoryId: catFriedRice.id,
      name: "Veg Burnt Garlic Fried Rice",
      prices: { full: 160 },
      imageUrl:
        "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800",
    },
    {
      categoryId: catFriedRice.id,
      name: "Veg Hongkong Fried Rice",
      prices: { full: 170 },
      imageUrl:
        "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800",
    },
    {
      categoryId: catFriedRice.id,
      name: "American Fried Rice",
      prices: { full: 180 },
      imageUrl:
        "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800",
    },
    {
      categoryId: catFriedRice.id,
      name: "Onion Chilli Fried Rice",
      prices: { full: 140 },
      imageUrl:
        "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800",
    },
    {
      categoryId: catFriedRice.id,
      name: "Shanghai Fried Rice",
      prices: { full: 190 },
      imageUrl:
        "https://images.unsplash.com/photo-1512058560366-cd2427ff06bb?w=800",
    },

    // === MAIN COURSE ===
    {
      categoryId: catMain.id,
      name: "Paneer Butter Masala",
      prices: { full: 180 },
      imageUrl:
        "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800",
    },
    {
      categoryId: catMain.id,
      name: "Dal Tadka",
      prices: { full: 140 },
      imageUrl:
        "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800",
    },
  ]);

  console.log("✅ Seed complete! All ~50 items added successfully.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
