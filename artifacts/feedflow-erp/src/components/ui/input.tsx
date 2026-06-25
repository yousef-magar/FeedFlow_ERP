import * as React from "react"
import { cn } from "@/lib/utils"
import { autoCorrect } from "@/lib/spellcheck"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        onBlur={(e) => {
          props.onBlur?.(e);
          if (type === "text" || !type) {
            const corrected = autoCorrect(e.target.value);
            if (corrected !== e.target.value) {
              const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
              nativeInputValueSetter?.call(e.target, corrected);
              e.target.dispatchEvent(new Event("input", { bubbles: true }));
            }
          }
        }}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
