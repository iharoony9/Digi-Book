import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Contacts
  app.get(api.contacts.list.path, async (req, res) => {
    const data = await storage.getContacts();
    res.json(data);
  });
  app.get(api.contacts.get.path, async (req, res) => {
    const data = await storage.getContact(Number(req.params.id));
    if (!data) return res.status(404).json({ message: "Not found" });
    res.json(data);
  });
  app.post(api.contacts.create.path, async (req, res) => {
    try {
      const input = api.contacts.create.input.parse(req.body);
      const data = await storage.createContact(input);
      res.status(201).json(data);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });
  app.put(api.contacts.update.path, async (req, res) => {
    try {
      const input = api.contacts.update.input.parse(req.body);
      const data = await storage.updateContact(Number(req.params.id), input);
      if (!data) return res.status(404).json({ message: "Not found" });
      res.json(data);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  // Stocks
  app.get(api.stocks.list.path, async (req, res) => {
    const data = await storage.getStocks();
    res.json(data);
  });
  app.get(api.stocks.get.path, async (req, res) => {
    const data = await storage.getStock(Number(req.params.id));
    if (!data) return res.status(404).json({ message: "Not found" });
    res.json(data);
  });
  app.post(api.stocks.create.path, async (req, res) => {
    try {
      const input = api.stocks.create.input.parse(req.body);
      const data = await storage.createStock(input);
      res.status(201).json(data);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });
  app.put(api.stocks.update.path, async (req, res) => {
    try {
      const input = api.stocks.update.input.parse(req.body);
      const data = await storage.updateStock(Number(req.params.id), input);
      if (!data) return res.status(404).json({ message: "Not found" });
      res.json(data);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.delete("/api/stocks/:id", async (req, res) => {
    await storage.deleteStock(Number(req.params.id));
    res.sendStatus(204);
  });

  app.delete("/api/contacts/:id", async (req, res) => {
    await storage.deleteContact(Number(req.params.id));
    res.sendStatus(204);
  });

  // Bills
  app.get(api.bills.list.path, async (req, res) => {
    const data = await storage.getBills();
    res.json(data);
  });
  app.get(api.bills.get.path, async (req, res) => {
    const data = await storage.getBill(Number(req.params.id));
    if (!data) return res.status(404).json({ message: "Not found" });
    res.json(data);
  });
  app.post(api.bills.create.path, async (req, res) => {
    try {
      const input = api.bills.create.input.parse(req.body);
      const data = await storage.createBill(input);
      res.status(201).json(data);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });
  app.delete("/api/bills/:id", async (req, res) => {
    await storage.deleteBill(Number(req.params.id));
    res.sendStatus(204);
  });

  // Transactions
  app.get(api.transactions.list.path, async (req, res) => {
    const data = await storage.getTransactions();
    res.json(data);
  });
  app.post(api.transactions.create.path, async (req, res) => {
    try {
      const input = api.transactions.create.input.parse(req.body);
      const data = await storage.createTransaction(input);
      res.status(201).json(data);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });
  app.put("/api/transactions/:id", async (req, res) => {
    try {
      const input = req.body; // Partial update
      const data = await storage.updateTransaction(Number(req.params.id), input);
      if (!data) return res.status(404).json({ message: "Not found" });
      res.json(data);
    } catch (err) {
      res.status(400).json({ message: "Invalid update" });
    }
  });
  app.delete("/api/transactions/:id", async (req, res) => {
    await storage.deleteTransaction(Number(req.params.id));
    res.sendStatus(204);
  });

  // Settings
  app.get(api.settings.get.path, async (req, res) => {
    const data = await storage.getSetting(req.params.key);
    if (!data) return res.status(404).json({ message: "Not found" });
    res.json(data);
  });
  app.put(api.settings.update.path, async (req, res) => {
    try {
      const input = api.settings.update.input.parse(req.body);
      const data = await storage.upsertSetting(req.params.key, input.value);
      res.json(data);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  // Seed Data
  seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const accountBal = await storage.getSetting("account_balance");
  if (!accountBal) {
    await storage.upsertSetting("account_balance", "500000");
    await storage.createContact({ name: "Ali", type: "customer", phone: "1234567890", balance: 0 });
    await storage.createContact({ name: "Ahmed", type: "supplier", phone: "0987654321", balance: -5000 });
    await storage.createStock({ name: "Rice 1kg", quantity: 50, price: 300 });
    await storage.createStock({ name: "Sugar 1kg", quantity: 100, price: 150 });
  }
}
