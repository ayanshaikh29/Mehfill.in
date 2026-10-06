"use client";
import { useEffect, useState } from "react";

// Email address assembled client-side so scrapers parsing static HTML
// never see a harvestable plain-text address (SEO "Email Privacy" check).
// Rendered as a <button> — no mailto: link exists anywhere in the markup,
// even after hydration. Humans see the full address; clicking opens mail.
const USER = "mehfill.in029";
const DOMAIN = "gmail.com";

export default function EmailLink({
  className = "",
}: {
  className?: string;
}) {
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    setAddress(`${USER}@${DOMAIN}`);
  }, []);

  if (!address) {
    // SSR + pre-hydration output: no email string anywhere in the HTML.
    return (
      <span className={className} aria-label="Email us">
        Email us
      </span>
    );
  }

  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        window.location.href = `mailto:${USER}@${DOMAIN}`;
      }}
    >
      {address}
    </button>
  );
}
