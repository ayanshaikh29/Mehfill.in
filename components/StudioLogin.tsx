"use client";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function StudioLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const passwordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setErr(error.message);
      else window.location.reload();
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-charcoal text-ivory flex items-center justify-center px-5">
      <div className="w-full max-w-sm rounded-[2rem] border border-white/10 bg-white/[0.04] p-8">
        <p className="text-[11px] font-bold tracking-[0.3em] text-champagne">MEHFILL · STUDIO</p>
        <h1 className="mt-3 font-serif font-light text-4xl">Owner access.</h1>
        <p className="mt-2 text-sm text-ivory/55">This page is private and unlisted.</p>
        <form onSubmit={passwordLogin} className="mt-6 flex flex-col gap-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Owner email"
            className="rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm outline-none placeholder:text-ivory/35 focus:border-champagne"
          />
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm outline-none placeholder:text-ivory/35 focus:border-champagne"
          />
          <button disabled={busy} className="rounded-full bg-ivory py-3 text-sm font-bold text-charcoal hover:bg-champagne-light disabled:opacity-60">
            {busy ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : "Enter Studio"}
          </button>
        </form>
        {err && <p className="mt-4 text-sm text-champagne-light">{err}</p>}
      </div>
    </main>
  );
}
