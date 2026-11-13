"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      on: (event: string, handler: (response: any) => void) => void;
    };
  }
}
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  Music,
  Pause,
  Play,
  Plus,
  Trash2,
  Upload,
  Copy,
  Eye,
  Users,
  Calendar,
  MapPin,
  Images,
  Heart,
  PartyPopper,
  Pencil,
  Sparkles,
  CreditCard,
  ShieldCheck,
  CheckCircle,
  Link as LinkIcon,
  Info,
  CheckCircle2,
  XCircle,
  Tag,
  X,
  AlertTriangle,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getCatalogTemplate } from "@/lib/catalog";
import { getPlan } from "@/lib/plans";
import {
  defaultContent,
  newEvent,
  newMilestone,
  formatDateLong,
  formatTime12,
  isSafeHttpUrl,
  type GalleryItem,
  type InvitationContent,
  type InvitationEvent,
  type InvitationRecord,
  type LoveStoryMilestone,
} from "@/lib/invitation";
import { isValidCalendarDate } from "@/lib/templates/date-format";
import { WhatsAppIcon } from "@/components/BrandIcons";
import { PhoneFrame, PreviewBackdrop } from "@/components/invitation/PhoneFrame";
import { deriveInitials } from "@/lib/initials";
import { MehfillDatePicker } from "@/components/ui/MehfillDatePicker";
import { MehfillTimePicker } from "@/components/ui/MehfillTimePicker";

const STEPS = [
  { id: "couple", label: "Couple", icon: Users },
  { id: "date", label: "Date & Time", icon: Calendar },
  { id: "venue", label: "Venue", icon: MapPin },
  { id: "events", label: "Events", icon: PartyPopper },
  { id: "photos", label: "Photos", icon: Images },
  { id: "loveStory", label: "Love Story", icon: Pencil },
  { id: "music", label: "Music", icon: Music },
  { id: "rsvp", label: "RSVP", icon: Heart },
  { id: "publish", label: "Publish", icon: Eye },
] as const;

type StepId = (typeof STEPS)[number]["id"];

type FieldKey =
  | "slug"
  | "brideName"
  | "groomName"
  | "weddingDate"
  | "startTime"
  | "venueName"
  | "venueAddress";

/** Fields that must be filled before the invitation can be published.
 *  All 8 templates display the start time and the full address, so both are
 *  mandatory — never silently dropped. */
function validatePublishContent(content: InvitationContent, isSite9?: boolean): Partial<Record<FieldKey, string>> {
  const e: Partial<Record<FieldKey, string>> = {};
  if (!content.brideName.trim()) e.brideName = "Bride's name is required.";
  if (!content.groomName.trim()) e.groomName = "Groom's name is required.";
  if (!isValidCalendarDate(content.weddingDate)) e.weddingDate = "Pick a valid wedding date.";
  if (!isSite9) {
    if (!content.startTime || !/^\d{1,2}:\d{2}$/.test(content.startTime)) {
      e.startTime = "Start time is required — every template shows it.";
    }
    if (!content.venueName.trim()) e.venueName = "Venue name is required.";
    if (!content.venueAddress.trim()) e.venueAddress = "Full address is required — every template shows it.";
  }
  return e;
}

function cleanSlugValue(raw: string): string {
  return raw.trim().toLowerCase().replace(/[\s_]+/g, "-").replace(/[^a-z0-9-]/g, "");
}

/** Drop undefined/empty entries so error maps only carry real problems. */
function pruneErrors(
  e: Partial<Record<FieldKey, string>>
): Partial<Record<FieldKey, string>> {
  const out: Partial<Record<FieldKey, string>> = {};
  for (const [k, v] of Object.entries(e)) {
    if (v) out[k as FieldKey] = v;
  }
  return out;
}

export default function EditInvitationPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [step, setStep] = useState<StepId>("couple");
  const [invitation, setInvitation] = useState<InvitationRecord | null>(null);
  const [content, setContent] = useState<InvitationContent>(defaultContent());
  const [published, setPublished] = useState<{ slug: string; url: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingMusic, setUploadingMusic] = useState(false);
  const [musicRightsOk, setMusicRightsOk] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [fullScreen, setFullScreen] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [paying, setPaying] = useState(false);

  // Custom Invitation URL (slug) state
  const [customSlug, setCustomSlug] = useState("");
  const [slugChecking, setSlugChecking] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [slugError, setSlugError] = useState("");
  const [slugSuccess, setSlugSuccess] = useState("");

  // Coupon state
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<{ code: string; discountAmount: number } | null>(null);
  const [couponBusy, setCouponBusy] = useState(false);
  const [couponErr, setCouponErr] = useState("");

  // 2-step Delete Invitation state
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    step: 1 | 2;
    busy: boolean;
    error: string;
  }>({
    open: false,
    step: 1,
    busy: false,
    error: "",
  });

  // Per-field validation errors (keyed by field id — see validateStep).
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
  // Honest save state: "unsaved" | "saving" | "saved" | "error".
  const [saveState, setSaveState] = useState<"unsaved" | "saving" | "saved" | "error">("saved");
  const autoSaveReady = useRef(false);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savingRef = useRef(false);
  // Bumped to remount the live preview iframe with fresh server-rendered HTML.
  const [previewRev, setPreviewRev] = useState(0);

  const template = useMemo(
    () => getCatalogTemplate(invitation?.template_slug || ""),
    [invitation]
  );
  const isSite9 = invitation?.template_slug === "royal-floral-garden";
  const [uploadingSide, setUploadingSide] = useState<"bridePhoto" | "groomPhoto" | null>(null);

  const load = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login?callbackUrl=" + encodeURIComponent(`/dashboard/edit/${id}`));
      return;
    }
    setUserEmail(user.email || "");
    setUserName(user.user_metadata?.full_name || user.email?.split("@")[0] || "");
    const res = await fetch(`/api/invitations/${id}`, { cache: "no-store" });
    if (!res.ok) {
      setErr("Invitation not found.");
      setLoading(false);
      return;
    }
    const data = await res.json();
    setInvitation(data.invitation as InvitationRecord);
    const initialSlug = (data.invitation?.slug || "").startsWith("invite-") ? "" : (data.invitation?.slug || "");
    setCustomSlug(initialSlug);
    const loaded = {
      ...defaultContent(data.invitation?.template_slug),
      ...((data.invitation?.content as Partial<InvitationContent>) || {}),
    };
    if ((!loaded.galleryItems || loaded.galleryItems.length === 0) && Array.isArray(loaded.gallery) && loaded.gallery.length > 0) {
      loaded.galleryItems = loaded.gallery.map((url, idx) => ({
        id: `legacy-${idx}-${url.slice(-12)}`,
        url,
        caption: "",
        category: "all",
      }));
    }
    setContent(loaded);
    setMusicRightsOk(Boolean(loaded.musicUrl));
    if (data.invitation?.status === "published" && data.invitation?.slug && data.invitation?.isPaid) {
      setPublished({
        slug: data.invitation.slug,
        url: `https://mehfill.in/i/${data.invitation.slug}`,
      });
    } else {
      setPublished(null);
    }
    setLoading(false);
  }, [id, router]);

  useEffect(() => {
    load();
  }, [load]);

  const set = <K extends keyof InvitationContent>(k: K, v: InvitationContent[K]) => {
    setContent((p) => ({ ...p, [k]: v }));
    // Typing in a field clears its validation error.
    if (typeof k === "string") {
      setErrors((prev) => {
        if (!prev[k as FieldKey]) return prev;
        const next = { ...prev };
        delete next[k as FieldKey];
        return next;
      });
    }
  };

  const setRsvp = (patch: Partial<InvitationContent["rsvp"]>) =>
    setContent((p) => ({ ...p, rsvp: { ...p.rsvp, ...patch } }));

  const scrollToFirstError = (errs: Partial<Record<FieldKey, string>>) => {
    const order: FieldKey[] = [
      "slug",
      "brideName",
      "groomName",
      "weddingDate",
      "startTime",
      "venueName",
      "venueAddress",
    ];
    const first = order.find((k) => errs[k]);
    if (!first) return;
    requestAnimationFrame(() => {
      const el = document.getElementById(`f-${first}`);
      if (!el) return;
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      if (el instanceof HTMLElement) {
        const focusable = el.matches("input, textarea, select") ? el : el.querySelector("input, textarea, select, button");
        if (focusable instanceof HTMLElement) focusable.focus({ preventScroll: true });
      }
    });
  };

  /** Validate the CURRENT step before advancing to the next one.
   *  Manual "Save" never validates — drafts are allowed to be incomplete. */
  const validateStep = (s: StepId): Partial<Record<FieldKey, string>> => {
    if (s === "couple") {
      const e: Partial<Record<FieldKey, string>> = {
        brideName: content.brideName.trim() ? undefined : "Bride's name is required.",
        groomName: content.groomName.trim() ? undefined : "Groom's name is required.",
      };
      const clean = cleanSlugValue(customSlug);
      if (clean.length < 3) e.slug = "Add your invitation link (min 3 characters).";
      else if (slugAvailable === false) e.slug = "This link is already taken — pick another.";
      return pruneErrors(e);
    }
    if (s === "date") {
      return pruneErrors({
        weddingDate: isValidCalendarDate(content.weddingDate)
          ? undefined
          : "Pick a valid wedding date.",
        startTime:
          isSite9 || (content.startTime && /^\d{1,2}:\d{2}$/.test(content.startTime))
            ? undefined
            : "Start time is required — every template shows it.",
      });
    }
    if (s === "venue") {
      if (isSite9) return {};
      return pruneErrors({
        venueName: content.venueName.trim() ? undefined : "Venue name is required.",
        venueAddress: content.venueAddress.trim()
          ? undefined
          : "Full address is required — every template shows it.",
      });
    }
    if (s === "publish") {
      const e = validatePublishContent(content, isSite9);
      const clean = cleanSlugValue(customSlug);
      if (clean.length < 3) e.slug = "Add your invitation link (min 3 characters).";
      else if (slugAvailable === false) e.slug = slugError || "This link is already taken — pick another.";
      else if (slugAvailable !== true) e.slug = "Still checking this link — try again in a moment.";
      return pruneErrors(e);
    }
    return {};
  };

  const handlePublishErrors = () => {
    const e = validateStep("publish");
    if (Object.keys(e).length) {
      setErrors((prev) => ({ ...prev, ...e }));
      scrollToFirstError(e);
      setErr("Please complete the required details before publishing.");
      return true;
    }
    return false;
  };

  // Check slug availability with debounce
  useEffect(() => {
    if (!customSlug || customSlug.trim() === "") {
      setSlugAvailable(null);
      setSlugError("");
      setSlugSuccess("");
      return;
    }
    const clean = customSlug.toLowerCase().replace(/[\s_]+/g, "-").replace(/[^a-z0-9-]/g, "");
    if (clean.length < 3) {
      setSlugAvailable(false);
      setSlugError("URL must be at least 3 characters.");
      setSlugSuccess("");
      return;
    }

    const t = setTimeout(async () => {
      setSlugChecking(true);
      try {
        const res = await fetch(`/api/invitations/check-slug?slug=${encodeURIComponent(clean)}&invitationId=${id || ""}`);
        const data = await res.json();
        if (data.available) {
          setSlugAvailable(true);
          setSlugError("");
          setSlugSuccess("This link is available");
        } else {
          setSlugAvailable(false);
          setSlugError(data.error || "This link is already taken");
          setSlugSuccess("");
        }
      } catch {
        setSlugAvailable(null);
      } finally {
        setSlugChecking(false);
      }
    }, 400);

    return () => clearTimeout(t);
  }, [customSlug, id]);

  const save = async (nextStep?: StepId) => {
    // Advancing to the next step requires the CURRENT step to be complete.
    // Manual "Save" (no nextStep) never blocks — drafts may be incomplete.
    if (nextStep) {
      const stepErrs = validateStep(step);
      if (Object.keys(stepErrs).length) {
        setErrors((prev) => ({ ...prev, ...stepErrs }));
        scrollToFirstError(stepErrs);
        return;
      }
    }
    savingRef.current = true;
    setSaving(true);
    setErr("");
    try {
      const payload: { content: InvitationContent; slug?: string } = { content };
      if (customSlug && customSlug.trim() && slugAvailable !== false) {
        payload.slug = cleanSlugValue(customSlug);
      }
      const res = await fetch(`/api/invitations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Could not save.");
      setInvitation(data.invitation as InvitationRecord);
      setSaveState("saved");
      if (nextStep) setStep(nextStep);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not save.");
      setSaveState("error");
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  // Debounced autosave — content/slug edits persist ~1.2s after the last
  // keystroke. The initial load never counts as a change.
  useEffect(() => {
    if (!autoSaveReady.current) return;
    if (savingRef.current) return;
    setSaveState("unsaved");
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(async () => {
      setSaveState("saving");
      try {
        const payload: { content: InvitationContent; slug?: string } = { content };
        if (customSlug && customSlug.trim() && slugAvailable !== false) {
          payload.slug = cleanSlugValue(customSlug);
        }
        const res = await fetch(`/api/invitations/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error();
        setSaveState("saved");
      } catch {
        setSaveState("error");
      }
    }, 1200);
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [content, customSlug, slugAvailable, id]);

  // Flip autosave on only AFTER the first post-load render has passed through
  // the autosave effect above (this effect is declared later, so it runs after
  // it) — loading the invitation is never treated as a user edit.
  useEffect(() => {
    if (!loading && invitation) autoSaveReady.current = true;
  }, [loading, invitation]);

  // Live preview refresh — remount the /i/ iframe ~400ms after edits settle
  // (autosave has persisted by then). Never reloads mid-typing.
  useEffect(() => {
    if (loading || !invitation) return;
    if (saveState !== "saved") return;
    const t = setTimeout(() => setPreviewRev((r) => r + 1), 400);
    return () => clearTimeout(t);
  }, [loading, invitation, saveState, content, customSlug, slugAvailable]);

  // Expose minimal page context to the support widget (read-only, never sent
  // anywhere except our own /api/support/* when the customer opens chat).
  useEffect(() => {
    const w = window as unknown as { __MF_SUPPORT_CTX?: Record<string, unknown> };
    w.__MF_SUPPORT_CTX = {
      route: `/dashboard/edit/${id}`,
      invitationId: id,
      templateSlug: invitation?.template_slug || "",
      step,
      saved: saveState === "saved",
      errorText: err || "",
    };
    return () => {
      delete w.__MF_SUPPORT_CTX;
    };
  }, [id, invitation?.template_slug, step, saveState, err]);

  // Load Razorpay script dynamically
  useEffect(() => {
    if (typeof window === "undefined") return;
    const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (!existing) {
      const s = document.createElement("script");
      s.src = "https://checkout.razorpay.com/v1/checkout.js";
      s.async = true;
      document.body.appendChild(s);
    }
  }, []);

  const handleDeleteInvitation = async () => {
    setDeleteModal((p) => ({ ...p, busy: true, error: "" }));
    try {
      const res = await fetch(`/api/invitations/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Could not delete invitation.");
      router.push("/dashboard");
    } catch (e) {
      setDeleteModal((p) => ({
        ...p,
        busy: false,
        error: e instanceof Error ? e.message : "Failed to delete.",
      }));
    }
  };

  const publishDirectly = async () => {
    setSaving(true);
    setErr("");
    try {
      const res = await fetch(`/api/invitations/${id}/publish`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Could not publish.");
      setPublished({ slug: data.slug, url: data.url });
      setInvitation((p) => (p ? { ...p, status: "published", slug: data.slug } : p));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not publish.");
    } finally {
      setSaving(false);
    }
  };

  const plan = getPlan(invitation?.package || "basic");
  const rawPrice = plan?.price || (invitation?.package === "premium" ? 2499 : 999);
  const discount = coupon?.discountAmount ?? 0;
  const payablePrice = Math.max(0, rawPrice - discount);

  const applyCoupon = async () => {
    if (!invitation?.package || !couponInput.trim()) return;
    setCouponBusy(true);
    setCouponErr("");
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput.trim(), packageId: invitation.package }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data?.error || "Could not apply coupon.");
      setCoupon({ code: data.coupon.code, discountAmount: data.coupon.discountAmount });
      setCouponInput("");
    } catch (e) {
      setCoupon(null);
      setCouponErr(e instanceof Error ? e.message : "Could not apply coupon.");
    } finally {
      setCouponBusy(false);
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    setCouponErr("");
    setCouponInput("");
  };

  const publishWithPayment = async () => {
    // Block publish until every required detail (names, date, start time,
    // venue, address, link) is filled — the server re-validates as well.
    if (handlePublishErrors()) return;
    await save();

    // If invitation already has verified payment, publish directly
    if (invitation?.isPaid) {
      await publishDirectly();
      return;
    }

    // Otherwise, initiate Payment Gateway to complete purchase & publish
    setPaying(true);
    setErr("");
    try {
      const pkg = invitation?.package || "basic";
      const tmpl = invitation?.template_slug || template?.slug || "royal-marigold";

      const res = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageId: pkg,
          templateSlug: tmpl,
          invitationId: id,
          couponCode: coupon?.code || undefined,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        // If razorpay isn't configured in test or fails, redirect smoothly to checkout page
        const cParam = coupon?.code ? `&coupon=${encodeURIComponent(coupon.code)}` : "";
        router.push(`/checkout?template=${tmpl}&package=${pkg}&invitationId=${id}${cParam}`);
        return;
      }

      if (data.free) {
        // 100% discount, publish immediately
        await publishDirectly();
        return;
      }

      if (!window.Razorpay) {
        router.push(`/checkout?template=${tmpl}&package=${pkg}&invitationId=${id}`);
        return;
      }

      const rzp = new window.Razorpay({
        key: data.keyId,
        amount: data.amountPaise,
        currency: data.currency || "INR",
        name: "Mehfill.in",
        description: `Publish & Activate — ${template?.name || "Wedding Invitation"}`,
        order_id: data.razorpayOrderId,
        prefill: {
          name: userName || `${content.brideName} & ${content.groomName}`,
          email: userEmail || undefined,
        },
        theme: { color: "#8B4828" },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          setSaving(true);
          try {
            const vRes = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                invitationId: id,
              }),
            });
            const vData = await vRes.json().catch(() => ({}));
            if (!vRes.ok) {
              setErr(vData?.error || "Payment received but verification failed. Please contact support.");
              return;
            }

            // Immediately publish the invitation now that payment is verified!
            const pubRes = await fetch(`/api/invitations/${id}/publish`, { method: "POST" });
            const pubData = await pubRes.json().catch(() => ({}));
            if (pubRes.ok && pubData.url) {
              setPublished({ slug: pubData.slug, url: pubData.url });
              // Redirect to celebratory thank you screen with live link
              router.push(`/thank-you?order=${encodeURIComponent(vData.orderId || response.razorpay_order_id || "")}&invitationId=${id}`);
            } else {
              // Payment is verified in DB! If content had a validation hiccup, customer can finish details
              setInvitation((p) => (p ? { ...p, isPaid: true } : p));
              setErr(pubData?.error || "Payment received! Please complete any missing details to publish.");
            }
          } catch (e) {
            setErr(e instanceof Error ? e.message : "Payment verification error.");
          } finally {
            setSaving(false);
            setPaying(false);
          }
        },
        modal: {
          ondismiss: () => {
            setPaying(false);
          },
        },
      });

      rzp.open();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not launch payment gateway.");
      setPaying(false);
    }
  };

  const validateAndUploadImage = async (file: File): Promise<string> => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      throw new Error("Only JPG, PNG or WebP images are allowed.");
    }
    if (file.size > 4 * 1024 * 1024) {
      throw new Error("Image must be under 4MB. Please compress and retry.");
    }
    const fd = new FormData();
    fd.set("file", file);
    fd.set("kind", "photo");
    const res = await fetch("/api/invitations/upload", { method: "POST", body: fd });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || "Upload failed.");
    return data.url as string;
  };

  const uploadCouplePhoto = async (side: "bridePhoto" | "groomPhoto", file: File) => {
    setUploadingSide(side);
    setErr("");
    try {
      const url = await validateAndUploadImage(file);
      set(side, url);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploadingSide(null);
    }
  };

  const uploadPhoto = async (file: File) => {
    setUploading(true);
    setErr("");
    try {
      const url = await validateAndUploadImage(file);
      setContent((p) => {
        const currentItems: GalleryItem[] =
          p.galleryItems && p.galleryItems.length > 0
            ? p.galleryItems
            : p.gallery.map((u, idx) => ({ id: `legacy-${idx}`, url: u, caption: "", category: "all" }));
        if (currentItems.length >= 20) return p;
        const nextItems = [...currentItems, { id: crypto.randomUUID(), url, caption: "", category: "all" }];
        return {
          ...p,
          galleryItems: nextItems,
          gallery: nextItems.map((item) => item.url),
        };
      });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const uploadMusic = async (file: File) => {
    if (!musicRightsOk) {
      setErr("Please confirm you have the rights or permission to use this music first.");
      return;
    }
    setUploadingMusic(true);
    setErr("");
    try {
      const fd = new FormData();
      fd.set("file", file);
      fd.set("kind", "music");
      const res = await fetch("/api/invitations/upload", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Music upload failed.");
      set("musicUrl", data.url);
      await saveWithContent({ ...content, musicUrl: data.url });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Music upload failed.");
    } finally {
      setUploadingMusic(false);
    }
  };

  const saveWithContent = async (snapshot: InvitationContent) => {
    setSaving(true);
    setErr("");
    try {
      const res = await fetch(`/api/invitations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: snapshot }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Could not save.");
      setInvitation(data.invitation as InvitationRecord);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not save.");
    } finally {
      setSaving(false);
    }
  };

  const openPreview = async () => {
    await save();
    setPreviewMode(true);
  };

  const removeMusic = async () => {
    set("musicUrl", "");
    audioRef.current?.pause();
    setPlaying(false);
    await saveWithContent({ ...content, musicUrl: "" });
  };

  const toggleMusic = () => {
    const el = audioRef.current;
    if (!el) return;
    if (playing) {
      el.pause();
      setPlaying(false);
    } else {
      el.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    }
  };

  const copyLink = async () => {
    if (!published) return;
    try {
      await navigator.clipboard.writeText(published.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBF7F0] flex items-center justify-center">
        <p className="font-serif text-2xl text-[#8B4828]">Loading your studio editor…</p>
      </div>
    );
  }

  if (!invitation || !template) {
    return (
      <main className="min-h-screen bg-[#FBF7F0] flex items-center justify-center px-5 text-center">
        <div>
          <p className="font-serif text-3xl italic text-[#2B1F17]">{err || "Invitation not found."}</p>
          <Link href="/dashboard" className="mt-5 inline-block rounded-xl bg-[#8B4828] px-7 py-3 text-xs sm:text-sm font-bold text-white shadow-md">
            Back to dashboard
          </Link>
        </div>
      </main>
    );
  }

  const stepIndex = STEPS.findIndex((s) => s.id === step);

  if (previewMode) {
    return (
      <div className="relative min-h-screen bg-[#141210] flex flex-col overflow-x-hidden">
        <PreviewBackdrop />
        <div className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 bg-[#141210]/85 backdrop-blur border-b border-white/10 text-white">
          <button onClick={() => { setFullScreen(false); setPreviewMode(false); }} className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to editor
          </button>
          <div className="flex items-center gap-2 text-[11px] font-bold tracking-wide text-white/60">
            {saving ? <span className="inline-flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Saving…</span> : <span className="inline-flex items-center gap-1"><Check className="h-3 w-3 text-[#25D366]" /> Changes Saved</span>}
          </div>
        </div>
        <div className="relative z-10 flex-1 flex justify-center items-center px-4 py-6 md:py-10">
          <PhoneFrame
            src={`/i/${invitation.slug}?preview=1`}
            fullScreen={fullScreen}
            onFullScreenChange={setFullScreen}
            toolbar={
              <span className="hidden sm:inline text-[11px] font-bold text-white/60 px-2">
                {template.name}
              </span>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen bg-[#FBF7F0] text-[#2B1F17] flex flex-col justify-between overflow-x-hidden">
      {/* Background Architectural Palace Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <Image
          src="/images/hero/auth_palace_bg.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-top opacity-20 brightness-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#FBF7F0]/90 via-[#FBF7F0]/95 to-[#FBF7F0]" />
      </div>

      {/* Transparent Real Flowers (No Background) Framing the Canvas */}
      <div className="pointer-events-none fixed top-0 right-0 z-10 w-44 sm:w-64 opacity-80" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/editor/floral-corner.png"
          alt=""
          className="w-full h-auto drop-shadow-[0_8px_20px_rgba(110,65,40,0.12)] rotate-90"
        />
      </div>
      <div className="pointer-events-none fixed bottom-0 left-0 z-10 w-44 sm:w-64 opacity-75" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/editor/floral-corner.png"
          alt=""
          className="w-full h-auto drop-shadow-[0_8px_20px_rgba(110,65,40,0.12)] -rotate-90"
        />
      </div>

      {/* Floating Gentle Petals */}
      <div className="pointer-events-none fixed inset-0 z-10 overflow-hidden" aria-hidden="true">
        {[
          { left: "10%", size: "12px", duration: "14s", delay: "0s", drift: "35px" },
          { left: "35%", size: "15px", duration: "16s", delay: "2.5s", drift: "-40px" },
          { left: "65%", size: "11px", duration: "12s", delay: "1.2s", drift: "45px" },
          { left: "88%", size: "14px", duration: "15s", delay: "4s", drift: "-30px" },
        ].map((p, i) => (
          <span
            key={i}
            className="auth-petal"
            style={{
              left: p.left,
              width: p.size,
              height: p.size,
              // @ts-expect-error CSS variable
              "--auth-duration": p.duration,
              "--auth-delay": p.delay,
              "--auth-drift": p.drift,
            }}
          />
        ))}
      </div>

      {/* Studio Editor Glass Header */}
      <header className="sticky top-0 z-40 bg-[#FBF7F0]/85 backdrop-blur-xl border-b border-[#E8DEC4]/70 shadow-[0_4px_20px_rgba(70,45,25,0.03)]">
        <div className="mx-auto max-w-5xl px-5 py-3.5 flex items-center justify-between gap-3">
          <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#695343] hover:text-[#2B1F17] transition-colors">
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden sm:inline-block rounded-full bg-[#FAF6EE] px-3 py-1 text-[11px] font-bold tracking-wide uppercase text-[#8B4828] border border-[#DECFC0]/60">
              {template.name} · {invitation.package}
            </span>
            <button
              onClick={openPreview}
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#DECFC0] bg-white/80 px-4 py-2 text-xs font-bold text-[#4A2F1B] hover:bg-white transition-all disabled:opacity-50"
            >
              <Eye className="h-3.5 w-3.5 text-[#8B4828]" /> Preview
            </button>
            <button
              onClick={() => save()}
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#8B4828] px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#72391F] transition-all disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />} Save
            </button>
            <button
              onClick={() => setDeleteModal({ open: true, step: 1, busy: false, error: "" })}
              disabled={saving}
              className="inline-flex items-center justify-center rounded-xl p-2 text-[#A89484] hover:text-[#C53030] hover:bg-[#FBEBEB] transition-colors"
              title="Delete Invitation"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Step Progress Bar */}
        <div className="mx-auto max-w-5xl px-5 pb-3 flex gap-2 overflow-x-auto no-scrollbar">
          {STEPS.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setStep(s.id)}
              className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-bold tracking-wide transition-all border ${
                s.id === step
                  ? "bg-[#8B4828] text-white border-[#8B4828] shadow-sm"
                  : i < stepIndex
                  ? "bg-[#EDF5E9] text-[#2F6824] border-[#C5E1BB]"
                  : "bg-white/70 border-[#DECFC0] text-[#7A6353] hover:border-[#8B4828]"
              }`}
            >
              {i + 1}. {s.label}
            </button>
          ))}
        </div>
      </header>

      {/* Editor Body — form (left) + live preview of the ACTUAL selected
          template (right, xl+) rendered by the same /i/ renderer the public
          URL uses, so what the customer sees IS the design they picked. */}
      <div className="relative z-20 mx-auto max-w-7xl px-5 md:px-8 py-8 flex-1 w-full xl:grid xl:grid-cols-[minmax(0,1fr)_336px] xl:items-start xl:gap-8">
        <div className="w-full min-w-0 max-w-5xl mx-auto xl:max-w-none">
        {err && (
          <div className="mb-6 rounded-2xl bg-[#FBECE8] border border-[#F3C4B8] p-4 text-xs sm:text-sm font-semibold text-[#A63C26]">
            {err}
          </div>
        )}

        {/* STEP: Couple */}
        {step === "couple" && (
          <Section
            title="Couple Details"
            sub="The names and personal story your guests will see on the invitation."
            floral="garland"
          >
            {/* Custom Invitation URL (Required) */}
            <div className="mb-6 rounded-2xl border border-[#DECFC0] bg-[#FFFDF9] p-5 shadow-xs">
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#7A6353]">
                  Custom Invitation URL
                </span>
                <span className="text-xs font-bold text-[#A63C26]">(required)</span>
                <span className="group relative cursor-pointer text-[#9E8B7C] hover:text-[#8B4828]">
                  <Info className="h-3.5 w-3.5" />
                  <span className="pointer-events-none absolute left-1/2 -top-10 -translate-x-1/2 hidden group-hover:block whitespace-nowrap rounded-lg bg-[#2B1F17] px-2.5 py-1 text-[11px] text-white shadow-md z-30">
                    Your guests will use this personalized link to open your card
                  </span>
                </span>
              </div>

              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <LinkIcon className="h-4 w-4 text-[#8B4828]" />
                </div>
                <input
                  id="f-slug"
                  value={customSlug}
                  onChange={(e) => {
                    const formatted = e.target.value.toLowerCase().replace(/[\s_]+/g, "-").replace(/[^a-z0-9-]/g, "");
                    setCustomSlug(formatted);
                    setErrors((prev) => {
                      if (!prev.slug) return prev;
                      const next = { ...prev };
                      delete next.slug;
                      return next;
                    });
                  }}
                  className={`w-full rounded-xl border pl-10 pr-10 py-3 text-xs sm:text-sm font-medium outline-none transition-all ${
                    slugAvailable === true
                      ? "border-[#2F6824] bg-white ring-2 ring-[#2F6824]/10 text-[#2B1F17]"
                      : slugAvailable === false
                      ? "border-[#A63C26] bg-[#FDF4F2] ring-2 ring-[#A63C26]/10 text-[#2B1F17]"
                      : "border-[#DECFC0] bg-white/95 text-[#2B1F17] focus:border-[#8B4828] focus:ring-2 focus:ring-[#8B4828]/15"
                  }`}
                  placeholder="e.g. rahul-weds-priya"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none">
                  {slugChecking ? (
                    <Loader2 className="h-4 w-4 animate-spin text-[#8B4828]" />
                  ) : slugAvailable === true ? (
                    <CheckCircle2 className="h-4 w-4 text-[#2F6824]" />
                  ) : slugAvailable === false ? (
                    <XCircle className="h-4 w-4 text-[#A63C26]" />
                  ) : null}
                </div>
              </div>

              {/* Status Message */}
              {errors.slug && (
                <p role="alert" className="mt-2 text-xs font-semibold text-[#A63C26]">
                  {errors.slug}
                </p>
              )}
              {slugSuccess && (
                <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-[#2F6824]">
                  <Check className="h-3.5 w-3.5" /> {slugSuccess}
                </p>
              )}
              {slugError && (
                <p className="mt-2 text-xs font-semibold text-[#A63C26]">
                  {slugError}
                </p>
              )}
              {!customSlug && (
                <p className="mt-1.5 text-xs text-[#A63C26]/90 font-medium">
                  A custom invitation URL is required.
                </p>
              )}

              {/* Live Preview of the link */}
              {customSlug && (
                <div className="mt-3.5 rounded-xl border border-[#DECFC0]/70 bg-[#FAF6EE] p-3 text-xs text-[#4A2F1B]">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-[#9E6D4B]">YOUR LINK WILL BE</span>
                  <p className="mt-1 font-mono font-semibold text-xs sm:text-sm break-all text-[#2B1F17]">
                    mehfill.in/i/{customSlug}
                  </p>
                </div>
              )}

              <div className="mt-2.5 flex items-start gap-2 rounded-xl bg-[#FAF6EE]/70 border border-[#EBE0D3] p-2.5 text-[11px] text-[#7A6353]">
                <Sparkles className="h-3.5 w-3.5 text-[#8B4828] shrink-0 mt-0.5" />
                <span>
                  Share this link directly on WhatsApp, Instagram bio, or print on cards for your guests.
                </span>
              </div>
            </div>

            {isSite9 ? (
              <div className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-5">
                  {/* Bride Card */}
                  <div className="rounded-2xl border border-[#DECFC0] bg-[#FFFDF9] p-5 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-[#EBE0D3] pb-2.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#8B4828]">The Bride</span>
                      <span className="text-[11px] text-[#7A6353]">Royal Couple Card</span>
                    </div>

                    <Field label="Bride's name" required error={errors.brideName}>
                      <input
                        id="f-brideName"
                        value={content.brideName}
                        onChange={(e) => set("brideName", e.target.value)}
                        className={inputCls + inputErrCls(errors.brideName)}
                        placeholder="e.g. Aisha"
                      />
                    </Field>

                    <div>
                      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-[#7A6353]">
                        Bride Photograph (Optional)
                      </span>
                      {content.bridePhoto ? (
                        <div className="flex items-center gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={content.bridePhoto}
                            alt="Bride preview"
                            className="h-20 w-16 rounded-xl object-cover border border-[#DECFC0]"
                          />
                          <div className="flex flex-col gap-1.5">
                            <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-[#DECFC0] bg-white px-3 py-1.5 text-xs font-bold text-[#8B4828] hover:bg-[#FAF6EE]">
                              <Upload className="h-3.5 w-3.5" />
                              {uploadingSide === "bridePhoto" ? "Uploading…" : "Replace"}
                              <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                className="hidden"
                                disabled={uploadingSide === "bridePhoto"}
                                onChange={(e) => {
                                  const f = e.target.files?.[0];
                                  if (f) uploadCouplePhoto("bridePhoto", f);
                                  e.target.value = "";
                                }}
                              />
                            </label>
                            <button
                              type="button"
                              onClick={() => set("bridePhoto", "")}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-[#DECFC0] bg-white px-3 py-1.5 text-xs font-semibold text-[#A63C26] hover:bg-[#FDF4F2]"
                            >
                              <Trash2 className="h-3.5 w-3.5" /> Remove
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-[#DECFC0] bg-white py-3 px-4 text-xs font-semibold text-[#8B4828] hover:bg-[#FAF6EE]">
                          {uploadingSide === "bridePhoto" ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Upload className="h-4 w-4" />
                          )}
                          <span>{uploadingSide === "bridePhoto" ? "Uploading…" : "Upload Bride Photo (JPG/PNG/WebP · max 4MB)"}</span>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="hidden"
                            disabled={uploadingSide === "bridePhoto"}
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) uploadCouplePhoto("bridePhoto", f);
                              e.target.value = "";
                            }}
                          />
                        </label>
                      )}
                    </div>

                    <Field label="Bride's parents' names (Optional)">
                      <input
                        value={content.brideParents || ""}
                        onChange={(e) => set("brideParents", e.target.value)}
                        className={inputCls}
                        placeholder="e.g. Daughter of Mr. & Mrs. Sharma"
                        maxLength={160}
                      />
                    </Field>

                    <Field label="Short bride description (Optional)">
                      <textarea
                        value={content.brideBio || ""}
                        onChange={(e) => set("brideBio", e.target.value)}
                        rows={2}
                        className={inputCls + " resize-none"}
                        placeholder="A short note about the bride…"
                        maxLength={300}
                      />
                    </Field>
                  </div>

                  {/* Groom Card */}
                  <div className="rounded-2xl border border-[#DECFC0] bg-[#FFFDF9] p-5 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-[#EBE0D3] pb-2.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#8B4828]">The Groom</span>
                      <span className="text-[11px] text-[#7A6353]">Royal Couple Card</span>
                    </div>

                    <Field label="Groom's name" required error={errors.groomName}>
                      <input
                        id="f-groomName"
                        value={content.groomName}
                        onChange={(e) => set("groomName", e.target.value)}
                        className={inputCls + inputErrCls(errors.groomName)}
                        placeholder="e.g. Hamza"
                      />
                    </Field>

                    <div>
                      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-[#7A6353]">
                        Groom Photograph (Optional)
                      </span>
                      {content.groomPhoto ? (
                        <div className="flex items-center gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={content.groomPhoto}
                            alt="Groom preview"
                            className="h-20 w-16 rounded-xl object-cover border border-[#DECFC0]"
                          />
                          <div className="flex flex-col gap-1.5">
                            <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-[#DECFC0] bg-white px-3 py-1.5 text-xs font-bold text-[#8B4828] hover:bg-[#FAF6EE]">
                              <Upload className="h-3.5 w-3.5" />
                              {uploadingSide === "groomPhoto" ? "Uploading…" : "Replace"}
                              <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                className="hidden"
                                disabled={uploadingSide === "groomPhoto"}
                                onChange={(e) => {
                                  const f = e.target.files?.[0];
                                  if (f) uploadCouplePhoto("groomPhoto", f);
                                  e.target.value = "";
                                }}
                              />
                            </label>
                            <button
                              type="button"
                              onClick={() => set("groomPhoto", "")}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-[#DECFC0] bg-white px-3 py-1.5 text-xs font-semibold text-[#A63C26] hover:bg-[#FDF4F2]"
                            >
                              <Trash2 className="h-3.5 w-3.5" /> Remove
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-[#DECFC0] bg-white py-3 px-4 text-xs font-semibold text-[#8B4828] hover:bg-[#FAF6EE]">
                          {uploadingSide === "groomPhoto" ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Upload className="h-4 w-4" />
                          )}
                          <span>{uploadingSide === "groomPhoto" ? "Uploading…" : "Upload Groom Photo (JPG/PNG/WebP · max 4MB)"}</span>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="hidden"
                            disabled={uploadingSide === "groomPhoto"}
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) uploadCouplePhoto("groomPhoto", f);
                              e.target.value = "";
                            }}
                          />
                        </label>
                      )}
                    </div>

                    <Field label="Groom's parents' names (Optional)">
                      <input
                        value={content.groomParents || ""}
                        onChange={(e) => set("groomParents", e.target.value)}
                        className={inputCls}
                        placeholder="e.g. Son of Mr. & Mrs. Verma"
                        maxLength={160}
                      />
                    </Field>

                    <Field label="Short groom description (Optional)">
                      <textarea
                        value={content.groomBio || ""}
                        onChange={(e) => set("groomBio", e.target.value)}
                        rows={2}
                        className={inputCls + " resize-none"}
                        placeholder="A short note about the groom…"
                        maxLength={300}
                      />
                    </Field>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Couple initials (Auto-derived from names)">
                    <div className="relative">
                      <input
                        value={deriveInitials(content.brideName, content.groomName).combined || content.initials || ""}
                        onChange={(e) => set("initials", e.target.value)}
                        className={inputCls}
                        placeholder="e.g. H & A"
                        maxLength={20}
                      />
                      {deriveInitials(content.brideName, content.groomName).combined && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-[#EDF5E9] border border-[#C5E1BB] px-2.5 py-0.5 text-[10px] font-bold text-[#2F6824]">
                          {deriveInitials(content.brideName, content.groomName).combined}
                        </span>
                      )}
                    </div>
                  </Field>
                  <Field label="Footer family gratitude (Optional)">
                    <input
                      value={content.familyNames || ""}
                      onChange={(e) => set("familyNames", e.target.value)}
                      className={inputCls}
                      placeholder="e.g. The Sharma & Verma Families"
                    />
                  </Field>
                  <Field label="Main invitation message" wide>
                    <textarea value={content.message || ""} onChange={(e) => set("message", e.target.value)} rows={3} className={inputCls + " resize-none"} maxLength={600} />
                  </Field>
                </div>
              </div>
            ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Bride's name" required error={errors.brideName}>
                <input
                  id="f-brideName"
                  value={content.brideName}
                  onChange={(e) => set("brideName", e.target.value)}
                  className={inputCls + inputErrCls(errors.brideName)}
                  placeholder="e.g. Aisha"
                />
              </Field>
              <Field label="Groom's name" required error={errors.groomName}>
                <input
                  id="f-groomName"
                  value={content.groomName}
                  onChange={(e) => set("groomName", e.target.value)}
                  className={inputCls + inputErrCls(errors.groomName)}
                  placeholder="e.g. Hamza"
                />
              </Field>
              <Field label="Couple initials (Auto-derived from names)">
                <div className="relative">
                  <input
                    value={deriveInitials(content.brideName, content.groomName).combined || content.initials || ""}
                    onChange={(e) => set("initials", e.target.value)}
                    className={inputCls}
                    placeholder="e.g. H & A"
                    maxLength={20}
                  />
                  {deriveInitials(content.brideName, content.groomName).combined && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-[#EDF5E9] border border-[#C5E1BB] px-2.5 py-0.5 text-[10px] font-bold text-[#2F6824]">
                      {deriveInitials(content.brideName, content.groomName).combined}
                    </span>
                  )}
                </div>
              </Field>
              <Field label="Family announcement (Optional)">
                <input value={content.familyNames || ""} onChange={(e) => set("familyNames", e.target.value)} className={inputCls} placeholder="e.g. Daughter of Mr. & Mrs. Sharma" />
              </Field>
              <Field label="Main invitation message" wide>
                <textarea value={content.message || ""} onChange={(e) => set("message", e.target.value)} rows={3} className={inputCls + " resize-none"} maxLength={600} />
              </Field>
              <Field label="Introductory quote or welcome line (Optional)" wide>
                <textarea value={content.intro || ""} onChange={(e) => set("intro", e.target.value)} rows={2} className={inputCls + " resize-none"} placeholder="A line about your love story…" maxLength={800} />
              </Field>
            </div>
            )}
            <NavButtons onNext={() => save("date")} saving={saving} />
          </Section>
        )}

        {/* STEP: Date */}
        {step === "date" && (
          <Section
            title="Date & Time"
            sub="When the celebration begins."
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Wedding date" required error={errors.weddingDate}>
                <div id="f-weddingDate" className={errors.weddingDate ? "rounded-xl ring-2 ring-[#A63C26]/40" : ""}>
                  <MehfillDatePicker
                    value={content.weddingDate}
                    onChange={(val) => set("weddingDate", val)}
                    min={new Date().toISOString().split("T")[0]}
                    placeholder="Select wedding date"
                  />
                </div>
              </Field>
              <Field label={isSite9 ? "Start time (Optional)" : "Start time"} required={!isSite9} error={errors.startTime}>
                <div id="f-startTime" className={errors.startTime ? "rounded-xl ring-2 ring-[#A63C26]/40" : ""}>
                  <MehfillTimePicker
                    value={content.startTime || ""}
                    onChange={(val) => set("startTime", val)}
                    placeholder="Select celebration start time"
                  />
                </div>
              </Field>
              <Field label="End time (Optional)">
                <MehfillTimePicker
                  value={content.endTime || ""}
                  onChange={(val) => set("endTime", val)}
                  placeholder="Select wrap-up time (optional)"
                />
              </Field>
            </div>
            {content.weddingDate && (
              <div className="mt-4 rounded-2xl bg-[#FAF6EE] border border-[#DECFC0]/60 p-4 text-xs sm:text-sm text-[#4A2F1B]">
                Your guests will see: <b>{formatDateLong(content.weddingDate)}</b>
                {content.startTime && <> at <b>{formatTime12(content.startTime)}</b></>}
              </div>
            )}
            <NavButtons onBack={() => setStep("couple")} onNext={() => save("venue")} saving={saving} />
          </Section>
        )}

        {/* STEP: Venue */}
        {step === "venue" && (
          <Section
            title="Celebration Venue"
            sub="Where your guests will join to celebrate your auspicious day."
            floral="garland"
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label={isSite9 ? "Venue name (Optional)" : "Venue name"} required={!isSite9} error={errors.venueName}>
                <input
                  id="f-venueName"
                  value={content.venueName}
                  onChange={(e) => set("venueName", e.target.value)}
                  className={inputCls + inputErrCls(errors.venueName)}
                  placeholder="e.g. The Grand Orchid Palace"
                />
              </Field>
              <Field label="Google Maps link (Optional)">
                <input value={content.mapsUrl || ""} onChange={(e) => set("mapsUrl", e.target.value)} className={inputCls} placeholder="https://maps.google.com/…" />
              </Field>
              <Field label={isSite9 ? "Full address & directions (Optional)" : "Full address & directions"} wide required={!isSite9} error={errors.venueAddress}>
                <textarea
                  id="f-venueAddress"
                  value={content.venueAddress}
                  onChange={(e) => set("venueAddress", e.target.value)}
                  rows={2}
                  className={inputCls + " resize-none" + inputErrCls(errors.venueAddress)}
                />
              </Field>
            </div>
            <NavButtons onBack={() => setStep("date")} onNext={() => save("events")} saving={saving} />
          </Section>
        )}

        {/* STEP: Events */}
        {step === "events" && (
          <Section
            title="Wedding Events"
            sub="Add Haldi, Mehendi, Sangeet, Nikah, Reception — whatever you are celebrating."
            floral="wreath"
          >
            <div className="space-y-4">
              {/* Quick Add Preset Events */}
              <div className="rounded-2xl border border-[#DECFC0] bg-[#FFFDF9] p-4 shadow-xs">
                <span className="block text-xs font-bold uppercase tracking-wider text-[#7A6353] mb-2.5">
                  Quick Add Preset Events
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { name: "Mehendi", icon: "🌿" },
                    { name: "Haldi", icon: "✨" },
                    { name: "Sangeet", icon: "🎵" },
                    { name: "Ring Ceremony", icon: "💍" },
                    { name: "Wedding", icon: "👰" },
                    { name: "Reception", icon: "🎉" },
                  ].map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => {
                        const ne = newEvent();
                        ne.name = preset.name;
                        set("events", [...content.events, ne]);
                      }}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#DECFC0] bg-white py-2 px-3 text-xs font-bold text-[#4A2F1B] hover:bg-[#FAF6EE] hover:border-[#8B4828] transition-all shadow-xs active:scale-95"
                    >
                      <span>{preset.icon}</span> {preset.name}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => set("events", [...content.events, newEvent()])}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#DECFC0] bg-white py-2 px-3 text-xs font-bold text-[#8B4828] hover:bg-[#FAF6EE] transition-all sm:col-span-3 active:scale-95"
                  >
                    <span>🪅</span> Custom Event
                  </button>
                </div>

                <div className="mt-3.5 flex items-start gap-2 rounded-xl bg-[#FAF6EE] border border-[#EBE0D3] p-2.5 text-[11px] text-[#7A6353]">
                  <Info className="h-4 w-4 text-[#8B4828] shrink-0 mt-0.5" />
                  <span>
                    <b>Note:</b> The venue &amp; timings of your <b>Primary Event</b> (Event 1) will be featured on the cover page of your invitation.
                  </span>
                </div>
              </div>

              {content.events.length === 0 && (
                <div className="rounded-2xl border border-dashed border-[#DECFC0] bg-[#FFFDF9] p-6 text-center text-xs text-[#7A6353]">
                  No ceremonies added yet. Only ceremonies you add will appear on your invitation.
                </div>
              )}

              {content.events.map((ev, i) => (
                <EventCard
                  key={ev.id}
                  event={ev}
                  onChange={(patch) =>
                    set("events", content.events.map((e) => (e.id === ev.id ? { ...e, ...patch } : e)))
                  }
                  onRemove={() => set("events", content.events.filter((e) => e.id !== ev.id))}
                  onMoveUp={i > 0 ? () => {
                    const next = [...content.events];
                    [next[i - 1], next[i]] = [next[i], next[i - 1]];
                    set("events", next);
                  } : undefined}
                  onMoveDown={i < content.events.length - 1 ? () => {
                    const next = [...content.events];
                    [next[i], next[i + 1]] = [next[i + 1], next[i]];
                    set("events", next);
                  } : undefined}
                  canRemove={isSite9 || content.events.length > 1}
                  index={i}
                />
              ))}
              <button
                type="button"
                onClick={() => set("events", [...content.events, newEvent()])}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#8B4828]/50 bg-white/70 py-3 text-xs sm:text-sm font-bold text-[#8B4828] hover:bg-white transition-all shadow-xs"
              >
                <Plus className="h-4 w-4" /> Add Event
              </button>
            </div>
            <NavButtons onBack={() => setStep("venue")} onNext={() => save("photos")} saving={saving} />
          </Section>
        )}

        {/* STEP: Photos */}
        {step === "photos" && (
          <Section
            title="Photo Gallery"
            sub="Upload up to 20 photos (JPG, PNG or WebP · max 4MB each)."
            floral="wreath"
          >
            {/* Choice: Use original template images or customer photos only (not shown for Site-9, which never uses demo photos) */}
            {!isSite9 && (
            <div className="rounded-2xl border border-[#DECFC0] bg-[#FFFDF9] p-5 shadow-xs mb-6">
              <span className="block text-xs font-bold uppercase tracking-wider text-[#9E6D4B] mb-1.5">
                Template Demo Images Choice
              </span>
              <p className="text-xs text-[#695343] mb-4">
                Choose how placeholder/sample gallery photos and portraits are handled on your published invitation. Essential decorative artwork (florals, arches, motifs) is always preserved.
              </p>

              <div className="grid sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => set("useTemplateImages", false)}
                  className={`text-left p-4 rounded-xl border transition-all ${
                    content.useTemplateImages === false || content.useTemplateImages === undefined
                      ? "border-[#8B4828] bg-[#FAF6EE] ring-2 ring-[#8B4828]/15"
                      : "border-[#DECFC0] bg-white hover:border-[#8B4828]/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs sm:text-sm font-bold text-[#2B1F17]">
                      B. Use only my uploaded photos
                    </span>
                    {(content.useTemplateImages === false || content.useTemplateImages === undefined) && (
                      <Check className="h-4 w-4 text-[#8B4828]" />
                    )}
                  </div>
                  <p className="text-[11px] text-[#7A6353] leading-relaxed">
                    <b>Recommended.</b> Only your uploaded photos will appear in galleries and portraits. If no photos are uploaded, photo galleries are cleanly hidden without blank gaps.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => set("useTemplateImages", true)}
                  className={`text-left p-4 rounded-xl border transition-all ${
                    content.useTemplateImages === true
                      ? "border-[#8B4828] bg-[#FAF6EE] ring-2 ring-[#8B4828]/15"
                      : "border-[#DECFC0] bg-white hover:border-[#8B4828]/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs sm:text-sm font-bold text-[#2B1F17]">
                      A. Use original template images
                    </span>
                    {content.useTemplateImages === true && (
                      <Check className="h-4 w-4 text-[#8B4828]" />
                    )}
                  </div>
                  <p className="text-[11px] text-[#7A6353] leading-relaxed">
                    Keep the template&rsquo;s artistic sample imagery in slots where you haven&rsquo;t uploaded a photo yet.
                  </p>
                </button>
              </div>
            </div>
            )}

            <label className="flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[#DECFC0] bg-white/75 py-12 hover:bg-white transition-all shadow-xs">
              {uploading ? (
                <Loader2 className="h-8 w-8 animate-spin text-[#8B4828]" />
              ) : (
                <>
                  <Upload className="h-8 w-8 text-[#8B4828]" />
                  <p className="mt-3 text-xs sm:text-sm font-bold text-[#2B1F17]">Tap to upload couple photos</p>
                  <p className="mt-1 text-[11px] text-[#7A6353]">JPG, PNG, WebP · up to 4MB each</p>
                </>
              )}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={(e) => {
                  const files = Array.from(e.target.files || []).slice(0, 5);
                  files.forEach((f) => uploadPhoto(f));
                  e.target.value = "";
                }}
              />
            </label>
            {(() => {
              const items: GalleryItem[] =
                content.galleryItems && content.galleryItems.length > 0
                  ? content.galleryItems
                  : content.gallery.map((url, idx) => ({ id: `legacy-${idx}`, url, caption: "", category: "all" }));
              if (items.length === 0) return null;
              const updateItems = (next: GalleryItem[]) => {
                setContent((p) => ({
                  ...p,
                  galleryItems: next,
                  gallery: next.map((x) => x.url),
                }));
              };
              return (
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {items.map((item, i) => (
                    <div key={item.id} className="rounded-2xl overflow-hidden border border-[#DECFC0] bg-white shadow-xs flex flex-col">
                      <div className="relative aspect-[4/3] bg-[#FAF6EE]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.url} alt={item.caption || `Upload ${i + 1}`} className="h-full w-full object-cover" />
                        <div className="absolute top-2 right-2 flex items-center gap-1">
                          {i > 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                const next = [...items];
                                [next[i - 1], next[i]] = [next[i], next[i - 1]];
                                updateItems(next);
                              }}
                              className="rounded-full bg-black/65 p-1.5 text-white hover:bg-black/80"
                              aria-label="Move photo earlier"
                              title="Move earlier"
                            >
                              <ChevronUp className="h-3.5 w-3.5" />
                            </button>
                          )}
                          {i < items.length - 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const next = [...items];
                                [next[i], next[i + 1]] = [next[i + 1], next[i]];
                                updateItems(next);
                              }}
                              className="rounded-full bg-black/65 p-1.5 text-white hover:bg-black/80"
                              aria-label="Move photo later"
                              title="Move later"
                            >
                              <ChevronDown className="h-3.5 w-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => updateItems(items.filter((_, j) => j !== i))}
                            className="rounded-full bg-[#A63C26]/90 p-1.5 text-white hover:bg-[#A63C26]"
                            aria-label="Remove photo"
                            title="Delete photo"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="p-3 space-y-2">
                        <input
                          value={item.caption || ""}
                          onChange={(e) =>
                            updateItems(items.map((x, j) => (j === i ? { ...x, caption: e.target.value } : x)))
                          }
                          placeholder="Photo caption (optional)"
                          maxLength={160}
                          className={inputCls + " !py-1.5 !text-xs"}
                        />
                        {isSite9 && (
                          <select
                            value={item.category || "all"}
                            onChange={(e) =>
                              updateItems(items.map((x, j) => (j === i ? { ...x, category: e.target.value } : x)))
                            }
                            className={inputCls + " !py-1.5 !text-xs"}
                          >
                            <option value="all">Category: All Moments</option>
                            <option value="couple">The Couple</option>
                            <option value="ceremonies">Ceremonies</option>
                            <option value="palace">Palace &amp; Decor</option>
                          </select>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
            <NavButtons onBack={() => setStep("events")} onNext={() => save("loveStory")} saving={saving} />
          </Section>
        )}

        {/* STEP: Love Story */}
        {step === "loveStory" && (
          <div className="space-y-6">
            <LoveStoryEditor
              milestones={content.loveStory || []}
              onChange={(ms) => set("loveStory", ms)}
              onRemove={(id) => {
                const m = (content.loveStory || []).find((x) => x.id === id);
                if (m) set("loveStory", content.loveStory!.filter((x) => x.id !== id));
              }}
            />
            <NavButtons onBack={() => setStep("photos")} onNext={() => save("music")} saving={saving} />
          </div>
        )}

        {/* STEP: Music */}
        {step === "music" && (
          <Section
            title="Background Music"
            sub={template.fields.music ? "Set the mood — guests can play or pause right from the invitation." : "This design uses its signature background music."}
            floral="garland"
          >
            {template.fields.music ? (
              <>
                <label className="flex items-start gap-3 rounded-2xl border border-[#DECFC0] bg-white/90 p-4 shadow-xs">
                  <input
                    type="checkbox"
                    checked={musicRightsOk}
                    onChange={(e) => setMusicRightsOk(e.target.checked)}
                    className="mt-0.5 h-4 w-4 accent-[#8B4828]"
                  />
                  <span className="text-xs sm:text-sm text-[#4A2F1B]">
                    I confirm I have permission to use this audio track for my celebration.
                  </span>
                </label>

                {content.musicUrl ? (
                  <div className="mt-4 rounded-2xl border border-[#DECFC0] bg-white/90 p-4 shadow-xs">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={toggleMusic}
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#8B4828] text-white shadow-sm hover:bg-[#72391F]"
                        aria-label={playing ? "Pause music" : "Play music"}
                      >
                        {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </button>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs sm:text-sm font-bold text-[#2B1F17]">Custom Background Audio</p>
                        <p className="truncate text-[11px] text-[#7A6353]">{content.musicUrl.split("/").pop()}</p>
                      </div>
                      <button
                        onClick={removeMusic}
                        disabled={saving}
                        className="rounded-xl border border-[#DECFC0] p-2 text-[#7A6353] hover:text-[#A63C26]"
                        aria-label="Remove music"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <audio ref={audioRef} src={content.musicUrl} preload="none" className="hidden" />
                  </div>
                ) : (
                  <label className={`mt-4 flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[#DECFC0] bg-white/75 py-12 hover:bg-white transition-all shadow-xs ${!musicRightsOk ? "opacity-50 pointer-events-none" : ""}`}>
                    {uploadingMusic ? (
                      <Loader2 className="h-8 w-8 animate-spin text-[#8B4828]" />
                    ) : (
                      <>
                        <Music className="h-8 w-8 text-[#8B4828]" />
                        <p className="mt-3 text-xs sm:text-sm font-bold text-[#2B1F17]">Tap to upload music track</p>
                        <p className="mt-1 text-[11px] text-[#7A6353]">MP3, M4A, WAV or OGG · up to 8MB</p>
                      </>
                    )}
                    <input
                      type="file"
                      accept="audio/mpeg,audio/mp4,audio/mp3,audio/x-m4a,audio/aac,audio/wav,audio/ogg"
                      className="hidden"
                      disabled={!musicRightsOk}
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) uploadMusic(f);
                        e.target.value = "";
                      }}
                    />
                  </label>
                )}
              </>
            ) : (
              <p className="rounded-2xl bg-[#FAF6EE] p-4 text-xs sm:text-sm text-[#695343]">
                This design uses authentic curated instrumental audio that stays active by default.
              </p>
            )}
            <NavButtons onBack={() => setStep("loveStory")} onNext={() => save("rsvp")} saving={saving} />
          </Section>
        )}

        {/* STEP: RSVP */}
        {step === "rsvp" && (
          <Section
            title="RSVP Preferences"
            sub="Let guests confirm attendance and send blessings directly."
            floral="garland"
          >
            <label className="flex items-center gap-3 rounded-2xl border border-[#DECFC0] bg-white/90 p-4 shadow-xs">
              <input
                type="checkbox"
                checked={content.rsvp?.enabled !== false}
                onChange={(e) => setRsvp({ enabled: e.target.checked })}
                className="h-4 w-4 accent-[#8B4828]"
              />
              <span className="text-xs sm:text-sm font-bold text-[#2B1F17]">Enable interactive RSVP form on the live invitation</span>
            </label>
            {content.rsvp?.enabled !== false && (
              <div className="mt-4 grid sm:grid-cols-2 gap-4">
                <Field label="RSVP contact person">
                  <input value={content.rsvp?.contactName || ""} onChange={(e) => setRsvp({ contactName: e.target.value })} className={inputCls} placeholder="e.g. Farhan Sharma" />
                </Field>
                <Field label="RSVP phone number">
                  <input value={content.rsvp?.contactPhone || ""} onChange={(e) => setRsvp({ contactPhone: e.target.value.replace(/\D/g, "").slice(0, 15) })} className={inputCls} inputMode="numeric" placeholder="10-digit mobile" />
                </Field>
                <Field label="Confirmation deadline (Optional)">
                  <input type="date" value={content.rsvp?.deadline || ""} onChange={(e) => setRsvp({ deadline: e.target.value })} className={inputCls} />
                </Field>
                <Field label="Custom RSVP welcome note" wide>
                  <textarea value={content.rsvp?.message || ""} onChange={(e) => setRsvp({ message: e.target.value })} rows={2} className={inputCls + " resize-none"} maxLength={400} />
                </Field>
              </div>
            )}
            <NavButtons onBack={() => setStep("music")} onNext={() => save("publish")} saving={saving} />
          </Section>
        )}

        {/* STEP: Publish */}
        {step === "publish" && (
          <Section
            title={published ? "Your Invitation is Live!" : "Final Preview & Publish"}
            sub={published ? "Share this special link with your loved ones." : "Review all details, preview full experience, and complete checkout."}
            floral="wreath"
          >
            {!published ? (
              <div className="space-y-6">
                <div className="rounded-3xl border border-[#DECFC0] bg-white/95 backdrop-blur-md p-6 sm:p-8 shadow-sm">
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#9E6D4B]">CELEBRATION SUMMARY</span>
                  <ul className="mt-4 space-y-2.5 text-xs sm:text-sm text-[#4A2F1B]">
                    <li><b>Couple:</b> {content.brideName} &amp; {content.groomName}</li>
                    <li><b>Date:</b> {formatDateLong(content.weddingDate) || "Date not configured"}</li>
                    <li><b>Venue:</b> {content.venueName || "Venue not configured"}</li>
                    <li><b>Events:</b> {content.events.filter((e) => e.name).length} event(s) · {content.gallery.length} photo(s) in gallery</li>
                    <li><b>Design:</b> <b>{template.name}</b> · <span className="capitalize">{invitation.package}</span></li>
                  </ul>

                  {/* Coupon Code Section (Only shown if unpaid) */}
                  {!invitation.isPaid && (
                    <div className="mt-6 pt-6 border-t border-[#DECFC0]/60">
                      <div className="flex items-center gap-2 mb-2.5">
                        <Tag className="h-4 w-4 text-[#8B4828]" />
                        <span className="text-xs font-bold uppercase tracking-wider text-[#9E6D4B]">Have a Coupon / Promo Code?</span>
                      </div>
                      
                      {coupon ? (
                        <div className="inline-flex items-center gap-2.5 rounded-xl border border-[#C5E1BB] bg-[#EDF5E9] px-3.5 py-2 text-xs font-medium text-[#2F6824]">
                          <Check className="h-4 w-4" />
                          <span>Code <b>{coupon.code}</b> applied! Saved ₹{coupon.discountAmount.toLocaleString("en-IN")}</span>
                          <button
                            type="button"
                            onClick={removeCoupon}
                            className="ml-2 text-[#2F6824]/70 hover:text-[#A63C26]"
                            title="Remove coupon"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex max-w-sm gap-2">
                          <input
                            type="text"
                            value={couponInput}
                            onChange={(e) => {
                              setCouponInput(e.target.value.toUpperCase());
                              setCouponErr("");
                            }}
                            placeholder="Enter coupon code"
                            className="flex-1 rounded-xl border border-[#DECFC0] bg-[#FAF6EE]/50 px-3 py-2 text-xs uppercase tracking-wider text-[#2B1F17] outline-none focus:border-[#8B4828]"
                          />
                          <button
                            type="button"
                            onClick={applyCoupon}
                            disabled={couponBusy || !couponInput.trim()}
                            className="rounded-xl border border-[#DECFC0] bg-white px-4 py-2 text-xs font-bold text-[#8B4828] hover:bg-[#FAF6EE] disabled:opacity-50"
                          >
                            {couponBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Apply"}
                          </button>
                        </div>
                      )}
                      {couponErr && <p className="mt-1.5 text-xs text-[#A63C26]">{couponErr}</p>}

                      {/* Pricing Summary */}
                      <div className="mt-4 rounded-2xl bg-[#FAF6EE]/60 p-3.5 border border-[#DECFC0]/60 text-xs text-[#4A2F1B] space-y-1.5 max-w-sm">
                        <div className="flex justify-between">
                          <span className="text-[#695343]">Package Price:</span>
                          <span className="font-semibold">₹{rawPrice.toLocaleString("en-IN")}</span>
                        </div>
                        {discount > 0 && (
                          <div className="flex justify-between text-[#2F6824]">
                            <span>Discount:</span>
                            <span className="font-semibold">-₹{discount.toLocaleString("en-IN")}</span>
                          </div>
                        )}
                        <div className="flex justify-between border-t border-[#DECFC0]/50 pt-1.5 text-xs font-bold text-[#2B1F17]">
                          <span>Total Payable:</span>
                          <span className="text-sm text-[#8B4828]">₹{payablePrice.toLocaleString("en-IN")}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      onClick={openPreview}
                      disabled={saving}
                      className="inline-flex items-center gap-2 rounded-xl border border-[#DECFC0] bg-white px-6 py-3 text-xs sm:text-sm font-bold text-[#4A2F1B] hover:bg-[#FAF6EE] disabled:opacity-50"
                    >
                      <Eye className="h-4 w-4 text-[#8B4828]" /> Full Live Preview
                    </button>

                    <button
                      onClick={publishWithPayment}
                      disabled={saving || paying}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#8B4828] px-8 py-3 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-[#72391F] transition-all disabled:opacity-50"
                    >
                      {saving || paying ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CreditCard className="h-4 w-4" />
                      )}
                      {invitation.isPaid
                        ? "Publish Invitation Live"
                        : payablePrice === 0
                        ? "Publish Free with Coupon"
                        : `Pay & Publish Live (₹${payablePrice.toLocaleString("en-IN")})`}
                    </button>
                  </div>
                </div>

                {invitation.package === "premium" && (
                  <PremiumBriefCard invitationId={invitation.id} />
                )}
              </div>
            ) : (
              <div className="rounded-3xl border border-[#C5E1BB] bg-[#EDF5E9]/50 backdrop-blur-md p-8 text-center shadow-sm">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EDF5E9] border border-[#C5E1BB]">
                  <Check className="h-7 w-7 text-[#2F6824]" />
                </span>
                <h3 className="mt-4 font-serif text-3xl sm:text-4xl text-[#2B1F17]">{content.brideName} &amp; {content.groomName}</h3>
                <p className="mt-3 font-mono text-xs sm:text-sm break-all rounded-2xl bg-white p-3.5 border border-[#DECFC0] max-w-lg mx-auto">
                  {published.url}
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <button
                    onClick={copyLink}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#2B1F17] px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-[#4A2F1B]"
                  >
                    {copied ? <Check className="h-4 w-4 text-[#25D366]" /> : <Copy className="h-4 w-4" />}
                    {copied ? "Copied to Clipboard!" : "Copy Link"}
                  </button>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`You're warmly invited! 🎉\n\n${content.brideName} & ${content.groomName}\n\nOpen our digital invitation:\n${published.url}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-6 py-3 text-xs sm:text-sm font-bold text-[#0c3c1e] hover:brightness-95"
                  >
                    <WhatsAppIcon className="h-4 w-4" /> Share on WhatsApp
                  </a>
                  <a
                    href={published.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-[#DECFC0] bg-white px-6 py-3 text-xs sm:text-sm font-bold text-[#4A2F1B] hover:bg-[#FAF6EE]"
                  >
                    <Eye className="h-4 w-4" /> View Live
                  </a>
                </div>
              </div>
            )}
            <NavButtons onBack={() => setStep("rsvp")} saving={false} hideNext />
          </Section>
        )}
        </div>

        {/* Live design preview — the real selected template (site-N original
            design), refreshed once edits settle after autosave. */}
        <aside className="hidden xl:block sticky top-28">
          <LiveTemplatePreview
            slug={invitation.slug || ""}
            templateName={template.name}
            rev={previewRev}
          />
        </aside>
      </div>

      {/* 2-Step Delete Confirmation Modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md rounded-3xl border border-[#DECFC0] bg-white p-6 sm:p-8 shadow-2xl text-center">
            {/* Step 1: First Confirmation */}
            {deleteModal.step === 1 && (
              <div>
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF5F5] border border-[#FED7D7] text-[#C53030]">
                  <AlertTriangle className="h-7 w-7 text-[#C53030]" />
                </div>
                <span className="mt-3 inline-block text-[11px] font-bold uppercase tracking-widest text-[#C53030]">
                  Step 1 of 2 · Delete Invitation
                </span>
                <h3 className="mt-1 font-serif text-2xl sm:text-3xl text-[#2B1F17]">
                  Are you sure?
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-[#695343] leading-relaxed">
                  Do you really want to delete this invitation for{" "}
                  <b>
                    {content.brideName || "Bride"} &amp; {content.groomName || "Groom"}
                  </b>
                  ? All your entered events, gallery images and drafts will be removed.
                </p>

                <div className="mt-6 flex flex-col sm:flex-row gap-2.5 justify-center">
                  <button
                    type="button"
                    onClick={() => setDeleteModal({ open: false, step: 1, busy: false, error: "" })}
                    className="rounded-xl border border-[#DECFC0] bg-white px-5 py-2.5 text-xs sm:text-sm font-bold text-[#4A2F1B] hover:bg-[#FAF6EE]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteModal((p) => ({ ...p, step: 2 }))}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#C53030] px-5 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-[#9B2C2C] shadow-sm"
                  >
                    Yes, continue <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Final Confirmation */}
            {deleteModal.step === 2 && (
              <div>
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#9B2C2C] text-white shadow-md">
                  <Trash2 className="h-7 w-7" />
                </div>
                <span className="mt-3 inline-block text-[11px] font-bold uppercase tracking-widest text-[#9B2C2C]">
                  Final Step 2 of 2 · Confirmation
                </span>
                <h3 className="mt-1 font-serif text-2xl sm:text-3xl text-[#2B1F17]">
                  Are you absolutely sure?
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-[#9B2C2C] bg-[#FFF5F5] border border-[#FED7D7] rounded-xl p-3 leading-relaxed">
                  ⚠️ <b>This action cannot be undone.</b>
                  {invitation?.status === "published"
                    ? " Your public invitation link will be permanently taken down."
                    : " All your entered wedding details, story milestones, and drafts will be erased."}
                </p>

                {deleteModal.error && (
                  <p className="mt-3 text-xs text-[#C53030] font-semibold">{deleteModal.error}</p>
                )}

                <div className="mt-6 flex flex-col sm:flex-row gap-2.5 justify-center">
                  <button
                    type="button"
                    disabled={deleteModal.busy}
                    onClick={() => setDeleteModal({ open: false, step: 1, busy: false, error: "" })}
                    className="rounded-xl border border-[#DECFC0] bg-white px-5 py-2.5 text-xs sm:text-sm font-bold text-[#4A2F1B] hover:bg-[#FAF6EE] disabled:opacity-50"
                  >
                    No, keep my invitation
                  </button>
                  <button
                    type="button"
                    disabled={deleteModal.busy}
                    onClick={handleDeleteInvitation}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#C53030] px-6 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-[#822727] shadow-md disabled:opacity-50"
                  >
                    {deleteModal.busy ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4" />
                        Yes, permanently delete
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Global Minimal Footer */}
      <footer className="relative z-10 w-full px-6 py-5 text-center text-xs text-[#7A6353]/80 border-t border-[#E8DEC4]/40">
        {saveState === "saving" ? (
          <span className="inline-flex items-center gap-1.5">
            <Loader2 className="h-3 w-3 animate-spin" /> Saving…
          </span>
        ) : saveState === "saved" ? (
          <span className="inline-flex items-center gap-1.5 text-[#2F6824]">
            <Check className="h-3 w-3" /> All changes saved
          </span>
        ) : saveState === "error" ? (
          <span className="font-semibold text-[#A63C26]">
            Couldn’t save — your latest edits are not persisted. Tap Save.
          </span>
        ) : (
          <span>Personalizing in Mehfill Studio · Unsaved changes</span>
        )}
      </footer>
    </main>
  );
}

/* ───────────────────────── Sub-components ───────────────────────── */

/**
 * Live preview of the ACTUAL selected template — the same /i/<slug>?preview=1
 * renderer the public URL uses, inside a compact iPhone-style shell. `rev`
 * changes remount the iframe so every refresh shows fresh server-rendered
 * HTML (customer names, dates, venue bound into the original site-N design).
 */
function LiveTemplatePreview({
  slug,
  templateName,
  rev,
}: {
  slug: string;
  templateName: string;
  rev: number;
}) {
  if (!slug) return null;
  const src = `/i/${slug}?preview=1&embed=1&rev=${rev}`;
  const virtualW = 390;
  const virtualH = 844;
  const screenW = 254;
  const scale = screenW / virtualW;
  const screenH = Math.round(virtualH * scale);
  return (
    <div className="rounded-[1.6rem] border border-[#DECFC0] bg-white/85 backdrop-blur-xl p-4 shadow-[0_14px_44px_rgba(110,75,45,0.12)]">
      <div className="flex items-center justify-between gap-2 px-1 pb-3">
        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#9E6D4B]">
          Live design
        </span>
        <span className="max-w-[160px] truncate rounded-full border border-[#DECFC0]/70 bg-[#FAF6EE] px-2 py-0.5 text-[10px] font-bold text-[#8B4828]">
          {templateName}
        </span>
      </div>
      <div className="relative mx-auto w-[272px] rounded-[2.2rem] bg-gradient-to-b from-[#3a3632] via-[#1f1c19] to-[#2a2622] p-[9px] shadow-[0_18px_44px_rgba(0,0,0,.35)]">
        <div
          className="relative overflow-hidden rounded-[1.8rem] bg-white"
          style={{ width: `${screenW}px`, height: `${screenH}px` }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-[7px] z-10 h-[18px] w-[70px] -translate-x-1/2 rounded-full bg-black shadow-[inset_0_0_0_1px_rgba(255,255,255,.12)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute bottom-[5px] left-1/2 z-10 h-[3.5px] w-[86px] -translate-x-1/2 rounded-full bg-black/30"
          />
          <iframe
            key={src}
            src={src}
            title={`${templateName} live preview`}
            className="border-0 bg-white block"
            style={{
              width: `${virtualW}px`,
              height: `${virtualH}px`,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
            }}
          />
        </div>
      </div>
      <p className="mt-3 text-center text-[11px] leading-relaxed text-[#7A6353]">
        Exactly how guests will see it · updates after each save
      </p>
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-[#DECFC0] bg-white/95 px-4 py-2.5 text-xs sm:text-sm text-[#2B1F17] outline-none transition-all placeholder:text-[#B5A496] focus:border-[#8B4828] focus:ring-2 focus:ring-[#8B4828]/15";

function Section({
  title,
  sub,
  children,
}: {
  title: string;
  sub: string;
  children: React.ReactNode;
  floral?: "garland" | "wreath";
}) {
  return (
    <div className="relative rounded-[2rem] border border-[#DECFC0] bg-white/85 backdrop-blur-xl p-6 sm:p-8 shadow-[0_12px_40px_rgba(110,75,45,0.06)]">
      <div className="pt-1">
        <h2 className="font-serif font-light text-2xl sm:text-4xl text-[#2B1F17]">{title}</h2>
        <p className="mt-1 text-xs sm:text-sm text-[#695343]">{sub}</p>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  wide,
  required,
  error,
}: {
  label: string;
  children: React.ReactNode;
  wide?: boolean;
  required?: boolean;
  error?: string;
}) {
  return (
    <label className={`block ${wide ? "sm:col-span-2" : ""}`}>
      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-[#7A6353]">
        {label}
        {required && <span className="text-[#A63C26]"> *</span>}
      </span>
      {children}
      {error && (
        <span role="alert" className="mt-1 block text-[11px] font-semibold text-[#A63C26]">
          {error}
        </span>
      )}
    </label>
  );
}

/** Input className with an error state overlay. */
function inputErrCls(error?: string) {
  return error ? " !border-[#A63C26] !bg-[#FDF4F2] !ring-2 !ring-[#A63C26]/15" : "";
}

function NavButtons({
  onBack,
  onNext,
  saving,
  hideNext,
}: {
  onBack?: () => void;
  onNext?: () => void;
  saving: boolean;
  hideNext?: boolean;
}) {
  return (
    <div className="mt-8 flex items-center justify-between gap-3 border-t border-[#DECFC0]/50 pt-5">
      {onBack ? (
        <button
          onClick={onBack}
          className="text-xs sm:text-sm font-semibold text-[#695343] hover:text-[#2B1F17] transition-colors"
        >
          ← Back
        </button>
      ) : <span />}
      {!hideNext && onNext && (
        <button
          onClick={onNext}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-[#8B4828] px-7 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-[#72391F] transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Next Step →
        </button>
      )}
    </div>
  );
}

function LoveStoryEditor({
  milestones,
  onChange,
  onRemove,
}: {
  milestones: LoveStoryMilestone[];
  onChange: (ms: LoveStoryMilestone[]) => void;
  onRemove: (id: string) => void;
}) {
  const [busy, setBusy] = useState(false);

  const add = () => {
    onChange([...milestones, newMilestone()]);
  };

  const uploadPhoto = async (file: File) => {
    const fd = new FormData();
    fd.set("file", file);
    fd.set("kind", "photo");
    const res = await fetch("/api/invitations/upload", { method: "POST", body: fd });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || "Upload failed.");
    return data.url as string;
  };

  return (
    <div className="rounded-[2rem] border border-[#DECFC0] bg-white/85 backdrop-blur-xl p-6 sm:p-8 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-serif font-light text-2xl sm:text-4xl text-[#2B1F17]">Our Love Story</h2>
          <p className="mt-1 text-xs sm:text-sm text-[#695343]">Chronicle how you first met, the proposal, and moments leading to marriage.</p>
        </div>
        <button
          onClick={add}
          disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#8B4828] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#72391F]"
        >
          <Plus className="h-3.5 w-3.5" /> Milestone
        </button>
      </div>

      {milestones.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#DECFC0] p-10 text-center">
          <p className="font-serif text-2xl italic text-[#695343]">No milestones added yet</p>
          <p className="mt-1 text-xs text-[#7A6353]">Add when you first met, first date, or the proposal.</p>
          <button
            onClick={add}
            className="mt-4 rounded-xl bg-[#8B4828] px-6 py-2.5 text-xs font-bold text-white"
          >
            Add First Milestone
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {milestones.map((m, idx) => (
            <div key={m.id} className="rounded-2xl border border-[#DECFC0]/60 bg-white p-4 shadow-xs">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <input
                    value={m.title}
                    onChange={(e) => onChange(milestones.map((x) => x.id === m.id ? { ...x, title: e.target.value } : x))}
                    placeholder="Milestone title (e.g. The First Date)"
                    className={inputCls}
                  />
                  <MehfillDatePicker
                    value={m.date}
                    onChange={(val) => onChange(milestones.map((x) => x.id === m.id ? { ...x, date: val } : x))}
                    placeholder="Milestone date"
                  />
                  <textarea
                    value={m.description}
                    onChange={(e) => onChange(milestones.map((x) => x.id === m.id ? { ...x, description: e.target.value } : x))}
                    rows={2}
                    className={inputCls + " resize-none"}
                    placeholder="What made this moment unforgettable…"
                    maxLength={500}
                  />
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center gap-1">
                    {idx > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          const next = [...milestones];
                          [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
                          onChange(next);
                        }}
                        className="rounded-lg border border-[#DECFC0] p-1.5 text-[#7A6353] hover:bg-[#FAF6EE]"
                        aria-label="Move milestone up"
                        title="Move up"
                      >
                        <ChevronUp className="h-3.5 w-3.5" />
                      </button>
                    )}
                    {idx < milestones.length - 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const next = [...milestones];
                          [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
                          onChange(next);
                        }}
                        className="rounded-lg border border-[#DECFC0] p-1.5 text-[#7A6353] hover:bg-[#FAF6EE]"
                        aria-label="Move milestone down"
                        title="Move down"
                      >
                        <ChevronDown className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button onClick={() => onRemove(m.id)} className="rounded-lg border border-[#DECFC0] p-1.5 text-[#A89484] hover:text-[#A63C26]" aria-label="Remove">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  {m.imageUrl ? (
                    <div className="flex flex-col items-center gap-1">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={m.imageUrl} alt={m.title || "Milestone"} className="h-12 w-12 rounded-lg object-cover border border-[#DECFC0]" />
                      <button
                        type="button"
                        onClick={() => onChange(milestones.map((x) => x.id === m.id ? { ...x, imageUrl: "" } : x))}
                        className="text-[10px] font-semibold text-[#A63C26] hover:underline"
                      >
                        Remove photo
                      </button>
                    </div>
                  ) : null}
                  <label className="cursor-pointer rounded-xl border border-[#DECFC0] px-2.5 py-1.5 text-[11px] font-bold text-[#8B4828] hover:bg-[#FAF6EE] text-center">
                    {m.imageUrl ? "Replace" : "Photo"}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={async (e) => {
                        const f = e.target.files?.[0];
                        if (!f) return;
                        setBusy(true);
                        try {
                          const url = await uploadPhoto(f);
                          onChange(milestones.map((x) => x.id === m.id ? { ...x, imageUrl: url } : x));
                        } catch (err) {
                          console.error(err);
                        } finally {
                          setBusy(false);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EventCard({
  event,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
  canRemove,
  index,
}: {
  event: InvitationEvent;
  onChange: (patch: Partial<InvitationEvent>) => void;
  onRemove: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canRemove: boolean;
  index: number;
}) {
  const mapUrlInvalid = Boolean(event.mapsUrl && event.mapsUrl.trim() && !isSafeHttpUrl(event.mapsUrl));
  return (
    <div className="rounded-2xl border border-[#DECFC0]/70 bg-white p-4 shadow-xs">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#9E6D4B]">EVENT {index + 1}</span>
        <div className="flex items-center gap-1.5">
          {onMoveUp && (
            <button type="button" onClick={onMoveUp} className="rounded-lg border border-[#DECFC0] p-1 text-[#7A6353] hover:bg-[#FAF6EE]" aria-label="Move ceremony up" title="Move up">
              <ChevronUp className="h-3.5 w-3.5" />
            </button>
          )}
          {onMoveDown && (
            <button type="button" onClick={onMoveDown} className="rounded-lg border border-[#DECFC0] p-1 text-[#7A6353] hover:bg-[#FAF6EE]" aria-label="Move ceremony down" title="Move down">
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          )}
          {canRemove && (
            <button type="button" onClick={onRemove} className="rounded-lg border border-[#DECFC0] p-1 text-[#A89484] hover:text-[#A63C26]" aria-label="Remove event">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <input value={event.name} onChange={(e) => onChange({ name: e.target.value })} placeholder="Ceremony name (e.g. Mehendi Ceremony)" className={inputCls} />
        <MehfillDatePicker
          value={event.date}
          onChange={(val) => onChange({ date: val })}
          placeholder="Ceremony date (Optional)"
        />
        <MehfillTimePicker
          value={event.time}
          onChange={(val) => onChange({ time: val })}
          placeholder="Ceremony timing (Optional)"
        />
        <input value={event.venue} onChange={(e) => onChange({ venue: e.target.value })} placeholder="Venue name (Optional)" className={inputCls} />
        <input value={event.address || ""} onChange={(e) => onChange({ address: e.target.value })} placeholder="Venue address (Optional)" className={inputCls} />
        <div>
          <input
            value={event.mapsUrl || ""}
            onChange={(e) => onChange({ mapsUrl: e.target.value })}
            placeholder="Google Maps URL (Optional, https://...)"
            className={inputCls + (mapUrlInvalid ? " !border-[#A63C26]" : "")}
          />
          {mapUrlInvalid && (
            <span className="mt-1 block text-[11px] font-semibold text-[#A63C26]">
              Enter a valid http:// or https:// URL.
            </span>
          )}
        </div>
        <input value={event.description || ""} onChange={(e) => onChange({ description: e.target.value })} placeholder="Short description or attire guidelines (Optional)" className={inputCls + " sm:col-span-2"} />
      </div>
    </div>
  );
}

function PremiumBriefCard({ invitationId }: { invitationId: string }) {
  const [brief, setBrief] = useState("");
  const [colours, setColours] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("busy");
    try {
      const res = await fetch("/api/customisation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invitationId, brief, colourPrefs: colours }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Could not submit.");
      setState("done");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Something went wrong.");
      setState("error");
    }
  };

  if (state === "done") {
    return (
      <div className="rounded-2xl border border-[#C5E1BB] bg-[#EDF5E9] p-5">
        <p className="text-xs sm:text-sm font-bold text-[#2F6824]">Customisation brief submitted successfully ✓</p>
        <p className="mt-1 text-xs text-[#4A2F1B]">
          Our design team will review your brief and update your dashboard with preview drafts.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-[#DECFC0] bg-white p-6 shadow-sm">
      <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#9E6D4B]">PREMIUM BESPOKE SERVICE</span>
      <h3 className="mt-1 font-serif text-2xl text-[#2B1F17]">Submit Customisation Brief</h3>
      <p className="mt-1 text-xs text-[#695343]">
        Tell our design team your preferred colour schemes, typography desires, or special motifs.
      </p>
      <textarea
        value={brief}
        onChange={(e) => setBrief(e.target.value)}
        required
        rows={4}
        placeholder="Describe your bespoke requirements in detail…"
        className="mt-3 w-full rounded-xl border border-[#DECFC0] bg-[#FAF6EE]/50 p-3 text-xs sm:text-sm outline-none focus:border-[#8B4828] resize-none"
      />
      <input
        value={colours}
        onChange={(e) => setColours(e.target.value)}
        placeholder="Preferred colours (e.g. Royal emerald & Champagne gold)"
        className="mt-3 w-full rounded-xl border border-[#DECFC0] bg-[#FAF6EE]/50 px-3 py-2 text-xs sm:text-sm outline-none focus:border-[#8B4828]"
      />
      {state === "error" && <p className="mt-2 text-xs text-[#A63C26]">{msg}</p>}
      <button
        disabled={state === "busy"}
        className="mt-4 rounded-xl bg-[#8B4828] px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#72391F] disabled:opacity-50"
      >
        {state === "busy" ? "Submitting…" : "Submit Design Brief"}
      </button>
    </form>
  );
}
