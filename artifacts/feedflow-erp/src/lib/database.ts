import { db as dexieDb } from "@/lib/dexie-storage";

const DB_NAME = "FeedFlowERP";
const DB_VERSION = 2;
const STORE_NAME = "backup";
const AUTO_BACKUP_KEY = "feedflow-auto-backup";
const LAST_BACKUP_KEY = "feedflow-last-backup";

export interface BackupInfo {
  id: string;
  timestamp: string;
  keyCount: number;
  sizeBytes: number;
  autoBackup?: boolean;
}

interface BackupRecord extends BackupInfo {
  data: Record<string, any>;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE_NAME)) {
        req.result.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function getAllStorageKeys(): string[] {
  return Object.keys(localStorage).filter(k => k.startsWith("ff-") || k.startsWith("feedflow-"));
}

function snapshotStorage(): Record<string, any> {
  const keys = getAllStorageKeys();
  const data: Record<string, any> = {};
  keys.forEach(k => {
    try { data[k] = JSON.parse(localStorage.getItem(k) || ""); }
    catch { data[k] = localStorage.getItem(k); }
  });
  return data;
}

function estimateSize(obj: Record<string, any>): number {
  try { return new Blob([JSON.stringify(obj)]).size; }
  catch { return 0; }
}

export async function createBackup(autoBackup = false): Promise<BackupInfo> {
  const data = snapshotStorage();
  const keyCount = Object.keys(data).length;
  const sizeBytes = estimateSize(data);
  const id = `bak-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const backup: BackupRecord = {
    id, keyCount, sizeBytes, autoBackup,
    timestamp: new Date().toISOString(),
    data,
  };
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(backup);
    tx.oncomplete = () => {
      db.close();
      localStorage.setItem(LAST_BACKUP_KEY, id);
      resolve({ id, timestamp: backup.timestamp, keyCount, sizeBytes, autoBackup });
    };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}

export async function listBackups(): Promise<BackupInfo[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).getAll();
    req.onsuccess = () => {
      db.close();
      resolve(req.result
        .map((r: BackupRecord) => ({ id: r.id, timestamp: r.timestamp, keyCount: r.keyCount, sizeBytes: r.sizeBytes, autoBackup: r.autoBackup }))
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    };
    req.onerror = () => { db.close(); reject(req.error); };
  });
}

export async function restoreBackup(id: string): Promise<void> {
  const db = await openDB();
  const backup: BackupRecord | undefined = await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).get(id);
    req.onsuccess = () => { db.close(); resolve(req.result); };
    req.onerror = () => { db.close(); reject(req.error); };
  });
  if (!backup) throw new Error("النسخة الاحتياطية غير موجودة");
  Object.entries(backup.data).forEach(([key, val]) => {
    localStorage.setItem(key, typeof val === "string" ? val : JSON.stringify(val));
  });
  window.location.reload();
}

export async function deleteBackup(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}

export async function resetAllData(preserveBackups = true): Promise<void> {
  const keys = getAllStorageKeys();
  keys.forEach(k => localStorage.removeItem(k));
  // Clear IndexedDB (dexie) data used by zustand persist middleware
  try {
    await dexieDb.kv.clear();
  } catch {}
  if (!preserveBackups) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).clear();
      tx.oncomplete = () => { db.close(); resolve(); };
      tx.onerror = () => { db.close(); reject(tx.error); };
    });
  }
}

export async function exportAsJSON(): Promise<Blob> {
  const data = snapshotStorage();
  const backup = {
    app: "FeedFlow ERP",
    version: 1,
    exportedAt: new Date().toISOString(),
    keyCount: Object.keys(data).length,
    data,
  };
  return new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
}

export async function importFromJSON(file: File): Promise<{ keysRestored: number }> {
  const text = await file.text();
  const parsed = JSON.parse(text);
  if (parsed.app !== "FeedFlow ERP") throw new Error("ملف غير صالح");
  if (!parsed.data || typeof parsed.data !== "object") throw new Error("لا توجد بيانات في الملف");
  const entries = Object.entries(parsed.data) as [string, any][];
  entries.forEach(([key, val]) => {
    localStorage.setItem(key, typeof val === "string" ? val : JSON.stringify(val));
  });
  return { keysRestored: entries.length };
}

export function isAutoBackupEnabled(): boolean {
  return localStorage.getItem(AUTO_BACKUP_KEY) === "true";
}

export function setAutoBackupEnabled(enabled: boolean): void {
  localStorage.setItem(AUTO_BACKUP_KEY, enabled ? "true" : "false");
}

export function getLastBackupId(): string | null {
  return localStorage.getItem(LAST_BACKUP_KEY);
}

export async function runAutoBackupIfNeeded(): Promise<void> {
  if (!isAutoBackupEnabled()) return;
  const lastId = getLastBackupId();
  if (lastId) {
    const backups = await listBackups();
    const last = backups.find(b => b.id === lastId);
    if (last) {
      const hoursSinceLast = (Date.now() - new Date(last.timestamp).getTime()) / 3600000;
      if (hoursSinceLast < 6) return;
    }
  }
  await createBackup(true);
}
