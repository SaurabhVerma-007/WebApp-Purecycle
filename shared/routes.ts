import { z } from 'zod';
import { insertUserSchema, insertCycleSchema, insertDailyLogSchema, cycles, dailyLogs } from './schema';

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
  auth: {
    register: {
      method: 'POST' as const,
      path: '/api/register',
      input: insertUserSchema,
      responses: {
        201: z.object({ id: z.number(), username: z.string() }),
        400: errorSchemas.validation,
      }
    },
    login: {
      method: 'POST' as const,
      path: '/api/login',
      input: z.object({ username: z.string(), password: z.string() }),
      responses: {
        200: z.object({ id: z.number(), username: z.string() }),
        401: z.object({ message: z.string() }),
      }
    },
    logout: {
      method: 'POST' as const,
      path: '/api/logout',
      responses: {
        200: z.void(),
      }
    },
    user: {
      method: 'GET' as const,
      path: '/api/user',
      responses: {
        200: z.object({ 
          id: z.number(), 
          username: z.string(), 
          displayName: z.string().nullable(),
          email: z.string().nullable(),
          trackingMode: z.string().optional() 
        }).nullable(),
      }
    },
    updateMode: {
      method: 'PATCH' as const,
      path: '/api/user/mode',
      input: z.object({ trackingMode: z.string() }),
      responses: {
        200: z.object({ trackingMode: z.string() }),
        401: z.object({ message: z.string() }),
      }
    }
  },
  cycles: {
    list: {
      method: 'GET' as const,
      path: '/api/cycles',
      responses: {
        200: z.array(z.custom<typeof cycles.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/cycles',
      input: insertCycleSchema.omit({ userId: true }),
      responses: {
        201: z.custom<typeof cycles.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/cycles/:id',
      input: insertCycleSchema.omit({ userId: true }).partial(),
      responses: {
        200: z.custom<typeof cycles.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    }
  },
  dailyLogs: {
    list: {
      method: 'GET' as const,
      path: '/api/daily-logs',
      responses: {
        200: z.array(z.custom<typeof dailyLogs.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/daily-logs',
      input: insertDailyLogSchema.omit({ userId: true }),
      responses: {
        201: z.custom<typeof dailyLogs.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/daily-logs/:id',
      input: insertDailyLogSchema.omit({ userId: true }).partial(),
      responses: {
        200: z.custom<typeof dailyLogs.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    }
  },
  ai: {
    chat: {
      method: 'POST' as const,
      path: '/api/ai/chat',
      input: z.object({ message: z.string(), context: z.string().optional() }),
      responses: {
        200: z.object({ response: z.string() }),
        500: errorSchemas.internal,
      }
    }
  }
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
