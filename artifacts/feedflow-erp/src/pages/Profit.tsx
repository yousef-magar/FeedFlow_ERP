import React, { useState, useMemo, useEffect } from "react";
import { useAppStore } from "@/hooks/use-app-store";
import { useSalesStore } from "@/hooks/use-sales-store";
import { usePricingStore } from "@/hooks/use-pricing-store";
import { useFleetStore } from "@/hooks/use-fleet-store";
import { useHRStore } from "@/hooks/use-hr-store";
import { useProcurementStore } from "@/hooks/use-procurement-store";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, DollarSign, Receipt, Truck, Users, ShoppingCart, Calendar, Download, ChevronDown, ChevronUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { usePermission } from "@/hooks/use-permission";

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const itemVariants = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

type DateMode = "today" | "week" | "month" | "custom";

function fmtDate(d: Date) {
  return d.toISOString().split("T")[0];
}
function fmtNum(n: number) {
  return new Intl.NumberFormat("ar-EG", { maximumFractionDigits: 0 }).format(n);
}
function fmtCurrency(n: number) {
  return new Intl.NumberFormat("ar-EG", { style: "currency", currency: "EGP", maximumFractionDigits: 0 }).format(n);
}
function getWeekRange(ref: Date) {
  const d = new Date(ref);
  const day = d.getDay();
  const diffToMon = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diffToMon);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return { from: fmtDate(monday), to: fmtDate(sunday) };
}
function getMonthRange(ref: Date) {
  const d = new Date(ref);
  return {
    from: fmtDate(new Date(d.getFullYear(), d.getMonth(), 1)),
    to: fmtDate(new Date(d.getFullYear(), d.getMonth() + 1, 0)),
  };
}

function isInRange(dateStr: string, from: string, to: string) {
  if (!from && !to) return true;
  if (from && dateStr < from) return false;
  if (to && dateStr > to) return false;
  return true;
}

export default function Profit() {
  const { t } = useAppStore();
  const { canView } = usePermission();
  const { invoices, returns } = useSalesStore();
  const { productPrices } = usePricingStore();
  const { vehicles } = useFleetStore();
  const { exportedPayrollEntries } = useHRStore();
  const { orders } = useProcurementStore();

  const [dateMode, setDateMode] = useState<DateMode>("today");
  const [dateFrom, setDateFrom] = useState(() => fmtDate(new Date()));
  const [dateTo, setDateTo] = useState(() => fmtDate(new Date()));

  useEffect(() => {
    const now = new Date();
    if (dateMode === "today") {
      const d = fmtDate(now);
      setDateFrom(d); setDateTo(d);
    } else if (dateMode === "week") {
      const r = getWeekRange(now);
      setDateFrom(r.from); setDateTo(r.to);
    } else if (dateMode === "month") {
      const r = getMonthRange(now);
      setDateFrom(r.from); setDateTo(r.to);
    }
  }, [dateMode]);

  const filteredInvoices = useMemo(() => invoices.filter(i => isInRange(i.date, dateFrom, dateTo)), [invoices, dateFrom, dateTo]);
  const filteredReturns = useMemo(() => returns.filter(r => isInRange(r.date, dateFrom, dateTo)), [returns, dateFrom, dateTo]);
  const allFleetExpenses = useMemo(() => vehicles.flatMap(v => (v.expenses || []).map(e => ({ ...e, vehicleName: v.name }))), [vehicles]);
  const filteredFleet = useMemo(() => allFleetExpenses.filter((e: { date: string }) => isInRange(e.date, dateFrom, dateTo)), [allFleetExpenses, dateFrom, dateTo]);
  const filteredPayroll = useMemo(() => exportedPayrollEntries.filter((e: { date: string }) => isInRange(e.date, dateFrom, dateTo)), [exportedPayrollEntries, dateFrom, dateTo]);
  const filteredOrders = useMemo(() => orders.filter((o: { date: string }) => isInRange(o.date, dateFrom, dateTo)), [orders, dateFrom, dateTo]);

  const revenue = useMemo(() =>
    filteredInvoices.reduce((s: number, i) => s + i.total, 0) - filteredReturns.reduce((s: number, r) => s + r.total, 0),
  [filteredInvoices, filteredReturns]);

  const cogs = useMemo(() =>
    filteredInvoices.reduce((sum: number, inv) =>
      sum + inv.items.reduce((s: number, item) => {
        const price = productPrices.find(p => p.productId === item.productId);
        return s + (price?.costPrice || 0) * item.qtyTons;
      }, 0), 0),
  [filteredInvoices, productPrices]);

  const grossProfit = revenue - cogs;
  const grossMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;

  const fleetCost = useMemo(() => filteredFleet.reduce((s: number, e: { amount: number }) => s + e.amount, 0), [filteredFleet]);
  const payrollCost = useMemo(() => filteredPayroll.reduce((s: number, e: { totalAmount: number }) => s + e.totalAmount, 0), [filteredPayroll]);
  const procurementCost = useMemo(() => filteredOrders.reduce((s: number, o: { total: number }) => s + o.total, 0), [filteredOrders]);

  const totalExpenses = fleetCost + payrollCost + procurementCost;
  const netProfit = grossProfit - totalExpenses;
  const netMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

  const dailyBreakdown = useMemo(() => {
    const dayMap = new Map<string, { revenue: number; cogs: number; fleet: number; payroll: number; procurement: number }>();
    const initDay = () => ({ revenue: 0, cogs: 0, fleet: 0, payroll: 0, procurement: 0 });

    filteredInvoices.forEach(inv => {
      const d = dayMap.get(inv.date) || initDay();
      d.revenue += inv.total;
      d.cogs += inv.items.reduce((s: number, item) => {
        const price = productPrices.find(p => p.productId === item.productId);
        return s + (price?.costPrice || 0) * item.qtyTons;
      }, 0);
      dayMap.set(inv.date, d);
    });
    filteredReturns.forEach(r => {
      const d = dayMap.get(r.date) || initDay();
      d.revenue -= r.total;
      dayMap.set(r.date, d);
    });
    filteredFleet.forEach(e => {
      const d = dayMap.get(e.date) || initDay();
      d.fleet += e.amount;
      dayMap.set(e.date, d);
    });
    filteredPayroll.forEach(e => {
      const d = dayMap.get(e.date) || initDay();
      d.payroll += e.totalAmount;
      dayMap.set(e.date, d);
    });
    filteredOrders.forEach(o => {
      const d = dayMap.get(o.date) || initDay();
      d.procurement += o.total;
      dayMap.set(o.date, d);
    });

    return Array.from(dayMap.entries())
      .map(([date, vals]) => ({ date, ...vals, gross: vals.revenue - vals.cogs, net: vals.revenue - vals.cogs - vals.fleet - vals.payroll - vals.procurement }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredInvoices, filteredReturns, filteredFleet, filteredPayroll, filteredOrders, productPrices]);

  const [expanded, setExpanded] = useState(false);

  if (!canView("/profit")) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <p className="text-sm">{t("ليس لديك صلاحية لعرض الأرباح", "You don't have permission to view profits")}</p>
      </div>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-3 sm:space-y-5" dir="rtl">
      {/* Header */}
      <motion.div variants={itemVariants} className="relative rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/10 p-4 sm:p-6 overflow-hidden">
        <div className="relative flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl font-bold">{t("الأرباح", "Profit")}</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">{t("حساب الربح بعد خصم التكاليف", "Profit calculation after deducting costs")}</p>
          </div>
        </div>
      </motion.div>

      {/* Date Filter */}
      <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-2">
        {[
          { id: "today" as DateMode, label: t("اليوم", "Today") },
          { id: "week" as DateMode, label: t("الأسبوع", "This Week") },
          { id: "month" as DateMode, label: t("الشهر", "This Month") },
          { id: "custom" as DateMode, label: t("مخصص", "Custom") },
        ].map(f => (
          <button key={f.id} type="button" onClick={() => setDateMode(f.id)}
            className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${dateMode === f.id ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-semibold" : "border-border/60 text-muted-foreground hover:border-border"}`}>
            {f.label}
          </button>
        ))}
        {dateMode === "custom" && (
          <div className="flex items-center gap-2 mr-2">
            <div className="space-y-0.5">
              <Label className="text-[9px] text-muted-foreground">{t("من", "From")}</Label>
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                className="w-32 h-7 text-[10px] rounded-md border border-input bg-transparent px-2" />
            </div>
            <div className="space-y-0.5">
              <Label className="text-[9px] text-muted-foreground">{t("إلى", "To")}</Label>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                className="w-32 h-7 text-[10px] rounded-md border border-input bg-transparent px-2" />
            </div>
          </div>
        )}
      </motion.div>

      {/* Summary Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500"><DollarSign className="w-4 h-4" /></div>
            <span className="text-[10px] sm:text-xs text-muted-foreground">{t("الإيرادات", "Revenue")}</span>
          </div>
          <p className="text-lg sm:text-xl font-bold text-emerald-500">{fmtCurrency(revenue)}</p>
        </Card>
        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-red-500/10 text-red-500"><Receipt className="w-4 h-4" /></div>
            <span className="text-[10px] sm:text-xs text-muted-foreground">{t("تكلفة الخامات", "COGS")}</span>
          </div>
          <p className="text-lg sm:text-xl font-bold text-red-500">{fmtCurrency(cogs)}</p>
        </Card>
        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className={`p-1.5 rounded-lg ${grossProfit >= 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}>
              <TrendingUp className="w-4 h-4" />
            </div>
            <span className="text-[10px] sm:text-xs text-muted-foreground">{t("الربح الإجمالي", "Gross Profit")}</span>
          </div>
          <p className={`text-lg sm:text-xl font-bold ${grossProfit >= 0 ? "text-emerald-500" : "text-red-500"}`}>{fmtCurrency(grossProfit)}</p>
          <p className="text-[9px] sm:text-[10px] text-muted-foreground">{t("هامش", "Margin")}: {fmtNum(grossMargin)}%</p>
        </Card>
        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className={`p-1.5 rounded-lg ${netProfit >= 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}>
              {netProfit >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            </div>
            <span className="text-[10px] sm:text-xs text-muted-foreground">{t("صافي الربح", "Net Profit")}</span>
          </div>
          <p className={`text-lg sm:text-xl font-bold ${netProfit >= 0 ? "text-emerald-500" : "text-red-500"}`}>{fmtCurrency(netProfit)}</p>
          <p className="text-[9px] sm:text-[10px] text-muted-foreground">{t("هامش", "Margin")}: {fmtNum(netMargin)}%</p>
        </Card>
      </motion.div>

      {/* Cost Breakdown */}
      <motion.div variants={itemVariants}>
        <Card className="p-3 sm:p-4">
          <h3 className="text-xs sm:text-sm font-semibold mb-3">{t("تفصيل التكاليف", "Cost Breakdown")}</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between py-1.5 border-b border-border/40 text-xs">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-3.5 h-3.5 text-red-500" />
                <span>{t("المشتريات (خامات)", "Procurement (Materials)")}</span>
              </div>
              <span className="font-semibold text-red-500">{fmtCurrency(procurementCost)}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-border/40 text-xs">
              <div className="flex items-center gap-2">
                <Truck className="w-3.5 h-3.5 text-amber-500" />
                <span>{t("مصروفات الأسطول", "Fleet Expenses")}</span>
              </div>
              <span className="font-semibold text-amber-500">{fmtCurrency(fleetCost)}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-border/40 text-xs">
              <div className="flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-blue-500" />
                <span>{t("الرواتب", "Payroll")}</span>
              </div>
              <span className="font-semibold text-blue-500">{fmtCurrency(payrollCost)}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 text-xs">
              <div className="flex items-center gap-2 font-semibold">
                <span>{t("إجمالي التكاليف", "Total Costs")}</span>
              </div>
              <span className="font-bold text-destructive">{fmtCurrency(totalExpenses)}</span>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Daily Breakdown Table */}
      <motion.div variants={itemVariants}>
        <Card className="p-3 sm:p-4">
          <button type="button" onClick={() => setExpanded(!expanded)}
            className="flex items-center justify-between w-full text-xs sm:text-sm font-semibold mb-2">
            <span>{t("تفصيل يومي", "Daily Breakdown")}</span>
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {expanded && (
            <div className="overflow-x-auto">
              <table className="w-full text-[10px] sm:text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border/40 text-muted-foreground">
                    <th className="text-right py-2 px-1 font-medium">{t("التاريخ", "Date")}</th>
                    <th className="text-right py-2 px-1 font-medium">{t("الإيرادات", "Revenue")}</th>
                    <th className="text-right py-2 px-1 font-medium">{t("تكلفة الخامات", "COGS")}</th>
                    <th className="text-right py-2 px-1 font-medium">{t("الربح الإجمالي", "Gross")}</th>
                    <th className="text-right py-2 px-1 font-medium">{t("المشتريات", "Proc.")}</th>
                    <th className="text-right py-2 px-1 font-medium">{t("الأسطول", "Fleet")}</th>
                    <th className="text-right py-2 px-1 font-medium">{t("الرواتب", "Payroll")}</th>
                    <th className="text-right py-2 px-1 font-medium">{t("صافي الربح", "Net")}</th>
                  </tr>
                </thead>
                <tbody>
                  {dailyBreakdown.map(d => (
                    <tr key={d.date} className="border-b border-border/20 hover:bg-muted/20 transition-colors">
                      <td className="py-1.5 px-1 font-medium">{d.date}</td>
                      <td className="py-1.5 px-1 text-emerald-500">{fmtCurrency(d.revenue)}</td>
                      <td className="py-1.5 px-1 text-red-500">{fmtCurrency(d.cogs)}</td>
                      <td className={`py-1.5 px-1 font-medium ${d.gross >= 0 ? "text-emerald-500" : "text-red-500"}`}>{fmtCurrency(d.gross)}</td>
                      <td className="py-1.5 px-1 text-red-500">{d.procurement > 0 ? fmtCurrency(d.procurement) : "—"}</td>
                      <td className="py-1.5 px-1 text-amber-500">{d.fleet > 0 ? fmtCurrency(d.fleet) : "—"}</td>
                      <td className="py-1.5 px-1 text-blue-500">{d.payroll > 0 ? fmtCurrency(d.payroll) : "—"}</td>
                      <td className={`py-1.5 px-1 font-bold ${d.net >= 0 ? "text-emerald-500" : "text-red-500"}`}>{fmtCurrency(d.net)}</td>
                    </tr>
                  ))}
                  {dailyBreakdown.length === 0 && (
                    <tr><td colSpan={8} className="text-center py-4 text-muted-foreground text-[10px]">{t("لا توجد بيانات في هذا النطاق", "No data in this range")}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Legend */}
      <motion.div variants={itemVariants} className="text-[9px] text-muted-foreground p-2">
        <p><strong>{t("منهجية الحساب:", "Calculation Method:")}</strong></p>
        <p>{t("الإيرادات = إجمالي فواتير المبيعات - المرتجعات", "Revenue = Total sales invoices - returns")}</p>
        <p>{t("تكلفة الخامات = الكمية المباعة × سعر التكلفة لكل منتج", "COGS = Quantity sold × cost price per product")}</p>
        <p>{t("الربح الإجمالي = الإيرادات - تكلفة الخامات", "Gross Profit = Revenue - COGS")}</p>
        <p>{t("صافي الربح = الربح الإجمالي - المشتريات - مصروفات الأسطول - الرواتب", "Net Profit = Gross Profit - Procurement - Fleet - Payroll")}</p>
      </motion.div>
    </motion.div>
  );
}
