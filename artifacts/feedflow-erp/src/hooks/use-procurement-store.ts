import { create } from "zustand";
import { persist } from "zustand/middleware";
import { dexieStorage } from "@/lib/dexie-storage";
import { api } from "@/lib/api";
import { withSync } from "@/lib/with-sync";
import { logActivity } from "./use-activity-log";

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  code: string;
  address: string;
  material: string;
  outstandingDebt: number;
  totalPurchases: number;
  lastPurchase: string;
  status: "active" | "inactive";
}

export interface PurchaseOrderItem {
  material: string;
  qty: number;
  unit: "ton" | "kg" | "bag";
  unitPrice: number;
  total: number;
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  supplierName: string;
  date: string;
  dueDate?: string;
  status: "pending" | "approved" | "delivered" | "paid" | "overdue";
  items: PurchaseOrderItem[];
  total: number;
  paidAmount: number;
  payMethod?: string;
  payBank?: string;
  notes?: string;
}

export interface PurchaseReturnItem {
  material: string;
  qty: number;
  unit: "ton" | "kg" | "bag";
  unitPrice: number;
  total: number;
}

export interface PurchaseReturn {
  id: string;
  poId: string;
  supplierId: string;
  supplierName: string;
  date: string;
  items: PurchaseReturnItem[];
  total: number;
  reason: string;
}

export interface SupplierPaymentAllocation {
  poId: string;
  amount: number;
}

export interface SupplierPayment {
  id: string;
  supplierId: string;
  supplierName: string;
  date: string;
  amount: number;
  method: "cash" | "bank_transfer" | "vodafone_cash" | "instapay";
  bankId?: string;
  allocations: SupplierPaymentAllocation[];
  notes?: string;
}

interface ProcState {
  suppliers: Supplier[];
  orders: PurchaseOrder[];
  returns: PurchaseReturn[];
  payments: SupplierPayment[];
  addSupplier: (s: Omit<Supplier, "id" | "totalPurchases" | "lastPurchase">) => Promise<Supplier | null>;
  updateSupplier: (id: string, data: Partial<Supplier>) => Promise<Supplier | null>;
  deleteSupplier: (id: string) => Promise<void>;
  addOrder: (o: PurchaseOrder) => Promise<PurchaseOrder | null>;
  updateOrder: (id: string, data: Partial<PurchaseOrder>) => Promise<PurchaseOrder | null>;
  deleteOrder: (id: string) => Promise<void>;
  addReturn: (r: PurchaseReturn) => Promise<PurchaseReturn | null>;
  addPayment: (pmt: SupplierPayment) => Promise<SupplierPayment | null>;
  recalcDebt: (supplierId: string) => void;
  nextOrderNum: () => number;
  nextReturnNum: () => number;
}

export const useProcurementStore = create<ProcState>()(
  persist(
    (set, get) => ({
      suppliers: [],
      orders: [],
      returns: [],
      payments: [],
      addSupplier: async (s) => {
        const full = { ...s, id: `SUP-${Date.now()}`, totalPurchases: 0, lastPurchase: "" };
        const created = await withSync(() => api.suppliers.create(full), "المورد");
        const saved = created || full;
        if (saved) {
          set(state => ({ suppliers: [...state.suppliers, saved] }));
          logActivity("procurement", "create", `إضافة مورد: ${saved.name}`, `Add supplier: ${saved.name}`, saved.id);
        }
        return saved;
      },
      updateSupplier: async (id, data) => {
        const updated = await withSync(() => api.suppliers.update(id, data), "المورد");
        const saved = updated || data;
        if (saved) {
          set(state => ({ suppliers: state.suppliers.map(s => s.id === id ? { ...s, ...saved } : s) }));
          logActivity("procurement", "update", `تحديث بيانات المورد: ${id}`, `Update supplier: ${id}`, id);
        }
        return saved;
      },
      deleteSupplier: async (id) => {
        await withSync<any>(() => api.suppliers.delete(id), "المورد").catch(() => {});
        set(state => ({ suppliers: state.suppliers.filter(s => s.id !== id) }));
        logActivity("procurement", "delete", `حذف المورد: ${id}`, `Delete supplier: ${id}`, id);
      },
      addOrder: async (o) => {
        const created = await withSync(() => api.purchaseOrders.create(o), "أمر الشراء");
        const saved = created || o;
        if (saved) {
          set(state => {
            const now = new Date().toISOString().split("T")[0];
            return {
              orders: [...state.orders, saved],
              suppliers: state.suppliers.map(s => s.id === o.supplierId ? {
                ...s,
                totalPurchases: (s.totalPurchases || 0) + Number(saved.total || 0),
                lastPurchase: now,
                outstandingDebt: (s.outstandingDebt || 0) + (Number(saved.total || 0) - Number(saved.paidAmount || 0)),
              } : s),
            };
          });
          logActivity("procurement", "create", `إنشاء أمر شراء: ${saved.id} - ${saved.supplierName} - ${saved.total} جنيه`, `New PO: ${saved.id} - ${saved.supplierName} - ${saved.total} EGP`, saved.id);
        }
        return saved;
      },
      updateOrder: async (id, data) => {
        const updated = await withSync(() => api.purchaseOrders.update(id, data), "أمر الشراء");
        const saved = updated || data;
        if (saved) {
          set(state => ({ orders: state.orders.map(o => o.id === id ? { ...o, ...saved } : o) }));
          logActivity("procurement", "update", `تحديث أمر الشراء: ${id}`, `Update PO: ${id}`, id);
        }
        return saved;
      },
      deleteOrder: async (id) => {
        const res = await withSync<any>(() => api.purchaseOrders.delete(id), "أمر الشراء");
        set(state => ({ orders: state.orders.filter(o => o.id !== id) }));
        logActivity("procurement", "delete", `حذف أمر الشراء: ${id}`, `Delete PO: ${id}`, id);
      },
      addReturn: async (r) => {
        const created = await withSync(() => api.purchaseReturns.create(r), "مرتجع الشراء");
        const saved = created || r;
        if (saved) {
          set(state => ({
            returns: [...state.returns, saved],
            orders: state.orders.map(o => o.id === r.poId ? { ...o, total: (o.total || 0) - (saved.total || 0) } : o),
          }));
          logActivity("procurement", "create", `إضافة مرتجع مشتريات: ${saved.id} - ${saved.total} جنيه`, `New purchase return: ${saved.id} - ${saved.total} EGP`, saved.id);
        }
        return saved;
      },
      addPayment: async (pmt) => {
        const created = await withSync(() => api.supplierPayments.create(pmt), "الدفعة");
        const saved = created || pmt;
        if (saved) {
          set(state => {
            let updatedOrders = [...state.orders];
            for (const alloc of (saved as any).allocations || pmt.allocations) {
              updatedOrders = updatedOrders.map(o =>
                o.id === alloc.poId
                  ? { ...o, paidAmount: (o.paidAmount || 0) + alloc.amount, status: ((o.paidAmount || 0) + alloc.amount >= o.total ? "paid" : o.status) as any }
                  : o
              );
            }
            const paidTotal = (saved as any).allocations?.reduce((s: number, a: any) => s + a.amount, 0) || pmt.allocations.reduce((s, a) => s + a.amount, 0);
            return {
              payments: [...state.payments, saved],
              orders: updatedOrders,
              suppliers: state.suppliers.map(s =>
                s.id === pmt.supplierId
                  ? { ...s, outstandingDebt: Math.max(0, (s.outstandingDebt || 0) - paidTotal) }
                  : s
              ),
            };
          });
          logActivity("procurement", "create", `تسجيل دفعة مورد: ${pmt.amount} جنيه لـ ${pmt.supplierName}`, `Supplier payment: ${pmt.amount} EGP to ${pmt.supplierName}`, pmt.id);
        }
        return saved;
      },
      recalcDebt: (supplierId) => set(state => {
        const total = state.orders
          .filter(o => o.supplierId === supplierId)
          .reduce((s, o) => s + (o.total - (o.paidAmount || 0)), 0);
        return {
          suppliers: state.suppliers.map(s => s.id === supplierId ? { ...s, outstandingDebt: total } : s),
        };
      }),
      nextOrderNum: () => {
        const orders = get().orders;
        const max = orders.reduce((m, o) => Math.max(m, parseInt(o.id.replace("PO-", "")) || 0), 0);
        return max + 1;
      },
      nextReturnNum: () => {
        const returns = get().returns;
        const max = returns.reduce((m, r) => Math.max(m, parseInt(r.id.replace("PR-", "")) || 0), 0);
        return max + 1;
      },
    }),
    { name: "ff-procurement", storage: dexieStorage }
  )
);
