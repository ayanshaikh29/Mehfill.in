import React from "react";
import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { FloralLayer, GoldenDivider } from "./FloralElements";
import { useFadeIn, useSlowZoom } from "./utils";

interface Props {
  venueName: string;
  venueAddress: string;
  venueCity: string;
  groomName: string;
  brideName: string;
  mainDate: string;
}

export const Scene3Venue: React.FC<Props> = ({
  venueName,
  venueAddress,
  venueCity,
  groomName,
  brideName,
  mainDate,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const bgScale = useSlowZoom(1.03, 1);

  const venueIconSp = spring({ frame: frame - 5, fps, config: { damping: 80, stiffness: 160, mass: 0.8 } });
  const venueScale = interpolate(venueIconSp, [0, 1], [0.5, 1]);
  const venueOpacity = interpolate(frame, [5, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const nameSp = spring({ frame: frame - 15, fps, config: { damping: 85, stiffness: 150, mass: 0.7 } });
  const nameY = interpolate(nameSp, [0, 1], [20, 0]);
  const nameOpacity = interpolate(frame, [15, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{
      width: "100%",
      height: "100%",
      position: "relative",
      overflow: "hidden",
      background: "#1c1917",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
    }}>
      {/* Dark luxury background */}
      <div style={{
        position: "absolute",
        inset: 0,
        transform: `scale(${bgScale})`,
        background: `
          radial-gradient(ellipse at 50% 30%, rgba(201,168,106,0.12) 0%, transparent 60%),
          radial-gradient(ellipse at 20% 80%, rgba(201,168,106,0.06) 0%, transparent 50%),
          linear-gradient(135deg, #1c1917 0%, #2a2320 50%, #1c1917 100%)
        `,
      }} />

      {/* Golden grid pattern */}
      <div style={{
        position: "absolute",
        inset: 0,
        opacity: 0.04,
        backgroundImage: `
          linear-gradient(rgba(201,168,106,0.8) 1px, transparent 1px),
          linear-gradient(90deg, rgba(201,168,106,0.8) 1px, transparent 1px)
        `,
        backgroundSize: "60px 60px",
      }} />

      {/* Golden border frame */}
      <div style={{ position: "absolute", inset: 20, border: "1px solid rgba(201,168,106,0.3)", borderRadius: 2 }} />
      <div style={{ position: "absolute", inset: 26, border: "0.5px solid rgba(201,168,106,0.15)", borderRadius: 1 }} />

      {/* Content */}
      <div style={{
        position: "relative",
        zIndex: 10,
        textAlign: "center",
        padding: "0 60px",
        maxWidth: 720,
      }}>
        {/* Location pin icon */}
        <div style={{
          transform: `scale(${venueScale})`,
          opacity: venueOpacity,
          marginBottom: 20,
        }}>
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <circle cx="20" cy="20" r="19" stroke="#c9a86a" strokeWidth="1" opacity="0.6" />
            <circle cx="20" cy="20" r="8" fill="#c9a86a" opacity="0.9" />
            <path d="M20 8 C13 8 8 13 8 20 C8 28 20 36 20 36 C20 36 32 28 32 20 C32 13 27 8 20 8Z" stroke="#c9a86a" strokeWidth="1.5" fill="none" opacity="0.5" />
          </svg>
        </div>

        {/* Eyebrow */}
        <div style={{
          opacity: useFadeIn(10, 15),
          fontFamily: '"Cormorant Garamond", "Georgia", serif',
          fontSize: 11,
          letterSpacing: "0.35em",
          textTransform: "uppercase",
          color: "#c9a86a",
          marginBottom: 20,
        }}>
          Venue &amp; Location
        </div>

        {/* Couple names */}
        <div style={{
          transform: `translateY(${nameY}px)`,
          opacity: nameOpacity,
        }}>
          <div style={{
            fontFamily: '"Cormorant Garamond", "Georgia", serif',
            fontSize: 54,
            fontWeight: 300,
            color: "#fdf9f0",
            lineHeight: 1.1,
            letterSpacing: "-0.01em",
          }}>
            {groomName} <span style={{ fontStyle: "italic", color: "#c9a86a" }}>&</span> {brideName}
          </div>
        </div>

        {/* Main date */}
        <div style={{ opacity: useFadeIn(30, 20), margin: "16px 0" }}>
          <GoldenDivider style={{ filter: "brightness(1.2)" }} />
          <div style={{
            fontFamily: '"Cormorant Garamond", "Georgia", serif',
            fontSize: 20,
            letterSpacing: "0.15em",
            color: "#c9a86a",
            textTransform: "uppercase",
            marginTop: 16,
          }}>
            {mainDate}
          </div>
        </div>

        {/* Venue details */}
        <div style={{ opacity: useFadeIn(40, 20), marginTop: 24 }}>
          <div style={{
            fontFamily: '"Cormorant Garamond", "Georgia", serif',
            fontSize: 32,
            fontWeight: 600,
            color: "#fdf9f0",
            marginBottom: 10,
            lineHeight: 1.2,
          }}>
            {venueName}
          </div>
          <div style={{
            fontFamily: '"Cormorant Garamond", "Georgia", serif',
            fontSize: 16,
            color: "rgba(253,249,240,0.6)",
            fontStyle: "italic",
            lineHeight: 1.5,
          }}>
            {venueAddress}
          </div>
          <div style={{
            fontFamily: '"Cormorant Garamond", "Georgia", serif',
            fontSize: 14,
            color: "#c9a86a",
            letterSpacing: "0.1em",
            marginTop: 8,
          }}>
            {venueCity}
          </div>
        </div>
      </div>
    </div>
  );
};
