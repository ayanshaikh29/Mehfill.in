# Off-page SEO plan — Mehfill.in

Goal: earn relevant backlinks and branded search demand for "digital wedding
invitation", "online wedding card", "WhatsApp wedding invitation" (en + hi)
without buying links or running PBNs. Everything below is manual/outreach work —
nothing here can be automated inside the codebase.

---

## 1. Foundation first (on-page prerequisites)

- [x] Canonical + OG/Twitter tags on every indexable page (`/`, `/templates`,
      `/how-it-works`, `/i/[slug]` injects canonical + og:url).
- [x] `app/manifest.webmanifest` (PWA/install metadata).
- [x] Sitemap coverage: confirm `app/sitemap.ts` lists all SEO landing pages;
      submit `https://mehfill.in/sitemap.xml` in Search Console.
- [x] Analytics: `/api/track` → `visits` table (bot-filtered) for measuring
      referral traffic from off-page work.
- [x] Create `robots.txt` rules allowing AI/ads crawlers you want; block
      nothing that matters (GPTBot decisions are a business call).

## 2. Directories & citations (highest ROI for India market)

Submit the product (free tier / listed plan) to:

- [ ] Google Business Profile (Nashik, service area = India-wide, category:
      "Wedding service" / "Invitation card shop") — LocalBusiness schema already
      emitted in `app/layout.tsx`.
- [ ] Justdial, Sulekha, IndiaMART (events/wedding services listings).
- [ ] Product directories: Product Hunt (launch: "WhatsApp-ready wedding
      invitations with RSVP"), BetaList, AlternativeTo (vs. Paperless Post /
      Canva), InstaLauncher, 1000Products.
- [ ] Indian startup directories: StartupIndia directory, inc42 listings,
      YourStory "products we love" pitches.

Each listing = NAP-consistent (Nashik, Maharashtra) + `https://mehfill.in` +
logo (`/logo.png`) + one-line pitch. Keep category/title identical for
citation consistency.

## 3. Wedding-ecosystem link earning

- [ ] Wedding planners & venues in Nashik/Pune/Mumbai: offer a free template
  sample for their "vendor resources" pages ("digital invitation partners").
- [ ] Matrimony/Shaadi community forums: answer "digital invitation" threads
  with a genuinely useful answer + link (respect forum promo rules).
- [ ] Wedding bloggers & YouTubers: pitch a "10 digital invite ideas" article
  or template giveaway; guest posts on wedding blogs (Indian Wedding Wire
  contributor posts, WedMeGood blog).
- [ ] Photographer/videographer cross-promotion: they send save-the-dates, we
  list them; they list us on their resources page (reciprocal but contextual).

## 4. Content assets that naturally earn links

- [x] **Free tools** (link magnets): "WhatsApp Wedding Invitation Wording
  Generator" (hi/en/ur), "Muhrat/date finder", "Seating RSVP calculator".
  Host under `/free/…`, indexable, tool-page schema. *(Wording generator LIVE
  at `/free/whatsapp-invitation-wording` — WebApplication + FAQ + Breadcrumb
  schema, sitemap entries; date finder & RSVP calculator listed as
  coming-soon on `/free`.)*
- [ ] **Statistics page**: "Indian wedding invitation trends 2026" —
  anonymised aggregate data from `visits`/templates (no PII). Data pages get
  cited by bloggers.
- [ ] **Template showcase pages** per theme (already: SEO landings) — pitch
  them to roundups ("best digital invitation templates").
- [ ] Hindi/Marathi/Urdu articles targeting regional queries:
  "शादी का निमंत्रण कार्ड ऑनलाइन", "ऑनलाइन वेडिंग इनविटेशन".

## 5. Social & community presence (brand signals)

- [ ] Pinterest: upload every template as a pin → link to `/templates`
  (Pinterest ranks well for "wedding invitation design" queries).
- [ ] Instagram: Reels of each template opening animation; bio link to
  templates. Handles in `SOCIAL_PROFILES` must all resolve (schema sameAs).
- [ ] Reddit/Quora: answer "how to make digital wedding invite" threads
  honestly; link only when it adds value. Quora digest posts in
  `wedding-invitation` topics.
- [ ] WhatsApp Communities/Share — already product-native; encourage sharing
  of `/i/[slug]` (backlinks are nofollow from WhatsApp, but traffic + branded
  searches are the point).

## 6. PR & launches

- [ ] Launch week: Product Hunt + BetaList + r/IndianStreetBets-adjacent
  communities are noise — target `r/india`, `r/WeddingPlanning` carefully.
- [ ] Local press: Nashik Times / Loksatta "local startup" story pitch.
- [ ] Founders' personal LinkedIn + X threads: "we replaced paper invites for
  N weddings" — founder pages attract link roundups.

## 7. Partnerships with measurable exchange

- [ ] Wedding expos (Nashik/Pune): QR card to `/templates` on every banner
  (offline → branded search).
- [ ] Coupon/deal sites (GrabOn, CashKaro): list a genuine first-invite
  discount — deal pages are dofollow-ish and trusted in India.
- [ ] Affiliate/light referral for wedding planners (track with `?ref=`).

## 8. Measurement (monthly)

| Metric | Tool |
| --- | --- |
| Referring domains | Search Console → Links |
| Position for target kw set | Search Console → Performance (en, hi, ur queries) |
| Branded searches ("mehfill") | Search Console → Performance |
| Referral sessions | `visits` table via `/api/track` + path pattern |
| Conversion from referral | orders with `created_at` after campaign start |

Rules: no paid links, no link farms, no exact-match commercial anchors en masse
(keep anchor mix: brand 60%+, URL 20%, phrase 20%). Re-audit every quarter.

---

### Priority order (do these first)

1. Google Business Profile + Search Console sitemap (1 day)
2. Directory/citation batch — 20 listings (1 week)
3. 5 guest posts on wedding blogs (month 1)
4. Free wording-generator tool (month 1–2, biggest link magnet)
5. Pinterest backlog of all templates (month 1)
