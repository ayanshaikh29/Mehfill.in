# Technical SEO Overhaul — mehfill.in

## Context

Audit of the Next.js 16 (App Router, TypeScript, Tailwind v4, Vercel) codebase shows the SEO foundation is **already substantially built**: `metadataBase` set, self-referencing canonicals on all ~25 public pages, `app/sitemap.ts` + `app/robots.ts` exist, www→apex 301 in middleware + next.config, Organization/WebSite/FAQPage/BreadcrumbList JSON-LD in place, next/font + AVIF/WebP images, policy pages exist. The real gaps are: **thin category copy (159–351 words vs. 400+ target), no blog at all, no baby-shower category page, policy pages not noindexed and still in the sitemap, no Product/Offer schema, no sample-template grid or pricing section on category pages, and some titles/descriptions out of the 50–60 / 140–160 char range.**

User decisions: blog as **static TS data files** (matches `lib/landing-content.ts` pattern, no new deps); **keep Vercel's platform-level HTTP→HTTPS** (no middleware change — loop risk documented in `middleware.ts:17-20`).

---

## Phase 1 — Canonical, indexing, meta hygiene

1. **http→https**: no code change (Vercel HSTS handles it; www→apex already 301s). Document in summary.
2. **Policy pages** (`app/privacy-policy`, `app/refund-policy`, `app/cookie-policy`, `app/terms-and-conditions`): add `robots: { index: false, follow: true }` to each page's `metadata`.
3. **`app/sitemap.ts`**:
   - Remove the 4 policy URLs (prompt: exclude policy pages).
   - Add `/blog` + each blog post slug (Phase 4).
   - Add `/baby-shower-invitations` (Phase 3 — auto via `LANDING_PAGES` if added there).
   - Replace hardcoded `new Date("2026-10-01")` with `new Date()` so lastmod reflects deploys.
4. **`app/robots.ts`**: already allows all and disallows `/api`, `/dashboard`, `/checkout` (+ admin/studio/login). No change needed — verify only.
5. **Title/description length pass** (50–60 / 140–160 chars, keyword first) across all public pages. Known offenders from audit:
   - `event-invitations` title 68 chars, description 164 → shorten.
   - `about` description 178, `demos` 170, `free/whatsapp-invitation-wording` 172, root layout default 176 → trim to ≤160.
   - Category titles/descriptions live in `lib/landing-content.ts` — fix centrally there.
   - Skip policy pages (noindexed anyway).

## Phase 2 — Category landing pages (core work)

**Files:** `lib/landing-content.ts`, `components/SeoLanding.tsx`, (small) `components/Pricing.tsx` or a new static pricing block.

1. **Rewrite/expand all 10 entries in `lib/landing-content.ts`** to 400+ words of unique natural copy each, with a consistent section structure per the prompt:
   - What it is → Why digital beats paper cards → How it works in 3 steps → (templates grid — rendered component) → (pricing — rendered component) → FAQ (5–6 Qs) → CTA.
   - Keywords woven in naturally per page: *digital wedding invitation India, online nikah card maker, e-invite with music, WhatsApp wedding invitation, video invitation maker* (one primary intent per page, as the file's existing comment demands — no stuffing).
   - Messaging rule: always **"paper card → digital invitation"**; audit found one line in `components/CinematicExperience.tsx:19` ("Not a PDF. Not a forwarded image.") — that's anti-PDF positioning, acceptable, but re-read all copy for any "PDF to digital" framing and fix.
   - Ensure every page ends with internal links: `relatedSlugs` (already rendered) + explicit home link (already rendered) — review/extend `relatedSlugs` so the new baby-shower page participates.
2. **Upgrade `components/SeoLanding.tsx`** to render the required sections:
   - **"How it works" 3-step block** — small shared step list (pick a template → customise in the editor → publish & share on WhatsApp), pulled from data or a shared constant.
   - **Sample templates grid** — new sub-component: filter `lib/catalog.ts` `CATALOG` by the landing's occasion (map slug→occasion), render 3–6 cards using `next/image` (explicit `width`/`height` or `fill`+`sizes`, `alt` from template description, lazy by default, AVIF/WebP already configured), linking to `/templates` and demo URLs.
   - **Pricing block** — static (server-rendered) two-plan summary from `lib/plans.ts` (Basic ₹999 / Premium ₹1,500) with link to `/#pricing`; do **not** reuse the client `Pricing.tsx` (it pulls i18n/currency/Supabase — too heavy for landing pages).
   - Keep existing: breadcrumb, single `<h1>`, intro, sections, FAQ `<details>`, related pills, CTA, Footer.
3. **JSON-LD upgrade in `LandingJsonLd`**: add `Product` with `offers` (`AggregateOffer`/`Offer`, priceCurrency INR, prices from `PLANS`) alongside existing FAQPage + BreadcrumbList. Keep Organization/WebSite on home (already present in `app/layout.tsx`).

## Phase 3 — New baby-shower category page

1. Add `baby-shower-invitations` entry to `lib/landing-content.ts` (full 400+ word copy, FAQs, relatedSlugs: birthday, event, digital-invitations, haldi).
2. Create `app/baby-shower-invitations/page.tsx` — copy the 40-line pattern from `app/haldi-invitations/page.tsx` (generateMetadata + LandingJsonLd + SeoLanding).
3. Wire internal links: `components/Footer.tsx` category list, `components/SeoCopy.tsx` homepage link strip, `components/Occasions.tsx` (currently Baby Showers → `/event-invitations`, re-point to new page), and add to `relatedSlugs` of event/birthday pages.
4. Sitemap picks it up automatically via `LANDING_PAGES`.

## Phase 4 — Blog (static TS data)

**New files:**
- `lib/blog-posts.ts` — `BlogPost` interface: `slug, title, description, date, h1, intro, sections (h2+body[]), faqs?, relatedSlug, keyword`. 5 starter posts:
  1. `how-to-send-wedding-invitation-on-whatsapp` → links `/digital-wedding-invitations`
  2. `nikah-invitation-wording-ideas` → links `/nikah-invitations`
  3. `paper-vs-digital-wedding-invitation-cost` → links `/digital-wedding-invitations`
  4. `digital-invitation-with-music-how-to-add-songs` → links `/digital-invitations`
  5. `engagement-invitation-wording-ideas` → links `/engagement-invitations`
  - SEO-friendly slugs, keyword near start of title, 140–160 char descriptions, ~400–600 words each, "paper card to digital" messaging, internal CTA link to the related category page.
- `app/blog/page.tsx` — index: title/description/canonical, one `<h1>`, linked list of posts (date + title + excerpt), BreadcrumbList JSON-LD.
- `app/blog/[slug]/page.tsx` — `generateStaticParams` from `BLOG_POSTS`, `generateMetadata` (canonical, OG/Twitter), article body with `<h1>`/`<h2>` structure, FAQPage JSON-LD if faqs exist, BreadcrumbList, "Related reading" link to the category page, `notFound()` for unknown slugs.
- Navbar/Footer: add a `Blog` link (Footer "Explore" column is enough; check Navbar link array in `components/Navbar.tsx`).

## Phase 5 — Performance & mobile (verify + light fixes)

- Fonts already via next/font with `display: swap` — no change.
- Images: AVIF/WebP already on; ensure every new grid image uses `next/image` with dimensions (prevents CLS) and `sizes`.
- Check `app/globals.css` `content-visibility: auto` doesn't hide category-page sections from find-in-page/CSS anchors — no change expected.
- Defer: blog/category pages are server components; no new client JS beyond what SeoLanding already uses (it's a server component — keep it that way).
- Confirm viewport/meta viewport (Next default) + run a quick mobile pass on the new sections (grid → 1–2 cols on small screens, tap targets on FAQ/CTA).

## Phase 6 — Verification

1. Add `"typecheck": "tsc --noEmit"` to `package.json` scripts.
2. Run `npm run lint`, `npm run typecheck`, `npm run build` — fix all errors/warnings (per AGENTS.md, consult `node_modules/next/dist/docs/` if Next 16 APIs behave unexpectedly — sitemap/robots/metadata docs already confirmed compatible).
3. Post-build, produce a **URL audit table**: every indexable URL (from sitemap) with its canonical, title length, description length — flag anything outside 50–60/140–160.
4. Verify `/robots.txt` and `/sitemap.xml` render correctly (`npm run start` + curl or build output check).

## Out of scope (not code)

- Off-site work (GSC, Instagram, Pinterest, backlinks) — user handles per their message.
- hreflang for the 4 client-side locales (no URL-segmented alternates exist; not in prompt).
- `/demos/[slug]` retirement (all slugs redirect already; not in prompt).
- llms.txt staleness (site-8/9, plan names) — trivial; fix opportunistically if touched.

## Key files

| Action | File |
|---|---|
| Edit | `lib/landing-content.ts` (expand 10 + add baby-shower) |
| Edit | `components/SeoLanding.tsx` (steps, template grid, pricing, Product JSON-LD) |
| New | `app/baby-shower-invitations/page.tsx` |
| New | `lib/blog-posts.ts`, `app/blog/page.tsx`, `app/blog/[slug]/page.tsx` |
| Edit | `app/sitemap.ts`, 4 policy `page.tsx` (noindex) |
| Edit | `components/Footer.tsx`, `components/SeoCopy.tsx`, `components/Occasions.tsx` |
| Edit | `package.json` (typecheck script), misc title/desc trims |

## Risks / notes

- Copy volume is the bulk of the work: 11 landing pages × 400+ words + 5 blog posts — all original writing, no duplication between pages (each has a distinct primary intent already).
- Keep `SeoLanding` a server component — adding client interactivity would hurt CLS/LCP.
- Category pages currently have **zero images**; the new template grid must set explicit dimensions everywhere to keep CLS < 0.1.
