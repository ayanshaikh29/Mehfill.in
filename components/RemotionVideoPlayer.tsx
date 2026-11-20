"use client";

import React, { useState } from "react";
import { Player } from "@remotion/player";
import {
  WeddingInvitationVideo,
  DEFAULT_VIDEO_PROPS,
  WeddingVideoProps,
} from "@/remotion/video/WeddingInvitationVideo";
import { Play, RotateCcw, Sparkles, MessageCircle, Sliders, Check } from "lucide-react";
import { waLink } from "@/lib/contact";

const PRESETS: Record<string, WeddingVideoProps> = {
  royal_nikah: {
    ...DEFAULT_VIDEO_PROPS,
    groomName: "Aariz",
    brideName: "Zoya",
    weddingDate: "Friday, 18 December 2026",
    bismillah: true,
    venueName: "Grand Noor Mahal Banquet",
    venueAddress: "Palace Road, Civil Lines",
    venueCity: "Udaipur & Mumbai",
    rsvpText: "With heartfelt blessings from The Khan & Shaikh Families",
  },
  jaipur_royal: {
    groomName: "Rahul",
    brideName: "Priya",
    weddingDate: "Sunday, 25 November 2026",
    bismillah: false,
    events: [
      { name: "Haldi & Phoolon Ki Holi", date: "24 Nov", time: "10:30 AM", venue: "Haveli Lawn" },
      { name: "Sangeet & Cocktail", date: "24 Nov", time: "7:00 PM", venue: "Royal Courtyard" },
      { name: "Shubh Vivah", date: "25 Nov", time: "6:30 PM", venue: "The Leela Mandap" },
    ],
    venueName: "The Leela Palace Heritage Mandap",
    venueAddress: "Lake Pichola Amber Enclave",
    venueCity: "Jaipur, Rajasthan",
    rsvpText: "Warmly invited by Sen & Sharma Families",
    brandUrl: "mehfill.in",
  },
  modern_ivory: {
    groomName: "Kabir",
    brideName: "Tanvi",
    weddingDate: "Saturday, 12 December 2026",
    bismillah: false,
    events: [
      { name: "Ring Ceremony", date: "11 Dec", time: "5:00 PM", venue: "Terrace Garden" },
      { name: "Wedding & Vows", date: "12 Dec", time: "4:00 PM", venue: "Grand Ballroom" },
      { name: "Black-Tie Reception", date: "12 Dec", time: "8:00 PM", venue: "Glass Pavilion" },
    ],
    venueName: "The St. Regis Grand Pavilion",
    venueAddress: "Lower Parel Penthouse Ballroom",
    venueCity: "Mumbai, Maharashtra",
    rsvpText: "Kindly RSVP via WhatsApp by 1 Dec",
    brandUrl: "mehfill.in",
  },
};

export default function RemotionVideoPlayer() {
  const [props, setProps] = useState<WeddingVideoProps>(DEFAULT_VIDEO_PROPS);
  const [activePreset, setActivePreset] = useState("royal_nikah");
  const [copied, setCopied] = useState(false);

  const applyPreset = (key: string) => {
    setActivePreset(key);
    if (PRESETS[key]) {
      setProps(PRESETS[key]);
    }
  };

  const whatsappMessage = `Hi Mehfill! I loved the video invitation template (MF-VIDEO-001) for ${props.groomName} & ${props.brideName} on ${props.weddingDate}. I would like to get my full customized HD video invitation with music and photos!`;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Phone Mockup Frame with Remotion Player */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="relative w-full max-w-[360px] mx-auto">
            {/* Phone Bezel */}
            <div className="relative rounded-[3.4rem] p-[10px] bg-gradient-to-b from-[#3a3530] via-[#1f1d1b] to-[#121110] shadow-[0_25px_60px_rgba(20,16,12,0.35),0_0_0_1px_rgba(255,255,255,0.12)]">
              {/* Dynamic Island / Notch */}
              <div className="absolute top-3.5 left-1/2 -translate-x-1/2 z-30 h-[18px] w-[80px] rounded-full bg-black shadow-inner pointer-events-none" />

              {/* Player Screen */}
              <div
                className="relative w-full overflow-hidden rounded-[2.6rem] bg-[#0c0a09] shadow-inner"
                style={{ aspectRatio: "9 / 16" }}
              >
                <Player
                  component={WeddingInvitationVideo as React.ComponentType<WeddingVideoProps>}
                  inputProps={props}
                  durationInFrames={900}
                  compositionWidth={1080}
                  compositionHeight={1920}
                  fps={30}
                  style={{
                    width: "100%",
                    height: "100%",
                  }}
                  controls
                  loop
                  autoPlay
                />
              </div>

              {/* Bottom Home Indicator Bar */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-30 h-1 w-24 rounded-full bg-white/40 pointer-events-none" />
            </div>

            {/* Live Indicator Pill */}
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-charcoal/60">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Live 60fps Code Animation Engine • Instant Preview</span>
            </div>
          </div>
        </div>

        {/* Right Column: Customizer & Order Actions */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Header */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-terracotta/10 text-terracotta font-semibold text-xs tracking-wider uppercase mb-3">
              <Sparkles className="w-3.5 h-3.5" /> MF-VIDEO-001 • Royal Motion Edition
            </div>
            <h1 className="font-serif font-light text-3xl sm:text-4xl text-charcoal tracking-tight">
              Cinematic Digital Wedding Invitation Video
            </h1>
            <p className="mt-2 text-charcoal/70 text-sm sm:text-base leading-relaxed">
              Real-time programmatic video rendered with Remotion. Change names, dates and events below to instantly watch the video update live.
            </p>
          </div>

          {/* Quick Presets */}
          <div className="bg-white/80 backdrop-blur rounded-2xl p-5 border hairline">
            <label className="block text-xs font-bold uppercase tracking-widest text-charcoal/60 mb-3">
              Select Preset Theme
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                { id: "royal_nikah", label: "Royal Nikah (Urdu / Arabic)", sub: "Aariz & Zoya" },
                { id: "jaipur_royal", label: "Jaipur Mandap Heritage", sub: "Rahul & Priya" },
                { id: "modern_ivory", label: "Ivory Modern Reception", sub: "Kabir & Tanvi" },
              ].map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => applyPreset(preset.id)}
                  className={`text-left p-3 rounded-xl border transition-all ${
                    activePreset === preset.id
                      ? "border-terracotta bg-terracotta/5 shadow-sm text-charcoal"
                      : "border-black/5 hover:border-black/15 bg-white text-charcoal/70"
                  }`}
                >
                  <div className="font-serif text-sm font-semibold text-charcoal">
                    {preset.label}
                  </div>
                  <div className="text-xs text-charcoal/50 mt-0.5">{preset.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Customization Form */}
          <div className="bg-white rounded-2xl p-6 border hairline space-y-4">
            <div className="flex items-center justify-between pb-2 border-b hairline">
              <div className="flex items-center gap-2 text-sm font-bold text-charcoal">
                <Sliders className="w-4 h-4 text-terracotta" /> Live Video Personalization
              </div>
              <button
                type="button"
                onClick={() => applyPreset(activePreset)}
                className="text-xs text-charcoal/50 hover:text-charcoal inline-flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal/70 mb-1">
                  Groom Name
                </label>
                <input
                  type="text"
                  value={props.groomName}
                  onChange={(e) => setProps({ ...props, groomName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border hairline bg-sand/30 text-sm font-serif text-charcoal focus:outline-none focus:ring-1 focus:ring-terracotta"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal/70 mb-1">
                  Bride Name
                </label>
                <input
                  type="text"
                  value={props.brideName}
                  onChange={(e) => setProps({ ...props, brideName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border hairline bg-sand/30 text-sm font-serif text-charcoal focus:outline-none focus:ring-1 focus:ring-terracotta"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal/70 mb-1">
                  Main Wedding Date
                </label>
                <input
                  type="text"
                  value={props.weddingDate}
                  onChange={(e) => setProps({ ...props, weddingDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border hairline bg-sand/30 text-sm text-charcoal focus:outline-none focus:ring-1 focus:ring-terracotta"
                />
              </div>

              <div className="flex flex-col justify-end">
                <label className="flex items-center gap-2 cursor-pointer py-2.5 px-3 rounded-xl border hairline bg-sand/20 hover:bg-sand/40">
                  <input
                    type="checkbox"
                    checked={props.bismillah}
                    onChange={(e) => setProps({ ...props, bismillah: e.target.checked })}
                    className="rounded text-terracotta focus:ring-terracotta h-4 w-4"
                  />
                  <span className="text-xs font-medium text-charcoal/80">
                    Include Bismillah Calligraphy
                  </span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal/70 mb-1">
                  Venue Name
                </label>
                <input
                  type="text"
                  value={props.venueName}
                  onChange={(e) => setProps({ ...props, venueName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border hairline bg-sand/30 text-sm text-charcoal focus:outline-none focus:ring-1 focus:ring-terracotta"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal/70 mb-1">
                  City / Location
                </label>
                <input
                  type="text"
                  value={props.venueCity}
                  onChange={(e) => setProps({ ...props, venueCity: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border hairline bg-sand/30 text-sm text-charcoal focus:outline-none focus:ring-1 focus:ring-terracotta"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal/70 mb-1">
                Family Blessings / RSVP Note
              </label>
              <input
                type="text"
                value={props.rsvpText || ""}
                onChange={(e) => setProps({ ...props, rsvpText: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border hairline bg-sand/30 text-sm text-charcoal focus:outline-none focus:ring-1 focus:ring-terracotta"
              />
            </div>
          </div>

          {/* CTAs & Order actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <a
              href={waLink(whatsappMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-all shadow-md hover:shadow-lg"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Order Full HD Video on WhatsApp (₹1,499)</span>
            </a>

            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full border hairline bg-white hover:bg-sand/30 text-charcoal font-semibold text-sm transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Play className="w-4 h-4 text-terracotta" />}
              <span>{copied ? "Link Copied!" : "Share Live Preview"}</span>
            </button>
          </div>

          <div className="rounded-xl p-4 bg-champagne/10 border border-champagne/20 text-xs text-charcoal/70 leading-relaxed">
            <strong className="text-charcoal font-semibold">How it works:</strong> In the live preview, Remotion renders individual layers (floral borders, 3D particles, calligraphy, typography and transitions) using code. When you place an order, our studio renders the final crisp 1080×1920 MP4 with your custom background shehnai/song, ready to forward directly to family groups on WhatsApp and Instagram!
          </div>
        </div>
      </div>
    </div>
  );
}
