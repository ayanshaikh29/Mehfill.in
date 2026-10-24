"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Loader2, Eye, EyeOff, Lock, Shield, Mail, ArrowRight } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { safeRedirectPath } from "@/lib/safe-redirect";

export const dynamic = "force-dynamic";

function AdminLoginInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = safeRedirectPath(searchParams.get("callbackUrl"), "/admin");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const configured = isSupabaseConfigured();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (!email.trim()) { setErr("Email is required."); return; }
    if (!password) { setErr("Password is required."); return; }

    setBusy(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      // Server-authoritative admin check
      const me = await fetch("/api/admin/me", { cache: "no-store" }).catch(() => null);
      const meData = me?.ok ? await me.json() : { admin: false };
      if (!meData.admin) {
        await supabase.auth.signOut();
        setErr("Access denied. Admin credentials only.");
        return;
      }
      router.push(callbackUrl);
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Invalid credentials.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-[#FBF7F0] flex flex-col justify-between">
      {/* Background Architectural Palace Atmosphere */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero/auth_palace_bg.jpg"
          alt="Mehfill Palace Courtyard"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_28%] opacity-85 brightness-[1.03]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#FBF7F0]/90 via-[#FBF7F0]/70 to-[#FBF7F0]/85 backdrop-blur-[1px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#FBF7F0]/30 to-[#FBF7F0]/95" />
      </div>

      {/* Floating Gentle Petals */}
      <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden" aria-hidden="true">
        {[
          { left: "10%", size: "12px", duration: "12s", delay: "0s", drift: "35px" },
          { left: "25%", size: "15px", duration: "14s", delay: "3s", drift: "-40px" },
          { left: "55%", size: "11px", duration: "11s", delay: "1.5s", drift: "50px" },
          { left: "80%", size: "14px", duration: "13s", delay: "4s", drift: "-30px" },
        ].map((p, i) => (
          <span
            key={i}
            className="auth-petal"
            style={{
              left: p.left,
              width: p.size,
              height: p.size,
              // @ts-expect-error CSS custom variable
              "--auth-duration": p.duration,
              "--auth-delay": p.delay,
              "--auth-drift": p.drift,
            }}
          />
        ))}
      </div>

      {/* Top Header */}
      <header className="relative z-20 w-full px-6 py-6 md:px-12 flex items-center justify-between">
        <Link href="/" className="inline-block transition-transform hover:scale-[1.02]" aria-label="Mehfill.in Home">
          <span className="relative block w-[124px] sm:w-[144px]" style={{ aspectRatio: "901 / 319" }}>
            <Image
              src="/logo-transparent.png"
              alt="Mehfill.in"
              width={452}
              height={160}
              priority
              className="absolute inset-0 h-full w-full object-contain"
            />
          </span>
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold tracking-wide text-[#7C5A3E] hover:text-[#4A2F1B] transition-colors"
        >
          Back to Site <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </header>

      {/* Admin Card */}
      <div className="relative z-20 flex-1 flex flex-col items-center justify-center px-4 py-6">
        <div className="w-full max-w-[420px] text-center mb-5">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F7EFE4] border border-[#EADBCA] text-[#8B4828] shadow-xs">
            <Shield className="h-6 w-6" />
          </div>
          <span className="inline-block text-[11px] font-bold uppercase tracking-[0.25em] text-[#9E6D4B] mb-1">
            RESTRICTED ACCESS
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-[#2B1F17]">
            Mehfill <span className="italic text-[#8B4828]">Studio Admin.</span>
          </h1>
          <p className="mt-1 text-xs text-[#695343]">
            Owner authentication portal for managing orders, platform invitations, and operations.
          </p>
        </div>

        <div className="w-full max-w-[420px] rounded-[2rem] border border-white/70 bg-white/80 backdrop-blur-xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(110,75,45,0.12)]">
          {err && (
            <div className="mb-4 rounded-xl bg-[#FBECE8] border border-[#F3C4B8] px-3.5 py-2.5 text-left text-xs font-semibold text-[#A63C26]">
              {err}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7A6353] mb-1">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A89484]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@mehfill.in"
                  className="w-full rounded-xl border border-[#DECFC0] bg-white/90 pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-[#2B1F17] outline-none transition-all placeholder:text-[#B5A496] focus:border-[#8B4828] focus:ring-2 focus:ring-[#8B4828]/15"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7A6353] mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A89484]" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-[#DECFC0] bg-white/90 pl-10 pr-10 py-2.5 text-xs sm:text-sm text-[#2B1F17] outline-none transition-all placeholder:text-[#B5A496] focus:border-[#8B4828] focus:ring-2 focus:ring-[#8B4828]/15"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A89484] hover:text-[#4A2F1B]"
                  aria-label="Toggle password view"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="mt-3 w-full flex items-center justify-center gap-2 rounded-xl bg-[#8B4828] py-3 text-xs sm:text-sm font-bold text-white shadow-[0_6px_20px_rgba(139,72,40,0.3)] hover:bg-[#72391F] transition-all disabled:opacity-60"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Access Admin Studio →"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-[#7A6353]">
            Owner authorization only. Unauthorized access attempts are monitored and recorded.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-20 w-full px-6 py-4 flex items-center justify-center text-xs text-[#7A6353]/80 border-t border-[#E8DEC4]/40">
        Mehfill.in · Enterprise Security &amp; Platform Controls
      </footer>
    </main>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FBF7F0] flex items-center justify-center">
          <p className="font-serif text-2xl text-[#8B4828]">Loading admin portal…</p>
        </div>
      }
    >
      <AdminLoginInner />
    </Suspense>
  );
}