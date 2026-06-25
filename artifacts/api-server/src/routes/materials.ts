import { Router } from "express";
import { db, materialsTable, inventoryTable, formulasTable, formulaIngredientsTable } from "@workspace/db";
import { eq, and, like, desc, sql } from "drizzle-orm";

const router = Router();

router.get("/materials", async (_req, res) => {
  const rows = await db.select().from(materialsTable).orderBy(desc(materialsTable.createdAt));
  res.json(rows);
});

router.get("/materials/:id", async (req, res) => {
  const [row] = await db.select().from(materialsTable).where(eq(materialsTable.id, Number(req.params.id)));
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(row);
});

router.post("/materials", async (req, res) => {
  const { id, ...data } = req.body;
  const row = await db.insert(materialsTable).values(data).returning();
  res.status(201).json(row[0]);
});

router.put("/materials/:id", async (req, res) => {
  const { id, ...data } = req.body;
  const row = await db.update(materialsTable).set({ ...data, updatedAt: sql`NOW()` }).where(eq(materialsTable.id, Number(req.params.id))).returning();
  res.json(row[0]);
});

router.delete("/materials/:id", async (req, res) => {
  await db.delete(materialsTable).where(eq(materialsTable.id, Number(req.params.id)));
  res.json({ ok: true });
});

router.get("/inventory", async (_req, res) => {
  const rows = await db.select().from(inventoryTable).orderBy(desc(inventoryTable.createdAt));
  res.json(rows);
});

router.post("/inventory", async (req, res) => {
  const { id, ...data } = req.body;
  const row = await db.insert(inventoryTable).values(data).returning();
  res.status(201).json(row[0]);
});

router.put("/inventory/:id", async (req, res) => {
  const { id, ...data } = req.body;
  const row = await db.update(inventoryTable).set(data).where(eq(inventoryTable.id, Number(req.params.id))).returning();
  res.json(row[0]);
});

router.delete("/inventory/:id", async (req, res) => {
  await db.delete(inventoryTable).where(eq(inventoryTable.id, Number(req.params.id)));
  res.json({ ok: true });
});

router.get("/formulas", async (_req, res) => {
  const rows = await db.select().from(formulasTable).orderBy(desc(formulasTable.createdAt));
  for (const f of rows) {
    (f as any).ingredients = await db.select().from(formulaIngredientsTable).where(eq(formulaIngredientsTable.formulaId, f.id));
  }
  res.json(rows);
});

router.post("/formulas", async (req, res) => {
  const { ingredients, ...formulaData } = req.body;
  const [formula] = await db.insert(formulasTable).values(formulaData).returning();
  if (ingredients?.length) {
    await db.insert(formulaIngredientsTable).values(ingredients.map((i: any) => ({ ...i, formulaId: formula.id })));
  }
  res.status(201).json(formula);
});

router.put("/formulas/:id", async (req, res) => {
  const { ingredients, ...formulaData } = req.body;
  await db.update(formulasTable).set(formulaData).where(eq(formulasTable.id, Number(req.params.id)));
  if (ingredients) {
    await db.delete(formulaIngredientsTable).where(eq(formulaIngredientsTable.formulaId, Number(req.params.id)));
    if (ingredients.length) {
      await db.insert(formulaIngredientsTable).values(ingredients.map((i: any) => ({ ...i, formulaId: Number(req.params.id) })));
    }
  }
  const [row] = await db.select().from(formulasTable).where(eq(formulasTable.id, Number(req.params.id)));
  res.json(row);
});

router.delete("/formulas/:id", async (req, res) => {
  await db.delete(formulaIngredientsTable).where(eq(formulaIngredientsTable.formulaId, Number(req.params.id)));
  await db.delete(formulasTable).where(eq(formulasTable.id, Number(req.params.id)));
  res.json({ ok: true });
});

export default router;
