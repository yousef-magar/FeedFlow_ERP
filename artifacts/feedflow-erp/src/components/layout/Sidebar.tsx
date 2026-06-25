import React, { useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import gsap from "gsap";
import {
  LayoutDashboard, Factory, Package, ShoppingCart, Users,
  Truck, UserCircle, Banknote, Clock, Briefcase, Calculator,
  FileText, BarChart, BotMessageSquare, Settings, DollarSign,
  ChevronRight, LogOut, Moon, Sun, UserCog, LucideIcon, TrendingUp,
} from "lucide-react";
import { useAppStore } from "@/hooks/use-app-store";

const MENU_MAP: Record<string, { icon: LucideIcon; ar: string; en: string }> = {
  "/activity-log": { icon: Clock, ar: "سجل النشاط", en: "Activity Log" },
  "/": { icon: LayoutDashboard, ar: "الرئيسية", en: "Dashboard" },
  "/production": { icon: Factory, ar: "الإنتاج", en: "Production" },
  "/inventory": { icon: Package, ar: "المخزون", en: "Inventory" },
  "/sales": { icon: ShoppingCart, ar: "المبيعات", en: "Sales" },
  "/customers": { icon: Users, ar: "العملاء", en: "Customers" },
  "/fleet": { icon: Truck, ar: "الأسطول", en: "Fleet & Delivery" },
  "/hr": { icon: UserCircle, ar: "الموارد البشرية", en: "HR" },
  "/attendance": { icon: Clock, ar: "الحضور والانصراف", en: "Attendance" },
  "/payroll": { icon: Banknote, ar: "الرواتب", en: "Payroll" },
  "/marketing": { icon: Briefcase, ar: "التسويق", en: "Marketing" },
  "/accounting": { icon: Calculator, ar: "الحسابات", en: "Accounting" },
  "/procurement": { icon: FileText, ar: "المشتريات", en: "Procurement" },
  "/reports": { icon: BarChart, ar: "التقارير", en: "Reports" },
  "/pricing": { icon: DollarSign, ar: "التسعير والتكلفة", en: "Pricing & Cost" },
  "/profit": { icon: TrendingUp, ar: "الأرباح", en: "Profit" },
  "/ai-assistant": { icon: BotMessageSquare, ar: "المساعد الذكي", en: "AI Assistant" },
  "/sub-accounts": { icon: UserCog, ar: "الحسابات الفرعية", en: "Sub Accounts" },
  "/settings": { icon: Settings, ar: "الإعدادات", en: "Settings" },
};

export function Sidebar({ collapsed, setCollapsed }: { collapsed: boolean; setCollapsed: (val: boolean) => void }) {
  const [location] = useLocation();
  const { t, theme, setTheme, sidebarOrder, activeModules, companyLogo, companyName, logout } = useAppStore();
  const sidebarRef = useRef<HTMLDivElement>(null);

  const menuItems = sidebarOrder
    .filter(path => MENU_MAP[path] && activeModules.includes(path))
    .map(path => ({ path, ...MENU_MAP[path] }));

  useEffect(() => {
    const el = sidebarRef.current;
    if (!el || collapsed) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(el.querySelectorAll(".nav-label"), { opacity: 0, x: -12 }, { opacity: 1, x: 0, duration: 0.35, stagger: 0.03, ease: "power2.out", delay: 0.1 });
    });
    return () => ctx.revert();
  }, [collapsed]);

  useEffect(() => {
    const el = sidebarRef.current;
    if (!el) return;
    const activeItem = el.querySelector(".nav-active");
    if (!activeItem) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(activeItem, { scaleX: 0.8, opacity: 0.5 }, { scaleX: 1, opacity: 1, duration: 0.3, ease: "back.out(2)" });
    });
    return () => ctx.revert();
  }, [location]);

  return (
    <motion.aside
      ref={sidebarRef}
      initial={false}
      animate={{ width: collapsed ? 80 : 280 }}
      transition={{ type: "spring", stiffness: 250, damping: 30 }}
      className="bg-sidebar border-x border-sidebar-border h-screen flex flex-col fixed z-50"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] to-transparent pointer-events-none" />

      <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border relative z-10">
        <motion.div
          initial={false}
          animate={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : "auto" }}
          transition={{ duration: 0.2 }}
          className="font-bold text-lg text-primary flex items-center gap-2 whitespace-nowrap"
        >
          <motion.div whileHover={{ rotate: [0, -15, 15, 0], transition: { duration: 0.4 } }}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 text-primary-foreground flex items-center justify-center text-xl overflow-hidden shadow-md shadow-primary/20 shrink-0">
              {companyLogo ? <img src={companyLogo} alt="logo" className="w-full h-full object-contain" /> : "F"}
            </div>
          </motion.div>
          <motion.span initial={false} animate={{ opacity: collapsed ? 0 : 1 }} transition={{ duration: 0.15 }}>
            {companyName}
          </motion.span>
        </motion.div>
        {collapsed && (
          <div className="w-full flex justify-center">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 text-primary-foreground flex items-center justify-center text-xl font-bold overflow-hidden shadow-md">
              {companyLogo ? <img src={companyLogo} alt="logo" className="w-full h-full object-contain" /> : "F"}
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-1 px-3 custom-scrollbar relative z-10">
        {menuItems.map((item) => {
          const isActive = location === item.path;
          const Icon = item.icon;

          return (
            <Link key={item.path} href={item.path}>
              <motion.div
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + menuItems.indexOf(item) * 0.04, type: "spring", stiffness: 200, damping: 25 }}
                whileHover={{ x: collapsed ? 0 : 6, transition: { duration: 0.12 } }}
                whileTap={{ scale: 0.97 }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer relative group transition-colors duration-150 ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-sm"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                } ${collapsed ? "justify-center" : ""}`}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-nav-indicator"
                    className="nav-active absolute right-0 top-1 bottom-1 w-[3px] bg-gradient-to-b from-primary via-primary/80 to-primary/40 rounded-r-full"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <div className="flex-shrink-0 relative">
                  <Icon className={`w-5 h-5 ${isActive ? "text-primary" : "text-sidebar-foreground/70"}`} />
                  {isActive && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: [1, 1.8, 1] }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className="absolute inset-0 bg-primary/20 rounded-full -z-10"
                    />
                  )}
                </div>
                <span className={`truncate text-sm nav-label ${collapsed ? "hidden" : ""}`}>
                  {t(item.ar, item.en)}
                </span>

                {collapsed && (
                  <div className="absolute right-14 bg-popover text-popover-foreground px-2 py-1.5 rounded-md shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 text-sm transition-opacity duration-200 border border-border">
                    <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-popover border-l border-t border-border rotate-45" />
                    {t(item.ar, item.en)}
                  </div>
                )}
              </motion.div>
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-sidebar-border flex flex-col gap-2 relative z-10">
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer hover:bg-sidebar-accent/50 text-sidebar-foreground transition-colors ${collapsed ? "justify-center" : ""}`}
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <motion.div
            animate={{ rotate: theme === "dark" ? 180 : 0, scale: theme === "dark" ? [1, 1.3, 1] : [1, 1.3, 1] }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </motion.div>
          {!collapsed && <span className="text-sm">{theme === "dark" ? t("الوضع الفاتح", "Light Mode") : t("الوضع الداكن", "Dark Mode")}</span>}
          {collapsed && (
            <div className="absolute right-14 bg-popover text-popover-foreground px-2 py-1.5 rounded-md shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 text-sm transition-opacity duration-200 border border-border">
              <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-popover border-l border-t border-border rotate-45" />
              {theme === "dark" ? t("الوضع الفاتح", "Light Mode") : t("الوضع الداكن", "Dark Mode")}
            </div>
          )}
        </motion.div>
        <Link href="/login">
          <motion.div
            whileHover={{ scale: 1.02, backgroundColor: "hsl(var(--destructive)/0.08)" }}
            whileTap={{ scale: 0.97 }}
            onClick={() => logout()}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer text-destructive/80 hover:text-destructive transition-colors ${collapsed ? "justify-center" : ""}`}
          >
            <LogOut className="w-5 h-5" />
            {!collapsed && <span className="text-sm">{t("تسجيل الخروج", "Logout")}</span>}
            {collapsed && (
              <div className="absolute right-14 bg-popover text-popover-foreground px-2 py-1.5 rounded-md shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 text-sm transition-opacity duration-200 border border-border">
                <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-popover border-l border-t border-border rotate-45" />
                {t("تسجيل الخروج", "Logout")}
              </div>
            )}
          </motion.div>
        </Link>
      </div>

      <motion.button
        onClick={() => setCollapsed(!collapsed)}
        whileHover={{ scale: 1.15, backgroundColor: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}
        whileTap={{ scale: 0.9 }}
        className="absolute top-6 -left-3 w-6 h-6 bg-sidebar-accent border border-sidebar-border rounded-full flex items-center justify-center text-sidebar-foreground transition-colors shadow-sm z-50"
      >
        <motion.div
          animate={{ rotate: collapsed ? 180 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <ChevronRight className="w-4 h-4" />
        </motion.div>
      </motion.button>
    </motion.aside>
  );
}
