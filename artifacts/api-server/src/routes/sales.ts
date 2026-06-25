import { Router } from "express";
import { db, customersTable, salesInvoicesTable, salesReturnsTable, customerPaymentsTable, paymentAllocationsTable } from "@workspace/db";
import { eq, desc, and, sql } from "drizzle-orm";

const router = Router();

router.get("/customers", async (_req, res) => {
  const rows = await db.select().from(customersTable).orderBy(desc(customersTable.createdAt));
  res.json(rows);
});

router.get("/customers/:id", async (req, res) => {
  const [row] = await db.select().from(customersTable).where(eq(customersTable.id, req.params.id));
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(row);
});

router.post("/customers", async (req, res) => {
  const row = await db.insert(customersTable).values(req.body).returning();
  res.status(201).json(row[0]);
});

router.put("/customers/:id", async (req, res) => {
  const row = await db.update(customersTable).set(req.body).where(eq(customersTable.id, req.params.id)).returning();
  res.json(row[0]);
});

router.delete("/customers/:id", async (req, res) => {
  await db.delete(customersTable).where(eq(customersTable.id, req.params.id));
  res.json({ ok: true });
});

router.get("/invoices", async (_req, res) => {
  const rows = await db.select().from(salesInvoicesTable).orderBy(desc(salesInvoicesTable.createdAt));
  res.json(rows);
});

router.get("/invoices/:id", async (req, res) => {
  const [row] = await db.select().from(salesInvoicesTable).where(eq(salesInvoicesTable.id, req.params.id));
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(row);
});

router.post("/invoices", async (req, res) => {
  const row = await db.insert(salesInvoicesTable).values(req.body).returning();
  res.status(201).json(row[0]);
});

router.put("/invoices/:id", async (req, res) => {
  const row = await db.update(salesInvoicesTable).set(req.body).where(eq(salesInvoicesTable.id, req.params.id)).returning();
  res.json(row[0]);
});

router.delete("/invoices/:id", async (req, res) => {
  await db.delete(salesInvoicesTable).where(eq(salesInvoicesTable.id, req.params.id));
  res.json({ ok: true });
});

router.get("/returns", async (_req, res) => {
  const rows = await db.select().from(salesReturnsTable).orderBy(desc(salesReturnsTable.createdAt));
  res.json(rows);
});

router.post("/returns", async (req, res) => {
  const row = await db.insert(salesReturnsTable).values(req.body).returning();
  res.status(201).json(row[0]);
});

router.get("/payments", async (_req, res) => {
  const rows = await db.select().from(customerPaymentsTable).orderBy(desc(customerPaymentsTable.createdAt));
  res.json(rows);
});

router.post("/payments", async (req, res) => {
  const { allocations, ...paymentData } = req.body;
  const [payment] = await db.insert(customerPaymentsTable).values(paymentData).returning();
  if (allocations?.length) {
    await db.insert(paymentAllocationsTable).values(allocations.map((a: any) => ({ ...a, paymentId: payment.id })));
  }
  res.status(201).json(payment);
});

export default router;
