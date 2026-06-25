import React, { useState, useMemo, useRef } from "react";
import { useAppStore } from "@/hooks/use-app-store";
import { useActivityLog, type ActivityEntry } from "@/hooks/use-activity-log";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  Search, Clock, Filter, Download, Trash2, RefreshCw,
  Factory, DollarSign, Truck, Users, Package, ShoppingCart, FileText,
  Settings, UserPlus, CreditCard, AlertTriangle, TrendingUp, BarChart3,
  X, AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { TextReveal } from "@/components/ui/TextReveal";

const MODULES = [
  { path: "all", ar: "الكل", en: "All" },
  { path: "production", ar: "الإنتاج", en: "Production", icon: Factory },
  { path: "sales", ar: "المبيعات", en: "Sales", icon: DollarSign },
  { path: "fleet", ar: "الأسطول", en: "Fleet", icon: Truck },
  { path: "hr", ar: "الموارد البشرية", en: "HR", icon: Users },
  { path: "inventory", ar: "المخزون", en: "Inventory", icon: Package },
  { path: "procurement", ar: "المشتريات", en: "Procurement", icon: ShoppingCart },
  { path: "pricing", ar: "التسعير", en: "Pricing", icon: BarChart3 },
  { path: "accounting", ar: "الحسابات", en: "Accounting", icon: CreditCard },
  { path: "payroll", ar: "الرواتب", en: "Payroll", icon: FileText },
  { path: "attendance", ar: "الحضور", en: "Attendance", icon: Users },
  { path: "marketing", ar: "التسويق", en: "Marketing", icon: TrendingUp },
  { path: "customers", ar: "العملاء", en: "Customers", icon: Users },
  { path: "settings", ar: "الإعدادات", en: "Settings", icon: Settings },
  { path: "sub-accounts", ar: "الحسابات الفرعية", en: "Sub-Accounts", icon: UserPlus },
  { path: "auth", ar: "الدخول", en: "Auth", icon: AlertCircle },
];

const ACTION_TYPES = [
  { value: "all", ar: "كل الأنواع", en: "All Types" },
  { value: "create", ar: "إضافة", en: "Create" },
  { value: "update", ar: "تحديث", en: "Update" },
  { value: "delete", ar: "حذف", en: "Delete" },
  { value: "login", ar: "تسجيل دخول", en: "Login" },
  { value: "logout", ar: "تسجيل خروج", en: "Logout" },
];

const MODULE_ICONS: Record<string, React.ElementType> = {};
MODULES.forEach(m => { if (m.icon) MODULE_ICONS[m.path] = m.icon; });
MODULE_ICONS["auth"] = AlertCircle;

export default function ActivityLog() {
  const { t } = useAppStore();
  const { entries, clearAll } = useActivityLog();
  const [searchQ, setSearchQ] = useState("");
  const [moduleFilter, setModuleFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");
  const [userFilter, setUserFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "week" | "month" | "custom">("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [clearOpen, setClearOpen] = useState(false);
  const [page, setPage] = useState(1);
  const perPage = 50;
  const printRef = useRef<HTMLDivElement>(null);

  const uniqueUsers = useMemo(() => {
    const u = new Set(entries.map(e => e.user));
    return Array.from(u).sort();
  }, [entries]);

  const filtered = useMemo(() => {
    let result = entries;
    if (moduleFilter !== "all") result = result.filter(e => e.module === moduleFilter);
    if (actionFilter !== "all") result = result.filter(e => e.action === actionFilter);
    if (userFilter !== "all") result = result.filter(e => e.user === userFilter);
    if (searchQ) { const q = searchQ.toLowerCase(); result = result.filter(e => e.arDescription.includes(q) || e.enDescription.toLowerCase().includes(q) || e.module.includes(q) || e.user.includes(q) || e.action.includes(q)); }
    const now = new Date();
    if (dateFilter === "today") { const ds = now.toISOString().split("T")[0]; result = result.filter(e => e.timestamp.startsWith(ds)); }
    else if (dateFilter === "week") { const d = new Date(now); d.setDate(d.getDate() - 7); result = result.filter(e => new Date(e.timestamp) >= d); }
    else if (dateFilter === "month") { const d = new Date(now); d.setMonth(d.getMonth() - 1); result = result.filter(e => new Date(e.timestamp) >= d); }
    else if (dateFilter === "custom" && dateFrom && dateTo) { result = result.filter(e => e.timestamp >= dateFrom && e.timestamp <= dateTo + "T23:59:59.999Z"); }
    return result.reverse();
  }, [entries, moduleFilter, actionFilter, userFilter, searchQ, dateFilter, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageEntries = filtered.slice((page - 1) * perPage, page * perPage);

  const handleClear = () => {
    clearAll();
    setClearOpen(false);
  };

  const handlePrint = () => {
    const w = window.open("", "", "width=1200,height=800");
    if (!w) return;
    w.document.write(`<html dir="rtl"><head><title>${t("سجل النشاط", "Activity Log")}</title><style>
      body { font-family: 'Cairo', sans-serif; padding: 20px; direction: rtl; }
      table { width: 100%; border-collapse: collapse; font-size: 12px; }
      th, td { padding: 8px; border: 1px solid #ddd; text-align: center; }
      th { background: #f5f5f5; }
      @media print { .no-print { display: none !important; } }
    </style></head><body>
      <h2 style="text-align:center;margin-bottom:20px;">${t("سجل النشاط", "Activity Log")}</h2>
      <table><thead><tr>
        <th>${t("التاريخ", "Date")}</th><th>${t("الوحدة", "Module")}</th><th>${t("الإجراء", "Action")}</th><th>${t("الوصف", "Description")}</th><th>${t("المستخدم", "User")}</th>
      </tr></thead><tbody>
      ${filtered.map(e => `<tr><td>${new Date(e.timestamp).toLocaleString("ar-EG")}</td><td>${e.module}</td><td>${e.action}</td><td>${e.arDescription}</td><td>${e.user}</td></tr>`).join("")}
      </tbody></table></body></html>`);
    w.document.close();
    setTimeout(() => { w.print(); w.close(); }, 300);
  };

  const handleExport = () => {
    const json = JSON.stringify(filtered, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `activity-log-${new Date().toISOString().split("T")[0]}.json`;
    a.click(); URL.revokeObjectURL(url);
  };

  const resetFilters = () => {
    setSearchQ(""); setModuleFilter("all"); setActionFilter("all"); setUserFilter("all");
    setDateFilter("all"); setDateFrom(""); setDateTo(""); setPage(1);
  };

  const colors: Record<string, string> = {
    production: "text-primary", sales: "text-emerald-500", fleet: "text-blue-500",
    hr: "text-purple-500", inventory: "text-amber-500", procurement: "text-cyan-500",
    pricing: "text-violet-500", accounting: "text-rose-500", payroll: "text-orange-500",
    attendance: "text-indigo-500", marketing: "text-pink-500", customers: "text-teal-500",
    settings: "text-muted-foreground", "sub-accounts": "text-yellow-500", auth: "text-red-500",
  };

  const actionBadgeColor = (action: string) => {
    if (action === "create") return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
    if (action === "update") return "bg-blue-500/10 text-blue-600 dark:text-blue-400";
    if (action === "delete") return "bg-red-500/10 text-red-600 dark:text-red-400";
    if (action === "login") return "bg-green-500/10 text-green-600 dark:text-green-400";
    if (action === "logout") return "bg-orange-500/10 text-orange-600 dark:text-orange-400";
    return "bg-gray-500/10 text-gray-600 dark:text-gray-400";
  };

  return (
    <div className="space-y-3 sm:space-y-6">
      <TextReveal text={t("سجل النشاط", "Activity Log")} className="text-2xl sm:text-3xl font-bold" as="h1" direction="words" />
      <p className="text-xs sm:text-sm text-muted-foreground -mt-3 sm:-mt-4">{t("تتبع جميع الأحداث في النظام", "Track every event in the system")}</p>

      {/* ═══ FILTERS ═══ */}
      <Card className="p-3 sm:p-4 border-border/50">
        <div className="flex flex-col gap-2">
          {/* Row 1: Search + module + action */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <div className="relative flex-1">
              <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              <Input value={searchQ} onChange={e => { setSearchQ(e.target.value); setPage(1); }}
                placeholder={t("بحث في السجل...", "Search log...")}
                className="h-9 text-xs sm:text-sm pr-9 w-full" />
            </div>
            <Select value={moduleFilter} onValueChange={v => { setModuleFilter(v); setPage(1); }}>
              <SelectTrigger className="h-9 text-xs sm:text-sm w-full sm:w-32">
                <SelectValue placeholder={t("الوحدة", "Module")} />
              </SelectTrigger>
              <SelectContent>
                {MODULES.map(m => (
                  <SelectItem key={m.path} value={m.path}>{t(m.ar, m.en)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={actionFilter} onValueChange={v => { setActionFilter(v); setPage(1); }}>
              <SelectTrigger className="h-9 text-xs sm:text-sm w-full sm:w-32">
                <SelectValue placeholder={t("الإجراء", "Action")} />
              </SelectTrigger>
              <SelectContent>
                {ACTION_TYPES.map(a => (
                  <SelectItem key={a.value} value={a.value}>{t(a.ar, a.en)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={userFilter} onValueChange={v => { setUserFilter(v); setPage(1); }}>
              <SelectTrigger className="h-9 text-xs sm:text-sm w-full sm:w-32">
                <SelectValue placeholder={t("المستخدم", "User")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("الكل", "All")}</SelectItem>
                {uniqueUsers.map(u => (
                  <SelectItem key={u} value={u}>{u}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Row 2: Date filter + actions */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-start sm:items-center">
            <Select value={dateFilter} onValueChange={v => { setDateFilter(v as any); setPage(1); }}>
              <SelectTrigger className="h-9 text-xs sm:text-sm w-full sm:w-32">
                <SelectValue placeholder={t("التاريخ", "Date")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("الكل", "All")}</SelectItem>
                <SelectItem value="today">{t("اليوم", "Today")}</SelectItem>
                <SelectItem value="week">{t("آخر 7 أيام", "Last 7 days")}</SelectItem>
                <SelectItem value="month">{t("آخر 30 يوم", "Last 30 days")}</SelectItem>
                <SelectItem value="custom">{t("مخصص", "Custom")}</SelectItem>
              </SelectContent>
            </Select>
            {dateFilter === "custom" && (
              <div className="flex items-center gap-2">
                <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="h-9 text-xs w-32" />
                <span className="text-muted-foreground text-xs">→</span>
                <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="h-9 text-xs w-32" />
              </div>
            )}
            <div className="flex gap-1.5 shrink-0 mr-auto">
              <Button variant="outline" size="sm" className="h-9 text-xs gap-1" onClick={handleExport}>
                <Download className="w-3.5 h-3.5" />{t("تصدير", "Export")}
              </Button>
              <Button variant="outline" size="sm" className="h-9 text-xs gap-1" onClick={handlePrint}>
                <FileText className="w-3.5 h-3.5" />{t("طباعة", "Print")}
              </Button>
              <Button variant="ghost" size="sm" className="h-9 text-xs text-destructive gap-1" onClick={() => setClearOpen(true)}>
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/30">
          <p className="text-[10px] sm:text-xs text-muted-foreground">
            {t("إجمالي", "Total")}: {filtered.length.toLocaleString("ar-EG")} {t("حدث", "events")}
            {moduleFilter !== "all" && ` — ${t(MODULES.find(m => m.path === moduleFilter)?.ar || "", MODULES.find(m => m.path === moduleFilter)?.en || "")}`}
          </p>
          <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1" onClick={resetFilters}>
            <RefreshCw className="w-3 h-3" />{t("إعادة تعيين", "Reset")}
          </Button>
        </div>
      </Card>

      {/* ═══ ENTRIES ═══ */}
      <ScrollReveal stagger={0.03}>
        <div className="space-y-1" ref={printRef}>
          {pageEntries.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground text-sm">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
              {t("لا توجد أحداث مسجلة بعد", "No events recorded yet")}
            </Card>
          ) : (
            pageEntries.map((entry, i) => {
              const Icon = MODULE_ICONS[entry.module] || Clock;
              return (
                <motion.div key={entry.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.015 }}
                  className="flex items-start gap-2 sm:gap-3 rounded-lg p-2 sm:p-3 hover:bg-muted/30 transition-colors">
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5 ${colors[entry.module] || ""}`}>
                    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium leading-snug">{t(entry.arDescription, entry.enDescription)}</p>
                    <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 flex-wrap">
                      <span className="text-[9px] sm:text-[10px] text-muted-foreground">{new Date(entry.timestamp).toLocaleString("ar-EG")}</span>
                      <Badge variant="outline" className={`text-[8px] sm:text-[9px] h-3.5 sm:h-4 px-1 font-normal border-0 ${actionBadgeColor(entry.action)}`}>{entry.action}</Badge>
                      <Badge variant="outline" className="text-[8px] sm:text-[9px] h-3.5 sm:h-4 px-1 font-normal">{entry.module}</Badge>
                      <span className="text-[9px] sm:text-[10px] text-muted-foreground">{entry.user}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </ScrollReveal>

      {/* ═══ PAGINATION ═══ */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button variant="outline" size="sm" className="h-8 text-xs" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>
            {t("السابق", "Prev")}
          </Button>
          <span className="text-xs sm:text-sm text-muted-foreground px-2">
            {page} / {totalPages}
          </span>
          <Button variant="outline" size="sm" className="h-8 text-xs" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>
            {t("التالي", "Next")}
          </Button>
        </div>
      )}

      {/* ═══ CLEAR CONFIRM DIALOG ═══ */}
      <Dialog open={clearOpen} onOpenChange={setClearOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5" />
              {t("مسح سجل النشاط", "Clear Activity Log")}
            </DialogTitle>
          </DialogHeader>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {t("هل أنت متأكد من مسح كل سجل النشاط؟ لا يمكن التراجع عن هذا الإجراء.", "Are you sure you want to clear the entire activity log? This action cannot be undone.")}
          </p>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setClearOpen(false)}>
              {t("إلغاء", "Cancel")}
            </Button>
            <Button variant="destructive" size="sm" onClick={handleClear}>
              <Trash2 className="w-4 h-4 ml-1" />{t("مسح", "Clear")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
