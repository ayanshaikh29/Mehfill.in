import React from "react";
import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { FloralLayer, GoldenDivider } from "./FloralElements";
import { useFadeIn } from "./utils";

interface Event {
  name: string;
  date: string;
  time: string;
  venue: string;
}

interface Props {
  events: Event[];
  groomName: string;
  brideName: string;
}

function EventCard({ event, index }: { event: Event; index: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const delay = index * 18;
  const sp = spring({ frame: frame - delay, fps, config: { damping: 85, stiffness: 150, mass: 0.7 } });
  const translateY = interpolate(sp, [0, 1], [30, 0]);
  const opacity = interpolate(frame, [delay, delay + 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{
      transform: `translateY(${translateY}px)`,
      opacity,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "20px 32px",
      background: "rgba(255,255,255,0.65)",
      backdropFilter: "blur(8px)",
      border: "1px solid rgba(201,168,106,0.35)",
      borderRadius: 4,
      minWidth: 190,
      flex: 1,
    }}>
      {/* Event icon dot */}
      <div style={{
        width: 10,
        height: 10,
        borderRadius: "50%",
        background: "#c9a86a",
        marginBottom: 12,
        boxShadow: "0 0 12px rgba(201,168,106,0.6)",
      }} />
      <div style={{
        fontFamily: '"Cormorant Garamond", "Georgia", serif',
        fontSize: 11,
        letterSpacing: "0.3em",
        textTransform: "uppercase",
        color: "#c9a86a",
        marginBottom: 8,
      }}>
        {event.name}
      </div>
      <div style={{
        fontFamily: '"Cormorant Garamond", "Georgia", serif',
        fontSize: 20,
        fontWeight: 600,
        color: "#1c1917",
        textAlign: "center",
        lineHeight: 1.3,
        marginBottom: 6,
      }}>
        {event.date}
      </div>
      <div style={{
        fontFamily: '"Cormorant Garamond", "Georgia", serif',
        fontSize: 15,
        color: "#6b5a3e",
        marginBottom: 8,
        fontStyle: "italic",
      }}>
        {event.time}
      </div>
      <div style={{
        fontFamily: '"Cormorant Garamond", "Georgia", serif',
        fontSize: 13,
        color: "#9a8060",
        textAlign: "center",
        lineHeight: 1.5,
      }}>
        {event.venue}
      </div>
    </div>
  );
}

export const Scene2Events: React.FC<Props> = ({ events, groomName, brideName }) => {
  const titleOpacity = useFadeIn(0, 20);
  const dividerOpacity = useFadeIn(15, 20);

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
      padding: "40px 60px",
    }}>
      {/* BG gradient */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: "radial-gradient(ellipse at 50% 0%, rgba(201,168,106,0.07) 0%, transparent 70%)",
      }} />

      <FloralLayer />

      <div style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: 820, textAlign: "center" }}>
        {/* Section header */}
        <div style={{ opacity: titleOpacity }}>
          <div style={{
            fontFamily: '"Cormorant Garamond", "Georgia", serif',
            fontSize: 12,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "#c9a86a",
            marginBottom: 10,
          }}>
            Celebration Schedule
          </div>
          <h2 style={{
            fontFamily: '"Cormorant Garamond", "Georgia", serif',
            fontSize: 44,
            fontWeight: 300,
            color: "#1c1917",
            margin: 0,
            lineHeight: 1.1,
          }}>
            {groomName} <span style={{ fontStyle: "italic", color: "#c9a86a" }}>&</span> {brideName}
          </h2>
        </div>

        <div style={{ opacity: dividerOpacity, margin: "16px 0" }}>
          <GoldenDivider />
        </div>

        {/* Events grid */}
        <div style={{
          display: "flex",
          gap: 16,
          justifyContent: "center",
          flexWrap: "wrap",
          marginTop: 8,
        }}>
          {events.map((event, i) => (
            <EventCard key={event.name} event={event} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
};
