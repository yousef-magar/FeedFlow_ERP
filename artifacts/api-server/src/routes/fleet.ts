import { Router } from "express";
import { db, fleetVehiclesTable, shipmentsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();

router.get("/vehicles", async (_req, res) => {
  const rows = await db.select().from(fleetVehiclesTable).orderBy(desc(fleetVehiclesTable.createdAt));
  res.json(rows);
});

router.post("/vehicles", async (req, res) => {
  const row = await db.insert(fleetVehiclesTable).values(req.body).returning();
  res.status(201).json(row[0]);
});

router.put("/vehicles/:id", async (req, res) => {
  const row = await db.update(fleetVehiclesTable).set(req.body).where(eq(fleetVehiclesTable.id, req.params.id)).returning();
  res.json(row[0]);
});

router.delete("/vehicles/:id", async (req, res) => {
  await db.delete(fleetVehiclesTable).where(eq(fleetVehiclesTable.id, req.params.id));
  res.json({ ok: true });
});

router.get("/shipments", async (_req, res) => {
  const rows = await db.select().from(shipmentsTable).orderBy(desc(shipmentsTable.createdAt));
  res.json(rows);
});

router.post("/shipments", async (req, res) => {
  const row = await db.insert(shipmentsTable).values(req.body).returning();
  res.status(201).json(row[0]);
});

router.put("/shipments/:id", async (req, res) => {
  const row = await db.update(shipmentsTable).set(req.body).where(eq(shipmentsTable.id, req.params.id)).returning();
  res.json(row[0]);
});

router.delete("/shipments/:id", async (req, res) => {
  await db.delete(shipmentsTable).where(eq(shipmentsTable.id, req.params.id));
  res.json({ ok: true });
});

export default router;
