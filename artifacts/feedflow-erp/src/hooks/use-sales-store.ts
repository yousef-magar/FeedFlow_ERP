import { create } from "zustand";
import { persist } from "zustand/middleware";
import { dexieStorage } from "@/lib/dexie-storage";
import { api } from "@/lib/api";
import { withSync } from "@/lib/with-sync";
import { logActivity } from "./use-activity-log";

export interface SalesInvoiceItem {
  productId: string;
  productName: string;
  productCode: string;
  qtyTons: number;
  bagWeight: number;
  bagCount: number;
  pricePerTon: number;
}

export interface SalesInvoice {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  type: "cash" | "credit" | "wholesale" | "retail";
  status: "paid" | "pending" | "overdue";
  date: string;
  items: SalesInvoiceItem[];
  discountPct: number;
  taxPct: number;
  subtotal: number;
  discountAmt: number;
  taxAmt: number;
  total: number;
  paidAmount: number;
  marketerId?: string;
  pricingTier?: "wholesale" | "retail";
  additionalCharges?: number;
  additionalChargesDesc?: string;
  payMethod?: string;
  payBank?: string;
  needsDelivery?: boolean;
  deliveryAddress?: {
    governorate: string;
    region: string;
    village?: string;
    details: string;
  };
}

export interface SalesReturnItem {
  productId: string;
  productName: string;
  qtyTons: number;
  bagWeight: number;
  bagCount: number;
  pricePerTon: number;
}

export interface SalesReturn {
  id: string;
  invoiceId: string;
  customerId: string;
  customerName: string;
  date: string;
  items: SalesReturnItem[];
  reason: string;
  total: number;
  discountPct?: number;
  discountAmt?: number;
  taxPct?: number;
  taxAmt?: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  phone2: string;
  code: string;
  address: string;
  region: string;
  governorate: string;
  distributionCenter: string;
  totalPurchases: number;
  lastPurchase: string;
  creditLimit: number;
  outstandingDebt: number;
  savedAddresses?: { governorate: string; region: string; village?: string; details: string[] }[];
}

export interface PaymentAllocation {
  invoiceId: string;
  amount: number;
}

export interface Payment {
  id: string;
  customerId: string;
  customerName: string;
  date: string;
  amount: number;
  type: "cash_receipt";
  allocations: PaymentAllocation[];
  notes?: string;
}

interface SalesState {
  invoices: SalesInvoice[];
  returns: SalesReturn[];
  customers: Customer[];
  payments: Payment[];
  addInvoice: (inv: SalesInvoice) => Promise<SalesInvoice | null>;
  updateInvoice: (id: string, data: Partial<SalesInvoice>) => Promise<SalesInvoice | null>;
  deleteInvoice: (id: string) => Promise<void>;
  addReturn: (ret: SalesReturn) => Promise<SalesReturn | null>;
  addCustomer: (c: Customer) => Promise<Customer | null>;
  updateCustomer: (id: string, data: Partial<Customer>) => Promise<Customer | null>;
  deleteCustomer: (id: string) => Promise<void>;
  saveCustomerAddress: (customerId: string, addr: { governorate: string; region: string; village?: string; details: string[] }) => void;
  addPayment: (pmt: Payment) => void;
  getCustomerPayments: (customerId: string) => Payment[];
  recalcOutstandingDebt: (customerId: string) => void;
  nextInvoiceNum: () => number;
  customRegions: Record<string, string[]>;
  addCustomRegion: (governorate: string, region: string) => void;
}

export const useSalesStore = create<SalesState>()(
  persist(
    (set, get) => ({
      invoices: [],
      returns: [],
      customers: [],
      payments: [],
      addInvoice: async (inv) => {
        const created = await withSync(() => api.invoices.create(inv), "الفاتورة");
        if (created) { set(s => ({ invoices: [created, ...s.invoices] })); logActivity("sales", "create", `إنشاء فاتورة: ${created.id} - ${created.customerName} - ${created.total} جنيه`, `New invoice: ${created.id} - ${created.customerName} - ${created.total} EGP`, created.id); }
        return created;
      },
      updateInvoice: async (id, data) => {
        const updated = await withSync(() => api.invoices.update(id, data), "الفاتورة");
        if (updated) { set(s => ({ invoices: s.invoices.map(i => i.id === id ? updated : i) })); logActivity("sales", "update", `تحديث الفاتورة: ${id}`, `Update invoice: ${id}`, id); }
        return updated;
      },
      deleteInvoice: async (id) => {
        const res = await withSync<any>(() => api.invoices.delete(id), "الفاتورة");
        if (res) { set(s => ({ invoices: s.invoices.filter(i => i.id !== id) })); logActivity("sales", "delete", `حذف الفاتورة: ${id}`, `Delete invoice: ${id}`, id); }
      },
      addReturn: async (ret) => {
        const created = await withSync(() => api.returns.create(ret), "المرتجع");
        if (created) { set(s => ({ returns: [created, ...s.returns] })); logActivity("sales", "create", `إضافة مرتجع: ${created.id} - ${created.customerName} - ${created.total} جنيه`, `New return: ${created.id} - ${created.customerName} - ${created.total} EGP`, created.id); }
        return created;
      },
      addCustomer: async (c) => {
        const created = await withSync(() => api.customers.create(c), "العميل");
        if (created) { set(s => ({ customers: [...s.customers, created] })); logActivity("customers", "create", `إضافة عميل: ${created.name}`, `Add customer: ${created.name}`, created.id); }
        return created;
      },
      updateCustomer: async (id, data) => {
        const updated = await withSync(() => api.customers.update(id, data), "العميل");
        if (updated) { set(s => ({ customers: s.customers.map(c => c.id === id ? updated : c) })); logActivity("customers", "update", `تحديث بيانات العميل: ${id}`, `Update customer: ${id}`, id); }
        return updated;
      },
      deleteCustomer: async (id) => {
        const res = await withSync<any>(() => api.customers.delete(id), "العميل");
        if (res) { set(s => ({ customers: s.customers.filter(c => c.id !== id) })); logActivity("customers", "delete", `حذف العميل: ${id}`, `Delete customer: ${id}`, id); }
      },
      saveCustomerAddress: (customerId, addr) => set(s => ({
        customers: s.customers.map(c => {
          if (c.id !== customerId) return c;
          const existing = c.savedAddresses || [];
          const dup = existing.find(e => e.governorate === addr.governorate && e.region === addr.region && e.village === addr.village && JSON.stringify(e.details) === JSON.stringify(addr.details));
          return { ...c, savedAddresses: dup ? existing : [...existing, addr] };
        }),
      })),
      addPayment: (pmt) => {
        const { invoices, customers } = get();
        let remaining = pmt.amount;
        const allocations: PaymentAllocation[] = [];

        const customerInvoices = invoices
          .filter(i => i.customerId === pmt.customerId && i.status !== "paid")
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        for (const inv of customerInvoices) {
          if (remaining <= 0) break;
          const invRemaining = inv.total - (inv.paidAmount || 0);
          if (invRemaining <= 0) continue;
          const alloc = Math.min(remaining, invRemaining);
          allocations.push({ invoiceId: inv.id, amount: alloc });
          remaining -= alloc;
        }

        const pmtWithAlloc: Payment = { ...pmt, allocations: allocations.length > 0 ? allocations : pmt.allocations };

        set(s => {
          let updatedInvoices = [...s.invoices];
          for (const alloc of pmtWithAlloc.allocations) {
            updatedInvoices = updatedInvoices.map(inv => {
              if (inv.id !== alloc.invoiceId) return inv;
              const newPaid = Number(inv.paidAmount || 0) + alloc.amount;
              return {
                ...inv,
                paidAmount: newPaid,
                status: newPaid >= inv.total ? "paid" : inv.status,
              };
            });
          }

          const updatedCustomers = s.customers.map(c => {
            if (c.id !== pmt.customerId) return c;
            const totalRemaining = updatedInvoices
              .filter(i => i.customerId === pmt.customerId && i.status !== "paid")
              .reduce((sum, i) => sum + (i.total - (i.paidAmount || 0)), 0);
            return { ...c, outstandingDebt: Math.max(0, totalRemaining) };
          });

          return {
            invoices: updatedInvoices,
            customers: updatedCustomers,
            payments: [pmtWithAlloc, ...s.payments],
          };
        });
        logActivity("sales", "create", `تسجيل دفعة: ${pmt.amount} جنيه من ${pmt.customerName}`, `Payment: ${pmt.amount} EGP from ${pmt.customerName}`, pmt.id);
      },
      getCustomerPayments: (customerId) => get().payments.filter(p => p.customerId === customerId),
      recalcOutstandingDebt: (customerId) => set(s => {
        const totalRemaining = s.invoices
          .filter(i => i.customerId === customerId && i.status !== "paid")
          .reduce((sum, i) => sum + (i.total - (i.paidAmount || 0)), 0);
        return {
          customers: s.customers.map(c =>
            c.id === customerId ? { ...c, outstandingDebt: Math.max(0, totalRemaining) } : c
          ),
        };
      }),
      nextInvoiceNum: () => {
        let maxNum = 0;
        for (const inv of get().invoices) {
          const m = inv.id.match(/INV-\d+-(\d+)/);
          if (m) maxNum = Math.max(maxNum, parseInt(m[1]));
        }
        return maxNum + 1;
      },
      customRegions: {},
      addCustomRegion: (governorate, region) => set(s => ({
        customRegions: {
          ...s.customRegions,
          [governorate]: [...(s.customRegions[governorate] || []), region],
        },
      })),
    }),
    {
      name: "ff-sales",
      storage: dexieStorage,
      migrate: (persisted: any) => {
        if (!persisted || !persisted.invoices) return persisted;
        return {
          ...persisted,
          invoices: persisted.invoices.map((inv: any) => ({
            ...inv,
            paidAmount: inv.paidAmount ?? (inv.status === "paid" ? inv.total : 0),
            additionalCharges: inv.additionalCharges ?? 0,
            additionalChargesDesc: inv.additionalChargesDesc ?? "",
          })),
          payments: persisted.payments ?? [],
        };
      },
    },
  ),
);
