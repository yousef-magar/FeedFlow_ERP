import React, { useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { useNotificationStore, type AppNotification } from "@/hooks/use-notification-store";
import { useAppStore } from "@/hooks/use-app-store";
import { Bell, BellRing, X, CheckCheck, Clock } from "lucide-react";

export function NotificationDrawer() {
  const { notifications, markRead, markAllRead, clearAll, unreadCount } = useNotificationStore();
  const { t } = useAppStore();
  const [open, setOpen] = React.useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const count = unreadCount();

  const typeStyles: Record<AppNotification["type"], { icon: string; bg: string; border: string }> = {
    critical: { icon: "🔴", bg: "bg-red-500/10", border: "border-red-500/30" },
    warning: { icon: "🟡", bg: "bg-amber-500/10", border: "border-amber-500/30" },
    info: { icon: "🔵", bg: "bg-blue-500/10", border: "border-blue-500/30" },
    success: { icon: "🟢", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
  };

  const handleNotificationClick = (n: AppNotification) => {
    if (!n.read) markRead(n.id);
    setOpen(false);
    if (n.link) setLocation(n.link);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-muted/50 transition-colors"
      >
        {count > 0 ? (
          <BellRing className="w-5 h-5 text-destructive" />
        ) : (
          <Bell className="w-5 h-5 text-muted-foreground" />
        )}
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-destructive text-[9px] font-bold text-white flex items-center justify-center">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute left-0 mt-2 w-80 sm:w-96 rounded-xl border border-border bg-card shadow-2xl overflow-hidden z-50">
          <div className="p-3 border-b border-border bg-muted/30 flex items-center justify-between">
            <p className="text-sm font-semibold flex items-center gap-2">
              {count > 0 ? <BellRing className="w-4 h-4 text-destructive" /> : <Bell className="w-4 h-4 text-muted-foreground" />}
              {t("الإشعارات", "Notifications")}
              {count > 0 && (
                <span className="text-[10px] bg-destructive/10 text-destructive px-1.5 py-0.5 rounded-full font-medium">{count}</span>
              )}
            </p>
            <div className="flex items-center gap-1">
              {count > 0 && (
                <button onClick={markAllRead} className="text-[10px] text-muted-foreground hover:text-foreground p-1 rounded hover:bg-muted/50" title={t("تحديد الكل مقروء", "Mark all read")}>
                  <CheckCheck className="w-3.5 h-3.5" />
                </button>
              )}
              <button onClick={clearAll} className="text-[10px] text-muted-foreground hover:text-foreground p-1 rounded hover:bg-muted/50" title={t("مسح الكل", "Clear all")}>
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <div className="max-h-72 sm:max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground text-xs">
                {t("لا توجد إشعارات", "No notifications")}
              </div>
            ) : (
              notifications.slice(0, 50).map(n => {
                const style = typeStyles[n.type];
                return (
                  <div
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className={`flex items-start gap-2.5 p-3 border-b border-border/50 hover:bg-muted/20 transition-colors cursor-pointer ${!n.read ? "bg-muted/10" : ""}`}
                  >
                    <span className="mt-0.5 text-sm shrink-0">{style.icon}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${style.bg} ${style.border.replace("border-", "border ")}`}>
                          {n.module}
                        </span>
                        {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
                      </div>
                      <p className="text-xs font-medium mt-0.5 leading-snug">{n.title}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{n.description}</p>
                      <p className="text-[9px] text-muted-foreground/50 mt-0.5 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {new Date(n.timestamp).toLocaleDateString("ar-EG", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
