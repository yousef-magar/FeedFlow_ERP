// Realistic Egyptian Animal Feed Factory Data
export const mockData = {
  kpis: {
    todaySales: 1250000,
    todayProfit: 187500,
    activeShipments: 14,
    collections: 850000,
    outstandingDebts: 4200000,
    criticalInventoryItems: 3,
    absentEmployees: 2
  },
  products: [
    { id: "P1", name: "نامي تسمين سوبر 21%", code: "F-21", category: "دواجن", proteinPct: 21, bagWeight: 50, wholeSalePrice: 24500, retailPrice: 25000, distributorPrice: 24000, minSalePrice: 23500 },
    { id: "P2", name: "بادي تسمين سوبر 23%", code: "F-23", category: "دواجن", proteinPct: 23, bagWeight: 50, wholeSalePrice: 25500, retailPrice: 26000, distributorPrice: 25000, minSalePrice: 24500 },
    { id: "P3", name: "ناهي تسمين سوبر 19%", code: "F-19", category: "دواجن", proteinPct: 19, bagWeight: 50, wholeSalePrice: 23500, retailPrice: 24000, distributorPrice: 23000, minSalePrice: 22500 },
    { id: "P4", name: "علف مواشي حلاب 18%", code: "C-18", category: "مواشي", proteinPct: 18, bagWeight: 50, wholeSalePrice: 18500, retailPrice: 19000, distributorPrice: 18000, minSalePrice: 17500 },
    { id: "P5", name: "علف تسمين عجول 16%", code: "C-16", category: "مواشي", proteinPct: 16, bagWeight: 50, wholeSalePrice: 17000, retailPrice: 17500, distributorPrice: 16500, minSalePrice: 16000 },
  ],
  inventory: [
    { id: "I1", materialName: "ذرة صفراء أوكراني", quantity: 1250, unit: "ton", warehouseId: "W1", batchNumber: "B-2023-11-01", productionDate: "2023-11-01", expiryDate: "2024-11-01", alertLevel: "normal" },
    { id: "I2", materialName: "صويا أرجنتيني 46%", quantity: 850, unit: "ton", warehouseId: "W1", batchNumber: "B-2023-11-05", productionDate: "2023-11-05", expiryDate: "2024-11-05", alertLevel: "normal" },
    { id: "I3", materialName: "نخالة (ردة) محلية", quantity: 45, unit: "ton", warehouseId: "W2", batchNumber: "B-2023-12-10", productionDate: "2023-12-10", expiryDate: "2024-03-10", alertLevel: "critical" },
    { id: "I4", materialName: "جلوتين ذرة مستورد", quantity: 120, unit: "ton", warehouseId: "W1", batchNumber: "B-2023-10-15", productionDate: "2023-10-15", expiryDate: "2024-10-15", alertLevel: "warning" },
    { id: "I5", materialName: "فيتامينات بريمكس", quantity: 5000, unit: "kg", warehouseId: "W3", batchNumber: "B-2023-09-20", productionDate: "2023-09-20", expiryDate: "2024-09-20", alertLevel: "normal" },
  ],
  customers: [
    { id: "C1", name: "مزارع الوطنية للدواجن", phone: "01012345678", address: "طريق مصر اسكندرية الزراعي", region: "البحيرة", governorate: "Alexandria", distributionCenter: "DC-North", totalPurchases: 15400000, lastPurchase: "2023-12-14", creditLimit: 2000000, outstandingDebt: 450000 },
    { id: "C2", name: "شركة الأماني للإنتاج الحيواني", phone: "01123456789", address: "المنطقة الصناعية بجمصة", region: "الاسكندرية", governorate: "Alexandria", distributionCenter: "DC-North", totalPurchases: 8500000, lastPurchase: "2023-12-10", creditLimit: 1000000, outstandingDebt: 120000 },
    { id: "C3", name: "مؤسسة النور لتوزيع الأعلاف", phone: "01234567890", address: "مركز طنطا", region: "الدقهلية", governorate: "Dakahlia", distributionCenter: "DC-Delta", totalPurchases: 12200000, lastPurchase: "2023-12-15", creditLimit: 1500000, outstandingDebt: 850000 },
    { id: "C4", name: "مزارع الوادي الجديد", phone: "01512345678", address: "طريق الخارجة", region: "الوادي الجديد", governorate: "New Valley", distributionCenter: "DC-South", totalPurchases: 4500000, lastPurchase: "2023-11-28", creditLimit: 500000, outstandingDebt: 0 },
    { id: "C5", name: "شركة الفيروز لتجارة الحبوب", phone: "01098765432", address: "مدينة السادات", region: "الدقهلية", governorate: "Dakahlia", distributionCenter: "DC-Delta", totalPurchases: 9800000, lastPurchase: "2023-12-05", creditLimit: 1200000, outstandingDebt: 320000 },
  ],
  fleet: [
    { id: "V1", name: "نقل ثقيل - ع ن 1234", driver: "محمد سعيد", type: "heavy", status: "on-route", location: "الطريق الزراعي" },
    { id: "V2", name: "نقل ثقيل - س م 5678", driver: "أحمد علي", type: "heavy", status: "loading", location: "المصنع" },
    { id: "V3", name: "نصف نقل - د ر 9012", driver: "محمود حسن", type: "semi", status: "available", location: "جراج المصنع" },
  ],
  employees: [
    { id: "E1", name: "حسن عبدالله", department: "الإنتاج", position: "مشرف وردية", baseSalary: 8000, status: "present", allowances: 1000, overtime: 500, deductions: 0, advances: 0 },
    { id: "E2", name: "سمير محمد", department: "المبيعات", position: "مندوب", baseSalary: 6000, status: "absent", allowances: 2000, overtime: 0, deductions: 200, advances: 1000 },
    { id: "E3", name: "طارق زياد", department: "الحسابات", position: "محاسب", baseSalary: 7500, status: "present", allowances: 500, overtime: 0, deductions: 0, advances: 0 },
  ],
  marketers: [
    { id: "M1", name: "كريم سامي", region: "الدلتا", customersCount: 12, totalSales: 4500000, commission: 45000, target: 5000000 },
    { id: "M2", name: "علاء محمود", region: "الصعيد", customersCount: 8, totalSales: 2800000, commission: 28000, target: 3000000 },
  ],
  suppliers: [
    { id: "S1", name: "الشركة الدولية للحبوب", material: "ذرة صفراء", balance: 1200000, status: "active" },
    { id: "S2", name: "مؤسسة الوفاء للاستيراد", material: "صويا", balance: 850000, status: "active" },
  ],
  recentActivity: [
    { id: 1, action: "تم إنشاء أمر إنتاج جديد رقم PRD-0042", time: "منذ 15 دقيقة", type: "production" },
    { id: 2, action: "تم تحصيل مبلغ 150,000 ج.م من مزارع الوطنية", time: "منذ ساعة", type: "finance" },
    { id: 3, action: "انخفاض رصيد النخالة في المخزن 2 عن الحد المسموح", time: "منذ ساعتين", type: "inventory" },
    { id: 4, action: "تم توصيل شحنة رقم SHP-883 بنجاح", time: "منذ 3 ساعات", type: "fleet" },
    { id: 5, action: "تم إضافة عميل جديد: مؤسسة الهدى", time: "منذ 5 ساعات", type: "sales" },
  ]
};
