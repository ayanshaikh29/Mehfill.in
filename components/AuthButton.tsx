"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { UserRound } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

// Shows "Account" when signed in, "Sign in" otherwise.
export default function AuthButton({ dark = false }: { dark?: boolean }) {
  const [email, setEmail] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setReady(true);
      return;
    }
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      setEmail(data.session?.user?.email ?? null);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setEmail(session?.user?.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!ready) return <span className="w-16" />;

  if (email) {
    return (
      <Link
        href="/dashboard"
        className={`inline-flex items-center gap-1.5 text-[13.5px] font-semibold transition-colors ${
          dark ? "text-ivory/80 hover:text-ivory" : "text-charcoal/70 hover:text-charcoal"
        }`}
      >
        <UserRound className="h-4 w-4" /> Account
      </Link>
    );
  }
  return (
    <Link
      href="/login"
      className={`inline-flex items-center gap-1.5 text-[13.5px] font-semibold transition-colors ${
        dark ? "text-ivory/80 hover:text-ivory" : "text-charcoal/70 hover:text-charcoal"
      }`}
    >
      <UserRound className="h-4 w-4" /> Sign in
    </Link>
  );
}
