import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bell, BellRing, Brain, ArrowLeftRight, TrendingUp, TrendingDown,
  DollarSign, X, CheckCircle2, AlertTriangle,
} from "lucide-react";
import type { SubstitutionResult } from "@/lib/substitution-engine";

interface Props {
  alerts: SubstitutionResult[];
  onViewDetails: (alert: SubstitutionResult) => void;
  onApprove: (alert: SubstitutionResult) => void;
  onReject: (alert: SubstitutionResult) => void;
  t: (ar: string, en: string) => string;
}

function fmtCurrency(n: number) {
  return new Intl.NumberFormat("ar-EG", {
    style: "currency", currency: "EGP", maximumFractionDigits: 0,
  }).format(n);
}

export function SubstitutionAlerts({ alerts, onViewDetails, onApprove, onReject, t }: Props) {
  const [expanded, setExpanded] = useState(false);
  const activeAlerts = alerts.filter(a => a.suggestions.length > 0);

  if (activeAlerts.length === 0) return null;

  return (
    <div className="relative">
      {/* Bell button */}
      <motion.button
        onClick={() => setExpanded(!expanded)}
        className={`relative flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all border ${
          expanded
            ? "bg-amber-100 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400"
            : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-amber-300"
        }`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <AnimatePresence mode="wait">
          {activeAlerts.length > 0 ? (
            <motion.div
              key="bell-ring"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <BellRing className="w-4 h-4 text-amber-500" />
            </motion.div>
          ) : (
            <Bell className="w-4 h-4" />
          )}
        </AnimatePresence>
        <span className="hidden sm:inline">{t("استبدال ذكي", "AI Substitutions")}</span>
        <Badge className="bg-amber-500 text-white text-[10px] px-1.5 py-0 min-w-5 h-5">
          {activeAlerts.length}
        </Badge>
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute left-0 top-full mt-2 w-80 sm:w-96 z-50"
          >
            <div className="rounded-2xl border bg-card shadow-xl">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-amber-500/10 to-amber-500/5 border-b">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/15 flex items-center justify-center">
                    <Brain className="w-3.5 h-3.5 text-amber-600" />
                  </div>
                  <div>
                    <span className="text-xs font-bold">{t("اقتراحات الاستبدال", "Substitution Suggestions")}</span>
                    <p className="text-[10px] text-muted-foreground">{activeAlerts.length} {t("تنبيه", "alert(s)")}</p>
                  </div>
                </div>
                <button onClick={() => setExpanded(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Body */}
              <div className="max-h-80 overflow-y-auto divide-y">
                {activeAlerts.map((alert, idx) => (
                  <motion.div
                    key={alert.orderId}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold truncate">{alert.productName}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">{t("أمر إنتاج", "Order")} #{alert.orderId}</p>
                      </div>
                      <div className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                        alert.totalImpact <= 0
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                          : "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400"
                      }`}>
                        {alert.totalImpact <= 0 ? (
                          <TrendingDown className="w-3 h-3" />
                        ) : (
                          <TrendingUp className="w-3 h-3" />
                        )}
                        {fmtCurrency(Math.abs(alert.totalImpact))}
                      </div>
                    </div>

                    {/* Suggestions summary */}
                    <div className="space-y-1.5 mb-2">
                      {alert.suggestions.slice(0, 2).map((s, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-[11px] text-muted-foreground bg-muted/20 dark:bg-muted/10 rounded-lg px-3 py-2 border border-border/40">
                          <div className="w-5 h-5 rounded-md bg-amber-500/10 flex items-center justify-center shrink-0">
                            <ArrowLeftRight className="w-2.5 h-2.5 text-amber-500" />
                          </div>
                          <span className="truncate font-medium">{s.originalMaterial}</span>
                          <span className="text-amber-600 dark:text-amber-400 font-semibold text-[11px]">→</span>
                          <span className="truncate text-foreground/80 font-medium">{s.substituteMaterial}</span>
                        </div>
                      ))}
                      {alert.suggestions.length > 2 && (
                        <p className="text-[10px] text-muted-foreground ps-1">
                          +{alert.suggestions.length - 2} {t("بدائل أخرى", "more substitutes")}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 pt-1.5 border-t border-border/50">
                      <Button
                        variant="ghost"
                        className="h-8 text-[11px] gap-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 flex-1 rounded-lg"
                        onClick={() => { onApprove(alert); setExpanded(false); }}
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        {t("قبول", "Accept")}
                      </Button>
                      <Button
                        variant="ghost"
                        className="h-8 text-[11px] gap-1 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 flex-1 rounded-lg"
                        onClick={() => { onReject(alert); setExpanded(false); }}
                      >
                        <X className="w-3 h-3" />
                        {t("رفض", "Reject")}
                      </Button>
                      <Button
                        variant="outline"
                        className="h-8 text-[11px] ms-auto rounded-lg"
                        onClick={() => { onViewDetails(alert); setExpanded(false); }}
                      >
                        {t("تفاصيل", "Details")}
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
