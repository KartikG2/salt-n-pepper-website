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
  // === PRODUCTION PROXY FIX ===
  // Essential for session cookies to work on Replit HTTPS
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
      const cat1 = await storage.createCategory({
        name: "Starters",
        slug: "starters",
        sortOrder: 1,
      });
      const cat2 = await storage.createCategory({
        name: "Main Course",
        slug: "main-course",
        sortOrder: 2,
      });

      await storage.createMenuItem({
        categoryId: cat1.id,
        name: "Hara Bara Kabab",
        price: 220,
        description: "Spinach and green pea patties",
        isVegetarian: true,
        isAvailable: true,
        imageUrl:
          "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800",
      });
      console.log("Database seeded.");
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

  app.post(api.reservations.create.path, async (req, res) => {
    try {
      const input = api.reservations.create.input.parse(req.body);
      const result = await storage.createReservation(input);
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

  app.get(
    api.admin.reservations.list.path,
    isAuthenticated,
    async (_req, res) => {
      res.json(await storage.getReservations());
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
