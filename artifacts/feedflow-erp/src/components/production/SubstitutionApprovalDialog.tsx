import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeftRight, CheckCircle2, XCircle, AlertTriangle, TrendingUp,
  TrendingDown, Brain, Package, DollarSign, Scale, Loader2,
} from "lucide-react";

export interface SuggestionData {
  originalMaterial: string;
  originalPricePerTon: number;
  substituteMaterial: string;
  substitutePricePerTon: number;
  substituteAvailableTons: number;
  neededTons: number;
  costImpact: number;
  newTotalCost: number;
  reason: "out_of_stock" | "insufficient_stock";
  aiRationale: string;
  confidence: number;
}

export interface SubstitutionApprovalData {
  requestId: string;
  orderId: string;
  productId: string;
  productName: string;
  suggestions: SuggestionData[];
  totalOriginalCost: number;
  totalNewCost: number;
  totalImpact: number;
}

interface Props {
  open: boolean;
  data: SubstitutionApprovalData | null;
  loading?: boolean;
  onApprove: (requestId: string) => void;
  onReject: (requestId: string) => void;
  onClose: () => void;
  t: (ar: string, en: string) => string;
}

function fmtCurrency(n: number) {
  return new Intl.NumberFormat("ar-EG", {
    style: "currency",
    currency: "EGP",
    maximumFractionDigits: 0,
  }).format(n);
}

function fmtNum(n: number) {
  return new Intl.NumberFormat("ar-EG").format(n);
}

export function SubstitutionApprovalDialog({
  open, data, loading, onApprove, onReject, onClose, t,
}: Props) {
  const [selectedAction, setSelectedAction] = useState<"approve" | "reject" | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setSelectedAction(null);
      setActionLoading(false);
    }
  }, [open]);

  if (!data) return null;

  const isPositiveImpact = data.totalImpact <= 0;
  const impactIcon = isPositiveImpact
    ? <TrendingDown className="w-5 h-5 text-emerald-500" />
    : <TrendingUp className="w-5 h-5 text-red-500" />;

  const handleApprove = async () => {
    setSelectedAction("approve");
    setActionLoading(true);
    await onApprove(data.requestId);
    setActionLoading(false);
  };

  const handleReject = async () => {
    setSelectedAction("reject");
    setActionLoading(true);
    await onReject(data.requestId);
    setActionLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={v => { if (!v && !actionLoading) onClose(); }}>
      <DialogContent className="sm:max-w-xl mx-4 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0">
              <Brain className="w-5 h-5 text-amber-600" />
            </div>
            {t("اقتراح الاستبدال الذكي", "AI Substitution Suggestion")}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {data.productName} — {data.orderId}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            >
              <Brain className="w-12 h-12 text-primary/30" />
            </motion.div>
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">
                {t("AI بتحليل المخزون والبدائل...", "Analyzing inventory & alternatives...")}
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-5 pt-1">
            {/* Summary card */}
            <div className="rounded-xl bg-gradient-to-br from-amber-500/5 to-amber-500/10 border border-amber-500/20 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-semibold">
                    {t("المواد المطلوب استبدالها", "Materials to substitute")}
                  </span>
                </div>
                <Badge variant="outline" className="bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700">
                  {data.suggestions.length} {data.suggestions.length > 1 ? t("مواد", "items") : t("مادة", "item")}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-background/60 px-3 py-2">
                  <p className="text-[10px] text-muted-foreground mb-0.5">{t("التكلفة الحالية", "Current Cost")}</p>
                  <p className="text-sm font-bold">{fmtCurrency(data.totalOriginalCost)}</p>
                </div>
                <div className="rounded-lg bg-background/60 px-3 py-2">
                  <p className="text-[10px] text-muted-foreground mb-0.5">{t("التكلفة الجديدة", "New Cost")}</p>
                  <p className={`text-sm font-bold ${isPositiveImpact ? "text-emerald-600" : "text-red-600"}`}>
                    {fmtCurrency(data.totalNewCost)}
                  </p>
                </div>
              </div>

              <div className={`mt-3 rounded-lg flex items-center gap-2 px-3 py-2 ${
                isPositiveImpact
                  ? "bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800"
                  : "bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800"
              }`}>
                {impactIcon}
                <div>
                  <p className={`text-xs font-semibold ${isPositiveImpact ? "text-emerald-700 dark:text-emerald-400" : "text-red-700 dark:text-red-400"}`}>
                    {isPositiveImpact
                      ? t("وفر في التكلفة", "Cost saving")
                      : t("زيادة في التكلفة", "Cost increase")}
                  </p>
                  <p className={`text-sm font-bold ${isPositiveImpact ? "text-emerald-600" : "text-red-600"}`}>
                    {fmtCurrency(Math.abs(data.totalImpact))}
                  </p>
                </div>
              </div>
            </div>

            {/* Individual suggestions */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {t("تفاصيل الاقتراحات", "Suggestion Details")}
              </p>

              {data.suggestions.map((s, idx) => {
                const priceDiff = s.substitutePricePerTon - s.originalPricePerTon;
                const priceUp = priceDiff > 0;
                return (
                  <motion.div
                    key={`${s.originalMaterial}-${idx}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="rounded-xl border bg-card p-3 space-y-2"
                  >
                    {/* Material swap */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground">{t("المادة الأصلية", "Original")}</p>
                        <p className="text-sm font-semibold truncate">{s.originalMaterial}</p>
                      </div>
                      <motion.div
                        animate={{ x: [0, 4, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                      >
                        <ArrowLeftRight className="w-5 h-5 text-amber-500 shrink-0" />
                      </motion.div>
                      <div className="flex-1 min-w-0 text-end">
                        <p className="text-xs text-muted-foreground">{t("البديل", "Substitute")}</p>
                        <p className="text-sm font-semibold truncate text-amber-700 dark:text-amber-400">{s.substituteMaterial}</p>
                      </div>
                    </div>

                    {/* Price comparison */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="rounded-lg bg-muted/40 px-2 py-1.5">
                        <p className="text-[10px] text-muted-foreground">{t("سعر المادة", "Mat. Price")}</p>
                        <p className="text-xs font-mono font-medium">
                          {fmtCurrency(s.originalPricePerTon)}
                          <span className="text-muted-foreground">/ط</span>
                        </p>
                      </div>
                      <div className="rounded-lg bg-muted/40 px-2 py-1.5">
                        <p className="text-[10px] text-muted-foreground">{t("سعر البديل", "Sub. Price")}</p>
                        <p className={`text-xs font-mono font-medium ${priceUp ? "text-red-600" : "text-emerald-600"}`}>
                          {fmtCurrency(s.substitutePricePerTon)}
                          <span className="text-muted-foreground">/ط</span>
                        </p>
                      </div>
                      <div className="rounded-lg bg-muted/40 px-2 py-1.5">
                        <p className="text-[10px] text-muted-foreground">{t("الفرق", "Diff")}</p>
                        <p className={`text-xs font-mono font-bold ${priceUp ? "text-red-600" : "text-emerald-600"}`}>
                          {priceUp ? "+" : ""}{fmtCurrency(priceDiff)}
                        </p>
                      </div>
                    </div>

                    {/* Stock & need */}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Scale className="w-3 h-3" />
                        <span>{t("المطلوب:", "Needed:")} <strong className="text-foreground">{s.neededTons.toFixed(1)}</strong> ط</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Package className="w-3 h-3" />
                        <span>{t("متوفر:", "Avail:")} <strong className={`${s.substituteAvailableTons >= s.neededTons ? "text-emerald-600" : "text-amber-600"}`}>
                          {s.substituteAvailableTons.toFixed(0)}
                        </strong> ط</span>
                      </div>
                      <Badge variant="outline" className={`text-[10px] ${
                        s.confidence >= 80
                          ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                          : s.confidence >= 60
                          ? "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800"
                          : "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800"
                      }`}>
                        {t("ثقة", "Conf.")} {s.confidence}%
                      </Badge>
                    </div>

                    {/* AI rationale */}
                    <div className="rounded-lg bg-primary/5 border border-primary/10 px-3 py-2">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Brain className="w-3 h-3 text-primary/60" />
                        <span className="text-[10px] font-semibold text-primary/60 uppercase tracking-wider">
                          {t("AI تحليل", "AI Analysis")}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{s.aiRationale}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <Separator />

            {/* Action buttons */}
            <div className="flex gap-3">
              <Button
                className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={handleApprove}
                disabled={actionLoading || selectedAction !== null}
              >
                {actionLoading && selectedAction === "approve" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                {t("اعتماد الاستبدال", "Approve Substitution")}
              </Button>
              <Button
                variant="outline"
                className="flex-1 gap-2 text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950/30"
                onClick={handleReject}
                disabled={actionLoading || selectedAction !== null}
              >
                {actionLoading && selectedAction === "reject" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                {t("رفض", "Reject")}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
