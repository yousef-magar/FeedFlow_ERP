import { useEffect, useRef } from "react";
import { useAppStore, type OverdueAlert } from "@/hooks/use-app-store";
import { useSalesStore } from "@/hooks/use-sales-store";

export function OverdueChecker() {
  const overdueEnabled = useAppStore(s => s.overdueEnabled);
  const overdueDays = useAppStore(s => s.overdueDays);
  const overdueMonths = useAppStore(s => s.overdueMonths);
  const setOverdueAlerts = useAppStore(s => s.setOverdueAlerts);
  const invoices = useSalesStore(s => s.invoices);
  const updateInvoice = useSalesStore(s => s.updateInvoice);
  const processedRef = useRef<Set<string>>(new Set());
  const alertsRef = useRef<OverdueAlert[]>([]);

  useEffect(() => {
    if (!overdueEnabled) {
      setOverdueAlerts([]);
      alertsRef.current = [];
      return;
    }
    const check = () => {
      const today = new Date();
      const totalDays = overdueDays + overdueMonths * 30;
      for (const inv of invoices) {
        if (inv.status !== "pending") continue;
        if (processedRef.current.has(inv.id)) continue;
        const invDate = new Date(inv.date);
        const diffMs = today.getTime() - invDate.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays >= totalDays) {
          processedRef.current.add(inv.id);
          updateInvoice(inv.id, { status: "overdue" });
          alertsRef.current.push({
            invoiceId: inv.id,
            customerName: inv.customerName,
            daysOverdue: diffDays,
            date: inv.date,
            total: inv.total,
          });
        }
      }
      setOverdueAlerts([...alertsRef.current]);
    };
    check();
    const interval = setInterval(check, 60000);
    return () => clearInterval(interval);
  }, [overdueEnabled, overdueDays, overdueMonths, invoices, updateInvoice, setOverdueAlerts]);

  return null;
}