import React from "react";

interface Props {
  keys: string[];
  className?: string;
}

export default function ShortcutHint({ keys, className = "" }: Props) {
  return (
    <kbd className={`pointer-events-none inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-mono font-medium text-muted-foreground/60 bg-muted/60 border border-border/40 rounded ${className}`}>
      {keys.map((k, i) => (
        <span key={i}>
          {i > 0 && <span className="mx-0.5 opacity-40">+</span>}
          <span>{k}</span>
        </span>
      ))}
    </kbd>
  );
}
