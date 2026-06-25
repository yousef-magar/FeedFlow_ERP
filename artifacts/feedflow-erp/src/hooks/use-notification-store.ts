import { create } from "zustand";
import { persist } from "zustand/middleware";
import { dexieStorage } from "@/lib/dexie-storage";

export type NotificationType = "critical" | "warning" | "info" | "success";

export interface AppNotification {
  id: string;
  type: NotificationType;
  module: string;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  link?: string;
}

interface NotificationState {
  notifications: AppNotification[];
  addNotification: (n: Omit<AppNotification, "id" | "timestamp" | "read">) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clearAll: () => void;
  unreadCount: () => number;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      addNotification: (n) => set(s => ({
        notifications: [{ id: crypto.randomUUID(), timestamp: new Date().toISOString(), read: false, ...n }, ...s.notifications].slice(0, 200),
      })),
      markRead: (id) => set(s => ({
        notifications: s.notifications.map(n => n.id === id ? { ...n, read: true } : n),
      })),
      markAllRead: () => set(s => ({
        notifications: s.notifications.map(n => ({ ...n, read: true })),
      })),
      clearAll: () => set({ notifications: [] }),
      unreadCount: () => get().notifications.filter(n => !n.read).length,
    }),
    { name: "ff-notifications", storage: dexieStorage },
  ),
);
