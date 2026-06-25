import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import {
  Plus, Save, Trash2, AlertTriangle, CheckCircle2, FlaskConical,
  Package, ChevronDown, Search, DollarSign, GripVertical,
  Copy, ArrowLeftRight, Layers, Sparkles, BadgeInfo,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { FormulaIngredient, InventoryItem } from "@/hooks/use-production-store";
import { findInventoryMatch } from "@/hooks/use-production-store";
import { MATERIAL_CATALOG, getMaterialPrice } from "@/lib/substitution-engine";
import { MagItem } from "@/components/ui/magnifier";

type Product = { id: string; name: string; code: string; category: string };

function fmtCurrency(n: number) {
  return new Intl.NumberFormat("ar-EG", {
    style: "currency", currency: "EGP", maximumFractionDigits: 0,
  }).format(n);
}

/* ── Detect substitution group ── */
function detectGroup(name: string): string | undefined {
  const n = name.toLowerCase();
  if (n.includes("ذرة") || n.includes("corn")) return "corn";
  if (n.includes("صويا") || n.includes("soy")) return "soy";
  if (n.includes("نخالة") || n.includes("ردة") || n.includes("bran")) return "wheat_bran";
  if (n.includes("جلوتين") || n.includes("gluten")) return "gluten";
  if (n.includes("فيتامين") || n.includes("بريمكس") || n.includes("premix") || n.includes("vitamin")) return "premix";
  return undefined;
}

const GROUP_LABELS: Record<string, string> = {
  corn: "ذرة",
  soy: "صويا",
  wheat_bran: "نخالة",
  gluten: "جلوتين",
  premix: "فيتامينات وبريمكس",
};

const GROUP_COLORS: Record<string, string> = {
  corn: "bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-700",
  soy: "bg-green-100 text-green-700 border-green-300 dark:bg-green-950/30 dark:text-green-400 dark:border-green-700",
  wheat_bran: "bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-700",
  gluten: "bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-700",
  premix: "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-700",
};
const GROUP_RING: Record<string, string> = {
  corn: "hsl(40, 90%, 55%)",
  soy: "hsl(140, 70%, 45%)",
  wheat_bran: "hsl(25, 85%, 55%)",
  gluten: "hsl(270, 60%, 55%)",
  premix: "hsl(210, 80%, 55%)",
};

/* ── Substitution Group Quick-Add ── */
function GroupQuickAdd({
  onSelect,
  excludeMaterials,
  inventory,
  t,
}: {
  onSelect: (material: string) => void;
  excludeMaterials: string[];
  inventory: InventoryItem[];
  t: (ar: string, en: string) => string;
}) {
  const [open, setOpen] = useState(false);

  // Group inventory items by substitution group
  const groups = useMemo(() => {
    const map = new Map<string, InventoryItem[]>();
    for (const item of inventory) {
      if (item.type !== "raw") continue;
      if (excludeMaterials.includes(item.materialName)) continue;
      const group = detectGroup(item.materialName) || "other";
      if (!map.has(group)) map.set(group, []);
      map.get(group)!.push(item);
    }
    return Array.from(map.entries())
      .filter(([g]) => g !== "other")
      .sort(([a], [b]) => a.localeCompare(b));
  }, [inventory, excludeMaterials]);

  if (groups.length === 0) return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full py-2 border border-dashed border-primary/30 rounded-lg text-xs text-primary hover:bg-primary/5 transition-colors flex items-center justify-center gap-1.5"
      >
        <Sparkles className="w-3 h-3" />
        {t("إضافة من مجموعة بدائل", "Add from substitution group")}
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-1 rounded-xl border bg-popover shadow-lg divide-y">
              {groups.map(([group, items]) => (
                <div key={group} className="p-2">
                  <div className="flex items-center gap-1.5 mb-1.5 px-1">
                    <Layers className="w-3 h-3 text-muted-foreground" />
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                      {GROUP_LABELS[group] || group}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {items.map(item => {
                      const tons = item.unit === "kg" ? item.quantity / 1000 : item.quantity;
                      const alertColor = item.alertLevel === "critical"
                        ? "border-destructive/30 text-destructive"
                        : item.alertLevel === "warning"
                        ? "border-amber-300 text-amber-600"
                        : "border-emerald-300 text-emerald-600";
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => { onSelect(item.materialName); setOpen(false); }}
                          className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-all hover:bg-muted/60 ${alertColor}`}
                        >
                          <Package className="w-3.5 h-3.5" />
                          {item.materialName}
                          <span className="opacity-70 text-[11px]">({tons.toFixed(0)}ط)</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Inject scrollbar styles once ── */
(function injectScrollCSS(){
  if(typeof document==='undefined'||document.getElementById('cb-scroll'))return;
  const s=document.createElement('style');s.id='cb-scroll';
  s.textContent=`.combobox-scroll{overflow-y:scroll!important;scrollbar-width:thin!important;scrollbar-color:hsl(225deg 21.05% 14.9%) transparent!important}
.combobox-scroll::-webkit-scrollbar{width:8px!important;display:block!important;background:transparent!important}
.combobox-scroll::-webkit-scrollbar-thumb{background:hsl(225deg 21.05% 14.9%)!important;border-radius:4px!important}
.combobox-scroll::-webkit-scrollbar-track{background:transparent!important}`;
  document.head.appendChild(s);
})();

/* ── Enhanced Inventory Combobox ── */
function InventoryCombobox({
  value, onChange, inventory, t, warehouseConfigs,
  onShowSubstitutes,
}: {
  value: string;
  onChange: (v: string) => void;
  inventory: InventoryItem[];
  t: (ar: string, en: string) => string;
  warehouseConfigs: { id: string; name: string }[];
  onShowSubstitutes?: (material: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = inventory.find(i => i.materialName === value);
  const group = value ? detectGroup(value) : undefined;
  const avail = selected
    ? selected.unit === "kg" ? selected.quantity / 1000 : selected.quantity
    : null;
  const price = value ? getMaterialPrice(value, inventory) : 0;
  const whName = useMemo(() => {
    const map = new Map(warehouseConfigs.map(w => [w.id, w.name]));
    return (id: string) => map.get(id) || id;
  }, [warehouseConfigs]);

  const levelColor = selected?.alertLevel === "critical"
    ? "text-destructive" : selected?.alertLevel === "warning"
    ? "text-amber-500" : "text-emerald-600";

  // Warehouse color mapping
  const WH_COLORS = [
    { bg: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400", dot: "bg-blue-500" },
    { bg: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400", dot: "bg-emerald-500" },
    { bg: "bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400", dot: "bg-purple-500" },
    { bg: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400", dot: "bg-amber-500" },
  ];

  // Group inventory by warehouse → substitution category
  const groupedByWarehouse = useMemo(() => {
    type Entry = { item: InventoryItem; tons: number };
    const whMap = new Map<string, { whId: string; whName: string; categories: Map<string, Entry[]>; uncategorized: Entry[] }>();

    const filtered = inventory.filter(i =>
      !query || i.materialName.toLowerCase().includes(query.toLowerCase())
    );

    for (const item of filtered) {
      const wId = item.warehouseId;
      if (!whMap.has(wId)) {
        whMap.set(wId, { whId: wId, whName: whName(wId), categories: new Map(), uncategorized: [] });
      }
      const group = whMap.get(wId)!;
      const tons = item.unit === "kg" ? item.quantity / 1000 : item.quantity;
      const entry = { item, tons };
      const cat = detectGroup(item.materialName);
      if (cat) {
        if (!group.categories.has(cat)) group.categories.set(cat, []);
        group.categories.get(cat)!.push(entry);
      } else {
        group.uncategorized.push(entry);
      }
    }

    // Sort warehouses by their order in warehouseConfigs, then unknown ones
    const whOrder = new Map(warehouseConfigs.map((w, i) => [w.id, i]));
    const sortedWh = Array.from(whMap.entries()).sort(([aId], [bId]) => {
      const ai = whOrder.get(aId) ?? 999;
      const bi = whOrder.get(bId) ?? 999;
      return ai - bi;
    });

    return sortedWh.map(([, val]) => ({
      ...val,
      categories: Array.from(val.categories.entries()).sort(([a], [b]) => a.localeCompare(b)),
    }));
  }, [inventory, query, whName, warehouseConfigs]);

  const whColorIndex = (whId: string) => {
    const idx = warehouseConfigs.findIndex(w => w.id === whId);
    return WH_COLORS[idx >= 0 ? idx % WH_COLORS.length : 0];
  };

  return (
    <div ref={ref} className="relative flex-1">
      <button
        type="button"
        onClick={() => { setOpen(o => !o); setQuery(""); }}
        className={`w-full h-10 px-3 pe-9 text-sm rounded-xl border bg-background flex items-center text-start transition-all
          ${open ? "border-primary ring-2 ring-primary/20 shadow-sm" : "border-input hover:border-primary/40"}
          ${!value ? "text-muted-foreground/70" : "text-foreground font-medium"}`}
      >
        <div className="truncate flex-1 flex items-center gap-1.5">
          {group && (
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${GROUP_COLORS[group]?.split(" ")[0] || "bg-muted"}`} />
          )}
          <span className="font-medium">{value || t("اختر خامة من المخزون...", "Select from inventory...")}</span>
          {selected && (
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md ${whColorIndex(selected.warehouseId).bg}`}>
              <span className={`w-1 h-1 rounded-full inline-block ${whColorIndex(selected.warehouseId).dot} me-1 align-middle`} />
              {whName(selected.warehouseId)}
            </span>
          )}
        </div>
        {selected && avail !== null && (
          <span className={`text-xs font-mono me-1 shrink-0 ${levelColor}`}>
            {avail.toFixed(0)}{t("ط", "T")}
          </span>
        )}
        <ChevronDown className={`w-4 h-4 shrink-0 absolute end-3 text-muted-foreground/60 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 top-full mt-1 w-full min-w-[340px] rounded-xl border bg-popover shadow-lg overflow-hidden"
          >
            <div className="p-2 border-b">
              <div className="relative">
                <Search className="absolute start-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                <input
                  autoFocus
                  className="w-full h-9 ps-8 pe-3 text-sm bg-muted/40 rounded-lg outline-none focus:ring-1 focus:ring-primary/30"
                  placeholder={t("بحث...", "Search...")}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="h-32 combobox-scroll">
              {groupedByWarehouse.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-3">{t("لا نتائج", "No results")}</p>
              ) : (
                <div className="divide-y">
                  {groupedByWarehouse.map(({ whId, whName: whLabel, categories, uncategorized }) => {
                    const wc = whColorIndex(whId);
                    return (
                      <div key={whId} className="py-1">
                        {/* Warehouse header */}
                        <div className={`flex items-center gap-1.5 px-2 py-1 mx-1 rounded-md ${wc.bg} mb-0.5`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${wc.dot}`} />
                          <span className="text-[11px] font-bold">{whLabel}</span>
                        </div>
                        {/* Categories within this warehouse */}
                        {categories.map(([cat, entries]) => (
                          <div key={cat} className="px-1">
                            <div className="flex items-center gap-1 px-2 py-0.5">
                              <Layers className="w-2.5 h-2.5 text-muted-foreground/50" />
                              <span className="text-[10px] font-semibold text-muted-foreground/60">{GROUP_LABELS[cat] || cat}</span>
                            </div>
                            {entries.map(({ item, tons }) => {
                              const price = getMaterialPrice(item.materialName, inventory);
                              const alertStyle = item.alertLevel === "critical"
                                ? "text-destructive bg-destructive/5"
                                : item.alertLevel === "warning"
                                ? "text-amber-600 bg-amber-50 dark:bg-amber-950/20"
                                : "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20";
                              return (
                                <button
                                  key={item.id}
                                  type="button"
                                  onClick={() => { onChange(item.materialName); setOpen(false); }}
                                  className={`w-full flex items-center justify-between px-2 py-1 text-[11px] hover:bg-muted/60 transition-colors text-start rounded-sm
                                    ${value === item.materialName ? "bg-primary/8 text-primary" : ""}`}
                                >
                                  <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <Package className="w-3 h-3 text-muted-foreground/60 shrink-0" />
                                    <span className="truncate">{item.materialName}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <div className="flex items-center gap-1">
                                      <div className={`w-1.5 h-1.5 rounded-full ${
                                        item.alertLevel === "critical" ? "bg-destructive"
                                        : item.alertLevel === "warning" ? "bg-amber-500"
                                        : "bg-emerald-500"
                                      }`} />
                                      <span className={`text-[10px] font-mono px-1 py-0.5 rounded-full ${alertStyle}`}>
                                        {tons.toFixed(0)} {t("ط", "T")}
                                      </span>
                                    </div>
                                    {price > 0 && (
                                      <span className="text-[10px] text-muted-foreground font-mono">{fmtCurrency(price)}</span>
                                    )}
                                    {onShowSubstitutes && (
                                      <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); onShowSubstitutes(item.materialName); setOpen(false); }}
                                        className="p-0.5 rounded text-muted-foreground/30 hover:text-amber-500 transition-colors"
                                        title={t("عرض البدائل", "Show substitutes")}
                                      >
                                        <ArrowLeftRight className="w-2.5 h-2.5" />
                                      </button>
                                    )}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        ))}
                        {/* Uncategorized within this warehouse */}
                        {uncategorized.length > 0 && (
                          <div className="px-1">
                            {categories.length > 0 && (
                              <div className="flex items-center gap-1 px-2 py-0.5">
                                <BadgeInfo className="w-2.5 h-2.5 text-muted-foreground/50" />
                                <span className="text-[10px] font-semibold text-muted-foreground/60">{t("أخرى", "Other")}</span>
                              </div>
                            )}
                            {uncategorized.map(({ item, tons }) => (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => { onChange(item.materialName); setOpen(false); }}
                                className={`w-full flex items-center justify-between px-2 py-1 text-[11px] hover:bg-muted/60 transition-colors text-start rounded-sm
                                  ${value === item.materialName ? "bg-primary/8 text-primary" : ""}`}
                              >
                                <span>{item.materialName}</span>
                                <span className="text-[10px] font-mono text-muted-foreground">
                                  {tons.toFixed(0)} {t("ط", "T")}
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Custom entry */}
            {query && !inventory.find(i => i.materialName === query) && (
              <div className="border-t p-1">
                <button
                  type="button"
                  onClick={() => { onChange(query); setOpen(false); }}
                  className="w-full text-xs px-3 py-2 text-primary hover:bg-primary/5 rounded-lg text-start flex items-center gap-1.5"
                >
                  <Plus className="w-3 h-3" />
                  {t(`إضافة "${query}"`, `Add "${query}"`)}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Substitution Alternatives Popover ── */
function SubstitutionPopover({
  material,
  inventory,
  onSelect,
  onClose,
  t,
}: {
  material: string;
  inventory: InventoryItem[];
  onSelect: (material: string) => void;
  onClose: () => void;
  t: (ar: string, en: string) => string;
}) {
  const group = detectGroup(material);
  if (!group) return null;

  const alternatives = inventory.filter(i => {
    if (i.type !== "raw") return false;
    if (i.materialName === material) return false;
    return detectGroup(i.materialName) === group;
  });

  if (alternatives.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-lg border bg-popover p-3 shadow-lg"
      >
        <p className="text-xs text-muted-foreground">
          {t("لا توجد بدائل في هذه المجموعة", "No alternatives in this group")}
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 4, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 4, scale: 0.96 }}
      className="rounded-xl border bg-card/95 dark:bg-card/90 shadow-lg overflow-hidden"
    >
      <div className="px-5 py-4 bg-primary/10 dark:bg-primary/15 border-b flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center">
            <ArrowLeftRight className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <span className="text-sm font-bold">{t("بدائل مجموعة", "Group alternatives")}</span>
            <Badge variant="outline" className="text-[11px] px-1.5 py-0.5 me-1">
              {GROUP_LABELS[group] || group}
            </Badge>
          </div>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-xs font-medium">
          {t("إلغاء", "Cancel")}
        </button>
      </div>
      <div className="p-3 space-y-1.5">
        {alternatives.map(item => {
          const tons = item.unit === "kg" ? item.quantity / 1000 : item.quantity;
          const price = getMaterialPrice(item.materialName, inventory);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => { onSelect(item.materialName); onClose(); }}
              className="w-full flex items-center justify-between px-5 py-4 text-sm hover:bg-muted/50 transition-colors text-start rounded-xl bg-muted/10 dark:bg-muted/5 border border-border/50"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center shrink-0">
                  <Package className="w-4 h-4 text-amber-600" />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium text-sm">{item.materialName}</p>
                  {price > 0 && (
                    <p className="mt-0.5">
                      <MagItem
                        label={fmtCurrency(price)}
                        detail={t("سعر الطن", "Price per Ton")}
                        big={fmtCurrency(price)}
                        sub={t("/طن", "/ton")}
                        className="text-xs text-muted-foreground font-mono"
                        ringColor="hsl(var(--muted-foreground))"
                      >
                        {fmtCurrency(price)}/{t("ط", "T")}
                      </MagItem>
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <MagItem
                  label={`${tons.toFixed(0)} ${t("ط", "T")}`}
                  detail={t("الرصيد المتاح", "Available Stock")}
                  big={tons.toFixed(0)}
                  sub={t("ط", "T")}
                  className="inline-flex"
                  ringColor={item.alertLevel === "critical" ? "hsl(0, 70%, 55%)" : item.alertLevel === "warning" ? "hsl(40, 90%, 55%)" : "hsl(160, 60%, 50%)"}
                >
                  <span className={`text-xs font-mono px-3 py-1.5 rounded-full ${
                    item.alertLevel === "critical" ? "text-destructive bg-destructive/8"
                    : item.alertLevel === "warning" ? "text-amber-600 bg-amber-50 dark:bg-amber-950/20"
                    : "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20"
                  }`}>
                    {tons.toFixed(0)} {t("ط", "T")}
                  </span>
                </MagItem>
              </div>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}

/* ── Material Ingredient Row ── */
/* ── Warehouse color helper (shared) ── */
const WH_COLORS = [
  { bg: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400", dot: "bg-blue-500" },
  { bg: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400", dot: "bg-emerald-500" },
  { bg: "bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400", dot: "bg-purple-500" },
  { bg: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400", dot: "bg-amber-500" },
];

function whColorIndex(whId: string, warehouseConfigs: { id: string }[]) {
  const idx = warehouseConfigs.findIndex(w => w.id === whId);
  return idx >= 0 ? idx % WH_COLORS.length : 0;
}

/* ── Material Ingredient Row ── */
function IngredientRow({
  ing, idx, draft, upd, remRow, rawInventory, t, warehouseConfigs,
  onShowSubstitutes,
  showSubstituteFor,
  onSelectSubstitute,
  onCloseSubstitutes,
}: {
  ing: FormulaIngredient;
  idx: number;
  draft: FormulaIngredient[];
  upd: (idx: number, field: "material" | "pct", val: string | number) => void;
  remRow: (idx: number) => void;
  rawInventory: InventoryItem[];
  t: (ar: string, en: string) => string;
  warehouseConfigs: { id: string; name: string }[];
  onShowSubstitutes: (material: string) => void;
  showSubstituteFor: string | null;
  onSelectSubstitute: (material: string) => void;
  onCloseSubstitutes: () => void;
}) {
  const match = findInventoryMatch(ing.material, rawInventory);
  const avail = match ? (match.unit === "kg" ? match.quantity / 1000 : match.quantity) : 0;
  const price = ing.material ? getMaterialPrice(ing.material, rawInventory) : 0;
  const group = ing.material ? detectGroup(ing.material) : undefined;
  const whLabel = match && warehouseConfigs.find(w => w.id === match.warehouseId);
  const wcIdx = match ? whColorIndex(match.warehouseId, warehouseConfigs) : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -8, height: 0 }}
      animate={{ opacity: 1, y: 0, height: "auto" }}
      exit={{ opacity: 0, y: -8, height: 0 }}
      className="flex flex-col gap-1.5 bg-background rounded-xl border border-border/60 p-2.5"
    >
      <div className="flex items-center gap-2">
        <InventoryCombobox
          value={ing.material}
          onChange={v => upd(idx, "material", v)}
          inventory={rawInventory}
          t={t}
          warehouseConfigs={warehouseConfigs}
          onShowSubstitutes={onShowSubstitutes}
        />
        <div className="flex items-center gap-0.5 shrink-0">
          <div className="relative">
            <Input
              type="number" min="0" max="100" step="0.5"
              className="w-20 h-9 text-sm font-bold font-mono text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none pe-5"
              value={ing.pct || ""}
              onChange={e => upd(idx, "pct", e.target.value)}
            />
            <span className="absolute end-1.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">%</span>
          </div>
        </div>
        <button
          onClick={() => remRow(idx)}
          className="text-muted-foreground/50 hover:text-destructive transition-colors shrink-0 p-1"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Info row: warehouse, stock, price */}
      {ing.material && (
        <div className="flex items-center gap-2 px-1">
          {match && whLabel && (
            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${WH_COLORS[wcIdx].bg}`}>
              <span className={`w-1.5 h-1.5 rounded-full inline-block ${WH_COLORS[wcIdx].dot} me-1 align-middle`} />
              {whLabel.name}
            </span>
          )}
          {match ? (
            <span className={`text-xs font-mono ${match.alertLevel === "critical" ? "text-destructive" : match.alertLevel === "warning" ? "text-amber-500" : "text-emerald-600"}`}>
              <span className={`w-1.5 h-1.5 rounded-full inline-block ${match.alertLevel === "critical" ? "bg-destructive" : match.alertLevel === "warning" ? "bg-amber-500" : "bg-emerald-500"} me-1 align-middle`} />
              {avail.toFixed(1)} {t("طن", "T")}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground/50 flex items-center gap-1">
              <AlertTriangle className="w-2.5 h-2.5" />
              {t("غير موجود في المخزون", "Not in inventory")}
            </span>
          )}
          {price > 0 && (
            <span className="text-xs text-muted-foreground font-mono">
              {fmtCurrency(price)}{t("/ط", "/T")}
            </span>
          )}
          {group && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${GROUP_COLORS[group]}`}>
              {GROUP_LABELS[group]}
            </span>
          )}
          {match && onShowSubstitutes && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onShowSubstitutes(ing.material); }}
              className="p-0.5 rounded text-muted-foreground/30 hover:text-amber-500 transition-colors"
              title={t("عرض البدائل", "Show substitutes")}
            >
              <ArrowLeftRight className="w-3 h-3" />
            </button>
          )}
        </div>
      )}

      {/* Substitution popover */}
      <AnimatePresence>
        {showSubstituteFor === ing.material && (
          <SubstitutionPopover
            material={ing.material}
            inventory={rawInventory}
            onSelect={onSelectSubstitute}
            onClose={onCloseSubstitutes}
            t={t}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ── Main FormulasTab ── */
export function FormulasTab({
  products, formulas, inventory, updateFormula, deleteFormula, warehouseConfigs, t,
}: {
  products: Product[];
  formulas: Record<string, FormulaIngredient[]>;
  inventory: InventoryItem[];
  updateFormula: (productId: string, ingredients: FormulaIngredient[]) => void;
  deleteFormula: (productId: string) => void;
  warehouseConfigs: { id: string; name: string }[];
  t: (ar: string, en: string) => string;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<FormulaIngredient[]>([]);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [showSubstituteFor, setShowSubstituteFor] = useState<string | null>(null);
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);

  const rawInventory = inventory.filter(i => i.type === "raw");

  const startEdit = (id: string) => {
    setEditingId(id);
    setDraft((formulas[id] || []).map(i => ({ ...i })));
    setSavedId(null);
    setShowSubstituteFor(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft([]);
    setShowSubstituteFor(null);
  };

  const saveEdit = (id: string) => {
    // Auto-distribute to 100% if close enough
    const total = draft.reduce((s, i) => s + i.pct, 0);
    let adjusted = draft;
    if (Math.abs(total - 100) < 5 && total !== 100 && draft.length > 0) {
      const scale = 100 / total;
      adjusted = draft.map(i => ({ ...i, pct: Math.round(i.pct * scale * 10) / 10 }));
      // Fix rounding
      const newTotal = adjusted.reduce((s, i) => s + i.pct, 0);
      if (Math.abs(newTotal - 100) > 0.1 && adjusted.length > 0) {
        adjusted[adjusted.length - 1].pct += +(100 - newTotal).toFixed(1);
      }
    }
    updateFormula(id, adjusted);
    setEditingId(null);
    setSavedId(id);
    setTimeout(() => setSavedId(null), 2000);
  };

  const upd = (idx: number, field: "material" | "pct", val: string | number) =>
    setDraft(prev => prev.map((it, i) =>
      i === idx ? { ...it, [field]: field === "pct" ? Math.max(0, Math.min(100, +val)) : val } : it
    ));

  const addRow = (material?: string) =>
    setDraft(prev => {
      if (material && prev.find(i => i.material === material)) return prev;
      const total = prev.reduce((s, i) => s + i.pct, 0);
      const remaining = 100 - total;
      const pct = material && prev.length > 0 ? Math.min(remaining, Math.round(remaining / (prev.length + 1) * 10) / 10) : 0;
      return [...prev, { material: material || "", pct }];
    });

  const remRow = (idx: number) => setDraft(prev => prev.filter((_, i) => i !== idx));

  const onSelectSubstitute = (material: string) => {
    if (!showSubstituteFor) return;
    const idx = draft.findIndex(i => i.material === showSubstituteFor);
    if (idx !== -1) upd(idx, "material", material);
    setShowSubstituteFor(null);
  };

  const totalDraft = draft.reduce((s, i) => s + i.pct, 0);
  const totalOk = Math.abs(totalDraft - 100) < 0.5;

  const toggleProduct = (id: string) => {
    setExpandedProduct(prev => prev === id ? null : id);
  };

  return (
    <div className="space-y-4">
      {/* Info banner */}
      <div className="rounded-xl bg-gradient-to-r from-primary/8 via-primary/5 to-transparent border border-primary/15 px-4 py-3 flex items-center gap-3">
        <Sparkles className="w-4 h-4 text-primary shrink-0" />
        <p className="text-xs text-muted-foreground">
          {t(
            "اختر الخامات من مجموعات بديلة — كل خامة ليها سعر ورصيد. تقدر تشوف بدائل كل خامة من نفس المجموعة وتستبدلها بنقرة.",
            "Pick ingredients from substitution groups — each shows price & stock. Click swap icon to see group alternatives."
          )}
        </p>
      </div>

      {/* Product formula cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {products.map(product => {
          const isEditing = editingId === product.id;
          const current = formulas[product.id] || [];
          const display = isEditing ? draft : current;
          const total = display.reduce((s, i) => s + i.pct, 0);
          const totalOk = Math.abs(total - 100) < 0.5;
          const wasSaved = savedId === product.id;
          const isExpanded = expandedProduct === product.id;

          return (
            <motion.div
              key={product.id}
              layout
              className={`rounded-2xl border bg-card overflow-hidden transition-all ${
                isEditing ? "border-primary/40 shadow-md shadow-primary/8 ring-1 ring-primary/10"
                  : wasSaved ? "border-emerald-400/40"
                  : "border-border"
              }`}
            >
              {/* Header - clickable to expand */}
              <button
                type="button"
                onClick={() => !isEditing && toggleProduct(product.id)}
                className={`w-full px-4 py-3 flex items-center justify-between ${isEditing ? "bg-primary/8" : wasSaved ? "bg-emerald-500/8" : "bg-muted/20 hover:bg-muted/40 transition-colors"}`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    isEditing ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30"
                      : "bg-primary/15 text-primary"
                  }`}>
                    <FlaskConical className="w-4 h-4" />
                  </div>
                  <div className="text-start">
                    <p className="font-bold text-sm leading-tight">{product.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{product.code} · {product.category}</p>
                  </div>
                </div>
                <AnimatePresence mode="wait">
                  {wasSaved ? (
                    <motion.div
                      key="saved" initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}
                      className="flex items-center gap-1 text-xs text-emerald-600 font-medium"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {t("تم الحفظ", "Saved")}
                    </motion.div>
                  ) : !isEditing ? (
                    <div className="flex items-center gap-1">
                      {current.length > 0 && (
                        <span className="text-[11px] text-muted-foreground px-2 py-0.5 rounded-full bg-muted/60">
                          {current.length} {t("خامات", "items")}
                        </span>
                      )}
                      {current.length > 0 && (
                        <Button
                          size="sm" variant="ghost"
                          className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-lg"
                          onClick={(e) => { e.stopPropagation(); if (confirm(t("حذف تركيبة هذا المنتج؟", "Delete this product's formula?"))) { deleteFormula(product.id); } }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                      <Button
                        size="sm" variant="outline"
                        className="h-7 text-xs rounded-lg"
                        onClick={(e) => { e.stopPropagation(); startEdit(product.id); }}
                      >
                        {t("تعديل", "Edit")}
                      </Button>
                    </div>
                  ) : (
                    <motion.div key="edit" className="flex gap-1.5">
                      <Button size="sm" variant="outline" className="h-7 text-xs rounded-lg" onClick={cancelEdit}>
                        {t("إلغاء", "Cancel")}
                      </Button>
                      <Button
                        size="sm" className="h-7 text-xs rounded-lg gap-1"
                        onClick={() => saveEdit(product.id)}
                        disabled={!totalOk || draft.some(i => !i.material)}
                      >
                        <Save className="w-3 h-3" />
                        {t("حفظ", "Save")}
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>

              {/* Body */}
              <AnimatePresence>
                {(isEditing || isExpanded || current.length === 0) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 space-y-2">
                      {isEditing ? (
                        <>
                          {/* Ingredients list */}
                          <div className="max-h-[500px] space-y-1 rounded-xl border bg-muted/10 p-2 combobox-scroll">
                            <AnimatePresence mode="popLayout">
                              {draft.map((ing, idx) => (
                                <IngredientRow
                                  key={`${ing.material}-${idx}`}
                                  ing={ing} idx={idx} draft={draft}
                                  upd={upd} remRow={remRow}
                                  rawInventory={rawInventory} t={t}
                                  warehouseConfigs={warehouseConfigs}
                                  onShowSubstitutes={setShowSubstituteFor}
                                  showSubstituteFor={showSubstituteFor}
                                  onSelectSubstitute={onSelectSubstitute}
                                  onCloseSubstitutes={() => setShowSubstituteFor(null)}
                                />
                              ))}
                            </AnimatePresence>

                            {/* Add buttons */}
                            <div className="flex flex-col gap-2 pt-1">
                            <button
                              onClick={() => addRow()}
                              className="w-full py-2 border border-dashed border-primary/40 rounded-lg text-xs text-primary hover:bg-primary/5 transition-colors flex items-center justify-center gap-1"
                            >
                              <Plus className="w-3 h-3" />
                              {t("إضافة خامة فارغة", "Add empty ingredient")}
                            </button>

                            <GroupQuickAdd
                              onSelect={(mat) => addRow(mat)}
                              excludeMaterials={draft.map(i => i.material).filter(Boolean)}
                              inventory={rawInventory}
                              t={t}
                            />
                          </div>
                          </div>

                          {/* Total badge */}
                          <div className={`flex items-center justify-between text-xs px-3 py-2 rounded-xl ${
                            totalOk
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                              : "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                          }`}>
                            <div className="flex items-center gap-1.5">
                              {totalOk ? (
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              ) : (
                                <AlertTriangle className="w-3.5 h-3.5" />
                              )}
                              <span>
                                {totalOk
                                  ? t("النسب متوازنة 100%", "Balanced at 100%")
                                  : t(`المجموع ${total.toFixed(1)}% — يجب أن يساوي 100%`, `Total ${total.toFixed(1)}% — must equal 100%`)}
                              </span>
                            </div>
                            <span className="font-bold text-sm">{total.toFixed(1)}%</span>
                          </div>

                          {/* Legend */}
                          <div className="flex items-center gap-3 text-[11px] text-muted-foreground pt-1">
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                              {t("موجود", "In stock")}
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                              {t("مخزون منخفض", "Low stock")}
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-muted inline-block" />
                              {t("غير موجود", "Not found")}
                            </span>
                            <span className="flex items-center gap-1">
                              <ArrowLeftRight className="w-2.5 h-2.5 text-amber-500" />
                              {t("له بدائل", "Has alternatives")}
                            </span>
                          </div>
                        </>
                      ) : (
                        <>
                          {current.length > 0 ? (
                            <>
                              {current.map((ing, idx) => {
                                const match = findInventoryMatch(ing.material, rawInventory);
                                const availTons = match ? (match.unit === "kg" ? match.quantity / 1000 : match.quantity) : 0;
                                const price = getMaterialPrice(ing.material, rawInventory);
                                const group = detectGroup(ing.material);
                                return (
                                  <div key={idx} className="space-y-1 group">
                                    <div className="flex justify-between text-xs items-center">
                                      <div className="flex items-center gap-1.5 min-w-0">
                                        {match ? (
                                          <div className={`w-2 h-2 rounded-full shrink-0 ${
                                            match.alertLevel === "critical" ? "bg-destructive"
                                            : match.alertLevel === "warning" ? "bg-amber-500"
                                            : "bg-emerald-500"
                                          }`} />
                                        ) : (
                                          <div className="w-2 h-2 rounded-full bg-muted shrink-0" />
                                        )}
                                        <span className="truncate">{ing.material}</span>
                                        {group && (
                                          <span className={`text-xs px-1.5 py-0.5 rounded-full border opacity-0 group-hover:opacity-100 transition-opacity ${GROUP_COLORS[group]}`}>
                                            {GROUP_LABELS[group]}
                                          </span>
                                        )}
                                        {price > 0 && (
                                          <span className="text-xs text-muted-foreground font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                                            {fmtCurrency(price)}
                                          </span>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-2 shrink-0">
                                        {match && (
                                          <span className={`text-xs font-mono ${
                                            match.alertLevel === "critical" ? "text-destructive"
                                            : match.alertLevel === "warning" ? "text-amber-500"
                                            : "text-emerald-600"
                                          }`}>
                                            {availTons.toFixed(0)}{t("ط", "T")}
                                          </span>
                                        )}
                                        <span className="font-semibold text-primary text-sm">{ing.pct}%</span>
                                      </div>
                                    </div>
                                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                      <motion.div
                                        className="h-full bg-primary/70 rounded-full"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${ing.pct}%` }}
                                        transition={{ duration: 0.5, delay: idx * 0.06 }}
                                      />
                                    </div>
                                  </div>
                                );
                              })}
                              <div className="flex justify-between text-xs text-muted-foreground pt-2 border-t">
                                <span className="flex items-center gap-1">
                                  <Layers className="w-3 h-3" />
                                  {current.length} {t("خامات", "ingredients")}
                                </span>
                                <span className={`font-semibold ${totalOk ? "text-emerald-600" : "text-destructive"}`}>
                                  {current.reduce((s, i) => s + i.pct, 0)}%
                                </span>
                              </div>
                            </>
                          ) : (
                            <div className="py-6 text-center">
                              <FlaskConical className="w-7 h-7 mx-auto mb-2 text-muted-foreground/25" />
                              <p className="text-xs text-muted-foreground">{t("لا توجد تركيبة", "No formula set")}</p>
                              <button
                                onClick={() => startEdit(product.id)}
                                className="mt-1.5 text-xs text-primary hover:underline"
                              >
                                {t("+ إضافة تركيبة", "+ Add formula")}
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* ── Add New Formula ── */}
      <div className="rounded-2xl border border-dashed border-primary/30 bg-primary/[0.02] p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Plus className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="font-bold text-sm">{t("إضافة تركيبة جديدة", "Add New Formula")}</p>
            <p className="text-xs text-muted-foreground">{t("أنشئ تركيبة لمنتج جديد", "Create a formula for a new product")}</p>
          </div>
        </div>
        <NewFormulaForm
          products={products}
          existingFormulas={formulas}
          inventory={inventory}
          updateFormula={updateFormula}
          warehouseConfigs={warehouseConfigs}
          t={t}
        />
      </div>
    </div>
  );
}

/* ── New Formula Form (Redesigned) ── */
function NewFormulaForm({
  products, existingFormulas, inventory, updateFormula, warehouseConfigs, t,
}: {
  products: Product[];
  existingFormulas: Record<string, FormulaIngredient[]>;
  inventory: InventoryItem[];
  updateFormula: (productId: string, ingredients: FormulaIngredient[]) => void;
  warehouseConfigs: { id: string; name: string }[];
  t: (ar: string, en: string) => string;
}) {
  const availableProducts = products.filter(p => !existingFormulas[p.id] || existingFormulas[p.id].length === 0);
  const [productName, setProductName] = useState("");
  const [productCode, setProductCode] = useState("");
  const [draft, setDraft] = useState<FormulaIngredient[]>([]);
  const [saved, setSaved] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestRef = useRef<HTMLDivElement>(null);

  const rawInventory = inventory.filter(i => i.type === "raw");
  const matchedProduct = availableProducts.find(p => p.name === productName);

  // Click-outside to close suggestions
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (suggestRef.current && !suggestRef.current.contains(e.target as Node)) setShowSuggestions(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filteredSuggestions = productName.trim()
    ? availableProducts.filter(p => p.name.toLowerCase().includes(productName.toLowerCase()))
    : [];

  const reset = () => {
    setProductName(""); setProductCode(""); setDraft([]); setSaved(false);
  };

  const handleSave = () => {
    const total = draft.reduce((s, i) => s + i.pct, 0);
    if (Math.abs(total - 100) > 0.5 || draft.some(i => !i.material)) return;
    const id = matchedProduct ? matchedProduct.id : (productCode || `CUSTOM-${Date.now()}`);
    updateFormula(id, draft);
    setSaved(true);
    setTimeout(reset, 2000);
  };

  const total = draft.reduce((s, i) => s + i.pct, 0);
  const totalOk = Math.abs(total - 100) < 0.5;
  const canSave = totalOk && draft.length > 0 && draft.every(i => i.material) && productName;

  return (
    <div className="space-y-4">
      {saved ? (
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
          <CheckCircle2 className="w-5 h-5" />
          {t("تم حفظ التركيبة!", "Formula saved!")}
        </motion.div>
      ) : (
        <>
          {/* Product info: single unified input with suggestions */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">{t("المنتج", "Product")}</Label>
            <div ref={suggestRef} className="relative">
              <div className="relative">
                <Package className="absolute end-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                <Input
                  value={productName}
                  onChange={e => { setProductName(e.target.value); setShowSuggestions(true); }}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder={t("ابحث عن منتج موجود أو اكتب اسم منتج جديد...", "Search existing product or type a new one...")}
                  className="w-full h-10 ps-3 pe-10 text-sm rounded-xl"
                />
              </div>
              {matchedProduct && (
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[11px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                    {t("منتج موجود", "Existing product")} · {matchedProduct.code} · {matchedProduct.category}
                  </span>
                </div>
              )}
              {showSuggestions && filteredSuggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute z-20 top-full mt-1 w-full rounded-xl border bg-popover shadow-lg overflow-hidden"
                >
                  {filteredSuggestions.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => { setProductName(p.name); setShowSuggestions(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-start hover:bg-muted/60 transition-colors"
                    >
                      <Package className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
                      <span className="font-medium">{p.name}</span>
                      <span className="text-muted-foreground text-[10px]">{p.code} · {p.category}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </div>
            {!matchedProduct && productName && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground">{t("كود المنتج (اختياري)", "Product code (optional)")}</Label>
                  <Input value={productCode} onChange={e => setProductCode(e.target.value)} placeholder="P6" className="h-9 text-xs rounded-xl" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground">{t("ملاحظة", "Note")}</Label>
                  <div className="h-9 flex items-center px-3 text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/30 rounded-xl">
                    {t("سيتم إنشاء منتج جديد", "New product will be created")}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Ingredients */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">{t("الخامات والنسب", "Ingredients & ratios")}</Label>
              {draft.length > 0 && (
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  totalOk ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40" : "bg-amber-100 text-amber-700 dark:bg-amber-950/40"
                }`}>
                  {total.toFixed(1)}%
                </span>
              )}
            </div>
            <div className="h-72 space-y-2 rounded-xl border bg-muted/5 p-3 combobox-scroll">
              <AnimatePresence mode="popLayout">
                {draft.map((ing, idx) => (
                  <IngredientRow
                    key={`new-${idx}`}
                    ing={ing} idx={idx} draft={draft}
                    upd={(i, f, v) => setDraft(prev => prev.map((it, j) => j === i ? { ...it, [f]: f === "pct" ? Math.max(0, Math.min(100, +v)) : v } : it))}
                    remRow={(i) => setDraft(prev => prev.filter((_, j) => j !== i))}
                    rawInventory={rawInventory} t={t}
                    warehouseConfigs={warehouseConfigs}
                    onShowSubstitutes={() => {}}
                    showSubstituteFor={null}
                    onSelectSubstitute={() => {}}
                    onCloseSubstitutes={() => {}}
                  />
                ))}
              </AnimatePresence>
              {draft.length === 0 && (
                <div className="py-8 text-center">
                  <FlaskConical className="w-8 h-8 mx-auto mb-2 text-muted-foreground/20" />
                  <p className="text-xs text-muted-foreground/60">{t("لم تضف أي خامات بعد", "No ingredients added yet")}</p>
                  <p className="text-[10px] text-muted-foreground/40 mt-0.5">{t("اضف خامة للبدء", "Add an ingredient to start")}</p>
                </div>
              )}
              <button
                onClick={() => setDraft(prev => [...prev, { material: "", pct: 0 }])}
                className="w-full h-10 border-2 border-dashed border-primary/30 rounded-xl text-sm font-medium text-primary hover:bg-primary/5 hover:border-primary/60 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {t("إضافة خامة", "Add ingredient")}
              </button>
            </div>
            {draft.length > 0 && !totalOk && (
              <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/30 px-3 py-2 rounded-xl">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                {t(`المجموع ${total.toFixed(1)}% — يجب أن يساوي 100%`, `Total ${total.toFixed(1)}% — must equal 100%`)}
              </div>
            )}
          </div>

          <Button
            onClick={handleSave}
            disabled={!canSave}
            className="w-full h-11 text-sm gap-2 rounded-xl font-bold"
          >
            <Save className="w-4 h-4" />
            {t("حفظ التركيبة", "Save Formula")}
          </Button>
        </>
      )}
    </div>
  );
}
