import { useEffect, useRef } from "react";
import { useNotificationStore } from "@/hooks/use-notification-store";
import { useProductionStore } from "@/hooks/use-production-store";
import { useSalesStore } from "@/hooks/use-sales-store";
import { useAppStore } from "@/hooks/use-app-store";

export function NotificationChecker() {
  const added = useRef(new Set<string>());
  const addNotification = useNotificationStore(s => s.addNotification);
  const { inventory, orders } = useProductionStore();
  const { invoices } = useSalesStore();
  const { taxEnabled } = useAppStore();

  useEffect(() => {
    const check = () => {
      for (const item of inventory) {
        if (item.alertLevel === "critical") {
          const k = `inv-crit-${item.id}`;
          if (!added.current.has(k)) {
            added.current.add(k);
            addNotification({
              type: "critical", module: "inventory",
              title: `مخزون حرج: ${item.materialName}`,
              description: `الكمية المتبقية: ${item.quantity} ${item.unit === "ton" ? "طن" : "كجم"} — تحت الحد المسموح`,
              link: "/inventory",
            });
          }
        }
      }

      const today = new Date().toISOString().split("T")[0];
      for (const inv of invoices) {
        if (inv.status === "overdue" || (inv.status === "pending" && inv.date < today)) {
          const k = `ovr-${inv.id}`;
          if (!added.current.has(k)) {
            added.current.add(k);
            addNotification({
              type: "warning", module: "sales",
              title: `فاتورة متأخرة: ${inv.customerName}`,
              description: `المبلغ: ${inv.total.toLocaleString("ar-EG")} ج.م — الفاتورة ${inv.id}`,
              link: "/sales",
            });
          }
        }
      }

      for (const o of orders) {
        if (o.status === "paused") {
          const k = `pau-${o.id}`;
          if (!added.current.has(k)) {
            added.current.add(k);
            addNotification({
              type: "info", module: "production",
              title: `أمر إنتاج موقوف: ${o.productName}`,
              description: `الأمر ${o.id} موقوف حالياً — ${o.producedTons}/${o.targetTons} طن`,
              link: "/production",
            });
          }
        }
      }
    };

    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, [inventory, invoices, orders, addNotification, taxEnabled]);

  return null;
}
