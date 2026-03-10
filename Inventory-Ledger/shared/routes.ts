import { z } from "zod";
import { insertContactSchema, insertStockSchema, insertTransactionSchema, contacts, stocks, bills, transactions, settings } from "./schema";

export const errorSchemas = {
  validation: z.object({ message: z.string(), field: z.string().optional() }),
  notFound: z.object({ message: z.string() }),
  internal: z.object({ message: z.string() }),
};

export const createBillRequestSchema = z.object({
  contactId: z.number(),
  discount: z.number().default(0),
  mazduri: z.number().default(0),
  items: z.array(z.object({
    stockId: z.number(),
    quantity: z.number(),
    price: z.number(),
  })).min(1, "Bill must have at least one item"),
});

export const api = {
  contacts: {
    list: {
      method: 'GET' as const,
      path: '/api/contacts' as const,
      responses: { 200: z.array(z.custom<typeof contacts.$inferSelect>()) },
    },
    get: {
      method: 'GET' as const,
      path: '/api/contacts/:id' as const,
      responses: { 200: z.custom<typeof contacts.$inferSelect>(), 404: errorSchemas.notFound },
    },
    create: {
      method: 'POST' as const,
      path: '/api/contacts' as const,
      input: insertContactSchema,
      responses: { 201: z.custom<typeof contacts.$inferSelect>(), 400: errorSchemas.validation },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/contacts/:id' as const,
      input: insertContactSchema.partial(),
      responses: { 200: z.custom<typeof contacts.$inferSelect>(), 404: errorSchemas.notFound },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/contacts/:id' as const,
      responses: { 204: z.void() },
    }
  },
  stocks: {
    list: {
      method: 'GET' as const,
      path: '/api/stocks' as const,
      responses: { 200: z.array(z.custom<typeof stocks.$inferSelect>()) },
    },
    get: {
      method: 'GET' as const,
      path: '/api/stocks/:id' as const,
      responses: { 200: z.custom<typeof stocks.$inferSelect>(), 404: errorSchemas.notFound },
    },
    create: {
      method: 'POST' as const,
      path: '/api/stocks' as const,
      input: insertStockSchema,
      responses: { 201: z.custom<typeof stocks.$inferSelect>(), 400: errorSchemas.validation },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/stocks/:id' as const,
      input: insertStockSchema.partial(),
      responses: { 200: z.custom<typeof stocks.$inferSelect>(), 404: errorSchemas.notFound },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/stocks/:id' as const,
      responses: { 204: z.void() },
    }
  },
  bills: {
    list: {
      method: 'GET' as const,
      path: '/api/bills' as const,
      responses: { 200: z.array(z.custom<any>()) },
    },
    get: {
      method: 'GET' as const,
      path: '/api/bills/:id' as const,
      responses: { 200: z.custom<any>(), 404: errorSchemas.notFound },
    },
    create: {
      method: 'POST' as const,
      path: '/api/bills' as const,
      input: createBillRequestSchema,
      responses: { 201: z.custom<typeof bills.$inferSelect>(), 400: errorSchemas.validation },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/bills/:id' as const,
      responses: { 204: z.void() },
    }
  },
  transactions: {
    list: {
      method: 'GET' as const,
      path: '/api/transactions' as const,
      responses: { 200: z.array(z.custom<typeof transactions.$inferSelect>()) },
    },
    create: {
      method: 'POST' as const,
      path: '/api/transactions' as const,
      input: insertTransactionSchema,
      responses: { 201: z.custom<typeof transactions.$inferSelect>(), 400: errorSchemas.validation },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/transactions/:id' as const,
      input: insertTransactionSchema.partial(),
      responses: { 200: z.custom<typeof transactions.$inferSelect>(), 404: errorSchemas.notFound },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/transactions/:id' as const,
      responses: { 204: z.void() },
    }
  },
  settings: {
    get: {
      method: 'GET' as const,
      path: '/api/settings/:key' as const,
      responses: { 200: z.custom<typeof settings.$inferSelect>(), 404: errorSchemas.notFound },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/settings/:key' as const,
      input: z.object({ value: z.string() }),
      responses: { 200: z.custom<typeof settings.$inferSelect>() },
    },
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
