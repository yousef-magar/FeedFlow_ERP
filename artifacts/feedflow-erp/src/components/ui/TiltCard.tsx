import { useRef, useCallback } from "react";

interface Props {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
  glare?: boolean;
}

export function TiltCard({ children, className = "", intensity = 8, glare = true }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);

  const onMove = useCallback(
    (e: React.MouseEvent) => {
      const card = cardRef.current;
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const rx = (y - cy) / cy * intensity;
      const ry = (cx - x) / cx * intensity;

      card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      card.style.transition = "transform 0.3s ease";

      if (glare && glareRef.current) {
        glareRef.current.style.background = `radial-gradient(circle at ${x / rect.width * 100}% ${y / rect.height * 100}%, hsl(var(--primary)/0.15), transparent 60%)`;
        glareRef.current.style.transition = "background 0.3s ease";
      }
    },
    [intensity, glare]
  );

  const onLeave = useCallback(() => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg)";
    if (glareRef.current) {
      glareRef.current.style.opacity = "0";
      glareRef.current.style.transition = "opacity 0.3s ease";
    }
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`relative ${className}`}
      style={{ transformStyle: "preserve-3d" }}
    >
      {children}
      {glare && (
        <div
          ref={glareRef}
          className="absolute inset-0 rounded-[inherit] pointer-events-none"
          style={{ mixBlendMode: "overlay" }}
        />
      )}
    </div>
  );
}

export function TiltCardContent({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={className} style={{ transform: "translateZ(30px)" }}>{children}</div>;
}
