"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import SupportMarkdown from "./SupportMarkdown";
import { waLink, CONTACT_EMAIL, WA_MSG_GENERAL } from "@/lib/contact";
import type { SupportContext } from "@/lib/support/types";

type Mode = "chat" | "bug" | "contact";

interface Msg {
  role: "user" | "assistant";
  content: string;
  image?: string | null;
}

const WELCOME: Msg = {
  role: "assistant",
  content:
    "Namaste! I'm the **Mehfill assistant**. Ask me anything — designs, the editor, saving, payments or publishing. I can also open a support ticket if something is broken.",
};

const QUICK_ACTIONS: { label: string; text: string }[] = [
  {
    label: "Choose a template",
    text: "How do I choose a design template and start a new invitation?",
  },
  {
    label: "Publish my invitation",
    text: "How do I publish my invitation and get the shareable link?",
  },
  {
    label: "Payment stuck",
    text: "My payment is stuck or money was deducted but nothing happened. What do I do?",
  },
  {
    label: "Wrong design / date",
    text: "The wrong design or an old date is showing in my invitation. How do I fix it?",
  },
  {
    label: "Photos not uploading",
    text: "Photos are not uploading in the editor. How do I fix this?",
  },
  {
    label: "Pricing & packages",
    text: "What are the packages and prices?",
  },
  { label: "Report a bug", text: "" },
];

const SESSION_KEY = "mf_support_session";
const CONV_KEY = "mf_support_conversation";

function getSessionId(): string {
  try {
    let s = localStorage.getItem(SESSION_KEY);
    if (!s || !/^[A-Za-z0-9-]{8,64}$/.test(s)) {
      s =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
      localStorage.setItem(SESSION_KEY, s);
    }
    return s;
  } catch {
    return `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
  }
}

function readEditorContext(): Partial<SupportContext> {
  if (typeof window === "undefined") return {};
  const w = window as unknown as { __MF_SUPPORT_CTX?: Record<string, unknown> };
  const e = w.__MF_SUPPORT_CTX || {};
  const out: Partial<SupportContext> = {};
  if (typeof e.templateSlug === "string") out.templateSlug = e.templateSlug;
  if (typeof e.step === "string") out.editorStep = e.step;
  if (typeof e.invitationId === "string") out.invitationId = e.invitationId;
  if (typeof e.saved === "boolean") out.saved = e.saved;
  if (typeof e.errorText === "string") out.errorText = e.errorText;
  return out;
}

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

export default function SupportWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("chat");
  const [messages, setMessages] = useState<Msg[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ticket, setTicket] = useState<{ ref: string; message: string } | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [restored, setRestored] = useState(false);
  const [convId, setConvId] = useState<string | null>(() => {
    try {
      return typeof window !== "undefined" ? localStorage.getItem(CONV_KEY) : null;
    } catch {
      return null;
    }
  });

  const abortRef = useRef<AbortController | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const hidden = useMemo(
    () => !pathname || pathname.startsWith("/admin") || pathname.startsWith("/studio"),
    [pathname]
  );

  const restoreHistory = useCallback(async (conversationId: string) => {
    try {
      const res = await fetch(
        `/api/support/chat?conversationId=${encodeURIComponent(conversationId)}&sessionId=${encodeURIComponent(
          getSessionId()
        )}`
      );
      if (!res.ok) return;
      const data = await res.json();
      const rows = (data.messages || []) as Msg[];
      if (rows.length) setMessages([WELCOME, ...rows]);
      setRestored(true);
    } catch {
      /* history is best-effort */
    }
  }, []);

  // Opening the panel (event handler, not an effect) restores stored history
  // once per session — setState stays out of effect bodies.
  const toggleOpen = useCallback(() => {
    const next = !open;
    setOpen(next);
    if (next && convId && !restored) void restoreHistory(convId);
  }, [convId, open, restoreHistory, restored]);

  useEffect(() => {
    if (!open) return;
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, sending, open, mode]);

  const context = useCallback((): SupportContext => {
    return { path: pathname || "/", ...readEditorContext() } as SupportContext;
  }, [pathname]);

  const sendChat = useCallback(
    async (text: string) => {
      const message = text.trim();
      if (!message || sending) return;
      setError(null);
      setMode("chat");
      setMessages((m) => [...m, { role: "user", content: message, image }]);
      setInput("");
      const sentImage = image;
      setImage(null);
      setSending(true);
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const res = await fetch("/api/support/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message,
            sessionId: getSessionId(),
            conversationId: convId,
            context: context(),
            image: sentImage || undefined,
          }),
          signal: controller.signal,
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.reply) {
          throw new Error(data.error || "Could not reach support. Please try again.");
        }
        setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
        if (data.conversationId) {
          setConvId(data.conversationId);
          try {
            localStorage.setItem(CONV_KEY, data.conversationId);
          } catch {
            /* ignore */
          }
        }
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
        setError((e as Error).message || "Network error. Please try again.");
      } finally {
        setSending(false);
        abortRef.current = null;
      }
    },
    [convId, context, image, sending]
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setSending(false);
  }, []);

  const submitBug = useCallback(async () => {
    const description = input.trim();
    if (description.length < 8 || sending) {
      setError("Please describe the problem in a sentence or two.");
      return;
    }
    setError(null);
    setSending(true);
    try {
      const res = await fetch("/api/support/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description,
          sessionId: getSessionId(),
          conversationId: convId,
          context: context(),
          image: image || undefined,
          attachScreenshot: Boolean(image),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ticket_ref) {
        throw new Error(data.error || "Could not create the ticket. Please try again.");
      }
      setTicket({ ref: data.ticket_ref, message: data.message });
      setMessages((m) => [
        ...m,
        {
          role: "user",
          content: `Reported a bug: ${description}`,
          image,
        },
        {
          role: "assistant",
          content: `Ticket **${data.ticket_ref}** created.\n\n${data.message}\n\nYou can keep describing the problem here — I'll attach it to the same ticket context for the team.`,
        },
      ]);
      setInput("");
      setImage(null);
      setMode("chat");
    } catch (e) {
      setError((e as Error).message || "Network error. Please try again.");
    } finally {
      setSending(false);
    }
  }, [convId, context, image, input, sending]);

  const pickImage = useCallback((file: File | undefined | null) => {
    setImageError(null);
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setImageError("Please choose a JPEG, PNG or WebP screenshot.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setImageError("Image must be under 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setImage(typeof reader.result === "string" ? reader.result : null);
    reader.onerror = () => setImageError("Could not read that file.");
    reader.readAsDataURL(file);
  }, []);

  const newConversation = useCallback(() => {
    abortRef.current?.abort();
    setMessages([WELCOME]);
    setConvId(null);
    setTicket(null);
    setError(null);
    setRestored(false);
    setMode("chat");
    setInput("");
    setImage(null);
    try {
      localStorage.removeItem(CONV_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const onAction = useCallback(
    (action: { label: string; text: string }) => {
      if (action.label === "Report a bug") {
        setMode("bug");
        setError(null);
        setTimeout(() => inputRef.current?.focus(), 50);
        return;
      }
      void sendChat(action.text);
    },
    [sendChat]
  );

  if (hidden) return null;

  return (
    <>
      {/* FAB — sits above the WhatsApp float (WhatsApp: bottom-5/7 right-5/7, z-70) */}
      <button
        type="button"
        onClick={toggleOpen}
        aria-label={open ? "Close support chat" : "Open support chat"}
        aria-expanded={open}
        className="group fixed bottom-[88px] right-5 md:bottom-[96px] md:right-7 z-[69] flex items-center gap-0 rounded-full bg-charcoal text-ivory shadow-[0_8px_24px_rgba(28,25,23,0.35)] transition-shadow hover:shadow-[0_12px_32px_rgba(28,25,23,0.5)]"
      >
        <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-semibold transition-all duration-300 group-hover:ml-4 group-hover:max-w-[120px]">
          Support
        </span>
        <span className="flex h-12 w-12 md:h-14 md:w-14 items-center justify-center">
          {open ? (
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 13a8 8 0 0 1 16 0" />
              <rect x="2.5" y="13" width="4" height="6" rx="2" />
              <rect x="17.5" y="13" width="4" height="6" rx="2" />
              <path d="M19.5 19v.5a2.5 2.5 0 0 1-2.5 2.5h-3" />
            </svg>
          )}
        </span>
      </button>

      {/* Panel */}
      <div
        role="dialog"
        aria-label="Mehfill support chat"
        className={`fixed z-[80] right-3 bottom-[148px] md:right-7 md:bottom-[164px] w-[calc(100vw-1.5rem)] max-w-[392px] origin-bottom-right transition-all duration-200 ${
          open ? "scale-100 opacity-100 translate-y-0" : "pointer-events-none scale-95 opacity-0 translate-y-3"
        }`}
      >
        <div className="flex h-[min(560px,calc(100dvh-200px))] flex-col overflow-hidden rounded-2xl border border-linen bg-ivory shadow-[0_20px_60px_rgba(28,25,23,0.28)]">
          {/* header */}
          <div className="flex items-center justify-between border-b border-linen bg-cream px-4 py-3">
            <div>
              <p className="text-sm font-bold text-charcoal">Mehfill Support</p>
              <p className="text-[11px] text-smoke">AI assistant · replies instantly</p>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={newConversation}
                className="rounded-full px-2.5 py-1 text-[11px] font-semibold text-smoke hover:bg-sand"
                title="Start a new conversation"
              >
                New chat
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Minimise support chat"
                className="flex h-7 w-7 items-center justify-center rounded-full text-smoke hover:bg-sand"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M5 12h14" />
                </svg>
              </button>
            </div>
          </div>

          {/* mode banner */}
          {mode === "bug" && (
            <div className="flex items-center justify-between border-b border-champagne-light bg-[#f7efdd] px-4 py-2">
              <p className="text-[12px] font-semibold text-espresso">Report a bug — the team will see it</p>
              <button
                type="button"
                onClick={() => {
                  setMode("chat");
                  setError(null);
                }}
                className="text-[11px] font-semibold text-smoke hover:text-charcoal"
              >
                Cancel
              </button>
            </div>
          )}

          {/* messages */}
          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 ${
                    m.role === "user"
                      ? "bg-charcoal text-ivory rounded-br-md"
                      : "border border-linen bg-cream text-espresso rounded-bl-md"
                  }`}
                >
                  {m.image ? (
                    <img
                      src={m.image}
                      alt="Your screenshot"
                      className="mb-2 max-h-36 rounded-lg border border-linen object-contain"
                    />
                  ) : null}
                  {m.role === "assistant" ? (
                    <SupportMarkdown text={m.content} />
                  ) : (
                    <p className="whitespace-pre-wrap text-[13.5px] leading-relaxed">{m.content}</p>
                  )}
                </div>
              </div>
            ))}

            {sending && mode === "chat" && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-md border border-linen bg-cream px-4 py-3">
                  <span className="inline-flex gap-1">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-smoke [animation-delay:0ms]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-smoke [animation-delay:150ms]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-smoke [animation-delay:300ms]" />
                  </span>
                </div>
              </div>
            )}

            {ticket && (
              <p className="text-center text-[11px] font-semibold text-olive">
                Ticket {ticket.ref} · {ticket.message.replace(/^Ticket created — /, "")}
              </p>
            )}

            {error && (
              <div className="rounded-xl border border-[#e7b9a8] bg-[#fbeee8] px-3 py-2">
                <p className="text-[12.5px] text-[#8a3d20]">{error}</p>
                <button
                  type="button"
                  onClick={() => setError(null)}
                  className="mt-1 text-[11px] font-semibold text-[#8a3d20] underline"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* quick actions */}
            {!sending && mode === "chat" && messages.length <= 3 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {QUICK_ACTIONS.map((a) => (
                  <button
                    key={a.label}
                    type="button"
                    onClick={() => onAction(a)}
                    className="rounded-full border border-linen bg-white px-3 py-1.5 text-[11.5px] font-semibold text-espresso transition-colors hover:border-champagne hover:bg-[#faf3e6]"
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* contact mode */}
          {mode === "contact" && (
            <div className="border-t border-linen bg-cream px-4 py-3 space-y-2">
              <p className="text-[12px] text-smoke">Talk to a human from the Mehfill team:</p>
              <a
                href={waLink(WA_MSG_GENERAL)}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-xl bg-[#25D366] px-3 py-2 text-center text-[13px] font-bold text-white hover:brightness-95"
              >
                WhatsApp us
              </a>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="block rounded-xl border border-linen bg-white px-3 py-2 text-center text-[13px] font-semibold text-espresso hover:bg-sand"
              >
                Email {CONTACT_EMAIL}
              </a>
            </div>
          )}

          {/* image preview */}
          {image && (
            <div className="flex items-center gap-2 border-t border-linen bg-cream px-4 py-2">
              <img src={image} alt="Attachment preview" className="h-10 w-10 rounded-md border border-linen object-cover" />
              <p className="flex-1 truncate text-[11.5px] text-smoke">
                Screenshot attached {mode === "chat" ? "— the assistant can see it (not stored)" : "— will be sent to the team"}
              </p>
              <button
                type="button"
                onClick={() => setImage(null)}
                className="text-[11px] font-semibold text-smoke hover:text-charcoal"
              >
                Remove
              </button>
            </div>
          )}
          {imageError && (
            <p className="border-t border-linen bg-[#fbeee8] px-4 py-1.5 text-[11.5px] text-[#8a3d20]">{imageError}</p>
          )}

          {/* input row */}
          <div className="border-t border-linen bg-ivory px-3 py-2.5">
            <div className="flex items-end gap-1.5">
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  pickImage(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                aria-label="Attach a screenshot"
                title="Attach a screenshot (max 2MB)"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-smoke hover:bg-sand"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="16" rx="2" />
                  <circle cx="8.5" cy="9.5" r="1.5" />
                  <path d="M21 16l-5-5-6 6-3-3-4 4" />
                </svg>
              </button>
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value.slice(0, 2000))}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (mode === "bug") void submitBug();
                    else void sendChat(input);
                  }
                }}
                rows={1}
                placeholder={mode === "bug" ? "What exactly went wrong?" : "Ask about designs, payments, publishing…"}
                className="max-h-24 min-h-9 flex-1 resize-none rounded-2xl border border-linen bg-white px-3.5 py-2 text-[13.5px] text-charcoal outline-none placeholder:text-smoke/70 focus:border-champagne"
              />
              {sending && mode === "chat" ? (
                <button
                  type="button"
                  onClick={stop}
                  aria-label="Stop waiting for reply"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-charcoal text-ivory"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                    <rect x="7" y="7" width="10" height="10" rx="1.5" />
                  </svg>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => (mode === "bug" ? void submitBug() : void sendChat(input))}
                  disabled={sending || (!input.trim() && mode !== "bug")}
                  aria-label={mode === "bug" ? "Submit bug report" : "Send message"}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-charcoal text-ivory transition-opacity disabled:opacity-35"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 12l16-8-6 16-2.5-6.5L4 12z" />
                  </svg>
                </button>
              )}
            </div>
            <div className="mt-1.5 flex items-center justify-between px-1">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setMode((m) => (m === "bug" ? "chat" : "bug"));
                    setError(null);
                    setTimeout(() => inputRef.current?.focus(), 50);
                  }}
                  className={`text-[11px] font-semibold ${mode === "bug" ? "text-terracotta-deep" : "text-smoke hover:text-charcoal"}`}
                >
                  {mode === "bug" ? "Back to chat" : "Report a bug"}
                </button>
                <button
                  type="button"
                  onClick={() => setMode((m) => (m === "contact" ? "chat" : "contact"))}
                  className={`text-[11px] font-semibold ${mode === "contact" ? "text-terracotta-deep" : "text-smoke hover:text-charcoal"}`}
                >
                  Contact human
                </button>
              </div>
              <p className="text-[10px] text-smoke/80">AI can make mistakes · verify critical info</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
