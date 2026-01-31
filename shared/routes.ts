import { z } from 'zod';
import { 
  insertCategorySchema, 
  insertMenuItemSchema, 
  insertOrderSchema, 
  insertReservationSchema,
  categories, 
  menuItems, 
  orders, 
  reservations 
} from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  // Public Routes
  categories: {
    list: {
      method: 'GET' as const,
      path: '/api/categories',
      responses: {
        200: z.array(z.custom<typeof categories.$inferSelect & { items: typeof menuItems.$inferSelect[] }>()),
      },
    },
  },
  menu: {
    list: {
      method: 'GET' as const,
      path: '/api/menu-items',
      responses: {
        200: z.array(z.custom<typeof menuItems.$inferSelect>()),
      },
    },
  },
  orders: {
    create: {
      method: 'POST' as const,
      path: '/api/orders',
      input: insertOrderSchema,
      responses: {
        201: z.custom<typeof orders.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  reservations: {
    create: {
      method: 'POST' as const,
      path: '/api/reservations',
      input: insertReservationSchema,
      responses: {
        201: z.custom<typeof reservations.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  
  // Admin Routes (Protected)
  admin: {
    login: {
      method: 'POST' as const,
      path: '/api/login',
      input: z.object({ username: z.string(), password: z.string() }),
      responses: {
        200: z.object({ message: z.string() }),
        401: errorSchemas.internal,
      }
    },
    logout: {
      method: 'POST' as const,
      path: '/api/logout',
      responses: {
        200: z.object({ message: z.string() }),
      }
    },
    me: {
      method: 'GET' as const,
      path: '/api/user',
      responses: {
        200: z.object({ id: z.number(), username: z.string() }),
        401: z.null(),
      }
    },
    categories: {
      create: {
        method: 'POST' as const,
        path: '/api/admin/categories',
        input: insertCategorySchema,
        responses: {
          201: z.custom<typeof categories.$inferSelect>(),
        },
      },
      update: {
        method: 'PUT' as const,
        path: '/api/admin/categories/:id',
        input: insertCategorySchema.partial(),
        responses: {
          200: z.custom<typeof categories.$inferSelect>(),
        },
      },
      delete: {
        method: 'DELETE' as const,
        path: '/api/admin/categories/:id',
        responses: {
          204: z.void(),
        },
      },
    },
    menuItems: {
      create: {
        method: 'POST' as const,
        path: '/api/admin/menu-items',
        input: insertMenuItemSchema,
        responses: {
          201: z.custom<typeof menuItems.$inferSelect>(),
        },
      },
      update: {
        method: 'PUT' as const,
        path: '/api/admin/menu-items/:id',
        input: insertMenuItemSchema.partial(),
        responses: {
          200: z.custom<typeof menuItems.$inferSelect>(),
        },
      },
      delete: {
        method: 'DELETE' as const,
        path: '/api/admin/menu-items/:id',
        responses: {
          204: z.void(),
        },
      },
    },
    orders: {
      list: {
        method: 'GET' as const,
        path: '/api/admin/orders',
        responses: {
          200: z.array(z.custom<typeof orders.$inferSelect>()),
        },
      },
      updateStatus: {
        method: 'PATCH' as const,
        path: '/api/admin/orders/:id/status',
        input: z.object({ status: z.string() }),
        responses: {
          200: z.custom<typeof orders.$inferSelect>(),
        },
      },
    },
    reservations: {
      list: {
        method: 'GET' as const,
        path: '/api/admin/reservations',
        responses: {
          200: z.array(z.custom<typeof reservations.$inferSelect>()),
        },
      },
      updateStatus: {
        method: 'PATCH' as const,
        path: '/api/admin/reservations/:id/status',
        input: z.object({ status: z.string() }),
        responses: {
          200: z.custom<typeof reservations.$inferSelect>(),
        },
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
