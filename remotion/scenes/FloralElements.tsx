import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { useFloat } from "./utils";

/** Golden particle dot */
function Particle({ x, y, size, speed, offset }: { x: number; y: number; size: number; speed: number; offset: number }) {
  const frame = useCurrentFrame();
  const floatY = useFloat(speed, offset);
  const opacity = interpolate(frame, [0, 20], [0, 0.6], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        borderRadius: "50%",
        background: "radial-gradient(circle, #d4af5a 0%, #c9a86a 60%, transparent 100%)",
        transform: `translateY(${floatY}px)`,
        opacity,
        filter: "blur(0.5px)",
      }}
    />
  );
}

/** Decorative corner rosette made of CSS */
function CornerRosette({ corner }: { corner: "tl" | "tr" | "bl" | "br" }) {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [5, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const isRight = corner === "tr" || corner === "br";
  const isBottom = corner === "bl" || corner === "br";
  return (
    <div
      style={{
        position: "absolute",
        top: isBottom ? undefined : 32,
        bottom: isBottom ? 32 : undefined,
        left: isRight ? undefined : 32,
        right: isRight ? 32 : undefined,
        opacity,
        transform: `rotate(${isRight ? (isBottom ? 270 : 90) : isBottom ? 180 : 0}deg)`,
      }}
    >
      {/* Layered golden rosette using CSS */}
      <svg width="90" height="90" viewBox="0 0 90 90" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="45" cy="45" r="8" fill="#c9a86a" opacity="0.9" />
        <circle cx="45" cy="45" r="6" fill="#f0e0a0" opacity="0.8" />
        {/* Petals */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
          <ellipse
            key={i}
            cx={45 + 22 * Math.cos((angle * Math.PI) / 180)}
            cy={45 + 22 * Math.sin((angle * Math.PI) / 180)}
            rx="7"
            ry="12"
            fill="#c9a86a"
            opacity="0.7"
            transform={`rotate(${angle}, ${45 + 22 * Math.cos((angle * Math.PI) / 180)}, ${45 + 22 * Math.sin((angle * Math.PI) / 180)})`}
          />
        ))}
        {/* Vine tendrils */}
        <path d="M45 10 C35 20 25 15 20 5" stroke="#c9a86a" strokeWidth="1.5" fill="none" opacity="0.8" />
        <path d="M80 45 C70 35 75 25 85 20" stroke="#c9a86a" strokeWidth="1.5" fill="none" opacity="0.8" />
        <path d="M45 10 Q50 20 45 15" stroke="#c9a86a" strokeWidth="1" fill="none" opacity="0.6" />
      </svg>
    </div>
  );
}

/** Horizontal ornamental divider */
export function GoldenDivider({ style }: { style?: React.CSSProperties }) {
  const frame = useCurrentFrame();
  const scaleX = interpolate(frame, [0, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, transform: `scaleX(${scaleX})`, ...style }}>
      <div style={{ flex: 1, height: 1, background: "linear-gradient(to right, transparent, #c9a86a, transparent)" }} />
      <svg width="24" height="24" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="3" fill="#c9a86a" />
        <circle cx="12" cy="12" r="6" fill="none" stroke="#c9a86a" strokeWidth="0.8" />
        {[0, 90, 180, 270].map((a, i) => (
          <line
            key={i}
            x1={12 + 7 * Math.cos((a * Math.PI) / 180)}
            y1={12 + 7 * Math.sin((a * Math.PI) / 180)}
            x2={12 + 10 * Math.cos((a * Math.PI) / 180)}
            y2={12 + 10 * Math.sin((a * Math.PI) / 180)}
            stroke="#c9a86a"
            strokeWidth="1"
          />
        ))}
      </svg>
      <div style={{ flex: 1, height: 1, background: "linear-gradient(to left, transparent, #c9a86a, transparent)" }} />
    </div>
  );
}

/** Full floral overlay layer */
export function FloralLayer() {
  return (
    <>
      <CornerRosette corner="tl" />
      <CornerRosette corner="tr" />
      <CornerRosette corner="bl" />
      <CornerRosette corner="br" />
      {/* Golden border frame */}
      <div style={{
        position: "absolute",
        inset: 20,
        border: "1px solid rgba(201,168,106,0.4)",
        borderRadius: 2,
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute",
        inset: 26,
        border: "0.5px solid rgba(201,168,106,0.2)",
        borderRadius: 1,
        pointerEvents: "none",
      }} />
      {/* Floating particles */}
      <Particle x={15} y={20} size={6} speed={1.2} offset={0} />
      <Particle x={80} y={15} size={4} speed={0.9} offset={30} />
      <Particle x={25} y={75} size={5} speed={1.1} offset={60} />
      <Particle x={72} y={80} size={7} speed={0.8} offset={15} />
      <Particle x={50} y={8} size={4} speed={1.3} offset={45} />
      <Particle x={5} y={50} size={3} speed={1.0} offset={90} />
      <Particle x={92} y={55} size={5} speed={1.4} offset={20} />
      <Particle x={45} y={92} size={4} speed={0.7} offset={75} />
    </>
  );
}
