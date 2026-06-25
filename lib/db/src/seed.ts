import { db, pool } from "./index";
import {
  subAccountsTable, bankAccountsTable, walletAccountsTable, paymentMethodsTable,
  customersTable, suppliersTable, employeesTable, shiftsTable,
  fleetVehiclesTable, warehouseConfigsTable,
  materialsTable, formulasTable, formulaIngredientsTable,
  productPricesTable, productGroupsTable,
  appSettingsTable,
} from "./schema";
import bcrypt from "bcrypt";

async function seed() {
  console.log("🌱 Seeding database...");

  const adminHash = await bcrypt.hash("admin123", 10);

  await db.insert(subAccountsTable).values({
    id: "admin-1", name: "مدير النظام", email: "admin@elnujoom.com",
    passwordHash: adminHash, role: "admin", active: true,
    permissions: {}, canExceedDiscountLimit: true,
    canAccessPricing: true, canAccessHR: true, canAccessPayroll: true,
    featurePermissions: {},
  }).onConflictDoNothing();

  await db.insert(bankAccountsTable).values([
    { id: "bank-1", name: "البنك الأهلي المصري", balance: "500000" },
    { id: "bank-2", name: "بنك مصر", balance: "300000" },
    { id: "bank-3", name: "بنك القاهرة", balance: "200000" },
  ]).onConflictDoNothing();

  await db.insert(walletAccountsTable).values([
    { id: "wallet-1", name: "فودافون كاش", type: "vodafone_cash", identifier: "01000000000", balance: "50000" },
    { id: "wallet-2", name: "انستاباي", type: "instapay", identifier: "company@instapay", balance: "30000", maxLimit: "50000" },
  ]).onConflictDoNothing();

  await db.insert(paymentMethodsTable).values([
    { id: "cash", labelAr: "نقدي", labelEn: "Cash" },
    { id: "bank_transfer", labelAr: "تحويل بنكي", labelEn: "Bank Transfer" },
    { id: "vodafone_cash", labelAr: "فودافون كاش", labelEn: "Vodafone Cash" },
    { id: "instapay", labelAr: "انستاباي", labelEn: "InstaPay" },
    { id: "check", labelAr: "شيك", labelEn: "Check" },
  ]).onConflictDoNothing();

  await db.insert(warehouseConfigsTable).values([
    { id: "W1", name: "المخزن الرئيسي", normalThreshold: "50", warningThreshold: "20" },
    { id: "W2", name: "مخزن المواد الخام", normalThreshold: "100", warningThreshold: "30" },
    { id: "W3", name: "مخزن المنتجات", normalThreshold: "80", warningThreshold: "25" },
  ]).onConflictDoNothing();

  await db.insert(materialsTable).values([
    { id: 1, name: "ذرة صفراء", category: "حبوب", unit: "ton", defaultPricePerTon: "12000", substitutionGroup: "corn", minStockAlert: "50" },
    { id: 2, name: "صويا (44%)", category: "بروتين", unit: "ton", defaultPricePerTon: "18000", substitutionGroup: "soy", minStockAlert: "30" },
    { id: 3, name: "نخالة قمح", category: "نخالة", unit: "ton", defaultPricePerTon: "8000", substitutionGroup: "wheat_bran", minStockAlert: "20" },
    { id: 4, name: "جلوتين ذرة", category: "بروتين", unit: "ton", defaultPricePerTon: "15000", substitutionGroup: "gluten", minStockAlert: "15" },
    { id: 5, name: "بريمكس فيتامينات", category: "إضافات", unit: "kg", defaultPricePerTon: "45000", substitutionGroup: "premix", minStockAlert: "5" },
    { id: 6, name: "صويا (46%)", category: "بروتين", unit: "ton", defaultPricePerTon: "19500", substitutionGroup: "soy", minStockAlert: "20" },
    { id: 7, name: "زيت صويا", category: "دهون", unit: "ton", defaultPricePerTon: "22000", minStockAlert: "10" },
    { id: 8, name: "مسحوق عظم", category: "كالسيوم", unit: "ton", defaultPricePerTon: "5000", minStockAlert: "15" },
    { id: 9, name: "ملح طعام", category: "إضافات", unit: "ton", defaultPricePerTon: "1500", minStockAlert: "10" },
  ]).onConflictDoNothing();

  await db.insert(formulasTable).values([
    { id: 1, productId: "P001", productName: "علف تسمين دواجن 21%", proteinPct: "21.0", bagWeight: 50 },
    { id: 2, productId: "P002", productName: "علف بياض 18%", proteinPct: "18.0", bagWeight: 50 },
    { id: 3, productId: "P003", productName: "علف نامي 16%", proteinPct: "16.0", bagWeight: 50 },
    { id: 4, productId: "P004", productName: "علف حيواني 14%", proteinPct: "14.0", bagWeight: 50 },
  ]).onConflictDoNothing();

  await db.insert(formulaIngredientsTable).values([
    { formulaId: 1, materialId: 1, percentage: "55.0", isOptional: false },
    { formulaId: 1, materialId: 2, percentage: "25.0", isOptional: false },
    { formulaId: 1, materialId: 3, percentage: "10.0", isOptional: false },
    { formulaId: 1, materialId: 5, percentage: "1.0", isOptional: false },
    { formulaId: 1, materialId: 7, percentage: "3.0", isOptional: false },
    { formulaId: 1, materialId: 8, percentage: "1.5", isOptional: false },
    { formulaId: 1, materialId: 9, percentage: "0.5", isOptional: false },
    { formulaId: 2, materialId: 1, percentage: "50.0", isOptional: false },
    { formulaId: 2, materialId: 2, percentage: "20.0", isOptional: false },
    { formulaId: 2, materialId: 4, percentage: "8.0", isOptional: false },
    { formulaId: 2, materialId: 3, percentage: "12.0", isOptional: false },
    { formulaId: 2, materialId: 5, percentage: "1.0", isOptional: false },
    { formulaId: 3, materialId: 1, percentage: "60.0", isOptional: false },
    { formulaId: 3, materialId: 2, percentage: "15.0", isOptional: false },
    { formulaId: 3, materialId: 3, percentage: "15.0", isOptional: false },
    { formulaId: 3, materialId: 8, percentage: "2.0", isOptional: false },
    { formulaId: 4, materialId: 1, percentage: "45.0", isOptional: false },
    { formulaId: 4, materialId: 3, percentage: "35.0", isOptional: false },
    { formulaId: 4, materialId: 2, percentage: "10.0", isOptional: false },
    { formulaId: 4, materialId: 8, percentage: "3.0", isOptional: false },
    { formulaId: 4, materialId: 9, percentage: "0.5", isOptional: false },
  ]).onConflictDoNothing();

  for (const p of [
    { productId: "P001", productName: "علف تسمين دواجن 21%", productCode: "P001", category: "دواجن", bagWeight: 50, wholesalePrice: "18500", retailPrice: "19000", distributorPrice: "18200", minSalePrice: "18000", costPrice: "16500" },
    { productId: "P002", productName: "علف بياض 18%", productCode: "P002", category: "دواجن", bagWeight: 50, wholesalePrice: "17500", retailPrice: "18000", distributorPrice: "17200", minSalePrice: "17000", costPrice: "15500" },
    { productId: "P003", productName: "علف نامي 16%", productCode: "P003", category: "حيواني", bagWeight: 50, wholesalePrice: "16000", retailPrice: "16500", distributorPrice: "15700", minSalePrice: "15500", costPrice: "14000" },
    { productId: "P004", productName: "علف حيواني 14%", productCode: "P004", category: "حيواني", bagWeight: 50, wholesalePrice: "14500", retailPrice: "15000", distributorPrice: "14200", minSalePrice: "14000", costPrice: "13000" },
  ]) {
    await db.insert(productPricesTable).values(p).onConflictDoNothing();
  }

  await db.insert(customersTable).values([
    { id: "C001", name: "مزرعة السلام", phone: "01234567890", code: "C001", governorate: "القاهرة", region: "السلام", totalPurchases: "0", creditLimit: "100000", outstandingDebt: "0" },
    { id: "C002", name: "مزرعة النور", phone: "01234567891", code: "C002", governorate: "الجيزة", region: "الهرم", totalPurchases: "0", creditLimit: "150000", outstandingDebt: "0" },
    { id: "C003", name: "مزرعة الفتح", phone: "01234567892", code: "C003", governorate: "القليوبية", region: "بنها", totalPurchases: "0", creditLimit: "80000", outstandingDebt: "0" },
  ]).onConflictDoNothing();

  await db.insert(suppliersTable).values([
    { id: "S001", name: "شركة الأمل للحبوب", phone: "01234567890", code: "S001", material: "ذرة صفراء", status: "active", outstandingDebt: "0", totalPurchases: "0" },
    { id: "S002", name: "شركة النيل للصويا", phone: "01234567891", code: "S002", material: "صويا", status: "active", outstandingDebt: "0", totalPurchases: "0" },
    { id: "S003", name: "شركة الوادي للنخالة", phone: "01234567892", code: "S003", material: "نخالة قمح", status: "active", outstandingDebt: "0", totalPurchases: "0" },
  ]).onConflictDoNothing();

  await db.insert(shiftsTable).values([
    { id: "shift-1", name: "الفترة الصباحية", startTime: "07:00", endTime: "15:00", departments: ["إنتاج", "مستودعات", "صيانة"], lateThresholdMinutes: 15 },
    { id: "shift-2", name: "الفترة المسائية", startTime: "15:00", endTime: "23:00", departments: ["إنتاج"], lateThresholdMinutes: 15 },
    { id: "shift-3", name: "الفترة الليلية", startTime: "23:00", endTime: "07:00", departments: ["أمن"], lateThresholdMinutes: 10 },
  ]).onConflictDoNothing();

  await db.insert(employeesTable).values([
    { id: "EMP001", name: "أحمد علي", phone: "01111111111", department: "إنتاج", position: "مشرف إنتاج", salaryType: "monthly", baseSalary: "8000", dailyIncentive: "50", status: "active", workStartTime: "07:00", workEndTime: "15:00", workHours: "8" },
    { id: "EMP002", name: "محمد حسن", phone: "01111111112", department: "إنتاج", position: "عامل إنتاج", salaryType: "weekly", baseSalary: "3500", dailyIncentive: "30", status: "active", workStartTime: "07:00", workEndTime: "15:00", workHours: "8" },
    { id: "EMP003", name: "خالد عمر", phone: "01111111113", department: "مستودعات", position: "أمين مستودع", salaryType: "monthly", baseSalary: "6000", dailyIncentive: "40", status: "active", workStartTime: "07:00", workEndTime: "15:00", workHours: "8" },
  ]).onConflictDoNothing();

  await db.insert(fleetVehiclesTable).values([
    { id: "V001", name: "تريلا 1", plate: "س ص ع 1234", driver: "السيد أحمد", driverPhone: "01222222221", type: "heavy", maxCapacity: "25", status: "available", locationType: "at-factory" },
    { id: "V002", name: "تريلا 2", plate: "س ص ع 5678", driver: "محمود علي", driverPhone: "01222222222", type: "heavy", maxCapacity: "25", status: "available", locationType: "at-factory" },
    { id: "V003", name: "نصف نقل", plate: "د أ ب 111", driver: "إبراهيم حسن", driverPhone: "01222222223", type: "semi", maxCapacity: "10", status: "available", locationType: "at-factory" },
  ]).onConflictDoNothing();

  await db.insert(productGroupsTable).values([
    { id: 1, name: "أعلاف دواجن", customName: "دواجن", customMargin: "12" },
    { id: 2, name: "أعلاف حيواني", customName: "حيواني", customMargin: "10" },
  ]).onConflictDoNothing();

  await db.insert(appSettingsTable).values([
    { key: "companyName", value: "مؤسسة النجوم للأعلاف" },
    { key: "companyAddress", value: "المنطقة الصناعية - مدينة السادات - المنوفية" },
    { key: "maxDiscountPercent", value: "10" },
    { key: "discountExceedAllowed", value: "false" },
    { key: "taxEnabled", value: "true" },
    { key: "taxPercent", value: "14" },
    { key: "language", value: "ar" },
    { key: "theme", value: "light" },
  ]).onConflictDoNothing();

  console.log("✅ Seed complete!");
  await pool.end();
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
