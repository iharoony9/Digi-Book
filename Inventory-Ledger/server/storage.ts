import { db } from "./db";
import { eq, sql } from "drizzle-orm";
import {
  contacts, stocks, bills, billItems, transactions, settings,
  type Contact, type Stock, type Bill, type BillItem, type Transaction, type Setting,
  type BillWithItems, type CreateBillRequest
} from "@shared/schema";

export interface IStorage {
  // Contacts
  getContacts(): Promise<Contact[]>;
  getContact(id: number): Promise<Contact | undefined>;
  createContact(contact: Omit<Contact, "id">): Promise<Contact>;
  updateContact(id: number, contact: Partial<Contact>): Promise<Contact | undefined>;
  deleteContact(id: number): Promise<void>;

  // Stocks
  getStocks(): Promise<Stock[]>;
  getStock(id: number): Promise<Stock | undefined>;
  createStock(stock: Omit<Stock, "id">): Promise<Stock>;
  updateStock(id: number, stock: Partial<Stock>): Promise<Stock | undefined>;
  deleteStock(id: number): Promise<void>;

  // Bills
  getBills(): Promise<BillWithItems[]>;
  getBill(id: number): Promise<BillWithItems | undefined>;
  createBill(billRequest: CreateBillRequest): Promise<Bill>;
  deleteBill(id: number): Promise<void>;

  // Transactions
  getTransactions(): Promise<Transaction[]>;
  getTransaction(id: number): Promise<Transaction | undefined>;
  createTransaction(transaction: Omit<Transaction, "id" | "createdAt">): Promise<Transaction>;
  updateTransaction(id: number, transaction: Partial<Transaction>): Promise<Transaction | undefined>;
  deleteTransaction(id: number): Promise<void>;

  // Settings
  getSetting(key: string): Promise<Setting | undefined>;
  upsertSetting(key: string, value: string): Promise<Setting>;
}

export class DatabaseStorage implements IStorage {
  // --- Contacts ---
  async getContacts(): Promise<Contact[]> {
    return await db.select().from(contacts);
  }
  async getContact(id: number): Promise<Contact | undefined> {
    const [contact] = await db.select().from(contacts).where(eq(contacts.id, id));
    return contact;
  }
  async createContact(contact: Omit<Contact, "id">): Promise<Contact> {
    const [newContact] = await db.insert(contacts).values(contact).returning();
    return newContact;
  }
  async updateContact(id: number, update: Partial<Contact>): Promise<Contact | undefined> {
    const [updated] = await db.update(contacts).set(update).where(eq(contacts.id, id)).returning();
    return updated;
  }
  async deleteContact(id: number): Promise<void> {
    await db.delete(contacts).where(eq(contacts.id, id));
  }

  // --- Stocks ---
  async getStocks(): Promise<Stock[]> {
    return await db.select().from(stocks);
  }
  async getStock(id: number): Promise<Stock | undefined> {
    const [stock] = await db.select().from(stocks).where(eq(stocks.id, id));
    return stock;
  }
  async createStock(stock: Omit<Stock, "id">): Promise<Stock> {
    const [newStock] = await db.insert(stocks).values(stock).returning();
    return newStock;
  }
  async updateStock(id: number, update: Partial<Stock>): Promise<Stock | undefined> {
    const [updated] = await db.update(stocks).set(update).where(eq(stocks.id, id)).returning();
    return updated;
  }
  async deleteStock(id: number): Promise<void> {
    await db.delete(stocks).where(eq(stocks.id, id));
  }

  // --- Bills ---
  async getBills(): Promise<BillWithItems[]> {
    const allBills = await db.select().from(bills).orderBy(sql`created_at DESC`);
    const result: BillWithItems[] = [];
    
    for (const b of allBills) {
      const bItems = await db.select().from(billItems).where(eq(billItems.billId, b.id));
      const [contact] = await db.select().from(contacts).where(eq(contacts.id, b.contactId));
      
      const itemsWithStock = await Promise.all(bItems.map(async (bi) => {
        const [stock] = await db.select().from(stocks).where(eq(stocks.id, bi.stockId));
        return { ...bi, stock };
      }));
      
      result.push({ ...b, items: itemsWithStock, contact });
    }
    return result;
  }

  async getBill(id: number): Promise<BillWithItems | undefined> {
    const [b] = await db.select().from(bills).where(eq(bills.id, id));
    if (!b) return undefined;

    const bItems = await db.select().from(billItems).where(eq(billItems.billId, b.id));
    const [contact] = await db.select().from(contacts).where(eq(contacts.id, b.contactId));
    
    const itemsWithStock = await Promise.all(bItems.map(async (bi) => {
      const [stock] = await db.select().from(stocks).where(eq(stocks.id, bi.stockId));
      return { ...bi, stock };
    }));
    
    return { ...b, items: itemsWithStock, contact };
  }

  async createBill(billRequest: CreateBillRequest): Promise<Bill> {
    return await db.transaction(async (tx) => {
      let subtotalSum = 0;
      for (const item of billRequest.items) {
        subtotalSum += item.quantity * item.price;
        const [stock] = await tx.select().from(stocks).where(eq(stocks.id, item.stockId));
        if (stock) {
          await tx.update(stocks).set({ quantity: stock.quantity - item.quantity }).where(eq(stocks.id, item.stockId));
        }
      }
      const finalAmount = subtotalSum - billRequest.discount + billRequest.mazduri;
      const [newBill] = await tx.insert(bills).values({
        contactId: billRequest.contactId,
        totalAmount: subtotalSum,
        discount: billRequest.discount,
        mazduri: billRequest.mazduri,
        finalAmount,
      }).returning();
      for (const item of billRequest.items) {
        await tx.insert(billItems).values({
          billId: newBill.id,
          stockId: item.stockId,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.quantity * item.price,
        });
      }
      const [contact] = await tx.select().from(contacts).where(eq(contacts.id, billRequest.contactId));
      if (contact) {
        await tx.update(contacts).set({ balance: contact.balance + finalAmount }).where(eq(contacts.id, billRequest.contactId));
      }
      await tx.insert(transactions).values({
        contactId: billRequest.contactId,
        amount: finalAmount,
        type: 'give',
        description: `Bill #${newBill.id}`,
        billId: newBill.id,
      });
      return newBill;
    });
  }

  async deleteBill(id: number): Promise<void> {
    await db.transaction(async (tx) => {
      const [bill] = await tx.select().from(bills).where(eq(bills.id, id));
      if (!bill) return;
      const items = await tx.select().from(billItems).where(eq(billItems.billId, id));
      for (const item of items) {
        const [stock] = await tx.select().from(stocks).where(eq(stocks.id, item.stockId));
        if (stock) {
          await tx.update(stocks).set({ quantity: stock.quantity + item.quantity }).where(eq(stocks.id, item.stockId));
        }
      }
      const [contact] = await tx.select().from(contacts).where(eq(contacts.id, bill.contactId));
      if (contact) {
        await tx.update(contacts).set({ balance: contact.balance - bill.finalAmount }).where(eq(contacts.id, bill.contactId));
      }
      await tx.delete(transactions).where(eq(transactions.billId, id));
      await tx.delete(billItems).where(eq(billItems.billId, id));
      await tx.delete(bills).where(eq(bills.id, id));
    });
  }

  // --- Transactions ---
  async getTransactions(): Promise<Transaction[]> {
    return await db.select().from(transactions).orderBy(sql`created_at DESC`);
  }

  async getTransaction(id: number): Promise<Transaction | undefined> {
    const [tx] = await db.select().from(transactions).where(eq(transactions.id, id));
    return tx;
  }

  async createTransaction(transaction: Omit<Transaction, "id" | "createdAt">): Promise<Transaction> {
    return await db.transaction(async (tx) => {
      const [newTx] = await tx.insert(transactions).values(transaction).returning();
      const [contact] = await tx.select().from(contacts).where(eq(contacts.id, transaction.contactId));
      if (contact) {
        const balanceChange = transaction.type === 'give' ? transaction.amount : -transaction.amount;
        await tx.update(contacts).set({ balance: contact.balance + balanceChange }).where(eq(contacts.id, transaction.contactId));
      }
      return newTx;
    });
  }

  async updateTransaction(id: number, update: Partial<Transaction>): Promise<Transaction | undefined> {
    return await db.transaction(async (tx) => {
      const [oldTx] = await tx.select().from(transactions).where(eq(transactions.id, id));
      if (!oldTx) return undefined;
      const [contact] = await tx.select().from(contacts).where(eq(contacts.id, oldTx.contactId));
      if (contact) {
        const oldBalanceChange = oldTx.type === 'give' ? oldTx.amount : -oldTx.amount;
        await tx.update(contacts).set({ balance: contact.balance - oldBalanceChange }).where(eq(contacts.id, oldTx.contactId));
      }
      const [updated] = await tx.update(transactions).set(update).where(eq(transactions.id, id)).returning();
      const [newContact] = await tx.select().from(contacts).where(eq(contacts.id, updated.contactId));
      if (newContact) {
        const newBalanceChange = updated.type === 'give' ? updated.amount : -updated.amount;
        await tx.update(contacts).set({ balance: newContact.balance + newBalanceChange }).where(eq(contacts.id, updated.contactId));
      }
      return updated;
    });
  }

  async deleteTransaction(id: number): Promise<void> {
    await db.transaction(async (tx) => {
      const [oldTx] = await tx.select().from(transactions).where(eq(transactions.id, id));
      if (!oldTx) return;
      const [contact] = await tx.select().from(contacts).where(eq(contacts.id, oldTx.contactId));
      if (contact) {
        const balanceChange = oldTx.type === 'give' ? oldTx.amount : -oldTx.amount;
        await tx.update(contacts).set({ balance: contact.balance - balanceChange }).where(eq(contacts.id, oldTx.contactId));
      }
      await tx.delete(transactions).where(eq(transactions.id, id));
    });
  }

  // --- Settings ---
  async getSetting(key: string): Promise<Setting | undefined> {
    const [setting] = await db.select().from(settings).where(eq(settings.key, key));
    return setting;
  }
  async upsertSetting(key: string, value: string): Promise<Setting> {
    const existing = await this.getSetting(key);
    if (existing) {
      const [updated] = await db.update(settings).set({ value }).where(eq(settings.key, key)).returning();
      return updated;
    } else {
      const [created] = await db.insert(settings).values({ key, value }).returning();
      return created;
    }
  }
}

export const storage = new DatabaseStorage();
