// Invitation content model — the single source of truth stored as
// JSONB on invitations.content. Every template renders from this shape.

export interface InvitationEvent {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM (24h)
  venue: string;
  description?: string;
}

export interface LoveStoryMilestone {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  description: string;
  imageUrl?: string;
}

export interface InvitationRsvp {
  enabled: boolean;
  contactName?: string;
  contactPhone?: string;
  deadline?: string;
  message?: string;
  guestOptions?: string[];
}

export interface InvitationContent {
  brideName: string;
  groomName: string;
  initials?: string;
  familyNames?: string;
  message?: string;
  intro?: string;
  weddingDate: string; // YYYY-MM-DD
  startTime?: string;
  endTime?: string;
  venueName: string;
  venueAddress: string;
  mapsUrl?: string;
  events: InvitationEvent[];
  gallery: string[];
  /** Customer-selected/uploaded background music (storage URL). Empty = template default. */
  musicUrl?: string;
  rsvp: InvitationRsvp;
  /** Love story milestones - optional cards in the invitation */
  loveStory?: LoveStoryMilestone[];
  /** Whether to use the original template's demo/replaceable photos when the customer hasn't uploaded their own. Defaults to false. */
  useTemplateImages?: boolean;
}

export type InvitationStatus =
  | "draft"
  | "published"
  | "suspended"
  | "deleted";

export interface InvitationRecord {
  id: string;
  user_id: string;
  order_id: number | null;
  template_slug: string;
  package: "basic" | "premium";
  slug: string | null;
  status: InvitationStatus;
  content: InvitationContent;
  theme: Record<string, string>;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  isPaid?: boolean;
}

export function defaultContent(): InvitationContent {
  return {
    brideName: "",
    groomName: "",
    initials: "",
    familyNames: "",
    message:
      "With the blessings of our families, we invite you to share in our joy as we begin our forever.",
    intro: "",
    weddingDate: "",
    startTime: "",
    endTime: "",
    venueName: "",
    venueAddress: "",
    mapsUrl: "",
    events: [
      {
        id: crypto.randomUUID(),
        name: "Wedding Ceremony",
        date: "",
        time: "",
        venue: "",
      },
    ],
    gallery: [],
    musicUrl: "",
    rsvp: {
      enabled: true,
      contactName: "",
      contactPhone: "",
      message: "Kindly confirm your presence before the celebrations begin.",
      guestOptions: ["1", "2", "3", "4", "5+"],
    },
    loveStory: [],
    useTemplateImages: false,
  };
}

export function newMilestone(): LoveStoryMilestone {
  return {
    id: crypto.randomUUID(),
    title: "",
    date: "",
    description: "",
    imageUrl: "",
  };
}

/** Shape check only — used for draft saves so customers can progress step-by-step. */
export function isContentShaped(c: unknown): c is InvitationContent {
  if (!c || typeof c !== "object") return false;
  const o = c as Record<string, unknown>;
  return (
    typeof o.brideName === "string" &&
    typeof o.groomName === "string" &&
    typeof o.weddingDate === "string" &&
    typeof o.venueName === "string" &&
    Array.isArray(o.events)
  );
}

/** Strict check — required before publishing (names, date and venue must be set). */
export function isValidContent(c: unknown): c is InvitationContent {
  if (!isContentShaped(c)) return false;
  return c.weddingDate.length > 0;
}

export function newEvent(): InvitationEvent {
  return {
    id: crypto.randomUUID(),
    name: "",
    date: "",
    time: "",
    venue: "",
  };
}

export function publicUrl(slug: string) {
  return `https://mehfill.in/i/${slug}`;
}

const RESERVED_SLUGS = new Set([
  "admin", "api", "dashboard", "demos", "login", "checkout", "about",
  "contact", "privacy-policy", "terms-and-conditions", "refund-policy",
  "cookie-policy", "studio", "site-1", "site-2", "site-3", "site-4",
  "site-5", "site-6", "site-7", "site-8", "i", "static", "assets",
]);

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export function generateSlug(
  bride: string,
  groom: string,
  existing: Set<string> | string[]
): string {
  const taken = existing instanceof Set ? existing : new Set(existing);
  const base =
    slugify(`${bride}-${groom}`) ||
    `invite-${Date.now().toString(36)}`;
  let candidate = base;
  let n = 2;
  while (RESERVED_SLUGS.has(candidate) || taken.has(candidate)) {
    candidate = `${base}-${n++}`;
  }
  return candidate;
}

/** Provisional slug used at invitation creation (before couple names are known).
 *  Never derived from the account email/username — publish replaces it with
 *  `bride-groom`. Matches /^invite-/ so publish can detect and regenerate. */
export function provisionalSlug(existing: Set<string> | string[]): string {
  const taken = existing instanceof Set ? existing : new Set(existing);
  let candidate = `invite-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  while (RESERVED_SLUGS.has(candidate) || taken.has(candidate)) {
    candidate = `invite-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  }
  return candidate;
}

/** True when the slug is still a placeholder (never personalised from couple names). */
export function isProvisionalSlug(slug: string | null | undefined): boolean {
  if (!slug) return true;
  return /^invite(-|$)/.test(slug) || /^invite-[a-z0-9]+$/.test(slug);
}

export function formatDateLong(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatTime12(t?: string): string {
  if (!t) return "";
  const [hRaw, m] = t.split(":");
  let h = Number(hRaw);
  if (Number.isNaN(h)) return t;
  const suffix = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m || "00"} ${suffix}`;
}
