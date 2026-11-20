import React from "react";
import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { FloralLayer, GoldenDivider } from "./FloralElements";
import { useFadeIn, useSlowZoom } from "./utils";

interface Props {
  groomName: string;
  brideName: string;
  weddingDate: string;
  rsvpText?: string;
  brandUrl?: string;
}

export const Scene4Closing: React.FC<Props> = ({
  groomName,
  brideName,
  weddingDate,
  rsvpText = "Kindly RSVP",
  brandUrl = "mehfill.in",
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const bgScale = useSlowZoom(1, 1.04);

  // Fade out near end
  const globalFadeOut = interpolate(frame, [durationInFrames - 20, durationInFrames - 5], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const heartSp = spring({ frame: frame - 10, fps, config: { damping: 60, stiffness: 200, mass: 0.5 } });
  const heartScale = interpolate(heartSp, [0, 1], [0, 1.1]);

  return (
    <div style={{
      width: "100%",
      height: "100%",
      position: "relative",
      overflow: "hidden",
      background: "#fdf9f0",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      opacity: globalFadeOut,
    }}>
      {/* Background */}
      <div style={{
        position: "absolute",
        inset: 0,
        transform: `scale(${bgScale})`,
        background: `
          radial-gradient(ellipse at 50% 50%, rgba(201,168,106,0.1) 0%, transparent 70%),
          linear-gradient(135deg, #fdf9f0 0%, #f5eed8 50%, #fdf9f0 100%)
        `,
      }} />

      <FloralLayer />

      <div style={{
        position: "relative",
        zIndex: 10,
        textAlign: "center",
        padding: "0 60px",
        maxWidth: 680,
      }}>
        {/* Heart */}
        <div style={{
          transform: `scale(${heartScale})`,
          opacity: interpolate(frame, [10, 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          marginBottom: 20,
        }}>
          <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
            <path
              d="M26 44 C26 44 6 32 6 18 C6 11 11 6 18 6 C22 6 25 8 26 10 C27 8 30 6 34 6 C41 6 46 11 46 18 C46 32 26 44 26 44Z"
              fill="#c9a86a"
              opacity="0.9"
            />
            <path
              d="M26 40 C26 40 10 30 10 18 C10 13 14 10 18 10 C22 10 24.5 12.5 26 14 C27.5 12.5 30 10 34 10 C38 10 42 13 42 18 C42 30 26 40 26 40Z"
              fill="#f0e0a0"
              opacity="0.7"
            />
          </svg>
        </div>

        {/* Couple names large */}
        <div style={{ opacity: useFadeIn(15, 20) }}>
          <div style={{
            fontFamily: '"Cormorant Garamond", "Georgia", serif',
            fontSize: 68,
            fontWeight: 300,
            color: "#1c1917",
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
          }}>
            {groomName}
          </div>
          <div style={{
            fontFamily: '"Cormorant Garamond", "Georgia", serif',
            fontSize: 32,
            fontStyle: "italic",
            color: "#c9a86a",
            margin: "2px 0",
          }}>
            &amp;
          </div>
          <div style={{
            fontFamily: '"Cormorant Garamond", "Georgia", serif',
            fontSize: 68,
            fontWeight: 300,
            color: "#1c1917",
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
          }}>
            {brideName}
          </div>
        </div>

        <div style={{ opacity: useFadeIn(30, 20), margin: "20px 0" }}>
          <GoldenDivider />
        </div>

        {/* Date */}
        <div style={{
          opacity: useFadeIn(35, 20),
          fontFamily: '"Cormorant Garamond", "Georgia", serif',
          fontSize: 18,
          letterSpacing: "0.18em",
          color: "#6b5a3e",
          textTransform: "uppercase",
          marginBottom: 16,
        }}>
          {weddingDate}
        </div>

        {/* RSVP */}
        <div style={{
          opacity: useFadeIn(45, 20),
          fontFamily: '"Cormorant Garamond", "Georgia", serif',
          fontSize: 15,
          color: "#9a8060",
          fontStyle: "italic",
          marginBottom: 24,
        }}>
          {rsvpText}
        </div>

        {/* Brand watermark */}
        <div style={{
          opacity: useFadeIn(55, 20),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
        }}>
          <div style={{ width: 32, height: 1, background: "rgba(201,168,106,0.5)" }} />
          <div style={{
            fontFamily: '"Cormorant Garamond", "Georgia", serif',
            fontSize: 12,
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color: "#c9a86a",
            opacity: 0.8,
          }}>
            {brandUrl}
          </div>
          <div style={{ width: 32, height: 1, background: "rgba(201,168,106,0.5)" }} />
        </div>
      </div>
    </div>
  );
};
