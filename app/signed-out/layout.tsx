import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Signed out — Mehfill",
  robots: { index: false, follow: false },
};

export default function SignedOutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
