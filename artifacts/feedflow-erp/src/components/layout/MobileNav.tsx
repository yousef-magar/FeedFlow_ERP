import { useRef, useEffect } from "react";
import { useLocation, Link } from "wouter";
import {
  LayoutDashboard, Factory, Package, ShoppingCart, Truck,
  BarChart, Settings, Users, UserCircle, Banknote, Briefcase,
  Calculator, FileText, DollarSign, BotMessageSquare, UserCog, Clock, TrendingUp,
  LogOut,
} from "lucide-react";
import { useAppStore } from "@/hooks/use-app-store";

const MENU_MAP: Record<string, { icon: React.ComponentType<{ className?: string }>; ar: string; en: string }> = {
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

export function MobileNav() {
  const [location] = useLocation();
  const { t, sidebarOrder, activeModules, logout } = useAppStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  const items = sidebarOrder
    .filter(path => MENU_MAP[path] && activeModules.includes(path))
    .map(path => ({ path, ...MENU_MAP[path] }));

  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const el = activeRef.current;
      const containerRect = container.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      const offset = el.offsetLeft - container.offsetLeft - containerRect.width / 2 + elRect.width / 2;
      container.scrollTo({ left: offset, behavior: "smooth" });
    }
  }, [location]);

  if (items.length === 0) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-border safe-area-bottom">
      <div ref={scrollRef} className="flex items-center h-16 overflow-x-auto overflow-y-hidden px-1 gap-0.5 no-scrollbar" dir="ltr">
        {items.map(item => {
          const isActive = location === item.path;
          const Icon = item.icon;
          return (
            <Link key={item.path} href={item.path}>
              <button
                ref={isActive ? activeRef : undefined}
                className={`flex flex-col items-center justify-center gap-0.5 px-2 py-1 rounded-xl relative shrink-0 min-w-[60px] ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {isActive && (
                  <div className="absolute -top-[5px] w-6 h-1 rounded-full bg-primary" />
                )}
                <div className={isActive ? "scale-110" : ""}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[9px] font-medium leading-tight truncate max-w-14 text-center">
                  {t(item.ar, item.en)}
                </span>
              </button>
            </Link>
          );
        })}
        {/* Logout */}
        <button
          onClick={() => { logout(); window.location.href = "/login"; }}
          className="flex flex-col items-center justify-center gap-0.5 px-2 py-1 rounded-xl shrink-0 min-w-[60px] text-destructive/80 hover:text-destructive"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-[9px] font-medium leading-tight truncate max-w-14 text-center">
            {t("خروج", "Logout")}
          </span>
        </button>
      </div>
    </nav>
  );
}
