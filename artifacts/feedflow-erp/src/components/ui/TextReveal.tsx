import { useEffect, useRef } from "react";
import gsap from "gsap";

interface Props {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span";
  delay?: number;
  duration?: number;
  stagger?: number;
  direction?: "chars" | "words";
}

export function TextReveal({
  text,
  className = "",
  as: Tag = "h1",
  delay = 0,
  duration = 0.5,
  stagger = 0.04,
  direction = "chars",
}: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const spans = el.querySelectorAll("span");
    if (!spans.length) return;
    gsap.fromTo(
      spans,
      { opacity: 0, y: 20, rotateX: -90 },
      {
        opacity: 1,
        y: 0,
        rotateX: 0,
        stagger,
        duration,
        delay,
        ease: "back.out(1.4)",
      }
    );
  }, [text, delay, duration, stagger]);

  const isRtl = /[\u0600-\u06FF]/.test(text);
  const splitBy = direction === "chars" && !isRtl ? text.split("") : text.split(" ");

  return (
    <Tag ref={ref as any} className={className} style={{ perspective: "600px" }}>
      {splitBy.map((part, i) => (
        <span
          key={i}
          className="inline-block"
          style={{ opacity: 0 }}
        >
          {part}
          {direction === "words" && i < splitBy.length - 1 ? "\u00A0" : ""}
        </span>
      ))}
    </Tag>
  );
}

export function StaggerLines({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const lines = el.querySelectorAll(".stagger-line");
    if (!lines.length) return;
    gsap.fromTo(
      lines,
      { opacity: 0, y: 16, clipPath: "inset(0 100% 0 0)" },
      { opacity: 1, y: 0, clipPath: "inset(0 0% 0 0)", stagger: 0.08, duration: 0.6, delay, ease: "power3.out" }
    );
  }, [delay]);

  return <div ref={ref} className={className}>{children}</div>;
}
