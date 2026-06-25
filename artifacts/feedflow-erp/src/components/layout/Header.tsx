import React, { useState } from "react";
import { useLocation } from "wouter";
import { Search, Globe, LogOut } from "lucide-react";
import { useAppStore } from "@/hooks/use-app-store";
import { GlobalSearch } from "@/components/GlobalSearch";
import { NotificationDrawer } from "@/components/NotificationDrawer";
import { SubstitutionAlerts } from "@/components/production/SubstitutionAlerts";
import { SubstitutionApprovalDialog } from "@/components/production/SubstitutionApprovalDialog";

export function Header({ onToggleHelp }: { onToggleHelp?: () => void }) {
  const [, setLocation] = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const {
    language, setLanguage, t,
    substitutionAlerts, substitutionDialogOpen, substitutionDialogData, substitutionLoading,
    openSubstitutionDialog, closeSubstitutionDialog, onApproveSubstitution, onRejectSubstitution,
    loggedInSubAccountId, subAccounts, logout,
  } = useAppStore();
  const currentAccount = loggedInSubAccountId ? subAccounts.find(a => a.id === loggedInSubAccountId) : null;

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("ar-EG", { style: "currency", currency: "EGP", maximumFractionDigits: 0 }).format(n);

  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-full max-w-md hidden md:block">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder={t("بحث في النظام...", "Search system...")}
            className="w-full h-10 bg-muted/50 border-none rounded-md pr-10 pl-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-shadow cursor-pointer"
            onFocus={() => setSearchOpen(true)}
            readOnly
          />
          <kbd className="absolute left-3 top-1/2 -translate-y-1/2 text-[9px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
            Ctrl+Shift+G
          </kbd>
        </div>
        <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
      </div>

      <div className="flex items-center gap-1">
        <button onClick={onToggleHelp} className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors text-sm font-bold" title={t("اختصارات لوحة المفاتيح", "Keyboard Shortcuts")}>
          <span>?</span>
        </button>
        <button 
          onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-md hover:bg-muted/50"
        >
          <Globe className="w-4 h-4" />
          {language === "ar" ? "English" : "عربي"}
        </button>

        <SubstitutionAlerts
          alerts={substitutionAlerts}
          onViewDetails={(alert) => {
            openSubstitutionDialog({
              requestId: alert.orderId,
              orderId: alert.orderId,
              productId: alert.productId,
              productName: alert.productName,
              suggestions: alert.suggestions,
              totalOriginalCost: alert.totalOriginalCost,
              totalNewCost: alert.totalNewCost,
              totalImpact: alert.totalImpact,
            });
          }}
          onApprove={(alert) => {
            openSubstitutionDialog({
              requestId: alert.orderId,
              orderId: alert.orderId,
              productId: alert.productId,
              productName: alert.productName,
              suggestions: alert.suggestions,
              totalOriginalCost: alert.totalOriginalCost,
              totalNewCost: alert.totalNewCost,
              totalImpact: alert.totalImpact,
            });
          }}
          onReject={(alert) => {
            if (onRejectSubstitution) onRejectSubstitution(alert.orderId);
          }}
          t={t}
        />

        {/* Unified Notifications */}
        <NotificationDrawer />

        <div className="flex items-center gap-3 pr-4 border-r border-border group relative">
          <div className="text-left rtl:text-right hidden sm:block cursor-pointer">
            <p className="text-sm font-semibold leading-none">{currentAccount?.name || t("المدير", "Admin")}</p>
            <p className="text-xs text-muted-foreground mt-1">{currentAccount?.role || t("مدير النظام", "System Admin")}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold cursor-pointer">
            {(currentAccount?.name || "أ م").charAt(0)}
          </div>
          <div className="absolute left-0 top-full mt-1 w-48 rounded-lg border border-border bg-card shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
            <div className="p-3 border-b border-border">
              <p className="text-sm font-semibold">{currentAccount?.name || t("المدير", "Admin")}</p>
              <p className="text-xs text-muted-foreground">{currentAccount?.email || "admin@factory.com"}</p>
            </div>
            <button
              onClick={() => { logout(); setLocation("/login"); }}
              className="flex items-center gap-2 w-full p-3 text-sm text-destructive hover:bg-destructive/10 transition-colors rounded-b-lg"
            >
              <LogOut className="w-4 h-4" />
              {t("تسجيل الخروج", "Logout")}
            </button>
          </div>
        </div>
      </div>

      <SubstitutionApprovalDialog
        open={substitutionDialogOpen}
        data={substitutionDialogData}
        loading={substitutionLoading}
        onApprove={(id) => { if (onApproveSubstitution) onApproveSubstitution(id); }}
        onReject={(id) => { if (onRejectSubstitution) onRejectSubstitution(id); }}
        onClose={closeSubstitutionDialog}
        t={t}
      />
    </header>
  );
}
