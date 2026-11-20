import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { FloralLayer, GoldenDivider } from "./FloralElements";
import { useFadeIn, useSlowZoom } from "./utils";

interface Props {
  groomName: string;
  brideName: string;
  weddingDate: string;
  bismillah?: boolean;
}

export const Scene1Opening: React.FC<Props> = ({ groomName, brideName, weddingDate, bismillah = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const bgScale = useSlowZoom(1, 1.05);

  // Staggered animations
  const bismillahOpacity = useFadeIn(5, 20);
  const ampersandSpring = spring({ frame: frame - 15, fps, config: { damping: 90, stiffness: 150, mass: 0.8 } });
  const groomSlide = spring({ frame: frame - 10, fps, config: { damping: 80, stiffness: 160, mass: 0.7 } });
  const brideSlide = spring({ frame: frame - 20, fps, config: { damping: 80, stiffness: 160, mass: 0.7 } });
  const dividerOpacity = useFadeIn(35, 20);
  const dateOpacity = useFadeIn(45, 20);

  const groomTranslateX = interpolate(groomSlide, [0, 1], [-60, 0]);
  const brideTranslateX = interpolate(brideSlide, [0, 1], [60, 0]);
  const groomOpacity = interpolate(frame, [10, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const brideOpacity = interpolate(frame, [20, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{
      width: "100%",
      height: "100%",
      position: "relative",
      overflow: "hidden",
      background: "#fdf9f0",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      {/* Background texture layer */}
      <div style={{
        position: "absolute",
        inset: 0,
        transform: `scale(${bgScale})`,
        background: `
          radial-gradient(ellipse at 20% 20%, rgba(201,168,106,0.08) 0%, transparent 60%),
          radial-gradient(ellipse at 80% 80%, rgba(201,168,106,0.06) 0%, transparent 60%),
          radial-gradient(ellipse at 50% 50%, rgba(253,249,240,1) 0%, rgba(245,238,220,0.8) 100%)
        `,
      }} />

      {/* Subtle floral watermark BG */}
      <div style={{
        position: "absolute",
        inset: 0,
        opacity: 0.04,
        backgroundImage: `
          radial-gradient(circle at 10% 10%, #c9a86a 1px, transparent 1px),
          radial-gradient(circle at 90% 10%, #c9a86a 1px, transparent 1px),
          radial-gradient(circle at 10% 90%, #c9a86a 1px, transparent 1px),
          radial-gradient(circle at 90% 90%, #c9a86a 1px, transparent 1px)
        `,
        backgroundSize: "120px 120px",
      }} />

      {/* Floral decoration layer */}
      <FloralLayer />

      {/* Main content */}
      <div style={{
        position: "relative",
        textAlign: "center",
        zIndex: 10,
        padding: "0 60px",
        maxWidth: 760,
      }}>
        {/* Bismillah (optional for Nikah) */}
        {bismillah && (
          <div style={{
            opacity: bismillahOpacity,
            fontFamily: '"Noto Nastaliq Urdu", "Amiri", serif',
            fontSize: 28,
            color: "#8B6914",
            marginBottom: 20,
            letterSpacing: "0.05em",
            direction: "rtl",
          }}>
            بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ
          </div>
        )}

        {/* Eyebrow text */}
        <div style={{
          opacity: useFadeIn(0, 15),
          fontFamily: '"Cormorant Garamond", "Georgia", serif',
          fontSize: 13,
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color: "#c9a86a",
          marginBottom: 24,
        }}>
          Together with their families
        </div>

        {/* Groom name */}
        <div style={{
          transform: `translateX(${groomTranslateX}px)`,
          opacity: groomOpacity,
          fontFamily: '"Cormorant Garamond", "Georgia", serif',
          fontSize: 76,
          fontWeight: 300,
          lineHeight: 1,
          color: "#1c1917",
          letterSpacing: "-0.02em",
        }}>
          {groomName}
        </div>

        {/* Ampersand */}
        <div style={{
          opacity: interpolate(ampersandSpring, [0, 1], [0, 1]),
          transform: `scale(${interpolate(ampersandSpring, [0, 1], [0.5, 1])})`,
          fontFamily: '"Cormorant Garamond", "Georgia", serif',
          fontSize: 48,
          fontStyle: "italic",
          color: "#c9a86a",
          margin: "4px 0",
          lineHeight: 1.2,
        }}>
          &amp;
        </div>

        {/* Bride name */}
        <div style={{
          transform: `translateX(${brideTranslateX}px)`,
          opacity: brideOpacity,
          fontFamily: '"Cormorant Garamond", "Georgia", serif',
          fontSize: 76,
          fontWeight: 300,
          lineHeight: 1,
          color: "#1c1917",
          letterSpacing: "-0.02em",
        }}>
          {brideName}
        </div>

        {/* Divider */}
        <div style={{ opacity: dividerOpacity, marginTop: 28 }}>
          <GoldenDivider />
        </div>

        {/* Wedding date */}
        <div style={{
          opacity: dateOpacity,
          marginTop: 20,
          fontFamily: '"Cormorant Garamond", "Georgia", serif',
          fontSize: 20,
          letterSpacing: "0.15em",
          color: "#6b5a3e",
          textTransform: "uppercase",
        }}>
          {weddingDate}
        </div>

        {/* Request line */}
        <div style={{
          opacity: useFadeIn(55, 20),
          marginTop: 10,
          fontFamily: '"Cormorant Garamond", "Georgia", serif',
          fontSize: 15,
          color: "#9a8060",
          fontStyle: "italic",
          letterSpacing: "0.05em",
        }}>
          request the honour of your presence
        </div>
      </div>
    </div>
  );
};
