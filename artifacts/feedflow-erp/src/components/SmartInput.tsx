import React, { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { autoCorrect, getCompletions, getBetterName } from "@/lib/spellcheck";

interface SmartInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "onBlur" | "onKeyDown"> {
  value: string;
  onChange: (value: string) => void;
  onAutoCorrect?: (value: string) => void;
  extraSuggestions?: string[];
  showSuggestion?: boolean;
}

export default function SmartInput({ value, onChange, onAutoCorrect, extraSuggestions = [], placeholder, className, showSuggestion = true, ...rest }: SmartInputProps) {
  const [options, setOptions] = useState<string[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(-1);
  const [betterSuggestion, setBetterSuggestion] = useState<string | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value.trim()) {
      setOptions(getCompletions(value, extraSuggestions));
      if (showSuggestion) {
        setBetterSuggestion(getBetterName(value));
      }
    } else {
      setOptions([]);
      setBetterSuggestion(null);
    }
    setSelectedIdx(-1);
  }, [value, extraSuggestions, showSuggestion]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOptions([]);
        setBetterSuggestion(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (options.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIdx(i => Math.min(i + 1, options.length - 1));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIdx(i => Math.max(i - 1, 0));
        return;
      }
      if (e.key === "Enter" && selectedIdx >= 0) {
        e.preventDefault();
        onChange(options[selectedIdx]);
        setOptions([]);
        setBetterSuggestion(null);
        return;
      }
    }
    if (e.key === "Tab" && betterSuggestion) {
      e.preventDefault();
      onChange(betterSuggestion);
      setBetterSuggestion(null);
      setOptions([]);
      onAutoCorrect?.(betterSuggestion);
    }
  };

  const handleBlur = () => {
    if (value.trim()) {
      const corrected = autoCorrect(value);
      if (corrected !== value) {
        onChange(corrected);
        onAutoCorrect?.(corrected);
      }
    }
    setTimeout(() => { setOptions([]); setBetterSuggestion(null); }, 200);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <Input
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={className}
          {...rest}
        />
        {betterSuggestion && showSuggestion && betterSuggestion !== value && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="absolute left-1 top-1/2 -translate-y-1/2 h-6 px-1.5 text-[10px] gap-0.5 text-primary hover:text-primary"
            onMouseDown={e => { e.preventDefault(); onChange(betterSuggestion); setBetterSuggestion(null); setOptions([]); onAutoCorrect?.(betterSuggestion); }}
            title="اقتراح اسم أفضل"
          >
            <Sparkles className="w-3 h-3" />
          </Button>
        )}
      </div>
      {options.length > 0 && (
        <div className="absolute z-50 w-full mt-1 rounded-lg border border-border bg-popover shadow-lg max-h-48 overflow-y-auto custom-scrollbar">
          {options.map((opt, i) => (
            <button
              key={opt}
              type="button"
              className={`w-full text-right px-3 py-1.5 text-xs transition-colors hover:bg-muted ${
                i === selectedIdx ? "bg-muted font-medium" : ""
              }`}
              onMouseDown={e => { e.preventDefault(); onChange(opt); setOptions([]); setBetterSuggestion(null); }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
