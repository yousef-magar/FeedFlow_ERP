---
name: Production Store Architecture
description: How production data is shared across all modules (orders, formulas, inventory)
---

# Rule
All production-related state lives in `src/hooks/use-production-store.ts`, a single Zustand store that persists to localStorage. All pages (Production, Inventory, Dashboard) import from this store — never from mockData directly for these entities.

**Why:** The user explicitly wanted all modules connected to Production as the core. Shared Zustand + localStorage means data survives navigation and is shared live across pages.

**How to apply:**
- Production orders → `useProductionStore().orders` / `addOrder` / `updateOrder` / `deleteOrder`
- Formulas (editable per product) → `useProductionStore().formulas` / `updateFormula`
- Inventory (raw + finished) → `useProductionStore().inventory` / `addInventoryItem` / `consumeRawMaterials` / `addFinishedProduct`
- localStorage keys: `ff-orders`, `ff-formulas`, `ff-inventory`
- `type: "raw" | "finished"` on InventoryItem distinguishes raw materials from finished production
- Formula matching to inventory uses word-subset fuzzy matching (`findInventoryMatch` exported helper)
- Formula tab UI lives in `src/pages/production/FormulasTab.tsx` (separate file to avoid bloating Production.tsx)
- On order completion: `consumeRawMaterials(productId, tons)` deducts ingredients; `addFinishedProduct(productId, name, tons)` adds to inventory
