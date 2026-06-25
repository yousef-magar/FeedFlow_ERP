import { useRef, useCallback } from "react";
import gsap from "gsap";

interface Props {
  children: React.ReactNode;
  className?: string;
  strength?: number;
  onClick?: () => void;
  as?: "button" | "div";
}

export function MagneticButton({ children, className = "", strength = 0.3, onClick, as: Tag = "button" }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = useCallback(
    (e: React.MouseEvent) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) * strength;
      const y = (e.clientY - rect.top - rect.height / 2) * strength;
      gsap.to(el, { x, y, scale: 1.04, duration: 0.4, ease: "power2.out" });
    },
    [strength]
  );

  const onLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    gsap.to(el, { x: 0, y: 0, scale: 1, duration: 0.5, ease: "power3.out" });
  }, []);

  return (
    <Tag
      ref={ref as any}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onClick={onClick}
      className={`inline-block cursor-pointer ${className}`}
    >
      {children}
    </Tag>
  );
}
