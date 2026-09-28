"use client";
import { useEffect, useRef } from "react";

// Lightweight canvas snowfall of golden petals/leaves.
// Pauses off-screen + honours prefers-reduced-motion. Mobile halves density.

type Petal = {
  x: number;
  y: number;
  size: number;
  angle: number;
  spin: number;
  speedY: number;
  swayFreq: number;
  phase: number;
  color: string;
  alpha: number;
  depth: number;
};

const LIGHT_COLORS = ["#C9A86A", "#E8D5A8", "#D9BE8C", "#B96A4B", "#E5C98F"];
const DARK_COLORS = ["#C9A86A", "#E8D5A8", "#9a7a45"];

export default function PetalFall({
  density = 14,
  tone = "light",
  className = "",
}: {
  density?: number;
  tone?: "light" | "dark";
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let raf = 0;
    let inView = true;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const colors = tone === "light" ? LIGHT_COLORS : DARK_COLORS;
    const count = Math.round(density * (window.innerWidth < 640 ? 0.5 : 1));

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      w = Math.max(1, r.width);
      h = Math.max(1, r.height);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const spawn = (fromTop: boolean): Petal => ({
      x: Math.random() * w,
      y: fromTop ? -30 : Math.random() * h,
      size: 5 + Math.random() * 11,
      angle: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.02,
      speedY: 0.25 + Math.random() * 0.6,
      swayFreq: 0.0004 + Math.random() * 0.0008,
      phase: Math.random() * Math.PI * 2,
      color: colors[(Math.random() * colors.length) | 0],
      alpha: 0.22 + Math.random() * 0.4,
      depth: 0.5 + Math.random() * 0.5,
    });

    const petals: Petal[] = Array.from({ length: count }, () => spawn(false));

    const io = new IntersectionObserver(([e]) => {
      inView = e.isIntersecting;
    });
    io.observe(canvas);

    const draw = (p: Petal) => {
      const s = p.size * p.depth;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.globalAlpha = p.alpha * p.depth;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.moveTo(0, -s);
      ctx.bezierCurveTo(s * 0.9, -s * 0.4, s * 0.7, s * 0.7, 0, s);
      ctx.bezierCurveTo(-s * 0.7, s * 0.7, -s * 0.9, -s * 0.4, 0, -s);
      ctx.fill();
      ctx.globalAlpha = p.alpha * p.depth * 0.45;
      ctx.strokeStyle = "#8a6a35";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.8);
      ctx.lineTo(0, s * 0.8);
      ctx.stroke();
      ctx.restore();
    };

    let t = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (!inView || document.hidden) return;
      t += 16;
      ctx.clearRect(0, 0, w, h);
      for (const p of petals) {
        p.y += p.speedY * p.depth;
        p.x += Math.sin(t * p.swayFreq + p.phase) * 0.6;
        p.angle += p.spin;
        if (p.y > h + 30) Object.assign(p, spawn(true));
        if (p.x < -40) p.x = w + 30;
        if (p.x > w + 40) p.x = -30;
        draw(p);
      }
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      io.disconnect();
    };
  }, [density, tone]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    />
  );
}
