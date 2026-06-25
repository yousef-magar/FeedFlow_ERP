import { useEffect, useRef, useCallback } from "react";
import gsap from "gsap";

export function useGsapFadeIn(delay = 0, duration = 0.6) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.opacity = "0";
    const ctx = gsap.context(() => {
      gsap.to(el, { opacity: 1, y: 0, duration, delay, ease: "power3.out" });
    });
    return () => ctx.revert();
  }, [delay, duration]);

  return ref;
}

export function useGsapStagger(deps: any[] = []) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || deps.length === 0) return;
    const items = container.children;
    if (!items.length) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        items,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.06,
          duration: 0.5,
          ease: "power3.out",
        }
      );
    });
    return () => ctx.revert();
  }, deps);

  return containerRef;
}

export function useGsapCounter(target: number, enabled = true) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!enabled) return;
    let current = 0;
    const duration = 1200;
    const steps = Math.max(1, Math.ceil(target / 60));
    const intervalMs = duration / (target / steps);
    const timer = setInterval(() => {
      current += steps;
      if (ref.current) ref.current.textContent = String(Math.min(current, target));
      if (current >= target) clearInterval(timer);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [target, enabled]);

  return ref;
}

export function useGsapMounted(deps: any[] = []) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(el, { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 0.4, ease: "power2.out" });
    });
    return () => ctx.revert();
  }, deps);

  return ref;
}

export function useGsapTimeline() {
  const tl = useRef<gsap.core.Timeline | null>(null);

  const create = useCallback(() => {
    tl.current = gsap.timeline({ paused: true });
    return tl.current;
  }, []);

  const play = useCallback(() => tl.current?.play(), []);
  const reverse = useCallback(() => tl.current?.reverse(), []);
  const kill = useCallback(() => tl.current?.kill(), []);

  return { create, play, reverse, kill, tl };
}
