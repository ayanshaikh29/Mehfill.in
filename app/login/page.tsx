"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Eye, EyeOff, Mail, Lock, User, Smartphone } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

function LoginInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");
  const configured = isSupabaseConfigured();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setSuccess("");
    
    if (mode === "register") {
      if (!fullName.trim()) { setErr("Full name is required"); return; }
      if (!email.trim()) { setErr("Email is required"); return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setErr("Invalid email"); return; }
      if (!mobile.trim() || mobile.replace(/\D/g, "").length !== 10) { setErr("Enter valid 10-digit mobile"); return; }
      if (password.length < 6) { setErr("Password must be at least 6 characters"); return; }
      if (password !== confirmPassword) { setErr("Passwords do not match"); return; }
    } else {
      if (!email.trim()) { setErr("Email is required"); return; }
      if (!password) { setErr("Password is required"); return; }
    }

    setBusy(true);
    try {
      const supabase = createClient();
      
      if (mode === "register") {
        const { data: signData, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName, mobile },
          },
        });
        if (error) throw error;
        // Auto-confirm the email server-side (no verification mail needed).
        if (signData.user?.id) {
          try {
            await fetch("/api/confirm-user", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userId: signData.user.id }),
            });
          } catch {
            // Fall through to normal sign-in attempt.
          }
        }
        // No verification mail — sign in straight away.
        const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
        if (loginError) {
          setSuccess("Account created! Please sign in.");
          setMode("login");
          return;
        }
        router.push(callbackUrl);
        router.refresh();
        return;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const handleGoogle = async () => {
    setErr("");
    setBusy(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback?next=${callbackUrl}` },
      });
      if (error) throw error;
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Google sign-in failed");
      setBusy(false);
    }
  };

  if (!configured) {
    return (
      <main className="min-h-screen bg-ivory flex flex-col">
        <div className="mx-auto w-full max-w-7xl px-5 md:px-8 py-5">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-charcoal/70 hover:text-charcoal">
            <ArrowLeft className="h-4 w-4" /> Back to Mehfill
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center px-5 pb-20">
          <div className="w-full max-w-md rounded-[2rem] border hairline bg-white p-8 md:p-10 shadow-[0_20px_60px_rgba(28,25,23,0.08)] text-center">
            <p className="font-serif text-3xl">Mehfill<span className="text-terracotta">.in</span></p>
            <p className="mt-6 rounded-2xl bg-cream px-5 py-4 text-sm text-charcoal/70">
              Auth is not connected yet — Supabase keys missing. The site works fully without it.
            </p>
            <Link href="/" className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-charcoal px-7 py-3.5 text-sm font-semibold text-ivory hover:bg-espresso">
              Continue to site <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-ivory flex flex-col">
      <div className="mx-auto w-full max-w-7xl px-5 md:px-8 py-5">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-charcoal/70 hover:text-charcoal">
          <ArrowLeft className="h-4 w-4" /> Back to Mehfill
        </Link>
      </div>
      <div className="flex flex-1 items-center justify-center px-5 pb-20">
        <div className="w-full max-w-md rounded-[2rem] border hairline bg-white p-8 md:p-10 shadow-[0_20px_60px_rgba(28,25,23,0.08)]">
          <p className="font-serif text-3xl">Mehfill<span className="text-terracotta">.in</span></p>
          <h1 className="mt-3 font-serif font-light text-4xl">{mode === "login" ? "Welcome back." : "Create your account."}</h1>
          <p className="mt-2 text-sm text-charcoal/60">{mode === "login" ? "Sign in to access your dashboard and designs." : "Join Mehfill to create beautiful invitations."}</p>

          {err && <p className="mt-4 rounded-xl bg-terracotta/10 px-4 py-3 text-sm text-terracotta-deep">{err}</p>}
          {success && <p className="mt-4 rounded-xl bg-olive/10 px-4 py-3 text-sm text-olive">{success}</p>}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {mode === "register" && (
              <>
                <div>
                  <label className="block text-[12px] font-bold tracking-[0.1em] text-charcoal/55 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full rounded-2xl border hairline bg-white px-4 py-3.5 text-sm outline-none focus:border-terracotta"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-bold tracking-[0.1em] text-charcoal/55 mb-1.5">Mobile Number</label>
                  <div className="relative">
                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal/40" />
                    <input
                      type="tel"
                      required
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      placeholder="10-digit mobile number"
                      inputMode="numeric"
                      maxLength={10}
                      className="w-full rounded-2xl border hairline bg-white pl-12 pr-4 py-3.5 text-sm outline-none focus:border-terracotta"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-[12px] font-bold tracking-[0.1em] text-charcoal/55 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal/40" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-2xl border hairline bg-white pl-12 pr-4 py-3.5 text-sm outline-none focus:border-terracotta"
                />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-bold tracking-[0.1em] text-charcoal/55 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal/40" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                  className="w-full rounded-2xl border hairline bg-white pl-12 pr-12 py-3.5 text-sm outline-none focus:border-terracotta"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal/40 hover:text-charcoal"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {mode === "register" && (
              <div>
                <label className="block text-[12px] font-bold tracking-[0.1em] text-charcoal/55 mb-1.5">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal/40" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-2xl border hairline bg-white pl-12 pr-12 py-3.5 text-sm outline-none focus:border-terracotta"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal/40 hover:text-charcoal"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}

            <button
              disabled={busy}
              className="w-full rounded-full bg-charcoal py-3.5 text-sm font-bold text-ivory hover:bg-espresso disabled:opacity-60"
            >
              {busy ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : (mode === "login" ? "Sign In" : "Create Account")}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3 text-[12px] font-bold tracking-[0.2em] text-charcoal/40">
            <span className="h-px flex-1 bg-charcoal/10" /> OR <span className="h-px flex-1 bg-charcoal/10" />
          </div>

          <button
            onClick={handleGoogle}
            disabled={busy}
            className="w-full flex items-center justify-center gap-3 rounded-full border hairline py-3.5 text-sm font-bold hover:border-charcoal/40 disabled:opacity-60"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
              <path fill="#fff" d="M21.35 11.1H12v2.9h5.35c-.5 2.4-2.55 3.5-5.35 3.5a5.9 5.9 0 0 1 0-11.8c1.5 0 2.85.55 3.9 1.45l2.1-2.1A8.9 8.9 0 0 0 12 2a9 9 0 0 0 0 18c5.2 0 8.65-3.65 8.65-8.8 0-.35-.05-.75-.3-1.1z" />
            </svg>
            Continue with Google
          </button>

          <p className="mt-6 text-center text-sm text-charcoal/60">
            {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={() => { setMode(mode === "login" ? "register" : "login"); setErr(""); setSuccess(""); }}
              className="font-semibold text-terracotta hover:underline"
            >
              {mode === "login" ? "Sign up" : "Sign in"}
            </button>
          </p>
          <p className="mt-6 text-center font-serif italic text-charcoal/50">More Than an Invitation. An Experience.</p>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-ivory flex items-center justify-center"><p className="font-serif text-2xl">Loading…</p></div>}>
      <LoginInner />
    </Suspense>
  );
}