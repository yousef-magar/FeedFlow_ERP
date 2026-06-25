import { Router } from "express";
import { db, suppliersTable, purchaseOrdersTable, purchaseReturnsTable, supplierPaymentsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();

router.get("/suppliers", async (_req, res) => {
  const rows = await db.select().from(suppliersTable).orderBy(desc(suppliersTable.createdAt));
  res.json(rows);
});

router.post("/suppliers", async (req, res) => {
  const row = await db.insert(suppliersTable).values(req.body).returning();
  res.status(201).json(row[0]);
});

router.put("/suppliers/:id", async (req, res) => {
  const row = await db.update(suppliersTable).set(req.body).where(eq(suppliersTable.id, req.params.id)).returning();
  res.json(row[0]);
});

router.delete("/suppliers/:id", async (req, res) => {
  await db.delete(suppliersTable).where(eq(suppliersTable.id, req.params.id));
  res.json({ ok: true });
});

router.get("/purchase-orders", async (_req, res) => {
  const rows = await db.select().from(purchaseOrdersTable).orderBy(desc(purchaseOrdersTable.createdAt));
  res.json(rows);
});

router.post("/purchase-orders", async (req, res) => {
  const row = await db.insert(purchaseOrdersTable).values(req.body).returning();
  res.status(201).json(row[0]);
});

router.put("/purchase-orders/:id", async (req, res) => {
  const row = await db.update(purchaseOrdersTable).set(req.body).where(eq(purchaseOrdersTable.id, req.params.id)).returning();
  res.json(row[0]);
});

router.delete("/purchase-orders/:id", async (req, res) => {
  await db.delete(purchaseOrdersTable).where(eq(purchaseOrdersTable.id, req.params.id));
  res.json({ ok: true });
});

router.get("/purchase-returns", async (_req, res) => {
  const rows = await db.select().from(purchaseReturnsTable).orderBy(desc(purchaseReturnsTable.createdAt));
  res.json(rows);
});

router.post("/purchase-returns", async (req, res) => {
  const row = await db.insert(purchaseReturnsTable).values(req.body).returning();
  res.status(201).json(row[0]);
});

router.get("/supplier-payments", async (_req, res) => {
  const rows = await db.select().from(supplierPaymentsTable).orderBy(desc(supplierPaymentsTable.createdAt));
  res.json(rows);
});

router.post("/supplier-payments", async (req, res) => {
  const row = await db.insert(supplierPaymentsTable).values(req.body).returning();
  res.status(201).json(row[0]);
});

export default router;
