import { useAppStore } from "@/hooks/use-app-store";

export function usePermission() {
  const hasFeaturePermission = useAppStore(s => s.hasFeaturePermission);
  const loggedInSubAccountId = useAppStore(s => s.loggedInSubAccountId);
  const subAccounts = useAppStore(s => s.subAccounts);

  const currentAccount = loggedInSubAccountId
    ? subAccounts.find(a => a.id === loggedInSubAccountId)
    : null;

  const can = (featureId: string): boolean => {
    if (!loggedInSubAccountId) return true;
    return hasFeaturePermission(featureId);
  };

  const modulePermission = (path: string): "none" | "view" | "full" => {
    if (!currentAccount) return "full";
    return currentAccount.permissions[path] || "none";
  };

  const canView = (path: string): boolean => modulePermission(path) !== "none";
  const canFull = (path: string): boolean => modulePermission(path) === "full";

  return { can, canView, canFull, modulePermission, currentAccount, isLoggedIn: !!loggedInSubAccountId };
}
