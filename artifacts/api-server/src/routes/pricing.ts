import { Router } from "express";
import { db, productPricesTable, pricingAlertsTable, productGroupsTable, groupItemsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();

router.get("/product-prices", async (_req, res) => {
  const rows = await db.select().from(productPricesTable).orderBy(desc(productPricesTable.lastUpdated));
  res.json(rows);
});

router.post("/product-prices", async (req, res) => {
  const row = await db.insert(productPricesTable).values(req.body).returning();
  res.status(201).json(row[0]);
});

router.put("/product-prices/:id", async (req, res) => {
  const row = await db.update(productPricesTable).set(req.body).where(eq(productPricesTable.id, Number(req.params.id))).returning();
  res.json(row[0]);
});

router.delete("/product-prices/:id", async (req, res) => {
  await db.delete(productPricesTable).where(eq(productPricesTable.id, Number(req.params.id)));
  res.json({ ok: true });
});

router.get("/pricing-alerts", async (_req, res) => {
  const rows = await db.select().from(pricingAlertsTable).orderBy(desc(pricingAlertsTable.createdAt));
  res.json(rows);
});

router.post("/pricing-alerts", async (req, res) => {
  const row = await db.insert(pricingAlertsTable).values(req.body).returning();
  res.status(201).json(row[0]);
});

router.put("/pricing-alerts/:id", async (req, res) => {
  const row = await db.update(pricingAlertsTable).set(req.body).where(eq(pricingAlertsTable.id, Number(req.params.id))).returning();
  res.json(row[0]);
});

router.get("/product-groups", async (_req, res) => {
  const rows = await db.select().from(productGroupsTable);
  for (const g of rows) {
    (g as any).items = await db.select().from(groupItemsTable).where(eq(groupItemsTable.groupId, g.id));
  }
  res.json(rows);
});

router.post("/product-groups", async (req, res) => {
  const row = await db.insert(productGroupsTable).values(req.body).returning();
  res.status(201).json(row[0]);
});

router.put("/product-groups/:id", async (req, res) => {
  const row = await db.update(productGroupsTable).set(req.body).where(eq(productGroupsTable.id, Number(req.params.id))).returning();
  res.json(row[0]);
});

router.delete("/product-groups/:id", async (req, res) => {
  await db.delete(groupItemsTable).where(eq(groupItemsTable.groupId, Number(req.params.id)));
  await db.delete(productGroupsTable).where(eq(productGroupsTable.id, Number(req.params.id)));
  res.json({ ok: true });
});

router.post("/group-items", async (req, res) => {
  const row = await db.insert(groupItemsTable).values(req.body).returning();
  res.status(201).json(row[0]);
});

router.delete("/group-items/:id", async (req, res) => {
  await db.delete(groupItemsTable).where(eq(groupItemsTable.id, Number(req.params.id)));
  res.json({ ok: true });
});

export default router;
