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

const scryptAsync = promisify(scrypt);

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
  // === PRODUCTION PROXY FIX ===
  // Required for secure cookies to work behind Replit/Heroku/Nginx proxies
  app.set("trust proxy", 1);

  // === AUTH SETUP ===
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "salt-n-papper-secret",
      resave: false,
      saveUninitialized: false,
      proxy: true, // Explicitly tell session to trust the proxy
      cookie: {
        // Secure only in production, but requires 'trust proxy' to be set to 1
        secure: process.env.NODE_ENV === "production",
        // Lax is standard, but 'none' is often required for Replit production subdomains
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
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

  // === SEED DATA ===
  (async () => {
    const existingUser = await storage.getUserByUsername("admin");
    if (!existingUser) {
      const hashedPassword = await hashPassword("admin123");
      await storage.createUser({ username: "admin", password: hashedPassword });
      console.log("Admin user created: admin / admin123");
    }

    const categories = await storage.getCategories();
    if (categories.length === 0) {
      const starters = await storage.createCategory({
        name: "Starters",
        slug: "starters",
        sortOrder: 1,
      });
      const main = await storage.createCategory({
        name: "Main Course",
        slug: "main-course",
        sortOrder: 2,
      });
      const rice = await storage.createCategory({
        name: "Rice",
        slug: "rice",
        sortOrder: 3,
      });
      const breads = await storage.createCategory({
        name: "Breads",
        slug: "breads",
        sortOrder: 4,
      });
      const desserts = await storage.createCategory({
        name: "Desserts",
        slug: "desserts",
        sortOrder: 5,
      });

      await storage.createMenuItem({
        categoryId: starters.id,
        name: "Hara Bara Kabab",
        price: 220,
        description: "Spinach and green pea patties, deep fried.",
        isVegetarian: true,
        isAvailable: true,
        imageUrl:
          "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=800",
      });
      await storage.createMenuItem({
        categoryId: main.id,
        name: "Paneer Tikka Masala",
        price: 280,
        description: "Grilled paneer cubes in spicy gravy.",
        isVegetarian: true,
        isAvailable: true,
        imageUrl:
          "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=800",
      });

      console.log("Database seeded with initial menu.");
    }
  })();

  // === API IMPLEMENTATION ===

  app.get(api.categories.list.path, async (req, res) => {
    const result = await storage.getCategories();
    res.json(result);
  });

  app.get(api.menu.list.path, async (req, res) => {
    const result = await storage.getMenuItems();
    res.json(result);
  });

  app.post(api.orders.create.path, async (req, res) => {
    try {
      const input = api.orders.create.input.parse(req.body);
      const result = await storage.createOrder(input);
      res.status(201).json(result);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  app.post(api.reservations.create.path, async (req, res) => {
    try {
      const input = api.reservations.create.input.parse(req.body);
      const result = await storage.createReservation(input);
      res.status(201).json(result);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  // Auth Routes
  app.post(api.admin.login.path, passport.authenticate("local"), (req, res) => {
    res.json({ message: "Logged in successfully" });
  });

  app.post(api.admin.logout.path, (req, res) => {
    req.logout((err) => {
      if (err) return res.status(500).json({ message: "Logout failed" });
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get(api.admin.me.path, (req, res) => {
    if (req.isAuthenticated()) {
      res.json(req.user);
    } else {
      res.status(401).send(null);
    }
  });

  // Protected Admin Routes
  app.get(api.admin.orders.list.path, isAuthenticated, async (req, res) => {
    const result = await storage.getOrders();
    res.json(result);
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

  app.get(
    api.admin.reservations.list.path,
    isAuthenticated,
    async (req, res) => {
      const result = await storage.getReservations();
      res.json(result);
    },
  );

  app.patch(
    api.admin.reservations.updateStatus.path,
    isAuthenticated,
    async (req, res) => {
      const result = await storage.updateReservationStatus(
        Number(req.params.id),
        req.body.status,
      );
      res.json(result);
    },
  );

  return httpServer;
}
