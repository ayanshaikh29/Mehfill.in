"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Eye, EyeOff, Lock, Shield } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

function AdminLoginInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const configured = isSupabaseConfigured();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (!email.trim()) { setErr("Email is required"); return; }
    if (!password) { setErr("Password is required"); return; }

    setBusy(true);
    try {
      const supabase = createClient();
      const { error, data } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      
      // Check if user is admin
      const isAdmin = data.user?.email && ["youremail@gmail.com"].includes(data.user.email.toLowerCase());
      if (!isAdmin) {
        await supabase.auth.signOut();
        setErr("Access denied. Admin only.");
        return;
      }
      router.push(callbackUrl);
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Invalid credentials");
    } finally {
      setBusy(false);
    }
  };

  if (!configured) {
    return (
      <main className="min-h-screen bg-charcoal text-ivory flex flex-col">
        <div className="mx-auto w-full max-w-7xl px-5 md:px-8 py-5">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-ivory/70 hover:text-ivory">
            <ArrowLeft className="h-4 w-4" /> Back to Site
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center px-5 pb-20">
          <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 md:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.3)] text-center">
            <Shield className="mx-auto h-10 w-10 text-champagne" />
            <p className="mt-4 font-serif text-3xl">Mehfill<span className="text-champagne">.in</span></p>
            <p className="mt-2 text-sm text-ivory/55">Admin Studio</p>
            <p className="mt-6 rounded-2xl bg-white/10 px-5 py-4 text-sm text-ivory/80">
              Supabase not configured. Add keys to .env.local to enable admin access.
            </p>
            <Link href="/" className="mt-6 inline-flex items-center gap-2 rounded-full bg-ivory px-7 py-3.5 text-sm font-bold text-charcoal hover:bg-champagne-light">
              <ArrowLeft className="h-4 w-4" /> Back to Site
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-charcoal text-ivory flex flex-col">
      <div className="mx-auto w-full max-w-7xl px-5 md:px-8 py-5">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-ivory/70 hover:text-ivory">
          <ArrowLeft className="h-4 w-4" /> Back to Site
        </Link>
      </div>
      <div className="flex flex-1 items-center justify-center px-5 pb-20">
        <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 md:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
          <div className="text-center mb-8">
            <Shield className="mx-auto h-10 w-10 text-champagne" />
            <p className="mt-4 font-serif text-3xl">Mehfill<span className="text-champagne">.in</span></p>
            <p className="mt-2 text-sm text-ivory/55">Admin Studio Access</p>
          </div>

          {err && <p className="mb-4 rounded-xl bg-white/10 px-4 py-3 text-sm text-champagne-light">{err}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[12px] font-bold tracking-[0.1em] text-ivory/55 mb-1.5">Admin Email</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@mehfill.in"
                  className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3.5 text-sm outline-none placeholder:text-ivory/35 focus:border-champagne"
                />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-bold tracking-[0.1em] text-ivory/55 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-ivory/35" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-white/15 bg-white/5 pl-12 pr-12 py-3.5 text-sm outline-none placeholder:text-ivory/35 focus:border-champagne"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-ivory/35 hover:text-ivory"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button disabled={busy} className="w-full rounded-full bg-ivory py-3.5 text-sm font-bold text-charcoal hover:bg-champagne-light disabled:opacity-60">
              {busy ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : "Access Studio"}
            </button>
          </form>

          <p className="mt-6 text-center font-serif italic text-ivory/40">Mehfill Admin Studio — Owner Access Only</p>
          <Link href="/" className="mt-4 block text-center text-sm font-semibold text-ivory/60 hover:text-ivory">
            <ArrowLeft className="inline h-3.5 w-3.5" /> Back to Site
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-charcoal text-ivory flex items-center justify-center"><p className="font-serif text-2xl">Loading…</p></div>}>
      <AdminLoginInner />
    </Suspense>
  );
}