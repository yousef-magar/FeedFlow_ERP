import { useEffect, useRef, useCallback } from "react";
import gsap from "gsap";

interface Particle {
  el: HTMLDivElement;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
}

interface Props {
  count?: number;
  colors?: string[];
  interactive?: boolean;
  className?: string;
}

export function ParticleField({
  count = 24,
  colors = ["hsl(var(--primary)/0.15)", "hsl(var(--chart-2)/0.12)", "hsl(var(--chart-3)/0.1)"],
  interactive = true,
  className = "",
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const rafRef = useRef<number>(0);

  const shapes = ["circle", "diamond"] as const;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const particles: Particle[] = [];

    for (let i = 0; i < count; i++) {
      const el = document.createElement("div");
      const size = 4 + Math.random() * 12;
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      const color = colors[Math.floor(Math.random() * colors.length)];

      el.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border-radius: ${shape === "circle" ? "50%" : "2px"};
        transform: rotate(${Math.random() * 360}deg);
        pointer-events: none;
        will-change: transform;
      `;
      container.appendChild(el);

      particles.push({
        el,
        x: Math.random() * containerRect.width,
        y: Math.random() * containerRect.height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        size,
      });
    }

    particlesRef.current = particles;

    const onMouse = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const onLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };

    if (interactive) {
      container.addEventListener("mousemove", onMouse);
      container.addEventListener("mouseleave", onLeave);
    }

    const animate = () => {
      const { width, height } = container.getBoundingClientRect();
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      for (const p of particles) {
        let dx = 0, dy = 0;
        if (interactive && mx > 0 && mx < width && my > 0 && my < height) {
          const diffX = p.x - mx;
          const diffY = p.y - my;
          const dist = Math.sqrt(diffX * diffX + diffY * diffY);
          if (dist < 150 && dist > 0) {
            const force = (150 - dist) / 150;
            dx = (diffX / dist) * force * 2;
            dy = (diffY / dist) * force * 2;
          }
        }

        p.x += p.vx + dx;
        p.y += p.vy + dy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        gsap.set(p.el, { x: p.x, y: p.y, rotate: p.x * 0.3 });
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
      container.querySelectorAll("div").forEach(d => d.remove());
      if (interactive) {
        container.removeEventListener("mousemove", onMouse);
        container.removeEventListener("mouseleave", onLeave);
      }
    };
  }, [count, interactive]);

  return <div ref={containerRef} className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`} />;
}

export function useParticleField() {
  const ref = useRef<HTMLDivElement>(null);

  const burst = useCallback((x: number, y: number) => {
    const container = ref.current;
    if (!container) return;
    for (let i = 0; i < 8; i++) {
      const dot = document.createElement("div");
      const angle = (Math.PI * 2 * i) / 8;
      const size = 3 + Math.random() * 4;
      dot.style.cssText = `
        position: absolute; width: ${size}px; height: ${size}px;
        border-radius: 50%; background: hsl(var(--primary)/0.4);
        left: ${x}px; top: ${y}px; pointer-events: none;
      `;
      container.appendChild(dot);
      gsap.to(dot, {
        x: Math.cos(angle) * (40 + Math.random() * 40),
        y: Math.sin(angle) * (40 + Math.random() * 40),
        opacity: 0,
        scale: 0,
        duration: 0.8,
        ease: "power3.out",
        onComplete: () => dot.remove(),
      });
    }
  }, []);

  return { ref, burst };
}
