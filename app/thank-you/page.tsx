"use client";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, ArrowRight, Copy, Check, Eye, Share2, Sparkles, Loader2, Heart } from "lucide-react";
import { WhatsAppIcon } from "@/components/BrandIcons";
import { waLink } from "@/lib/contact";
import { formatINR } from "@/lib/plans";

interface OrderStatusData {
  order: {
    id: number;
    package: string;
    amount: number;
    currency: string;
    status: string;
    isPaid: boolean;
    createdAt: string;
  } | null;
  invitation: {
    id: string;
    package: string;
    templateSlug: string;
    slug: string | null;
    status: string;
    isPublished: boolean;
    coupleTitle: string | null;
    publicUrl: string | null;
  } | null;
}

function CelebrationAnimation() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Floating confetti dots */}
      <span className="absolute top-10 left-[15%] h-3 w-3 rounded-full bg-[#E0A96D] animate-ping opacity-75" />
      <span className="absolute top-20 right-[18%] h-2.5 w-2.5 rounded-full bg-[#8B4828] animate-bounce opacity-80" />
      <span className="absolute top-1/3 left-[10%] h-3.5 w-3.5 rounded-full bg-[#2F6824] animate-pulse opacity-70" />
      <span className="absolute top-1/4 right-[12%] h-2 w-2 rounded-full bg-[#D4AF37] animate-ping opacity-90" />
      <span className="absolute bottom-1/4 left-[14%] h-2.5 w-2.5 rounded-full bg-[#C2593F] animate-bounce opacity-75" />
      <span className="absolute bottom-1/3 right-[15%] h-3 w-3 rounded-full bg-[#E0A96D] animate-pulse opacity-80" />
    </div>
  );
}

function Content() {
  const params = useSearchParams();
  const orderParam = params.get("order") || "";
  const invitationIdParam = params.get("invitationId") || "";

  const [loading, setLoading] = useState(Boolean(orderParam || invitationIdParam));
  const [data, setData] = useState<OrderStatusData | null>(null);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    if (!orderParam && !invitationIdParam) {
      setLoading(false);
      return;
    }

    const q = new URLSearchParams();
    if (orderParam) q.set("orderId", orderParam);
    if (invitationIdParam) q.set("invitationId", invitationIdParam);

    let active = true;
    const poll = async () => {
      try {
        const res = await fetch(`/api/orders/status?${q.toString()}`, { cache: "no-store" });
        if (!res.ok) {
          if (active) setLoading(false);
          return;
        }
        const json = await res.json();
        if (active && json.ok) {
          setData(json);
          setLoading(false);
        }
      } catch {
        if (active) setLoading(false);
      }
    };

    poll();
    return () => {
      active = false;
    };
  }, [orderParam, invitationIdParam]);

  const invitation = data?.invitation;
  const order = data?.order;
  const isLive = Boolean(invitation?.isPublished && invitation?.publicUrl);
  const publicUrl = invitation?.publicUrl || (invitation?.slug && isLive ? `https://mehfill.in/i/${invitation.slug}` : "");

  const handleCopy = async () => {
    if (!publicUrl) return;
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleShare = async () => {
    if (!publicUrl) return;
    const shareText = `You're warmly invited to our celebration! ✨\n\n${invitation?.coupleTitle ? `${invitation.coupleTitle}\n\n` : ""}Open our digital invitation:\n${publicUrl}`;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: invitation?.coupleTitle || "Wedding Invitation · Mehfill.in",
          text: shareText,
          url: publicUrl,
        });
        setShared(true);
        setTimeout(() => setShared(false), 2000);
        return;
      } catch {
        // user cancelled or share unsupported
      }
    }
    // Fallback: open WhatsApp Web
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank");
  };

  return (
    <div className="relative w-full max-w-xl rounded-[2.5rem] border border-[#DECFC0] bg-white/95 backdrop-blur-md p-7 sm:p-10 text-center shadow-[0_20px_60px_rgba(43,31,23,0.1)] overflow-hidden">
      <CelebrationAnimation />

      {/* Header icon */}
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EDF5E9] border border-[#C5E1BB] text-[#2F6824] shadow-xs">
        <CheckCircle2 className="h-9 w-9 text-[#2F6824]" />
      </div>

      <div className="mt-4 flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#9E6D4B]">
        <Sparkles className="h-3.5 w-3.5 text-[#E0A96D]" />
        <span>Payment Verified</span>
        <Sparkles className="h-3.5 w-3.5 text-[#E0A96D]" />
      </div>

      <h1 className="mt-2 font-serif text-3xl sm:text-5xl text-[#2B1F17] leading-tight font-normal">
        Your Celebration Begins Here! ✨
      </h1>

      <p className="mt-3 text-sm sm:text-base text-[#695343] leading-relaxed max-w-md mx-auto">
        Thank you for choosing Mehfill.in. Your payment has been verified and your invitation is ready to share with your loved ones.
      </p>

      {/* Verified Details Pill / Card */}
      {(order || invitationIdParam || orderParam) && (
        <div className="mt-6 rounded-2xl bg-[#FAF6EE] border border-[#DECFC0]/80 p-4 text-xs sm:text-sm text-[#4A2F1B] space-y-2 text-left">
          <div className="flex items-center justify-between border-b border-[#DECFC0]/60 pb-2">
            <span className="text-[#695343]">Order Reference:</span>
            <span className="font-mono font-bold text-[#2B1F17]">
              #{order?.id || orderParam.slice(-8).toUpperCase()}
            </span>
          </div>

          {order && (
            <div className="flex items-center justify-between border-b border-[#DECFC0]/60 pb-2">
              <span className="text-[#695343]">Package &amp; Amount:</span>
              <span className="font-semibold text-[#2B1F17] capitalize">
                {order.package || "Basic"} · {formatINR(order.amount)}
              </span>
            </div>
          )}

          {invitation?.coupleTitle && (
            <div className="flex items-center justify-between border-b border-[#DECFC0]/60 pb-2">
              <span className="text-[#695343]">Celebration:</span>
              <span className="font-serif text-sm font-semibold text-[#8B4828]">
                {invitation.coupleTitle}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between pt-0.5">
            <span className="text-[#695343]">Publication Status:</span>
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase ${
              isLive
                ? "bg-[#EDF5E9] text-[#2F6824] border border-[#C5E1BB]"
                : "bg-[#FDF3E5] text-[#A6621E] border border-[#F4D9B6]"
            }`}>
              {isLive ? "Live & Ready ✓" : "Payment Confirmed · Draft Saved"}
            </span>
          </div>
        </div>
      )}

      {/* Live Public URL Card */}
      {isLive && publicUrl && (
        <div className="mt-6 rounded-2xl border border-[#C5E1BB] bg-[#EDF5E9]/60 p-5 text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-[#2F6824] flex items-center justify-center gap-1.5">
            <Heart className="h-3.5 w-3.5 fill-[#2F6824]" /> Public Invitation URL
          </p>

          <p className="mt-2 font-mono text-xs sm:text-sm break-all rounded-xl bg-white px-3.5 py-2.5 border border-[#C5E1BB] text-[#2B1F17]">
            {publicUrl}
          </p>

          {/* Action buttons */}
          <div className="mt-4 flex flex-wrap justify-center gap-2.5">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-2 rounded-xl bg-[#2B1F17] px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-[#4A2F1B] transition-all"
            >
              {copied ? <Check className="h-4 w-4 text-[#25D366]" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied!" : "Copy Link"}
            </button>

            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 text-xs sm:text-sm font-bold text-[#0c3c1e] hover:brightness-95 transition-all shadow-sm"
            >
              {shared ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
              Share Invitation
            </button>

            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-[#DECFC0] bg-white px-4 py-2.5 text-xs sm:text-sm font-bold text-[#4A2F1B] hover:bg-[#FAF6EE] transition-all shadow-xs"
            >
              <Eye className="h-4 w-4 text-[#8B4828]" /> View Invitation
            </a>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="mt-6 flex flex-col sm:flex-row gap-2.5 justify-center">
        {invitation?.id && (
          <Link
            href={`/dashboard/edit/${invitation.id}`}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-[#DECFC0] bg-white px-6 py-3 text-xs sm:text-sm font-bold text-[#4A2F1B] hover:bg-[#FAF6EE] shadow-xs"
          >
            Edit Invitation
          </Link>
        )}

        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#8B4828] px-7 py-3 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-[#72391F]"
        >
          Go to Dashboard <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Support / Feedback */}
      <div className="mt-7 pt-6 border-t border-[#DECFC0]/60 text-xs text-[#7A6353]">
        <p>Need custom edits or special assistance with your invitation?</p>
        <a
          href={waLink(`Hello Mehfill Team! My order #${order?.id || orderParam || ""} is paid. I need assistance with my invitation.`)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-1.5 font-bold text-[#8B4828] hover:underline"
        >
          <WhatsAppIcon className="h-3.5 w-3.5" /> Message us on WhatsApp
        </a>
      </div>
    </div>
  );
}

export default function ThankYouPage() {
  return (
    <main className="min-h-screen bg-[#FAF6EE] flex flex-col items-center justify-center px-4 py-12">
      <Suspense fallback={
        <div className="flex items-center gap-3 text-sm font-bold text-[#8B4828]">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Verifying order...</span>
        </div>
      }>
        <Content />
      </Suspense>
    </main>
  );
}
