import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ── Magnifier Lens ── */
export function MagItem({ children, label, detail, big, sub, className, ringColor }: {
  children: React.ReactNode; label: string; detail: string; big: string; sub: string; className?: string; ringColor?: string;
}) {
  const [isOver, setIsOver] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLSpanElement>(null);
  const handleMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
  };
  const size = 100;
  const half = size / 2;
  const scale = 1.4;
  let ox = half, oy = half;
  if (contentRef.current && ref.current) {
    const cr = contentRef.current.getBoundingClientRect();
    const pr = ref.current.getBoundingClientRect();
    const mx = pos.x + pr.left - cr.left;
    const my = pos.y + pr.top - cr.top;
    ox = half - mx * scale;
    oy = half - my * scale;
  }
  return (
    <div ref={ref} className="relative inline-flex" onMouseEnter={()=>setIsOver(true)} onMouseLeave={()=>setIsOver(false)} onMouseMove={handleMove}>
      <span ref={contentRef} className={`${className || ""} relative`} style={isOver ? {cursor:"none"} : undefined}>{children}</span>
      <AnimatePresence mode="wait">
        {isOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, left: pos.x - half, top: pos.y - half }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 250, damping: 22, mass: 0.4 }}
            className="absolute z-50 pointer-events-none"
          >
            {/* Outer glow */}
            <div className="absolute rounded-full" style={{
              width: size + 26, height: size + 26,
              left: -13, top: -13,
              background: `radial-gradient(circle, ${ringColor || "hsl(var(--primary)/0.12)"}, transparent 70%)`,
            }} />
            {/* Lens body */}
            <div className="relative overflow-hidden rounded-full" style={{
              width: size, height: size,
              background: "radial-gradient(circle at 30% 25%, hsl(var(--card)/0.65), hsl(var(--card)/0.55))",
              boxShadow: `0 10px 50px -8px rgba(0,0,0,0.35), 0 0 0 2px ${ringColor ? ringColor.replace(")", "/0.3)") : "hsl(var(--primary)/0.3)"}, 0 0 0 6px ${ringColor ? ringColor.replace(")", "/0.06)") : "hsl(var(--primary)/0.04)"}`,
            }}>
              {/* Glass glare */}
              <div className="absolute inset-0 rounded-full" style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.04) 30%, transparent 55%)",
              }} />
              <div className="absolute top-2.5 left-3 w-6 h-3 rounded-full bg-white/18 blur-[2px] -rotate-[15deg]" />
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-14 h-7 rounded-[50%] bg-white/3 blur-[2px]" />
              {/* Magnified content */}
              <motion.span
                animate={{ x: ox, y: oy }}
                transition={{ type: "spring", stiffness: 400, damping: 35, mass: 0.3 }}
                style={{
                  position: "absolute", left: 0, top: 0,
                  scale, transformOrigin: "0 0",
                  whiteSpace: "nowrap",
                  filter: "brightness(1.15) contrast(1.1)",
                }}
              >
                {children}
              </motion.span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
