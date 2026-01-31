import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// === TABLE DEFINITIONS ===

// Admin Users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Menu Categories
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // e.g., "Starters", "Main Course"
  slug: text("slug").notNull().unique(),
  sortOrder: integer("sort_order").default(0),
});

// Menu Items
export const menuItems = pgTable("menu_items", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  price: integer("price").notNull(), // In INR
  imageUrl: text("image_url"),
  isVegetarian: boolean("is_vegetarian").default(true),
  isAvailable: boolean("is_available").default(true),
});

// Orders
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  customerAddress: text("customer_address"), // For delivery
  type: text("type").notNull(), // 'dine-in', 'takeaway', 'delivery'
  items: jsonb("items").notNull(), // Array of { menuItemId, quantity, name, price }
  totalAmount: integer("total_amount").notNull(),
  status: text("status").default("pending"), // 'pending', 'confirmed', 'completed', 'cancelled'
  createdAt: timestamp("created_at").defaultNow(),
});

// Reservations
export const reservations = pgTable("reservations", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  date: text("date").notNull(), // YYYY-MM-DD
  time: text("time").notNull(), // HH:MM
  guests: integer("guests").notNull(),
  status: text("status").default("pending"), // 'pending', 'confirmed', 'cancelled'
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

// === SCHEMAS ===

export const insertUserSchema = createInsertSchema(users);
export const insertCategorySchema = createInsertSchema(categories);
export const insertMenuItemSchema = createInsertSchema(menuItems);
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true, status: true });
export const insertReservationSchema = createInsertSchema(reservations).omit({ id: true, createdAt: true, status: true });

// === EXPLICIT TYPES ===

export type User = typeof users.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type MenuItem = typeof menuItems.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type Reservation = typeof reservations.$inferSelect;

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type InsertMenuItem = z.infer<typeof insertMenuItemSchema>;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type InsertReservation = z.infer<typeof insertReservationSchema>;

// Request Types
export type CreateOrderRequest = InsertOrder;
export type CreateReservationRequest = InsertReservation;

// Item inside an order
export const orderItemSchema = z.object({
  menuItemId: z.number(),
  name: z.string(),
  price: z.number(),
  quantity: z.number(),
});

export type OrderItem = z.infer<typeof orderItemSchema>;
