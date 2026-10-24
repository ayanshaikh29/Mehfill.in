# MEHFILL.IN — COMPLETE TEMPLATE-TO-PURCHASE INVITATION BUILDER

Website: https://mehfill.in/
GitHub: https://github.com/ayanshaikh29/Mehfill.in.git

## ROLE

Act as a senior full-stack SaaS architect, UX engineer, database engineer and e-commerce workflow specialist.

Upgrade the existing Mehfill.in application into a complete self-service digital invitation platform. Study the provided competitor screenshots as functional references only. Do not copy their branding, source code, exact layouts or visual identity.

Build the experience using Mehfill.in's own premium wedding design system.

IMPORTANT: Inspect the existing repository and implement the real workflow. Do not return only a proposal, mockup or disconnected UI. Preserve working functionality and existing templates.

## 1. AUDIT THE EXISTING PROJECT FIRST

Inspect:
- Current frontend framework, routing and component architecture.
- Existing public/site-1 through public/site-7 invitation templates and their assets.
- Demo pages and template preview routes.
- Authentication and customer dashboard.
- Invitation editor, preview and publishing implementation.
- Supabase tables, relationships, RLS policies and Storage buckets.
- Current pricing, checkout, payment verification and order management.
- Existing internationalisation and currency implementation, if present.

Identify reusable components and existing working flows before making changes. Avoid duplicate systems and destructive database migrations.

## 2. LANDING PAGE AND TEMPLATE CATALOGUE

The homepage must explain the process clearly:

"Choose Your Template → Add Your Details → Preview Your Invitation → Make It Yours"

Display real previews of the existing invitation templates in a premium, responsive gallery.

Every template card must provide:
- Template name and real preview.
- Open/Preview button.
- Choose This Template button.
- Accurate package or feature information where applicable.

The selected template must be carried forward through navigation, authentication and the dashboard.

On each template's preview page, include a small, clearly visible sticky or bottom CTA:
"Choose This Template"

Keep the CTA accessible on mobile without covering important invitation content.

Do not make the customer purchase merely to preview a design. Let them explore and select the design first.

## 3. AUTHENTICATION AFTER TEMPLATE SELECTION

Required flow:

1. A visitor browses templates without logging in.
2. The visitor opens a demo and selects "Choose This Template".
3. If not authenticated, open the existing Sign Up / Sign In interface.
4. Preserve the selected template ID, return URL and any non-sensitive workflow state through authentication.
5. After successful authentication, route to the customer dashboard's template-selection/confirmation experience.
6. Highlight the previously selected template prominently.
7. Let the customer confirm it or choose another existing template.
8. Save the draft against the authenticated user in the database.

Never store passwords, authentication tokens or sensitive customer data in URL parameters or insecure browser storage. Use the existing secure authentication architecture.

If the customer already has an unfinished draft, offer to resume it or create a new invitation without overwriting their existing work.

## 4. CUSTOMER DASHBOARD

Build or enhance the authenticated dashboard with:
- Welcome area.
- Start New Invitation action.
- Selected template preview.
- All available templates in a gallery.
- Highlighted selected template and selection confirmation.
- Draft invitations and their status.
- Edit, preview, resume and delete actions with appropriate confirmation.
- Published invitations and their public links.
- Purchase/order status.

Use clear states such as Draft, Ready for Preview, Awaiting Payment, Paid, Publishing and Published.

Show only the current user's data, enforced by server-side authorization and Supabase RLS policies.

## 5. MULTI-STEP INVITATION BUILDER

Create a polished, mobile-first, step-by-step form inspired by the functional ideas in the supplied screenshots.

Use a progress indicator, numbered steps, Back/Continue controls, clear validation, autosave and a persistent draft.

Proposed steps:

### Step 1 — Invitation Type
Support the event types already appropriate for Mehfill.in: wedding, engagement, reception and other supported celebrations.

Do not force wedding-specific fields onto every event type.

### Step 2 — Couple / Host Details
For weddings:
- Bride's name.
- Groom's name.
- Optional display title or invitation tagline.
- Supported invitation wording.
- Correct bride-first ordering wherever required.

For other celebrations, provide relevant host/person fields.

### Step 3 — Custom Invitation URL
Allow the customer to choose a readable URL slug, for example:
mehfill.in/i/ayesha-arman

Requirements:
- Suggest a slug from the correct names, with bride first for weddings.
- Allow manual editing.
- Normalize case, whitespace and special characters safely.
- Check availability against the real database.
- Handle collisions and reserved routes.
- Persist the final slug with a unique database constraint.
- Never use the account username or email as the default identity when actual invitation names are available.
- Keep published URLs stable unless an explicit URL-change flow is used.
- Do not expose another customer's private information through slug availability responses.

### Step 4 — Language & Invitation Content
Provide an invitation-language option with the currently supported languages, including English, Hindi, Marathi and Urdu when implemented.

Allow additional invitation-language blocks only where the existing template renderer supports them.

Preserve the original customer-entered content. Interface translation must not silently translate invitation text.

Provide appropriate RTL handling for Urdu and other supported RTL languages.

### Step 5 — Love Story
Inspired by the competitor's "Your Love Story" feature, create an optional story editor.

Users can:
- Add multiple story milestone cards.
- Edit each milestone's title, date and description.
- Upload an optional image per milestone, if supported.
- Reorder milestones.
- Edit or remove a card.
- Preview the story in the chosen template.

Each milestone must be stored as structured data, not concatenated into a single text string.

Add a clear "Add Story Milestone" button.

If the selected template does not support a story section, explain this or offer an appropriate supported layout. Never silently discard the data.

### Step 6 — Main Event Details
Provide:
- Event date.
- Start time and optional end time.
- Venue name.
- Venue address.
- Map/location information where supported.
- Optional dress code or additional instructions.

Use a proper calendar date picker with month/year navigation, clear selected states, mobile-friendly controls and a readable date format.

Only enforce future-date selection if that is a real product requirement; otherwise support the event dates customers are allowed to use.

Store dates and times consistently. Handle local timezone display correctly.

### Step 7 — Wedding Events
Create a dedicated event-card system similar in functionality to the screenshots.

Include quick-add presets where relevant:
- Mehendi
- Haldi
- Sangeet
- Engagement / Ring Ceremony
- Wedding
- Reception
- Custom Event

Each event should be an independent editable card containing:
- Event name.
- Date.
- Start time and optional end time.
- Venue, including a "Same venue as main event" option.
- Address or map location where supported.
- Optional event-specific notes.
- Edit, remove and mark-as-primary actions.

Support adding multiple custom events, reordering them and validating required fields.

Mark the primary event clearly. Its configured date, time and venue should populate the appropriate cover-page fields.

Do not copy the primary event's date to every other event. Each event must retain its own saved date and time.

### Step 8 — Family Details
Create optional, well-structured family detail cards.

For weddings, allow:
- Bride's father and mother names.
- Groom's father and mother names.
- Optional additional family members or hosts where appropriate.
- Optional family introduction wording.

Use repeatable cards or clearly grouped forms with Add, Edit and Remove actions.

Do not require family details if the customer wants to omit them.

Only render the family section on the invitation when the template supports it and the customer has supplied the relevant content.

### Step 9 — Photos & Media
Allow supported uploads such as:
- Couple photos.
- Gallery photos.
- Event photos.
- Optional background music where supported by the package and template.

Requirements:
- Validate file types and file sizes.
- Show upload progress, previews, replacement and removal controls.
- Use persistent Supabase Storage or the existing configured persistent storage.
- Never depend on the ephemeral serverless filesystem for permanent uploads.
- Never replace a template's decorative background or design assets just because a customer uploads a gallery image.
- Store media ownership and association with the correct invitation.
- Enforce authorization on upload and deletion.
- Use safe, appropriately scoped public or signed URLs based on the intended publication model.

### Step 10 — Optional Features
Display optional features only when implemented and compatible with the selected template/package, for example:
- RSVP.
- Countdown.
- Map directions.
- Music.
- Gallery.
- Supported custom sections.

Clearly distinguish available, package-dependent and future features.

### Step 11 — Review and Final Preview
Show a complete review summary and the actual selected invitation rendered using the saved draft data.

Requirements:
- Use the same template renderer as the final published invitation.
- Show the actual mobile/iPhone preview.
- Do not use a separate mockup with hardcoded sample details.
- Ensure names, initials, dates, events, venue, family details, photos, music and story cards are correctly mapped.
- Remove stale demo content from customer-filled fields.
- Preserve all original decorative elements and layout.
- Provide Edit Details and Edit Section navigation.
- Show missing required fields before allowing the user to proceed.

The customer must see and approve the complete preview before purchase.

## 6. PURCHASE AFTER FINAL PREVIEW

The intended sequence is:

Template selection → Sign in / Sign up → Dashboard → Details → Final Preview → Purchase → Verified Payment → Publish → Share.

At the end of the final preview, display the actual available package and its price.

Set the Basic package's authoritative base price to INR 999. Preserve other package prices unless explicitly approved.

Before payment:
- Save the draft.
- Validate required details.
- Display the selected package, actual amount, currency and applicable terms.
- Allow the customer to return to the editor without losing work.

Payment requirements:
- Calculate the order amount on the server.
- Verify payment using the existing provider's trusted verification/webhook mechanism.
- Never trust frontend success messages.
- Never mark an order paid without verification.
- Prevent duplicate payment processing and duplicate order creation.
- Save a persistent order record with package ID, amount, currency and status.

If payment fails, keep the invitation draft intact and provide a safe retry flow.

If the provider is not configured or international payment is unsupported, display an honest message. Never simulate successful payment in production.

Do not publish a paid invitation until the applicable payment and publication requirements have been satisfied.

## 7. PUBLISHING AND PUBLIC INVITATION URL

After verified payment and a successful publication operation:
- Persist the invitation's published status.
- Make the public URL resolve to the chosen existing template.
- Render the saved customer content using the shared template renderer.
- Ensure the page works on mobile and desktop.
- Provide Copy Link, Share and preview actions.
- Allow authorized customers to edit their invitations from the dashboard.
- Keep the published URL stable when content is edited.
- Handle failed publication without losing the verified order or customer content.

Do not create a separate hardcoded HTML website for every customer.

Keep template source code and static design assets in the existing application deployment. Store customer data in the configured database and uploaded media in persistent storage.

## 8. DATABASE AND SECURITY

Audit the current Supabase schema before writing migrations.

Reuse existing tables when suitable and create only the missing structures, which may include:
- Invitations.
- Invitation events.
- Love story milestones.
- Family members or family-detail records.
- Invitation media references.
- Orders and payment status.
- Slug uniqueness and publication status.

Choose normalized relational tables or validated structured JSON according to the existing architecture and querying requirements. Do not duplicate the same information in conflicting formats.

Requirements:
- Use database foreign keys and appropriate indexes.
- Enforce unique public slugs.
- Enforce ownership through server-side checks and RLS.
- Keep privileged Supabase keys on the server only.
- Validate every write operation.
- Validate media ownership.
- Avoid destructive schema migrations.
- Provide safe, versioned migrations and rollback guidance where appropriate.

## 9. USER EXPERIENCE AND DESIGN

Create a premium, polished experience consistent with Mehfill.in's existing visual identity.

Use:
- Clear step indicators.
- Elegant cards.
- Accessible date pickers.
- Smooth but restrained animations.
- Useful empty states.
- Responsive layouts.
- Autosave indicators.
- Inline validation.
- Mobile-friendly buttons and forms.
- Consistent typography and spacing.

Use the provided competitor screenshots as functional inspiration, not as a pixel-perfect design target.

Do not replace Mehfill.in's logo, template art or original decorative assets. Do not redesign the invitation itself merely to match the editor's styling.

## 10. TESTING AND DELIVERY

Implement and test the complete workflow.

Test cases:
1. Select a template without signing in.
2. Sign up and return to the selected template.
3. Sign in and resume an existing draft.
4. Switch templates without corrupting customer details.
5. Add, edit, reorder and remove story milestones.
6. Add multiple wedding events with different dates and venues.
7. Use the date picker on mobile.
8. Save optional family details.
9. Upload, replace and remove supported images.
10. Select and reserve a unique custom invitation URL.
11. Refresh or reopen the builder without losing saved data.
12. Verify the final preview matches the published renderer.
13. Complete a real supported sandbox payment and verify the payment record.
14. Test payment failure and retry.
15. Verify unauthorized users cannot read or modify another customer's drafts.
16. Confirm a published invitation resolves to the correct template and content.
17. Confirm existing templates and published URLs continue working.

Run the project's actual build and tests. Fix regressions.

Return a final implementation report containing:
- Audit findings.
- Files and migrations changed.
- Features implemented and verified.
- Tests performed and results.
- Payment or provider configuration still required.
- Deployment instructions.
- Known limitations.

Do not claim production deployment, payment success or functionality that has not been verified.

FINAL PRODUCT GOAL:
Mehfill.in must provide a seamless journey in which customers choose a design, create an account, customise their invitation through structured cards and forms, review a faithful live preview, purchase their package and publish a stable, shareable digital invitation.