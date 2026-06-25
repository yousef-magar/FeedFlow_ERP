import React, { useState } from "react";
import { useAppStore, SubAccount, Permission, ALL_MODULE_PATHS, SUB_ACCOUNT_FEATURES } from "@/hooks/use-app-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Users,
  UserPlus,
  Shield,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  KeyRound,
  Copy,
  Check,
  ChevronDown,
  ShieldQuestion,
} from "lucide-react";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";

const MODULE_LABELS: Record<string, { ar: string; en: string }> = {
  "/": { ar: "الرئيسية", en: "Dashboard" },
  "/production": { ar: "الإنتاج", en: "Production" },
  "/inventory": { ar: "المخزون", en: "Inventory" },
  "/sales": { ar: "المبيعات", en: "Sales" },
  "/customers": { ar: "العملاء", en: "Customers" },
  "/fleet": { ar: "الأسطول", en: "Fleet & Delivery" },
  "/hr": { ar: "الموارد البشرية", en: "HR" },
  "/attendance": { ar: "الحضور والانصراف", en: "Attendance" },
  "/payroll": { ar: "الرواتب", en: "Payroll" },
  "/marketing": { ar: "التسويق", en: "Marketing" },
  "/accounting": { ar: "الحسابات", en: "Accounting" },
  "/procurement": { ar: "المشتريات", en: "Procurement" },
  "/pricing": { ar: "التسعير", en: "Pricing" },
  "/profit": { ar: "الأرباح", en: "Profit" },
  "/reports": { ar: "التقارير", en: "Reports" },
  "/ai-assistant": { ar: "المساعد الذكي", en: "AI Assistant" },
  "/settings": { ar: "الإعدادات", en: "Settings" },
  "/sub-accounts": { ar: "الحسابات الفرعية", en: "Sub Accounts" },
  "/activity-log": { ar: "سجل النشاط", en: "Activity Log" },
};

const PERMISSION_OPTIONS: { value: Permission; ar: string; en: string; color: string }[] = [
  { value: "none", ar: "لا يوجد وصول", en: "No Access", color: "text-destructive" },
  { value: "view", ar: "عرض فقط", en: "View Only", color: "text-yellow-500" },
  { value: "full", ar: "وصول كامل", en: "Full Access", color: "text-green-500" },
];

const DEFAULT_PERMISSIONS: Record<string, Permission> = Object.fromEntries(
  ALL_MODULE_PATHS.map(p => [p, "view"])
);

function generatePassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#$!";
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function PermissionBadge({ permission, t }: { permission: Permission; t: (ar: string, en: string) => string }) {
  if (permission === "none") return <Badge variant="destructive" className="text-xs">{t("لا وصول", "No Access")}</Badge>;
  if (permission === "view") return <Badge variant="outline" className="text-xs text-yellow-600 border-yellow-500">{t("عرض", "View")}</Badge>;
  return <Badge className="text-xs bg-green-600 text-white">{t("كامل", "Full")}</Badge>;
}

function CopyButton({ text, t }: { text: string; t: (ar: string, en: string) => string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
      title={t("نسخ", "Copy")}
    >
      {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

interface AccountFormProps {
  initial?: Partial<SubAccount>;
  onSave: (data: Omit<SubAccount, "id" | "createdAt">) => void;
  onClose: () => void;
  t: (ar: string, en: string) => string;
  isEdit?: boolean;
}

function AccountForm({ initial, onSave, onClose, t, isEdit }: AccountFormProps) {
  const [name, setName] = useState(initial?.name || "");
  const [email, setEmail] = useState(initial?.email || "");
  const [password, setPassword] = useState(initial?.password || "");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState(initial?.role || "");
  const [active, setActive] = useState(initial?.active ?? true);
  const [permissions, setPermissions] = useState<Record<string, Permission>>(
    initial?.permissions || { ...DEFAULT_PERMISSIONS }
  );
  const [canExceedDiscountLimit, setCanExceedDiscountLimit] = useState(initial?.canExceedDiscountLimit ?? false);
  const [canAccessPricing, setCanAccessPricing] = useState(initial?.canAccessPricing ?? false);
  const [canAccessHR, setCanAccessHR] = useState(initial?.canAccessHR ?? false);
  const [canAccessPayroll, setCanAccessPayroll] = useState(initial?.canAccessPayroll ?? false);

  const getDefaultFeatures = () => {
    const result: Record<string, boolean> = {};
    for (const features of Object.values(SUB_ACCOUNT_FEATURES)) {
      for (const f of features) result[f.id] = true;
    }
    return result;
  };

  const [q1, setQ1] = useState(initial?.securityQuestions?.q1 || "");
  const [a1, setA1] = useState(initial?.securityQuestions?.a1 || "");
  const [q2, setQ2] = useState(initial?.securityQuestions?.q2 || "");
  const [a2, setA2] = useState(initial?.securityQuestions?.a2 || "");
  const [q3, setQ3] = useState(initial?.securityQuestions?.q3 || "");
  const [a3, setA3] = useState(initial?.securityQuestions?.a3 || "");

  const [featurePermissions, setFeaturePermissions] = useState<Record<string, boolean>>(
    initial?.featurePermissions && Object.keys(initial.featurePermissions).length > 0
      ? initial.featurePermissions
      : getDefaultFeatures()
  );
  const [featureOpen, setFeatureOpen] = useState<Record<string, boolean>>({});

  const toggleFeature = (id: string) => {
    setFeaturePermissions(p => ({ ...p, [id]: !p[id] }));
  };

  const setAll = (perm: Permission) => {
    setPermissions(Object.fromEntries(ALL_MODULE_PATHS.map(p => [p, perm])));
  };

  const handleSave = () => {
    if (!name.trim() || !email.trim() || !password.trim()) return;
    const sq = q1 || a1 || q2 || a2 || q3 || a3 ? { q1, a1, q2, a2, q3, a3 } : undefined;
    onSave({ name, email, password, role, active, permissions, canExceedDiscountLimit, canAccessPricing, canAccessHR, canAccessPayroll, featurePermissions, securityQuestions: sq });
  };

  return (
    <div className="flex flex-col gap-3 min-h-0">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>{t("الاسم الكامل", "Full Name")} *</Label>
          <Input value={name} onChange={e => setName(e.target.value)} placeholder={t("أدخل الاسم", "Enter name")} />
        </div>
        <div className="space-y-1.5">
          <Label>{t("البريد الإلكتروني", "Email")} *</Label>
          <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="user@example.com" />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label>{t("كلمة السر", "Password")} *</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={isEdit ? t("اتركها فارغة للإبقاء على الحالية", "Leave blank to keep current") : t("أدخل كلمة السر", "Enter password")}
                className="pe-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 end-0 flex items-center px-3 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <Button
              type="button"
              variant="outline"
              className="shrink-0 gap-1.5 text-xs"
              onClick={() => { setPassword(generatePassword()); setShowPassword(true); }}
            >
              <KeyRound className="w-3.5 h-3.5" />
              {t("توليد تلقائي", "Generate")}
            </Button>
          </div>
          {password && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="flex gap-1">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 w-6 rounded-full transition-colors ${
                      password.length < 6
                        ? i === 0 ? "bg-destructive" : "bg-muted"
                        : password.length < 10
                        ? i < 2 ? "bg-yellow-500" : "bg-muted"
                        : password.length < 12
                        ? i < 3 ? "bg-blue-500" : "bg-muted"
                        : "bg-green-500"
                    }`}
                  />
                ))}
              </div>
              <span>
                {password.length < 6
                  ? t("ضعيفة", "Weak")
                  : password.length < 10
                  ? t("مقبولة", "Fair")
                  : password.length < 12
                  ? t("جيدة", "Good")
                  : t("قوية", "Strong")}
              </span>
            </div>
          )}
        </div>

        <div className="border border-border rounded-lg overflow-hidden sm:col-span-2">
          <div className="flex items-center gap-2 p-3 bg-muted/40 border-b border-border">
            <ShieldQuestion className="w-4 h-4 text-primary" />
            <span className="font-semibold text-sm">{t("أسئلة الأمان", "Security Questions")}</span>
          </div>
          <div className="p-3 space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground">{t("السؤال الأول", "Question 1")}</Label>
              <Input value={q1} onChange={e => setQ1(e.target.value)} className="h-9 text-xs mt-1 mb-1" />
              <Input value={a1} onChange={e => setA1(e.target.value)} placeholder={t("الإجابة", "Answer")} className="h-9 text-xs" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">{t("السؤال الثاني", "Question 2")}</Label>
              <Input value={q2} onChange={e => setQ2(e.target.value)} className="h-9 text-xs mt-1 mb-1" />
              <Input value={a2} onChange={e => setA2(e.target.value)} placeholder={t("الإجابة", "Answer")} className="h-9 text-xs" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">{t("السؤال الثالث", "Question 3")}</Label>
              <Input value={q3} onChange={e => setQ3(e.target.value)} className="h-9 text-xs mt-1 mb-1" />
              <Input value={a3} onChange={e => setA3(e.target.value)} placeholder={t("الإجابة", "Answer")} className="h-9 text-xs" />
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>{t("الدور الوظيفي", "Job Role")}</Label>
          <Input value={role} onChange={e => setRole(e.target.value)} placeholder={t("مثال: مدير مبيعات", "e.g. Sales Manager")} />
        </div>
        <div className="flex items-center justify-between p-3 border border-border rounded-lg">
          <Label>{t("الحساب مفعّل", "Account Active")}</Label>
          <Switch checked={active} onCheckedChange={setActive} />
        </div>
        <div className="flex items-center justify-between p-3 border border-border rounded-lg">
          <div>
            <Label className="cursor-pointer">{t("تجاوز حد الخصم الأقصى", "Exceed Max Discount")}</Label>
            <p className="text-[10px] text-muted-foreground mt-0.5">{t("السماح بتجاوز حد الخصم المسموح به في الإعدادات", "Allow exceeding the max discount set in Settings")}</p>
          </div>
          <Switch checked={canExceedDiscountLimit} onCheckedChange={setCanExceedDiscountLimit} />
        </div>
        <div className="flex items-center justify-between p-3 border border-border rounded-lg">
          <div>
            <Label className="cursor-pointer">{t("صلاحية التسعير والتكلفة", "Pricing & Cost Access")}</Label>
            <p className="text-[10px] text-muted-foreground mt-0.5">{t("السماح برؤية التكلفة وتسعير المنتجات وإغلاق الفواتير", "Allow viewing costs, setting prices, and closing invoices")}</p>
          </div>
          <Switch checked={canAccessPricing} onCheckedChange={setCanAccessPricing} />
        </div>
        <div className="flex items-center justify-between p-3 border border-border rounded-lg">
          <div>
            <Label className="cursor-pointer">{t("صلاحية الموارد البشرية", "HR Access")}</Label>
            <p className="text-[10px] text-muted-foreground mt-0.5">{t("السماح بالوصول إلى بيانات الموظفين الحساسة", "Allow access to sensitive employee data")}</p>
          </div>
          <Switch checked={canAccessHR} onCheckedChange={setCanAccessHR} />
        </div>
        <div className="flex items-center justify-between p-3 border border-border rounded-lg">
          <div>
            <Label className="cursor-pointer">{t("صلاحية الرواتب", "Payroll Access")}</Label>
            <p className="text-[10px] text-muted-foreground mt-0.5">{t("السماح بالوصول إلى بيانات الرواتب والمعلومات المالية", "Allow access to payroll and financial data")}</p>
          </div>
          <Switch checked={canAccessPayroll} onCheckedChange={setCanAccessPayroll} />
        </div>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <div className="flex items-center justify-between p-3 bg-muted/40 border-b border-border">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            <span className="font-semibold text-sm">{t("الصلاحيات", "Permissions")}</span>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setAll("full")}>{t("كل الصلاحيات", "Grant All")}</Button>
            <Button size="sm" variant="outline" className="h-7 text-xs text-destructive border-destructive/30" onClick={() => setAll("none")}>{t("إلغاء الكل", "Revoke All")}</Button>
          </div>
        </div>
        <div className="divide-y divide-border max-h-44 overflow-y-auto custom-scrollbar">
          {ALL_MODULE_PATHS.map(path => {
            const label = MODULE_LABELS[path];
            const current = permissions[path] || "none";
            return (
              <div key={path} className="flex items-center justify-between px-3 py-1.5 gap-2">
                <span className="text-xs flex-1 min-w-0 truncate">{t(label.ar, label.en)}</span>
                <div className="flex rounded border border-border overflow-hidden flex-shrink-0">
                  {(["none", "view", "full"] as Permission[]).map((perm) => {
                    const isActive = current === perm;
                    const styles =
                      perm === "none"
                        ? isActive ? "bg-destructive text-white" : "hover:bg-destructive/10 text-muted-foreground"
                        : perm === "view"
                        ? isActive ? "bg-yellow-500 text-white" : "hover:bg-yellow-500/10 text-muted-foreground"
                        : isActive ? "bg-green-600 text-white" : "hover:bg-green-600/10 text-muted-foreground";
                    const label2 =
                      perm === "none" ? t("لا", "No")
                      : perm === "view" ? t("عرض", "View")
                      : t("كامل", "Full");
                    return (
                      <button
                        key={perm}
                        onClick={() => setPermissions(p => ({ ...p, [path]: perm }))}
                        className={`px-2 py-0.5 text-xs font-medium transition-colors border-s border-border first:border-s-0 ${styles}`}
                      >
                        {label2}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <div className="flex items-center justify-between p-3 bg-muted/40 border-b border-border">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            <span className="font-semibold text-sm">{t("صلاحيات الميزات", "Feature Permissions")}</span>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => {
              const all: Record<string, boolean> = {};
              for (const features of Object.values(SUB_ACCOUNT_FEATURES)) {
                for (const f of features) all[f.id] = true;
              }
              setFeaturePermissions(all);
            }}>{t("تفعيل الكل", "Grant All")}</Button>
            <Button size="sm" variant="outline" className="h-7 text-xs text-destructive border-destructive/30" onClick={() => {
              const none: Record<string, boolean> = {};
              for (const features of Object.values(SUB_ACCOUNT_FEATURES)) {
                for (const f of features) none[f.id] = false;
              }
              setFeaturePermissions(none);
            }}>{t("إلغاء الكل", "Revoke All")}</Button>
          </div>
        </div>
        <div className="divide-y divide-border max-h-60 overflow-y-auto custom-scrollbar">
          {ALL_MODULE_PATHS.map(path => {
            const features = SUB_ACCOUNT_FEATURES[path];
            if (!features || features.length === 0) return null;
            const label = MODULE_LABELS[path];
            const allGranted = features.every(f => featurePermissions[f.id]);
            const someGranted = features.some(f => featurePermissions[f.id]);
            const isOpen = featureOpen[path] || false;
            return (
              <Collapsible key={path} open={isOpen} onOpenChange={open => setFeatureOpen(o => ({ ...o, [path]: open }))}>
                <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 text-xs font-medium hover:bg-muted/20 transition-colors cursor-pointer">
                  <div className="flex items-center gap-2">
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? "rotate-0" : "-rotate-90"}`} />
                    <span>{t(label?.ar || path, label?.en || path)}</span>
                  </div>
                  <span className={`text-[10px] ${allGranted ? "text-green-500" : someGranted ? "text-yellow-500" : "text-destructive"}`}>
                    {allGranted ? t("كل الصلاحيات", "All Granted") : someGranted ? t("بعض الصلاحيات", "Partial") : t("بدون صلاحيات", "None")}
                  </span>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-3 pb-2 space-y-1">
                    {features.map(f => (
                      <div key={f.id} className="flex items-center justify-between py-1">
                        <span className="text-xs">{t(f.labelAr, f.labelEn)}</span>
                        <Switch
                          checked={featurePermissions[f.id] ?? true}
                          onCheckedChange={() => toggleFeature(f.id)}
                          className="scale-75"
                        />
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>
      </div>

      <DialogFooter className="pt-2">
        <Button variant="outline" onClick={onClose}>{t("إلغاء", "Cancel")}</Button>
        <Button onClick={handleSave} disabled={!name.trim() || !email.trim() || (!isEdit && !password.trim())}>
          {t("حفظ", "Save")}
        </Button>
      </DialogFooter>
    </div>
  );
}

function PasswordDisplay({ password, t }: { password: string; t: (ar: string, en: string) => string }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-sm font-mono tracking-wider">
        {visible ? password : "••••••••••••"}
      </span>
      <button
        onClick={() => setVisible(!visible)}
        className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
        title={t(visible ? "إخفاء" : "إظهار", visible ? "Hide" : "Show")}
      >
        {visible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
      </button>
      {visible && <CopyButton text={password} t={t} />}
    </div>
  );
}

export default function SubAccounts() {
  const { t, subAccounts, addSubAccount, updateSubAccount, deleteSubAccount } = useAppStore();
  const [addOpen, setAddOpen] = useState(false);
  const [editAccount, setEditAccount] = useState<SubAccount | null>(null);
  const [permAccount, setPermAccount] = useState<SubAccount | null>(null);
  const [permEdit, setPermEdit] = useState<Record<string, Permission>>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openPermDialog = (account: SubAccount) => {
    setPermAccount(account);
    setPermEdit({ ...account.permissions });
  };

  const savePermissions = () => {
    if (!permAccount) return;
    updateSubAccount(permAccount.id, { permissions: permEdit });
    setPermAccount(null);
  };

  return (
    <div className="space-y-3 sm:space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("الحسابات الفرعية", "Sub Accounts")}</h1>
          <p className="text-muted-foreground mt-1">
            {t("إدارة المستخدمين وصلاحياتهم", "Manage users and their permissions")}
          </p>
        </div>
        <Button className="gap-2" onClick={() => setAddOpen(true)}>
          <UserPlus className="w-4 h-4" />
          {t("إضافة حساب فرعي", "Add Sub Account")}
        </Button>
      </div>

      {subAccounts.length === 0 ? (
        <Card className="p-6 sm:p-12 flex flex-col items-center justify-center text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <Users className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <p className="font-semibold text-lg">{t("لا توجد حسابات فرعية", "No Sub Accounts Yet")}</p>
            <p className="text-muted-foreground text-sm mt-1">
              {t("أضف حسابات فرعية لمنح الوصول لأعضاء الفريق", "Add sub accounts to grant team members access")}
            </p>
          </div>
          <Button className="gap-2" onClick={() => setAddOpen(true)}>
            <UserPlus className="w-4 h-4" />
            {t("إضافة أول حساب", "Add First Account")}
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {subAccounts.map(account => {
            const fullCount = Object.values(account.permissions).filter(p => p === "full").length;
            const viewCount = Object.values(account.permissions).filter(p => p === "view").length;
            return (
              <Card key={account.id} className="p-3 sm:p-5 flex flex-col gap-3 sm:gap-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                      {account.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold">{account.name}</p>
                      <p className="text-xs text-muted-foreground">{account.email}</p>
                      {account.role && <p className="text-xs text-muted-foreground">{account.role}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {account.active
                      ? <Badge className="bg-green-600/20 text-green-600 border-green-600/30 text-xs gap-1"><CheckCircle2 className="w-3 h-3" />{t("مفعّل", "Active")}</Badge>
                      : <Badge variant="outline" className="text-muted-foreground text-xs gap-1"><XCircle className="w-3 h-3" />{t("موقوف", "Inactive")}</Badge>
                    }
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-muted/30 rounded-md px-3 py-2">
                  <KeyRound className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                  <span className="text-xs text-muted-foreground me-1">{t("كلمة السر:", "Password:")}</span>
                  <PasswordDisplay password={account.password} t={t} />
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 rounded-md px-3 py-2 flex-wrap">
                  <Shield className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>{t(`وصول كامل: ${fullCount}`, `Full Access: ${fullCount}`)}</span>
                  <span>·</span>
                  <span>{t(`عرض فقط: ${viewCount}`, `View Only: ${viewCount}`)}</span>
                  <span>·</span>
                  <span>{t(`ميزات: ${Object.values(account.featurePermissions || {}).filter(Boolean).length}/${Object.values(SUB_ACCOUNT_FEATURES).flat().length}`, `Features: ${Object.values(account.featurePermissions || {}).filter(Boolean).length}/${Object.values(SUB_ACCOUNT_FEATURES).flat().length}`)}</span>
                  {account.canExceedDiscountLimit && (
                    <><span>·</span><Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-[10px]">{t("خصم مفتوح", "Unlimited Disc.")}</Badge></>
                  )}
                  {account.canAccessPricing && (
                    <><span>·</span><Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px]">{t("تسعير", "Pricing")}</Badge></>
                  )}
                  {account.canAccessHR && (
                    <><span>·</span><Badge className="bg-blue-500/10 text-blue-600 border-blue-500/30 text-[10px]">{t("موارد بشرية", "HR")}</Badge></>
                  )}
                  {account.canAccessPayroll && (
                    <><span>·</span><Badge className="bg-purple-500/10 text-purple-600 border-purple-500/30 text-[10px]">{t("رواتب", "Payroll")}</Badge></>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 border-t border-border pt-3">
                  <Button size="sm" variant="outline" className="flex-1 gap-1.5 text-xs h-8" onClick={() => openPermDialog(account)}>
                    <Shield className="w-3.5 h-3.5" /> {t("الصلاحيات", "Permissions")}
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1.5 text-xs h-8 w-full sm:w-auto" onClick={() => setEditAccount(account)}>
                    <Pencil className="w-3.5 h-3.5" /> {t("تعديل", "Edit")}
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1.5 text-xs h-8 w-full sm:w-auto text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => setDeleteId(account.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-2xl w-[calc(100vw-32px)]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-primary" />
              {t("إضافة حساب فرعي", "Add Sub Account")}
            </DialogTitle>
          </DialogHeader>
          <AccountForm
            t={t}
            onSave={(data) => { addSubAccount(data); setAddOpen(false); }}
            onClose={() => setAddOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editAccount} onOpenChange={open => !open && setEditAccount(null)}>
        <DialogContent className="max-w-2xl w-[calc(100vw-32px)]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="w-5 h-5 text-primary" />
              {t("تعديل الحساب", "Edit Account")}
            </DialogTitle>
          </DialogHeader>
          {editAccount && (
            <AccountForm
              t={t}
              initial={editAccount}
              isEdit
              onSave={(data) => {
                const finalData = data.password ? data : { ...data, password: editAccount.password };
                updateSubAccount(editAccount.id, finalData);
                setEditAccount(null);
              }}
              onClose={() => setEditAccount(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!permAccount} onOpenChange={open => !open && setPermAccount(null)}>
        <DialogContent className="max-w-lg w-[calc(100vw-32px)]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              {t("تعديل الصلاحيات", "Edit Permissions")} — {permAccount?.name}
            </DialogTitle>
          </DialogHeader>
          {permAccount && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{t("اضغط على الزرار لتغيير الصلاحية", "Click a button to change permission")}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPermEdit(Object.fromEntries(ALL_MODULE_PATHS.map(p => [p, "full"])))}
                    className="px-2.5 py-1 text-xs rounded border border-green-600/40 text-green-600 hover:bg-green-600/10 transition-colors"
                  >
                    {t("كل الصلاحيات", "Grant All")}
                  </button>
                  <button
                    onClick={() => setPermEdit(Object.fromEntries(ALL_MODULE_PATHS.map(p => [p, "none"])))}
                    className="px-2.5 py-1 text-xs rounded border border-destructive/40 text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    {t("إلغاء الكل", "Revoke All")}
                  </button>
                </div>
              </div>

              <div className="max-h-[55vh] overflow-y-auto custom-scrollbar border border-border rounded-lg overflow-hidden">
                <div className="divide-y divide-border">
                  {ALL_MODULE_PATHS.map(path => {
                    const label = MODULE_LABELS[path];
                    const current = permEdit[path] || "none";
                    return (
                      <div key={path} className="flex items-center justify-between px-4 py-2.5 gap-3 hover:bg-muted/20">
                        <span className="text-sm flex-1 min-w-0 truncate">{t(label.ar, label.en)}</span>
                        <div className="flex rounded-md border border-border overflow-hidden flex-shrink-0">
                          {(["none", "view", "full"] as Permission[]).map((perm) => {
                            const isActive = current === perm;
                            const styles =
                              perm === "none"
                                ? isActive ? "bg-destructive text-white" : "hover:bg-destructive/10 text-muted-foreground"
                                : perm === "view"
                                ? isActive ? "bg-yellow-500 text-white" : "hover:bg-yellow-500/10 text-muted-foreground"
                                : isActive ? "bg-green-600 text-white" : "hover:bg-green-600/10 text-muted-foreground";
                            const btnLabel =
                              perm === "none" ? t("لا", "No")
                              : perm === "view" ? t("عرض", "View")
                              : t("كامل", "Full");
                            return (
                              <button
                                key={perm}
                                onClick={() => setPermEdit(p => ({ ...p, [path]: perm }))}
                                className={`px-3 py-1 text-xs font-medium transition-colors border-s border-border first:border-s-0 ${styles}`}
                              >
                                {btnLabel}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-1">
                <Button variant="outline" onClick={() => setPermAccount(null)}>{t("إلغاء", "Cancel")}</Button>
                <Button onClick={savePermissions} className="gap-2">
                  <Shield className="w-4 h-4" />
                  {t("حفظ الصلاحيات", "Save Permissions")}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={open => !open && setDeleteId(null)}>
        <AlertDialogContent className="w-[calc(100vw-32px)]">
          <AlertDialogHeader>
            <AlertDialogTitle>{t("حذف الحساب", "Delete Account")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("هل أنت متأكد من حذف هذا الحساب؟ لا يمكن التراجع عن هذا الإجراء.", "Are you sure you want to delete this account? This action cannot be undone.")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("إلغاء", "Cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => { if (deleteId) { deleteSubAccount(deleteId); setDeleteId(null); } }}
            >
              {t("حذف", "Delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
