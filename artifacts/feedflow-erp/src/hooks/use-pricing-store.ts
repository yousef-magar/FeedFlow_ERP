import { create } from "zustand";
import { persist } from "zustand/middleware";
import { dexieStorage } from "@/lib/dexie-storage";
import { MATERIAL_CATALOG } from "@/lib/substitution-engine";
import { useProductionStore } from "./use-production-store";
import { useProcurementStore } from "./use-procurement-store";
import { api } from "@/lib/api";

export interface PriceEntry {
  date: string;
  field: string;
  oldValue: number;
  newValue: number;
}

export interface ProductPrice {
  id?: number;
  productId: string;
  productName: string;
  productCode: string;
  category: string;
  bagWeight: number;
  wholeSalePrice: number;
  retailPrice: number;
  distributorPrice: number;
  minSalePrice: number;
  costPrice: number;
  lastUpdated: string;
  priceHistory: PriceEntry[];
}

export interface PricingAlert {
  productName: string;
  costPrice: number;
  reason: "production" | "procurement";
  date: string;
  dismissed: boolean;
}

interface GroupState {
  groupExtraItems: Record<string, string[]>;
  groupCustomNames: Record<string, string>;
  groupCustomMargins: Record<string, string>;
  customGroups: string[];
}

interface PricingState extends GroupState {
  productPrices: ProductPrice[];
  pricingAlerts: PricingAlert[];
  updatePrice: (productId: string, field: keyof ProductPrice, value: number) => void;
  setProductPrices: (prices: ProductPrice[]) => void;
  getPrice: (productId: string, tier: "wholesale" | "retail" | "distributor") => number;
  getCostPrice: (productId: string) => number;
  recalculateCostPrices: () => void;
  ensureInventoryPrices: (inventory: { id: string; materialName: string; type: string; unit: string }[]) => void;
  addPricingAlert: (productName: string, costPrice: number, reason: "production" | "procurement") => void;
  dismissPricingAlert: (index: number) => void;
  dismissAllAlerts: () => void;
  applySuggestedPrice: (index: number) => void;
  calculateFormulaCost: (productId: string) => number | null;
  recalculateFormulaCosts: () => void;
  getLastPurchasePrice: (materialName: string) => number | null;
  syncRawCostsFromProcurement: () => void;
  bulkUpdatePrices: (productIds: string[], field: keyof ProductPrice, value: number) => void;
  addItemToGroup: (groupName: string, itemName: string) => void;
  removeItemFromGroup: (groupName: string, itemName: string) => void;
  setGroupCustomName: (groupName: string, label: string) => void;
  setGroupMargin: (groupName: string, pct: string) => void;
  addCustomGroup: (name: string) => void;
  removeCustomGroup: (name: string) => void;
}

function seedPrices(): ProductPrice[] {
  return [];
}

export const usePricingStore = create<PricingState>()(
  persist(
    (set, get) => ({
      productPrices: seedPrices(),
      pricingAlerts: [],
      groupExtraItems: {},
      groupCustomNames: {},
      groupCustomMargins: {},
      customGroups: [],

      updatePrice: (productId, field, value) => {
        const oldPrices = get().productPrices;
        const idx = oldPrices.findIndex(p => p.productId === productId);
        if (idx === -1) return;
        const product = oldPrices[idx];
        const oldValue = product[field] as number;
        if (oldValue === value) return;
        const historyEntry: PriceEntry = {
          date: new Date().toISOString(),
          field,
          oldValue,
          newValue: value,
        };
        const updated = [...oldPrices];
        updated[idx] = {
          ...product,
          [field]: value,
          lastUpdated: new Date().toISOString().split("T")[0],
          priceHistory: [historyEntry, ...product.priceHistory.slice(0, 49)],
        };
        set({ productPrices: updated });
        if (field === "costPrice" || field === "wholeSalePrice") {
          get().recalculateFormulaCosts();
        }
        // Sync to API
        const dbId = oldPrices[idx].id;
        if (dbId) {
          api.productPrices.update(dbId, { [field]: value }).catch(() => {});
        }
      },

      setProductPrices: (prices) => set({ productPrices: prices }),

      getPrice: (productId, tier) => {
        const p = get().productPrices.find(p => p.productId === productId);
        if (!p) return 0;
        if (tier === "wholesale") return p.wholeSalePrice;
        if (tier === "retail") return p.retailPrice;
        return p.distributorPrice;
      },

      getCostPrice: (productId) => {
        const p = get().productPrices.find(p => p.productId === productId);
        return p?.costPrice || 0;
      },

      ensureInventoryPrices: (inventory) => {
        const existing = get().productPrices;
        const now = new Date().toISOString().split("T")[0];
        const existingIds = new Set(existing.map(p => p.productId));
        const newPrices: ProductPrice[] = [];
        for (const item of inventory) {
          if (existingIds.has(`inv-${item.id}`)) continue;
          const invId = `inv-${item.id}`;
          const cost = get().productPrices.find(p => p.productName.includes(item.materialName.replace(/ .*/, "")) || item.materialName.includes(p.productName.slice(0, 6)))?.costPrice || 0;
          newPrices.push({
            productId: invId,
            productName: item.materialName,
            productCode: item.type === "raw" ? "خام" : "مصنع",
            category: item.type === "raw" ? "خام" : "مصنع",
            bagWeight: item.unit === "ton" ? 50 : 1,
            wholeSalePrice: Math.round(cost * 1.4),
            retailPrice: Math.round(cost * 1.5),
            distributorPrice: Math.round(cost * 1.3),
            minSalePrice: Math.round(cost * 1.2),
            costPrice: cost,
            lastUpdated: now,
            priceHistory: [],
          });
          existingIds.add(invId);
        }
        if (newPrices.length > 0) {
          set({ productPrices: [...existing, ...newPrices] });
        }
      },

      recalculateCostPrices: () => {
        const d = new Date().toISOString().split("T")[0];
        const updated = get().productPrices.map(p => {
          const oldCost = p.costPrice;
          const formulaCost = get().calculateFormulaCost(p.productId);
          const newCost = formulaCost !== null ? formulaCost : Math.round(p.wholeSalePrice * 0.75);
          if (oldCost === newCost) return p;
          return {
            ...p,
            costPrice: newCost,
            lastUpdated: d,
            priceHistory: [{
              date: new Date().toISOString(),
              field: "costPrice",
              oldValue: oldCost,
              newValue: newCost,
            }, ...p.priceHistory.slice(0, 49)],
          };
        });
        set({ productPrices: updated });
      },

      addPricingAlert: (productName, costPrice, reason) => {
        const alerts = get().pricingAlerts;
        const dup = alerts.some(a =>
          !a.dismissed && a.productName === productName && a.reason === reason &&
          Date.now() - new Date(a.date).getTime() < 3600000
        );
        if (dup) return;
        set({
          pricingAlerts: [{
            productName,
            costPrice,
            reason,
            date: new Date().toISOString(),
            dismissed: false,
          }, ...alerts],
        });
      },

      dismissPricingAlert: (index) => {
        const alerts = [...get().pricingAlerts];
        if (alerts[index]) {
          alerts[index] = { ...alerts[index], dismissed: true };
          set({ pricingAlerts: alerts });
        }
      },

      dismissAllAlerts: () => {
        const alerts = get().pricingAlerts.map(a => ({ ...a, dismissed: true }));
        set({ pricingAlerts: alerts });
      },

      applySuggestedPrice: (index) => {
        const { pricingAlerts, productPrices } = get();
        const alert = pricingAlerts[index];
        if (!alert || alert.dismissed) return;
        const product = productPrices.find(p => p.productName === alert.productName);
        if (product) {
          const suggested = Math.round(alert.costPrice * 1.2);
          get().updatePrice(product.productId, "wholeSalePrice", suggested);
          get().updatePrice(product.productId, "retailPrice", Math.round(suggested * 1.08));
          get().updatePrice(product.productId, "distributorPrice", Math.round(suggested * 0.95));
          get().updatePrice(product.productId, "minSalePrice", Math.round(suggested * 0.9));
        }
        const alerts = [...pricingAlerts];
        alerts[index] = { ...alerts[index], dismissed: true };
        set({ pricingAlerts: alerts });
      },

      calculateFormulaCost: (productId) => {
        const formulas = useProductionStore.getState().formulas;
        const formula = formulas[productId];
        if (!formula || formula.length === 0) return null;
        let totalCost = 0;
        const prices = get().productPrices;
        for (const ing of formula) {
          const ingPrice = prices.find(p => p.productName === ing.material);
          const ingCostPerTon = ingPrice?.costPrice ||
            (() => {
              for (const group of Object.values(MATERIAL_CATALOG)) {
                const m = group.find(g => g.name === ing.material);
                if (m) return m.pricePerTon;
              }
              return 0;
            })();
          totalCost += (ing.pct / 100) * ingCostPerTon;
        }
        return Math.round(totalCost);
      },

      recalculateFormulaCosts: () => {
        const { formulas } = useProductionStore.getState();
        const productIds = Object.keys(formulas);
        if (productIds.length === 0) return;
        const d = new Date().toISOString().split("T")[0];
        const updated = get().productPrices.map(p => {
          if (!productIds.includes(p.productId)) return p;
          const formulaCost = get().calculateFormulaCost(p.productId);
          if (formulaCost === null || formulaCost === p.costPrice) return p;
          return {
            ...p,
            costPrice: formulaCost,
            lastUpdated: d,
            priceHistory: [{
              date: new Date().toISOString(),
              field: "costPrice",
              oldValue: p.costPrice,
              newValue: formulaCost,
            }, ...p.priceHistory.slice(0, 49)],
          };
        });
        set({ productPrices: updated });
      },

      getLastPurchasePrice: (materialName) => {
        const orders = useProcurementStore.getState().orders;
        const validStatuses = new Set(["approved", "delivered", "paid"]);
        const matches = orders
          .filter(o => validStatuses.has(o.status))
          .flatMap(o => o.items.filter(i => i.material === materialName).map(i => ({ date: o.date, unitPrice: i.unitPrice })))
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return matches.length > 0 ? matches[0].unitPrice : null;
      },

      syncRawCostsFromProcurement: () => {
        const orders = useProcurementStore.getState().orders;
        const validStatuses = new Set(["approved", "delivered", "paid"]);
        const relevantOrders = orders.filter(o => validStatuses.has(o.status));
        if (relevantOrders.length === 0) return;
        const d = new Date().toISOString().split("T")[0];
        const updated = get().productPrices.map(p => {
          if (p.category !== "خام" && p.productCode !== "خام") return p;
          const matches = relevantOrders
            .flatMap(o => o.items.filter(i => i.material === p.productName).map(i => ({ date: o.date, unitPrice: i.unitPrice })))
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          if (matches.length === 0) return p;
          const latest = matches[0].unitPrice;
          if (latest === p.costPrice) return p;
          return {
            ...p,
            costPrice: latest,
            lastUpdated: d,
            priceHistory: [{ date: new Date().toISOString(), field: "costPrice", oldValue: p.costPrice, newValue: latest }, ...p.priceHistory.slice(0, 49)],
          };
        });
        set({ productPrices: updated });
        get().recalculateFormulaCosts();
      },

      bulkUpdatePrices: (productIds, field, value) => {
        const oldPrices = get().productPrices;
        const d = new Date().toISOString().split("T")[0];
        const updated = oldPrices.map(p => {
          if (!productIds.includes(p.productId)) return p;
          const oldValue = p[field] as number;
          if (oldValue === value) return p;
          return {
            ...p,
            [field]: value,
            lastUpdated: d,
            priceHistory: [{ date: new Date().toISOString(), field: field as string, oldValue, newValue: value }, ...p.priceHistory.slice(0, 49)],
          };
        });
        set({ productPrices: updated });
        if (field === "costPrice" || field === "wholeSalePrice") {
          get().recalculateFormulaCosts();
        }
      },

      addItemToGroup: (groupName, itemName) => {
        const existing = get().productPrices.find(p => p.productName === itemName);
        if (!existing) {
          const invItem = (useProductionStore.getState().inventory).find(i => i.materialName === itemName);
          if (invItem) {
            get().ensureInventoryPrices([{ id: invItem.id, materialName: invItem.materialName, type: invItem.type, unit: invItem.unit }]);
          }
        }
        const current = get().groupExtraItems[groupName] || [];
        if (current.includes(itemName)) return;
        set({ groupExtraItems: { ...get().groupExtraItems, [groupName]: [...current, itemName] } });
      },

      removeItemFromGroup: (groupName, itemName) => {
        const current = get().groupExtraItems[groupName] || [];
        set({ groupExtraItems: { ...get().groupExtraItems, [groupName]: current.filter(n => n !== itemName) } });
      },

      setGroupCustomName: (groupName, label) => {
        set({ groupCustomNames: { ...get().groupCustomNames, [groupName]: label } });
      },

      setGroupMargin: (groupName, pct) => {
        set({ groupCustomMargins: { ...get().groupCustomMargins, [groupName]: pct } });
      },

      addCustomGroup: (name) => {
        const current = get().customGroups;
        if (current.includes(name)) return;
        set({ customGroups: [...current, name] });
      },

      removeCustomGroup: (name) => {
        set({ customGroups: get().customGroups.filter(g => g !== name) });
      },
    }),
    { name: "ff-pricing-store-v3", storage: dexieStorage },
  ),
);
