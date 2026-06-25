import { useCallback, useRef } from "react";
import gsap from "gsap";

interface Props {
  children: React.ReactNode;
  className?: string;
  color?: string;
}

export function RippleEffect({ children, className = "", color = "hsl(var(--primary)/0.3)" }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  const onClick = useCallback(
    (e: React.MouseEvent) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const ripple = document.createElement("div");
      const size = Math.max(rect.width, rect.height) * 1.5;
      ripple.style.cssText = `
        position: absolute; left: ${x - size / 2}px; top: ${y - size / 2}px;
        width: ${size}px; height: ${size}px; border-radius: 50%;
        background: ${color}; pointer-events: none;
      `;
      el.appendChild(ripple);

      gsap.fromTo(
        ripple,
        { scale: 0, opacity: 0.6 },
        {
          scale: 1,
          opacity: 0,
          duration: 0.6,
          ease: "power2.out",
          onComplete: () => ripple.remove(),
        }
      );
    },
    [color]
  );

  return (
    <div ref={ref} onClick={onClick} className={`relative overflow-hidden ${className}`}>
      {children}
    </div>
  );
}
