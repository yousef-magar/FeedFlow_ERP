const BASE = "/api";

function getToken(): string | null {
  try {
    return localStorage.getItem("feedflow-jwt");
  } catch { return null; }
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = {};
  if (body) headers["Content-Type"] = "application/json";
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || res.statusText);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

const get = <T>(path: string) => request<T>("GET", path);
const post = <T>(path: string, body?: unknown) => request<T>("POST", path, body);
const put = <T>(path: string, body: unknown) => request<T>("PUT", path, body);
const del = <T>(path: string) => request<T>("DELETE", path);

export const api = {
  materials: {
    list: () => get<any[]>("/materials"),
    get: (id: number) => get<any>(`/materials/${id}`),
    create: (d: any) => post<any>("/materials", d),
    update: (id: number, d: any) => put<any>(`/materials/${id}`, d),
    delete: (id: number) => del(`/materials/${id}`),
  },
  inventory: {
    list: () => get<any[]>("/inventory"),
    create: (d: any) => post<any>("/inventory", d),
    update: (id: number, d: any) => put<any>(`/inventory/${id}`, d),
    delete: (id: number) => del(`/inventory/${id}`),
  },
  formulas: {
    list: () => get<any[]>("/formulas"),
    create: (d: any) => post<any>("/formulas", d),
    update: (id: number, d: any) => put<any>(`/formulas/${id}`, d),
    delete: (id: number) => del(`/formulas/${id}`),
  },
  productionOrders: {
    list: () => get<any[]>("/production-orders"),
    create: (d: any) => post<any>("/production-orders", d),
    update: (id: string, d: any) => put<any>(`/production-orders/${id}`, d),
    delete: (id: string) => del(`/production-orders/${id}`),
  },
  warehouseConfigs: {
    list: () => get<any[]>("/warehouse-configs"),
    create: (d: any) => post<any>("/warehouse-configs", d),
    update: (id: string, d: any) => put<any>(`/warehouse-configs/${id}`, d),
  },
  customers: {
    list: () => get<any[]>("/customers"),
    get: (id: string) => get<any>(`/customers/${id}`),
    create: (d: any) => post<any>("/customers", d),
    update: (id: string, d: any) => put<any>(`/customers/${id}`, d),
    delete: (id: string) => del(`/customers/${id}`),
  },
  invoices: {
    list: () => get<any[]>("/invoices"),
    get: (id: string) => get<any>(`/invoices/${id}`),
    create: (d: any) => post<any>("/invoices", d),
    update: (id: string, d: any) => put<any>(`/invoices/${id}`, d),
    delete: (id: string) => del(`/invoices/${id}`),
  },
  returns: {
    list: () => get<any[]>("/returns"),
    create: (d: any) => post<any>("/returns", d),
  },
  payments: {
    list: () => get<any[]>("/payments"),
    create: (d: any) => post<any>("/payments", d),
  },
  employees: {
    list: () => get<any[]>("/employees"),
    create: (d: any) => post<any>("/employees", d),
    update: (id: string, d: any) => put<any>(`/employees/${id}`, d),
    delete: (id: string) => del(`/employees/${id}`),
  },
  shifts: {
    list: () => get<any[]>("/shifts"),
    create: (d: any) => post<any>("/shifts", d),
    delete: (id: string) => del(`/shifts/${id}`),
  },
  attendance: {
    list: (params?: string) => get<any[]>(`/attendance${params ? `?${params}` : ""}`),
    create: (d: any) => post<any>("/attendance", d),
    update: (id: number, d: any) => put<any>(`/attendance/${id}`, d),
  },
  payroll: {
    list: () => get<any[]>("/payroll"),
    create: (d: any) => post<any>("/payroll", d),
  },
  vehicles: {
    list: () => get<any[]>("/vehicles"),
    create: (d: any) => post<any>("/vehicles", d),
    update: (id: string, d: any) => put<any>(`/vehicles/${id}`, d),
    delete: (id: string) => del(`/vehicles/${id}`),
  },
  shipments: {
    list: () => get<any[]>("/shipments"),
    create: (d: any) => post<any>("/shipments", d),
    update: (id: string, d: any) => put<any>(`/shipments/${id}`, d),
    delete: (id: string) => del(`/shipments/${id}`),
  },
  suppliers: {
    list: () => get<any[]>("/suppliers"),
    create: (d: any) => post<any>("/suppliers", d),
    update: (id: string, d: any) => put<any>(`/suppliers/${id}`, d),
    delete: (id: string) => del(`/suppliers/${id}`),
  },
  purchaseOrders: {
    list: () => get<any[]>("/purchase-orders"),
    create: (d: any) => post<any>("/purchase-orders", d),
    update: (id: string, d: any) => put<any>(`/purchase-orders/${id}`, d),
    delete: (id: string) => del(`/purchase-orders/${id}`),
  },
  purchaseReturns: {
    list: () => get<any[]>("/purchase-returns"),
    create: (d: any) => post<any>("/purchase-returns", d),
  },
  supplierPayments: {
    list: () => get<any[]>("/supplier-payments"),
    create: (d: any) => post<any>("/supplier-payments", d),
  },
  productPrices: {
    list: () => get<any[]>("/product-prices"),
    create: (d: any) => post<any>("/product-prices", d),
    update: (id: number, d: any) => put<any>(`/product-prices/${id}`, d),
    delete: (id: number) => del(`/product-prices/${id}`),
  },
  pricingAlerts: {
    list: () => get<any[]>("/pricing-alerts"),
    create: (d: any) => post<any>("/pricing-alerts", d),
    update: (id: number, d: any) => put<any>(`/pricing-alerts/${id}`, d),
  },
  productGroups: {
    list: () => get<any[]>("/product-groups"),
    create: (d: any) => post<any>("/product-groups", d),
    update: (id: number, d: any) => put<any>(`/product-groups/${id}`, d),
    delete: (id: number) => del(`/product-groups/${id}`),
  },
  groupItems: {
    create: (d: any) => post<any>("/group-items", d),
    delete: (id: number) => del(`/group-items/${id}`),
  },
  subAccounts: {
    list: () => get<any[]>("/sub-accounts"),
    create: (d: any) => post<any>("/sub-accounts", d),
    update: (id: string, d: any) => put<any>(`/sub-accounts/${id}`, d),
    delete: (id: string) => del(`/sub-accounts/${id}`),
  },
  bankAccounts: {
    list: () => get<any[]>("/bank-accounts"),
    create: (d: any) => post<any>("/bank-accounts", d),
    update: (id: string, d: any) => put<any>(`/bank-accounts/${id}`, d),
    delete: (id: string) => del(`/bank-accounts/${id}`),
  },
  walletAccounts: {
    list: () => get<any[]>("/wallet-accounts"),
    create: (d: any) => post<any>("/wallet-accounts", d),
    update: (id: string, d: any) => put<any>(`/wallet-accounts/${id}`, d),
    delete: (id: string) => del(`/wallet-accounts/${id}`),
  },
  expenseCategories: {
    list: () => get<string[]>("/expense-categories"),
    create: (name: string) => post<any>("/expense-categories", { name }),
    delete: (name: string) => del(`/expense-categories/${encodeURIComponent(name)}`),
  },
  auth: {
    login: async (email: string, password: string) => {
      const result = await post<any>("/auth/login", { email, password });
      if (result.token) {
        localStorage.setItem("feedflow-jwt", result.token);
      }
      return result;
    },
    me: () => get<any>("/auth/me"),
    logout: () => localStorage.removeItem("feedflow-jwt"),
  },
  activityLog: {
    list: (params?: string) => get<any[]>(`/activity-log${params ? `?${params}` : ""}`),
    create: (d: any) => post<any>("/activity-log", d),
    clear: () => del("/activity-log"),
  },
  notifications: {
    list: () => get<any[]>("/notifications"),
    create: (d: any) => post<any>("/notifications", d),
    markRead: (id: string) => put<any>(`/notifications/${id}/read`, {}),
    markAllRead: () => put<any>("/notifications/read-all", {}),
    clear: () => del("/notifications"),
  },
};
