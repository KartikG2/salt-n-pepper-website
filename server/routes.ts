import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { type ItemPrices } from "@shared/schema";

const scryptAsync = promisify(scrypt);

// === AUTH UTILS ===
async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePassword(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export async function registerRoutes(
  httpServer: Server,
  app: Express,
): Promise<Server> {
  app.set("trust proxy", 1);

  // === AUTH SETUP ===
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "salt-n-papper-secret",
      resave: false,
      saveUninitialized: false,
      proxy: true,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 24 * 60 * 60 * 1000,
      },
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) return done(null, false, { message: "Incorrect username." });
        const isValid = await comparePassword(password, user.password);
        if (!isValid)
          return done(null, false, { message: "Incorrect password." });
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }),
  );

  passport.serializeUser((user: any, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  const isAuthenticated = (req: any, res: any, next: any) => {
    if (req.isAuthenticated()) return next();
    res.status(401).json({ message: "Unauthorized" });
  };

  // === SEED DATA UPDATED FOR PORTIONS ===
  (async () => {
    const existingUser = await storage.getUserByUsername("admin");
    if (!existingUser) {
      const hashedPassword = await hashPassword("admin123");
      await storage.createUser({ username: "admin", password: hashedPassword });
    }

    const categories = await storage.getCategories();
    if (categories.length === 0) {
      const cat1 = await storage.createCategory({
        name: "Starters",
        slug: "starters",
        sortOrder: 1,
      });

      // Updated seed data to use the 'prices' object instead of a single 'price'
      await storage.createMenuItem({
        categoryId: cat1.id,
        name: "Paneer Tikka",
        // Using the new JSONB structure
        prices: { full: 280, half: 160, quarter: 90 } as ItemPrices,
        description: "Charcoal grilled cottage cheese",
        isVegetarian: true,
        isAvailable: true,
        imageUrl:
          "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800",
      });
      console.log("Database seeded with portion data.");
    }
  })();

  // === PUBLIC API ===
  app.get(api.categories.list.path, async (_req, res) => {
    res.json(await storage.getCategories());
  });

  app.get(api.menu.list.path, async (_req, res) => {
    res.json(await storage.getMenuItems());
  });

  app.post(api.orders.create.path, async (req, res) => {
    try {
      const input = api.orders.create.input.parse(req.body);
      const result = await storage.createOrder(input);
      res.status(201).json(result);
    } catch (err) {
      if (err instanceof z.ZodError)
        return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  // === AUTH ROUTES ===
  app.post(
    api.admin.login.path,
    passport.authenticate("local"),
    (_req, res) => {
      res.json({ message: "Logged in successfully" });
    },
  );

  app.post(api.admin.logout.path, (req, res) => {
    req.logout((err) => {
      if (err) return res.status(500).json({ message: "Logout failed" });
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get(api.admin.me.path, (req, res) => {
    if (req.isAuthenticated()) res.json(req.user);
    else res.status(401).send(null);
  });

  // === PROTECTED ADMIN ROUTES ===

  // NEW: Update existing menu item (The "Edit" functionality)
  app.patch(
    api.admin.menuItems.update.path,
    isAuthenticated,
    async (req, res) => {
      try {
        const result = await storage.updateMenuItem(
          Number(req.params.id),
          req.body,
        );
        res.json(result);
      } catch (err) {
        res.status(500).json({ message: "Failed to update item" });
      }
    },
  );

  // Create new menu item
  app.post(
    api.admin.menuItems.create.path,
    isAuthenticated,
    async (req, res) => {
      try {
        const result = await storage.createMenuItem(req.body);
        res.status(201).json(result);
      } catch (err) {
        res.status(500).json({ message: "Failed to create item" });
      }
    },
  );

  app.delete(
    api.admin.menuItems.delete.path,
    isAuthenticated,
    async (req, res) => {
      await storage.deleteMenuItem(Number(req.params.id));
      res.sendStatus(204);
    },
  );

  app.get(api.admin.orders.list.path, isAuthenticated, async (_req, res) => {
    res.json(await storage.getOrders());
  });

  app.patch(
    api.admin.orders.updateStatus.path,
    isAuthenticated,
    async (req, res) => {
      const result = await storage.updateOrderStatus(
        Number(req.params.id),
        req.body.status,
      );
      res.json(result);
    },
  );

  return httpServer;
}
