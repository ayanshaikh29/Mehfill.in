"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Loader2,
  Mail,
  Lock,
  User,
  Smartphone,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { safeRedirectPath } from "@/lib/safe-redirect";

export const dynamic = "force-dynamic";

function LoginInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = safeRedirectPath(searchParams.get("callbackUrl"), "/dashboard");
  const initialMode = searchParams.get("mode") === "register" ? "register" : "login";

  const [authMethod, setAuthMethod] = useState<"email" | "google">("email");
  const [mode, setMode] = useState<"login" | "register">(initialMode);
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
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotModal, setForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotBusy, setForgotBusy] = useState(false);

  const configured = isSupabaseConfigured();

  const [googleBusy, setGoogleBusy] = useState(false);

  // Read error or status from URL query params (e.g. redirected back from OAuth failure or cancellation)
  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      if (errorParam === "1") {
        setErr("Authentication was cancelled or failed. Please try again.");
      } else {
        setErr(decodeURIComponent(errorParam));
      }
    }
  }, [searchParams]);

  // Keep mode in sync if user changes URL search param
  useEffect(() => {
    if (searchParams.get("mode") === "register") {
      setMode("register");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setSuccess("");

    if (mode === "register") {
      if (!fullName.trim()) { setErr("Please enter your full name."); return; }
      if (!email.trim()) { setErr("Please enter your email address."); return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setErr("Please enter a valid email address."); return; }
      if (!mobile.trim() || mobile.replace(/\D/g, "").length !== 10) { setErr("Please enter a valid 10-digit mobile number."); return; }
      if (password.length < 6) { setErr("Password must be at least 6 characters."); return; }
      if (password !== confirmPassword) { setErr("Passwords do not match."); return; }
    } else {
      if (!email.trim()) { setErr("Please enter your email address."); return; }
      if (!password) { setErr("Please enter your password."); return; }
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
        // Auto-confirm the email server-side for immediate access
        if (signData.user?.id) {
          try {
            await fetch("/api/confirm-user", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userId: signData.user.id }),
            });
          } catch {
            /* fallthrough */
          }
        }
        const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
        if (loginError) {
          setSuccess("Account created successfully! Please sign in.");
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
      setErr(e instanceof Error ? e.message : "Authentication failed. Please check your credentials.");
    } finally {
      setBusy(false);
    }
  };

  const handleGoogle = async () => {
    setErr("");
    setGoogleBusy(true);
    try {
      const supabase = createClient();
      const redirectUri = `${window.location.origin}/auth/callback?next=${encodeURIComponent(callbackUrl)}`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUri,
          queryParams: {
            access_type: "offline",
            prompt: "select_account",
          },
        },
      });
      if (error) throw error;
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Google sign in failed. Please try again.");
      setGoogleBusy(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setForgotBusy(true);
    try {
      const supabase = createClient();
      await supabase.auth.resetPasswordForEmail(forgotEmail.trim(), {
        redirectTo: `${window.location.origin}/login?mode=reset`,
      });
      setForgotSent(true);
    } catch {
      setForgotSent(true);
    } finally {
      setForgotBusy(false);
    }
  };

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-[#FBF7F0] flex flex-col justify-between">
      {/* Background Architectural Palace Image with Soft Fade */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero/auth_palace_bg.jpg"
          alt="Mehfill Palace Courtyard"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_28%] opacity-90 brightness-[1.03]"
        />
        {/* Warm luxury subtle vignette & radial gradient so text remains ultra-legible */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#FBF7F0]/85 via-[#FBF7F0]/65 to-[#FBF7F0]/80 backdrop-blur-[1px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#FBF7F0]/30 to-[#FBF7F0]/95" />
      </div>

      {/* Floating Gentle Petals */}
      <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden" aria-hidden="true">
        {[
          { left: "8%", size: "12px", duration: "12s", delay: "0s", drift: "35px" },
          { left: "22%", size: "15px", duration: "14s", delay: "3s", drift: "-40px" },
          { left: "45%", size: "11px", duration: "11s", delay: "1.5s", drift: "50px" },
          { left: "68%", size: "14px", duration: "13s", delay: "4s", drift: "-30px" },
          { left: "85%", size: "13px", duration: "15s", delay: "2s", drift: "45px" },
          { left: "92%", size: "10px", duration: "10s", delay: "5s", drift: "-25px" },
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
          Back to Home <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </header>

      {/* Main Content Card Container */}
      <div className="relative z-20 flex-1 flex flex-col items-center justify-center px-4 py-4 sm:py-8">
        <div className="w-full max-w-[440px] text-center mb-5">
          <span className="inline-block text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.25em] text-[#9E6D4B] mb-1">
            {mode === "login" ? "WELCOME BACK" : "JOIN THE CELEBRATION"}
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-[2.6rem] font-normal tracking-tight text-[#2B1F17] leading-[1.18]">
            {mode === "login" ? (
              <>
                Welcome back <br className="hidden sm:inline" />
                to <span className="font-normal italic text-[#8B4828]">Mehfill.</span>
              </>
            ) : (
              <>
                Begin your <br className="hidden sm:inline" />
                forever with <span className="font-normal italic text-[#8B4828]">Mehfill.</span>
              </>
            )}
          </h1>
          <p className="mt-2 text-xs sm:text-[13px] text-[#695343] leading-relaxed max-w-sm mx-auto">
            {mode === "login"
              ? "Sign in to continue creating and managing your beautiful digital invitations."
              : "Create your account in seconds to personalize handcrafted wedding invitation websites."}
          </p>
        </div>

        {/* Glassmorphism Card Matching User's Design Exactly */}
        <div className="w-full max-w-[430px] rounded-[2rem] border border-white/70 bg-white/75 backdrop-blur-xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(110,75,45,0.12)]">
          {/* Prominent Continue with Google Button */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={googleBusy || busy}
            className="w-full mb-4 flex items-center justify-center gap-2.5 rounded-xl border border-[#DECFC0] bg-white py-2.5 px-4 text-xs sm:text-sm font-semibold text-[#2B1F17] shadow-sm transition-all hover:bg-[#FDFBF7] hover:border-[#96522F]/40 active:scale-[0.99] disabled:opacity-60"
          >
            {googleBusy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-[#8B4828]" />
                <span>Connecting to Google…</span>
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" aria-hidden="true">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>

          <div className="relative flex py-1 items-center mb-4">
            <div className="flex-grow border-t border-[#E8DEC4]"></div>
            <span className="flex-shrink mx-3 text-[11px] font-semibold text-[#876F5E] uppercase tracking-wider">
              or with email
            </span>
            <div className="flex-grow border-t border-[#E8DEC4]"></div>
          </div>

          {err && (
            <div className="mb-4 rounded-xl bg-[#FBECE8] border border-[#F3C4B8] px-3.5 py-2.5 text-left text-xs font-medium text-[#A63C26]">
              {err}
            </div>
          )}
          {success && (
            <div className="mb-4 rounded-xl bg-[#EDF5E9] border border-[#C5E1BB] px-3.5 py-2.5 text-left text-xs font-medium text-[#2F6824]">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5 text-left">
            {mode === "register" && (
              <>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7A6353] mb-1">
                    Full name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A89484]" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Aarav Sharma"
                      className="w-full rounded-xl border border-[#DECFC0] bg-white/90 pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-[#2B1F17] outline-none transition-all placeholder:text-[#B5A496] focus:border-[#96522F] focus:ring-2 focus:ring-[#96522F]/15"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7A6353] mb-1">
                    WhatsApp mobile
                  </label>
                  <div className="relative">
                    <Smartphone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A89484]" />
                    <input
                      type="tel"
                      required
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      placeholder="10-digit mobile number"
                      maxLength={10}
                      inputMode="numeric"
                      className="w-full rounded-xl border border-[#DECFC0] bg-white/90 pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-[#2B1F17] outline-none transition-all placeholder:text-[#B5A496] focus:border-[#96522F] focus:ring-2 focus:ring-[#96522F]/15"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7A6353] mb-1">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A89484]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-[#DECFC0] bg-white/90 pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-[#2B1F17] outline-none transition-all placeholder:text-[#B5A496] focus:border-[#96522F] focus:ring-2 focus:ring-[#96522F]/15"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7A6353]">
                  Password
                </label>
                {mode === "login" && (
                  <button
                    type="button"
                    onClick={() => { setForgotModal(true); setForgotEmail(email); }}
                    className="text-[11px] font-semibold text-[#8B4828] hover:text-[#5B2E18] transition-colors"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A89484]" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  minLength={6}
                  className="w-full rounded-xl border border-[#DECFC0] bg-white/90 pl-10 pr-10 py-2.5 text-xs sm:text-sm text-[#2B1F17] outline-none transition-all placeholder:text-[#B5A496] focus:border-[#96522F] focus:ring-2 focus:ring-[#96522F]/15"
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

            {mode === "register" && (
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7A6353] mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A89484]" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    minLength={6}
                    className="w-full rounded-xl border border-[#DECFC0] bg-white/90 pl-10 pr-10 py-2.5 text-xs sm:text-sm text-[#2B1F17] outline-none transition-all placeholder:text-[#B5A496] focus:border-[#96522F] focus:ring-2 focus:ring-[#96522F]/15"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A89484] hover:text-[#4A2F1B]"
                    aria-label="Toggle confirm password view"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Primary Action Button */}
            <button
              type="submit"
              disabled={busy}
              className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl bg-[#8B4828] py-3 text-xs sm:text-sm font-bold text-white shadow-[0_6px_20px_rgba(139,72,40,0.32)] transition-all hover:bg-[#72391F] hover:shadow-[0_8px_24px_rgba(139,72,40,0.4)] active:scale-[0.99] disabled:opacity-60"
            >
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  {mode === "login" ? "Sign In →" : "Create Account →"}
                </>
              )}
            </button>
          </form>

          {/* Toggle between Login and Register */}
          <div className="mt-5 text-center text-xs text-[#7A6353]">
            {mode === "login" ? (
              <>
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => { setMode("register"); setErr(""); setSuccess(""); }}
                  className="font-bold text-[#8B4828] hover:underline"
                >
                  Create one
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => { setMode("login"); setErr(""); setSuccess(""); }}
                  className="font-bold text-[#8B4828] hover:underline"
                >
                  Sign In
                </button>
              </>
            )}
          </div>
        </div>

        {/* Legal Disclaimer */}
        <p className="mt-4 text-[11px] text-[#7A6353]/90 text-center">
          By continuing, you agree to our{" "}
          <Link href="/terms-and-conditions" className="underline hover:text-[#4A2F1B]">Terms of Service</Link>
          {" "}and{" "}
          <Link href="/privacy-policy" className="underline hover:text-[#4A2F1B]">Privacy Policy</Link>
        </p>
      </div>

      {/* Footer Navigation */}
      <footer className="relative z-20 w-full px-6 py-4 flex flex-wrap items-center justify-center gap-6 text-xs text-[#7A6353]/80 border-t border-[#E8DEC4]/40">
        <Link href="/privacy-policy" className="hover:text-[#4A2F1B] transition-colors">Privacy Policy</Link>
        <span>·</span>
        <Link href="/terms-and-conditions" className="hover:text-[#4A2F1B] transition-colors">Terms of Service</Link>
        <span>·</span>
        <Link href="/contact" className="hover:text-[#4A2F1B] transition-colors">Contact Us</Link>
      </footer>

      {/* Forgot Password Modal */}
      {forgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl text-left border border-[#DECFC0]">
            <h3 className="font-serif text-2xl text-[#2B1F17]">Reset Password</h3>
            <p className="mt-1 text-xs text-[#695343]">
              Enter your registered email and we will send you a password recovery link.
            </p>
            {forgotSent ? (
              <div className="mt-4">
                <p className="rounded-xl bg-[#EDF5E9] p-3 text-xs text-[#2F6824]">
                  Password reset link sent! Check your email inbox.
                </p>
                <button
                  onClick={() => { setForgotModal(false); setForgotSent(false); }}
                  className="mt-4 w-full rounded-xl bg-[#8B4828] py-2.5 text-xs font-bold text-white"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="mt-4 space-y-3">
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-[#DECFC0] px-3.5 py-2 text-xs outline-none focus:border-[#96522F]"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setForgotModal(false)}
                    className="flex-1 rounded-xl border border-[#DECFC0] py-2 text-xs font-semibold text-[#695343]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotBusy}
                    className="flex-1 rounded-xl bg-[#8B4828] py-2 text-xs font-bold text-white"
                  >
                    {forgotBusy ? "Sending…" : "Send Link"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FBF7F0] flex items-center justify-center">
          <p className="font-serif text-2xl text-[#8B4828]">Loading…</p>
        </div>
      }
    >
      <LoginInner />
    </Suspense>
  );
}