import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Package, PackageCheck, Scale, Layers } from "lucide-react";
import type { BagEntry } from "@/hooks/use-production-store";

function fmtNum(n: number) { return new Intl.NumberFormat("ar-EG").format(n); }

const BAG_COLORS = [
  { bg: "from-primary/20 to-primary/5",   border: "border-primary/30",   text: "text-primary",       icon: "text-primary/60" },
  { bg: "from-emerald-500/20 to-emerald-500/5", border: "border-emerald-500/30", text: "text-emerald-600", icon: "text-emerald-500/60" },
  { bg: "from-violet-500/20 to-violet-500/5",   border: "border-violet-500/30",  text: "text-violet-600",  icon: "text-violet-500/60" },
  { bg: "from-amber-500/20 to-amber-500/5",     border: "border-amber-500/30",   text: "text-amber-600",   icon: "text-amber-500/60" },
  { bg: "from-rose-500/20 to-rose-500/5",       border: "border-rose-500/30",    text: "text-rose-600",    icon: "text-rose-500/60" },
];

function BagCard({ bag, index, totalCount, t }: {
  bag: BagEntry; index: number; totalCount: number;
  t: (ar: string, en: string) => string;
}) {
  const color = BAG_COLORS[index % BAG_COLORS.length];
  const pct = totalCount > 0 ? (bag.count / totalCount) * 100 : 0;
  const tons = (bag.count * bag.weightKg) / 1000;
  const iconCount = Math.min(5, Math.ceil(pct / 20));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.07, ease: "easeOut" }}
      className={`relative rounded-2xl border bg-gradient-to-br ${color.bg} ${color.border} p-4 overflow-hidden`}
    >
      {/* Background icon watermark */}
      <div className="absolute -bottom-3 -end-3 opacity-[0.07]">
        <Package className="w-20 h-20" />
      </div>

      {/* Top row */}
      <div className="flex items-start justify-between mb-3">
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${color.border} ${color.text} bg-background/40`}>
          <Scale className="w-3 h-3" />
          {bag.weightKg} {t("كجم", "kg")}
        </div>
        <div className="flex gap-0.5">
          {Array.from({ length: iconCount }).map((_, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.07 + i * 0.05 + 0.2 }}>
              <Package className={`w-3.5 h-3.5 ${color.icon}`} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Count */}
      <motion.p
        className={`text-4xl font-black tracking-tight ${color.text} mb-0.5`}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.07 + 0.15, type: "spring", stiffness: 200 }}
      >
        {fmtNum(bag.count)}
      </motion.p>
      <p className="text-xs text-muted-foreground font-medium mb-3">{t("شيكارة", "bags")}</p>

      {/* Progress bar */}
      <div className="h-1.5 bg-background/50 rounded-full overflow-hidden mb-2">
        <motion.div
          className={`h-full rounded-full ${color.text.replace("text-", "bg-").replace("-600", "-500").replace("-500/60","")}`}
          style={{ backgroundColor: undefined }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ delay: index * 0.07 + 0.3, duration: 0.6, ease: "easeOut" }}
        />
      </div>

      {/* Bottom stats */}
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-muted-foreground">{pct.toFixed(0)}% {t("من الإجمالي", "of total")}</span>
        <span className={`font-semibold ${color.text}`}>{tons >= 1 ? `${tons.toFixed(1)} ${t("ط","T")}` : `${(tons * 1000).toFixed(0)} ${t("ك","kg")}`}</span>
      </div>
    </motion.div>
  );
}

export function BagsBreakdownDialog({ open, bags, productName, producedTons, onClose, t }: {
  open: boolean;
  bags: BagEntry[];
  productName: string;
  producedTons: number;
  onClose: () => void;
  t: (ar: string, en: string) => string;
}) {
  const validBags = bags.filter(b => b.count > 0 && b.weightKg > 0);
  const totalCount = validBags.reduce((s, b) => s + b.count, 0);
  const totalTons  = validBags.reduce((s, b) => s + (b.count * b.weightKg) / 1000, 0);

  return (
    <AnimatePresence>
      {open && (
        <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
          <DialogContent className="sm:max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base">
                <motion.div
                  initial={{ rotate: -15, scale: 0.7 }} animate={{ rotate: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 18 }}
                  className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center shrink-0"
                >
                  <PackageCheck className="w-5 h-5 text-primary" />
                </motion.div>
                <div>
                  <p>{t("توزيع الشكاير", "Bags Breakdown")}</p>
                  <p className="text-xs font-normal text-muted-foreground mt-0.5">{productName}</p>
                </div>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 pt-1">
              {/* Summary bar */}
              <motion.div
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 px-4 py-3 flex items-center justify-between"
              >
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">{t("إجمالي الشكاير", "Total Bags")}</p>
                  <p className="font-black text-3xl text-primary">{fmtNum(totalCount)}</p>
                </div>
                <div className="text-end">
                  <p className="text-xs text-muted-foreground mb-0.5">{t("إجمالي الوزن", "Total Weight")}</p>
                  <p className="font-bold text-lg">{totalTons.toFixed(2)} {t("طن", "T")}</p>
                </div>
              </motion.div>

              {/* Bag type cards */}
              {validBags.length > 0 ? (
                <div className={`grid gap-3 ${validBags.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
                  {validBags.map((bag, i) => (
                    <BagCard key={bag.id} bag={bag} index={i} totalCount={totalCount} t={t} />
                  ))}
                </div>
              ) : (
                <div className="py-10 text-center">
                  <Package className="w-10 h-10 mx-auto mb-3 text-muted-foreground/20" />
                  <p className="text-sm text-muted-foreground">{t("لا توجد بيانات شكاير", "No bag data")}</p>
                </div>
              )}

              {/* Proportion visual */}
              {validBags.length > 1 && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                  className="rounded-xl border bg-muted/20 p-3 space-y-2"
                >
                  <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    {t("نسب التوزيع", "Distribution")}
                  </p>
                  <div className="flex h-4 rounded-full overflow-hidden gap-0.5">
                    {validBags.map((bag, i) => {
                      const color = BAG_COLORS[i % BAG_COLORS.length];
                      const pct = totalCount > 0 ? (bag.count / totalCount) * 100 : 0;
                      return (
                        <motion.div
                          key={bag.id}
                          initial={{ flex: 0 }} animate={{ flex: pct }}
                          transition={{ delay: 0.5 + i * 0.05, duration: 0.5 }}
                          className={`rounded-sm ${color.text.replace("text-","bg-").replace("-600","-500")}`}
                          style={{ minWidth: pct > 3 ? undefined : 0 }}
                        />
                      );
                    })}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    {validBags.map((bag, i) => {
                      const color = BAG_COLORS[i % BAG_COLORS.length];
                      const pct = totalCount > 0 ? (bag.count / totalCount) * 100 : 0;
                      return (
                        <div key={bag.id} className="flex items-center gap-1.5 text-[11px]">
                          <span className={`w-2.5 h-2.5 rounded-sm ${color.text.replace("text-","bg-").replace("-600","-500")}`} />
                          <span className="text-muted-foreground">{bag.weightKg}{t("ك","kg")} — {pct.toFixed(0)}%</span>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
