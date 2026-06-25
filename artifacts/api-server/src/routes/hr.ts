import { Router } from "express";
import { db, employeesTable, shiftsTable, attendanceTable, payrollTransactionsTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";

const router = Router();

router.get("/employees", async (_req, res) => {
  const rows = await db.select().from(employeesTable).orderBy(desc(employeesTable.createdAt));
  res.json(rows);
});

router.post("/employees", async (req, res) => {
  const row = await db.insert(employeesTable).values(req.body).returning();
  res.status(201).json(row[0]);
});

router.put("/employees/:id", async (req, res) => {
  const row = await db.update(employeesTable).set(req.body).where(eq(employeesTable.id, req.params.id)).returning();
  res.json(row[0]);
});

router.delete("/employees/:id", async (req, res) => {
  await db.delete(employeesTable).where(eq(employeesTable.id, req.params.id));
  res.json({ ok: true });
});

router.get("/shifts", async (_req, res) => {
  const rows = await db.select().from(shiftsTable);
  res.json(rows);
});

router.post("/shifts", async (req, res) => {
  const row = await db.insert(shiftsTable).values(req.body).returning();
  res.status(201).json(row[0]);
});

router.delete("/shifts/:id", async (req, res) => {
  await db.delete(shiftsTable).where(eq(shiftsTable.id, req.params.id));
  res.json({ ok: true });
});

router.get("/attendance", async (req, res) => {
  const { employeeId, date } = req.query;
  const conditions = [];
  if (employeeId) conditions.push(eq(attendanceTable.employeeId, employeeId as string));
  if (date) conditions.push(eq(attendanceTable.date, date as string));
  const where = conditions.length ? and(...conditions) : undefined;
  const rows = await db.select().from(attendanceTable).where(where);
  res.json(rows);
});

router.post("/attendance", async (req, res) => {
  const row = await db.insert(attendanceTable).values(req.body).returning();
  res.status(201).json(row[0]);
});

router.put("/attendance/:id", async (req, res) => {
  const row = await db.update(attendanceTable).set(req.body).where(eq(attendanceTable.id, Number(req.params.id))).returning();
  res.json(row[0]);
});

router.get("/payroll", async (_req, res) => {
  const rows = await db.select().from(payrollTransactionsTable).orderBy(desc(payrollTransactionsTable.createdAt));
  res.json(rows);
});

router.post("/payroll", async (req, res) => {
  const row = await db.insert(payrollTransactionsTable).values(req.body).returning();
  res.status(201).json(row[0]);
});

export default router;
