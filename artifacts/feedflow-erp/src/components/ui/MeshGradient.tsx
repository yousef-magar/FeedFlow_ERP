import { useEffect, useRef } from "react";
import gsap from "gsap";

interface Props {
  colors?: string[];
  speed?: number;
  className?: string;
}

export function MeshGradient({
  colors = ["hsl(var(--primary)/0.12)", "hsl(var(--chart-2)/0.08)", "hsl(var(--background))"],
  speed = 1,
  className = "",
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const blobsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    blobsRef.current.forEach(b => { gsap.killTweensOf(b); b.remove(); });
    blobsRef.current = [];

    const positions = [
      { x: "0%", y: "0%" },
      { x: "100%", y: "0%" },
      { x: "50%", y: "100%" },
      { x: "0%", y: "50%" },
      { x: "100%", y: "50%" },
    ];

    const blobs = colors.map((color, i) => {
      const blob = document.createElement("div");
      const pos = positions[i % positions.length];
      const size = 200 + Math.random() * 200;
      blob.style.cssText = `
        position: absolute; border-radius: 50%;
        width: ${size}px; height: ${size}px;
        background: ${color};
        filter: blur(${60 + Math.random() * 40}px);
        left: ${pos.x}; top: ${pos.y};
        transform: translate(-50%, -50%);
        will-change: transform;
      `;
      container.appendChild(blob);
      blobsRef.current.push(blob);

      gsap.to(blob, {
        x: () => gsap.utils.random(-40, 40),
        y: () => gsap.utils.random(-40, 40),
        scale: () => 1 + Math.random() * 0.5,
        duration: 6 / speed + Math.random() * 4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      return blob;
    });

    return () => blobs.forEach(b => { gsap.killTweensOf(b); b.remove(); });
  }, [colors, speed]);

  return <div ref={ref} className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`} />;
}
