import { toast } from "@/hooks/use-toast";

export async function withSync<T>(
  apiCall: () => Promise<T>,
  label: string,
): Promise<T | null> {
  try {
    return await apiCall();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    toast({
      title: `خطأ في ${label}`,
      description: msg,
      variant: "destructive",
    });
    return null;
  }
}
