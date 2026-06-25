import { pgTable, serial, text, integer, numeric, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const shiftsTable = pgTable("shifts", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  departments: jsonb("departments").$type<string[]>().default([]),
  lateThresholdMinutes: integer("late_threshold_minutes").default(15),
});

export const employeesTable = pgTable("employees", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").default(""),
  department: text("department").default(""),
  position: text("position").default(""),
  salaryType: text("salary_type").notNull().default("monthly"),
  baseSalary: numeric("base_salary", { precision: 10, scale: 2 }).default("0"),
  dailyIncentive: numeric("daily_incentive", { precision: 8, scale: 2 }).default("0"),
  lateDeductionPct: numeric("late_deduction_pct", { precision: 5, scale: 2 }).default("0"),
  status: text("status").default("active"),
  allowances: numeric("allowances", { precision: 10, scale: 2 }).default("0"),
  overtime: numeric("overtime", { precision: 10, scale: 2 }).default("0"),
  deductions: numeric("deductions", { precision: 10, scale: 2 }).default("0"),
  advances: numeric("advances", { precision: 10, scale: 2 }).default("0"),
  joinDate: text("join_date"),
  notes: text("notes").default(""),
  workStartTime: text("work_start_time").default("08:00"),
  workEndTime: text("work_end_time").default("17:00"),
  workHours: numeric("work_hours", { precision: 4, scale: 1 }).default("8"),
  overtimeRate: numeric("overtime_rate", { precision: 8, scale: 2 }).default("0"),
  commissionType: text("commission_type").default("none"),
  commissionRate: numeric("commission_rate", { precision: 5, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const attendanceTable = pgTable("attendance", {
  id: serial("id").primaryKey(),
  employeeId: text("employee_id").references(() => employeesTable.id).notNull(),
  date: text("date").notNull(),
  status: text("status").notNull().default("present"),
  reason: text("reason"),
  deductionAmount: numeric("deduction_amount", { precision: 8, scale: 2 }).default("0"),
  checkIn: text("check_in"),
  checkOut: text("check_out"),
});

export const payrollTransactionsTable = pgTable("payroll_transactions", {
  id: text("id").primaryKey(),
  year: integer("year").notNull(),
  month: integer("month").notNull(),
  weekNumber: integer("week_number"),
  approvalType: text("approval_type").notNull(),
  approvedAt: text("approved_at"),
  totalGross: numeric("total_gross", { precision: 12, scale: 2 }).notNull(),
  totalDeductions: numeric("total_deductions", { precision: 12, scale: 2 }).notNull(),
  totalNet: numeric("total_net", { precision: 12, scale: 2 }).notNull(),
  employeeCount: integer("employee_count").notNull(),
  breakdown: jsonb("breakdown").$type<{
    employeeId: string; name: string; dailyRate: number;
    presentDays: number; absentDays: number; grossPay: number;
    incentivePaid: number; advances: number; deductions: number; netPay: number;
  }[]>().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertEmployeeSchema = createInsertSchema(employeesTable);
export const insertAttendanceSchema = createInsertSchema(attendanceTable);

export type Shift = typeof shiftsTable.$inferSelect;
export type Employee = typeof employeesTable.$inferSelect;
export type Attendance = typeof attendanceTable.$inferSelect;
export type PayrollTransaction = typeof payrollTransactionsTable.$inferSelect;
