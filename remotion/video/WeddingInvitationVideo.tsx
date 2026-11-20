import React from "react";
import { Sequence, AbsoluteFill } from "remotion";
import { Scene1Opening } from "../scenes/Scene1Opening";
import { Scene2Events } from "../scenes/Scene2Events";
import { Scene3Venue } from "../scenes/Scene3Venue";
import { Scene4Closing } from "../scenes/Scene4Closing";

export interface WeddingVideoProps {
  groomName?: string;
  brideName?: string;
  weddingDate?: string;
  bismillah?: boolean;
  events?: Array<{
    name: string;
    date: string;
    time: string;
    venue: string;
  }>;
  venueName?: string;
  venueAddress?: string;
  venueCity?: string;
  rsvpText?: string;
  brandUrl?: string;
}

export const DEFAULT_VIDEO_PROPS: WeddingVideoProps = {
  groomName: "Aariz",
  brideName: "Zoya",
  weddingDate: "Friday, 18 December 2026",
  bismillah: true,
  events: [
    {
      name: "Haldi & Mehndi",
      date: "16 Dec 2026",
      time: "4:00 PM Onwards",
      venue: "Courtyard Villa",
    },
    {
      name: "Nikah Ceremony",
      date: "18 Dec 2026",
      time: "11:30 AM",
      venue: "Grand Noor Mahal",
    },
    {
      name: "Walima Feast",
      date: "19 Dec 2026",
      time: "7:30 PM",
      venue: "Imperial Lawn",
    },
  ],
  venueName: "Grand Noor Mahal Banquet",
  venueAddress: "Palace Road, Civil Lines",
  venueCity: "Udaipur & Mumbai",
  rsvpText: "With blessings from The Khan & Shaikh Families",
  brandUrl: "mehfill.in",
};

/**
 * MF-VIDEO-001: Royal Nikah & Luxury Wedding Invitation Video
 * Total Duration: 30 seconds @ 30fps = 900 frames
 * - Scene 1: Opening & Couple Names (0 - 240 frames = 8s)
 * - Scene 2: Multi-event Schedule (240 - 510 frames = 9s)
 * - Scene 3: Royal Venue & Location (510 - 720 frames = 7s)
 * - Scene 4: Blessings & Closing RSVP (720 - 900 frames = 6s)
 */
export const WeddingInvitationVideo: React.FC<WeddingVideoProps> = (rawProps) => {
  const groomName = rawProps.groomName || DEFAULT_VIDEO_PROPS.groomName!;
  const brideName = rawProps.brideName || DEFAULT_VIDEO_PROPS.brideName!;
  const weddingDate = rawProps.weddingDate || DEFAULT_VIDEO_PROPS.weddingDate!;
  const bismillah = rawProps.bismillah ?? DEFAULT_VIDEO_PROPS.bismillah;
  const events = rawProps.events || DEFAULT_VIDEO_PROPS.events || [];
  const venueName = rawProps.venueName || DEFAULT_VIDEO_PROPS.venueName!;
  const venueAddress = rawProps.venueAddress || DEFAULT_VIDEO_PROPS.venueAddress!;
  const venueCity = rawProps.venueCity || DEFAULT_VIDEO_PROPS.venueCity!;
  const rsvpText = rawProps.rsvpText || DEFAULT_VIDEO_PROPS.rsvpText;
  const brandUrl = rawProps.brandUrl || DEFAULT_VIDEO_PROPS.brandUrl;

  return (
    <AbsoluteFill style={{ backgroundColor: "#fdf9f0" }}>
      {/* Scene 1: Opening (0 to 8s) */}
      <Sequence from={0} durationInFrames={240}>
        <Scene1Opening
          groomName={groomName}
          brideName={brideName}
          weddingDate={weddingDate}
          bismillah={bismillah}
        />
      </Sequence>

      {/* Scene 2: Celebration Events (8s to 17s) */}
      <Sequence from={240} durationInFrames={270}>
        <Scene2Events
          events={events}
          groomName={groomName}
          brideName={brideName}
        />
      </Sequence>

      {/* Scene 3: Venue & Map details (17s to 24s) */}
      <Sequence from={510} durationInFrames={210}>
        <Scene3Venue
          venueName={venueName}
          venueAddress={venueAddress}
          venueCity={venueCity}
          groomName={groomName}
          brideName={brideName}
          mainDate={weddingDate}
        />
      </Sequence>

      {/* Scene 4: Closing RSVP (24s to 30s) */}
      <Sequence from={720} durationInFrames={180}>
        <Scene4Closing
          groomName={groomName}
          brideName={brideName}
          weddingDate={weddingDate}
          rsvpText={rsvpText}
          brandUrl={brandUrl}
        />
      </Sequence>
    </AbsoluteFill>
  );
};
