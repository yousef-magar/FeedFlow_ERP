import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

interface Props {
  children: React.ReactNode;
  className?: string;
  direction?: "up" | "down" | "left" | "right" | "none";
  delay?: number;
  duration?: number;
  distance?: number;
  threshold?: number;
  once?: boolean;
  stagger?: number;
}

const dirMap = {
  up: { y: 1 },
  down: { y: -1 },
  left: { x: 1 },
  right: { x: -1 },
  none: {},
};

export function ScrollReveal({
  children,
  className = "",
  direction = "up",
  delay = 0,
  duration = 0.7,
  distance = 40,
  threshold = 0.1,
  once = true,
  stagger = 0,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || revealed) return;

    const dir = dirMap[direction];
    const fromVars: gsap.TweenVars = { opacity: 0, ...dir, [Object.keys(dir)[0] || "y"]: Object.values(dir)[0] ? distance * (Object.values(dir)[0] as number) : 0 };
    if (stagger) {
      gsap.fromTo(
        el.children,
        { opacity: 0, ...dir, [Object.keys(dir)[0] || "y"]: Object.values(dir)[0] ? distance * (Object.values(dir)[0] as number) : 0 },
        { opacity: 1, ...Object.fromEntries(Object.entries(dir).map(([k, v]) => [k, 0])), stagger, duration, delay, ease: "power3.out" }
      );
      setRevealed(true);
      return;
    }

    gsap.set(el, fromVars);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          gsap.to(el, {
            opacity: 1,
            ...Object.fromEntries(Object.entries(dir).map(([k, v]) => [k, 0])),
            duration,
            delay,
            ease: "power3.out",
          });
          setRevealed(true);
          if (once) observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [direction, delay, duration, distance, threshold, once, stagger, revealed]);

  return <div ref={ref} className={className}>{children}</div>;
}
