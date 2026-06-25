import React from "react";
import { useAppStore } from "@/hooks/use-app-store";
import { type ShortcutDef } from "@/hooks/use-keyboard-shortcuts";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Keyboard } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  shortcuts: ShortcutDef[];
}

export default function ShortcutsHelpDialog({ open, onClose, shortcuts }: Props) {
  const { t, language } = useAppStore();
  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="w-[calc(100vw-32px)] sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Keyboard className="w-5 h-5" />{t("اختصارات لوحة المفاتيح", "Keyboard Shortcuts")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          {shortcuts.map((s, i) => {
            const keys = [
              s.ctrl && "Ctrl", s.alt && "Alt", s.shift && "Shift", s.key && (s.key === "Escape" ? "Esc" : s.key === "/" ? "/" : s.key.toUpperCase()),
            ].filter(Boolean).join(" + ");
            return (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                <span className="text-sm">{language === "ar" ? s.descriptionAr : s.descriptionEn}</span>
                <kbd className="px-2 py-0.5 text-xs font-mono bg-muted border border-border rounded">{keys}</kbd>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
