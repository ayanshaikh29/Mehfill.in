"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function SignOutButton({ dark = false }: { dark?: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        await createClient().auth.signOut();
        router.push("/");
        router.refresh();
      }}
      className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-bold disabled:opacity-60 ${
        dark ? "bg-ivory text-charcoal hover:bg-champagne-light" : "border hairline hover:border-charcoal/40"
      }`}
    >
      <LogOut className="h-4 w-4" /> {busy ? "Signing out…" : "Sign out"}
    </button>
  );
}
