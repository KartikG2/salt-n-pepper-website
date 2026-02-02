import {
  pgTable,
  text,
  serial,
  integer,
  boolean,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// === TYPES & INTERFACES ===

// Portions TypeScript helper
export interface ItemPrices {
  full: number;
  half?: number;
  quarter?: number;
}

// Updated OrderItem to include portion info
export interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  portion: keyof ItemPrices;
}

// === TABLE DEFINITIONS ===

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(), // Required for Admin Dashboard
  sortOrder: integer("sort_order").default(0),
});

export const menuItems = pgTable("menu_items", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  // JSONB stores the ItemPrices object
  prices: jsonb("prices").$type<ItemPrices>().notNull(),
  imageUrl: text("image_url"), // Enabled for Admin Dashboard custom images
  isVegetarian: boolean("is_vegetarian").default(true),
  isAvailable: boolean("is_available").default(true),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  customerAddress: text("customer_address"),
  type: text("type").notNull(), // 'dine-in', 'takeaway', 'delivery'
  items: jsonb("items").$type<OrderItem[]>().notNull(),
  totalAmount: integer("total_amount").notNull(),
  status: text("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reservations = pgTable("reservations", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  date: text("date").notNull(),
  time: text("time").notNull(),
  guests: integer("guests").notNull(),
  status: text("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

// === RELATIONS ===

export const menuItemsRelations = relations(menuItems, ({ one }) => ({
  category: one(categories, {
    fields: [menuItems.categoryId],
    references: [categories.id],
  }),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  items: many(menuItems),
}));

// === SCHEMAS & TYPES ===

export const insertUserSchema = createInsertSchema(users);
export const insertCategorySchema = createInsertSchema(categories);

// Enhanced Menu Item Schema with Zod validation for the prices object
export const insertMenuItemSchema = createInsertSchema(menuItems, {
  prices: z.object({
    full: z.number().min(1),
    half: z.number().optional(),
    quarter: z.number().optional(),
  }),
}).omit({
  id: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  status: true,
});

export const insertReservationSchema = createInsertSchema(reservations).omit({
  id: true,
  createdAt: true,
  status: true,
});

// Select Types
export type User = typeof users.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type MenuItem = typeof menuItems.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type Reservation = typeof reservations.$inferSelect;

// Insert Types
export type InsertUser = typeof users.$inferInsert;
export type InsertCategory = typeof categories.$inferInsert;
export type InsertMenuItem = z.infer<typeof insertMenuItemSchema>;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type InsertReservation = z.infer<typeof insertReservationSchema>;
