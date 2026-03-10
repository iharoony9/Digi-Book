import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// --- CONTACTS ---
export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'customer', 'supplier'
  phone: text("phone"),
  balance: integer("balance").notNull().default(0), // positive: they owe us, negative: we owe them
});

// --- STOCKS (Products) ---
export const stocks = pgTable("stocks", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  quantity: integer("quantity").notNull().default(0),
  price: integer("price").notNull().default(0),
});

// --- BILLS ---
export const bills = pgTable("bills", {
  id: serial("id").primaryKey(),
  contactId: integer("contact_id").notNull(),
  totalAmount: integer("total_amount").notNull().default(0),
  discount: integer("discount").notNull().default(0),
  mazduri: integer("mazduri").notNull().default(0),
  finalAmount: integer("final_amount").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// --- BILL ITEMS ---
export const billItems = pgTable("bill_items", {
  id: serial("id").primaryKey(),
  billId: integer("bill_id").notNull(),
  stockId: integer("stock_id").notNull(),
  quantity: integer("quantity").notNull(),
  price: integer("price").notNull(),
  subtotal: integer("subtotal").notNull(),
});

// --- TRANSACTIONS (Ledger) ---
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  contactId: integer("contact_id").notNull(),
  amount: integer("amount").notNull(),
  type: text("type").notNull(), // 'give', 'take'
  description: text("description"),
  billId: integer("bill_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

// --- SETTINGS ---
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(), // e.g. 'account_balance'
  value: text("value").notNull(),
});

// Schemas
export const insertContactSchema = createInsertSchema(contacts).omit({ id: true });
export const insertStockSchema = createInsertSchema(stocks).omit({ id: true });
export const insertBillSchema = createInsertSchema(bills).omit({ id: true, createdAt: true });
export const insertBillItemSchema = createInsertSchema(billItems).omit({ id: true });
export const insertTransactionSchema = createInsertSchema(transactions).omit({ id: true, createdAt: true });
export const insertSettingSchema = createInsertSchema(settings).omit({ id: true });

// Types
export type Contact = typeof contacts.$inferSelect;
export type Stock = typeof stocks.$inferSelect;
export type Bill = typeof bills.$inferSelect;
export type BillItem = typeof billItems.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type Setting = typeof settings.$inferSelect;

export type CreateBillRequest = {
  contactId: number;
  discount: number;
  mazduri: number;
  items: Array<{
    stockId: number;
    quantity: number;
    price: number;
  }>;
};

export type BillWithItems = Bill & {
  items: (BillItem & { stock: Stock })[];
  contact: Contact;
};
