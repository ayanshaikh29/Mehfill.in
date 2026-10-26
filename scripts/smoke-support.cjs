/* eslint-disable @typescript-eslint/no-require-imports */
/* Smoke test: AI support assistant — the parts that must be correct WITHOUT
   a live Groq key or database:
   1. Knowledge base auto-syncs from the real product code (templates/prices)
      and search retrieval returns the right articles.
   2. Deterministic classification rules map critical issues to the right
      category/severity and can never be silently skipped.
   3. The markdown renderer is XSS-safe by construction (AST only, no HTML).
   4. Screenshot validation is magic-byte based (not extension/declared type).
   5. Groq client degrades gracefully with no key (never throws).
   6. Owner-alert policy: no duplicate emails, escalation re-notifies,
      delivery status is what gets recorded.
*/
require("../.smoke/register.js");

const { searchKnowledge, templateFacts, pricingFacts, formatKnowledge } =
  require("../.smoke/lib/support/knowledge-base.js");
const { ruleClassify, classifyIssue, maxSeverity, CATEGORY_LABELS } =
  require("../.smoke/lib/support/classify.js");
const { parseSupportMarkdown, parseInline } = require("../.smoke/lib/support/markdown.js");
const { validateSupportImage, maxImageBytes } = require("../.smoke/lib/support/image.js");
const { groqChat, groqConfigured, visionAvailable } = require("../.smoke/lib/support/groq.js");
const { shouldSendAlert, buildAlertEmail, incidentFingerprint } =
  require("../.smoke/lib/support/alerts.js");
const { buildSupportSystemPrompt, contextBlock } = require("../.smoke/lib/support/prompt.js");
const { makeTicketRef, cleanText } = require("../.smoke/lib/support/tickets.js");
const { CATALOG } = require("../.smoke/lib/catalog.js");
const { PLANS, formatINR } = require("../.smoke/lib/plans.js");

let failures = 0;
function check(cond, label) {
  if (cond) console.log(`PASS ${label}`);
  else {
    console.log(`FAIL ${label}`);
    failures++;
  }
}

async function main() {
  /* ── 1. Knowledge base auto-sync + retrieval ─────────────────────────── */
  const facts = templateFacts();
  check(CATALOG.every((t) => facts.includes(t.name)), "KB templateFacts lists every catalog name");
  check(CATALOG.every((t) => facts.includes(t.demoUrl || "/templates")), "KB templateFacts carries live demo urls");
  const priceFacts = pricingFacts();
  check(
    PLANS.every((p) => priceFacts.includes(formatINR(p.price))),
    `KB pricingFacts uses live PLANS prices (${PLANS.map((p) => formatINR(p.price)).join(", ")})`
  );

  const priceHits = searchKnowledge("how much does it cost pricing package price");
  check(
    priceHits.some((h) => h.id === "kb-pricing-payments"),
    "search('pricing') retrieves the pricing article"
  );
  const photoHits = searchKnowledge("photos are not uploading to my gallery");
  check(photoHits.some((h) => h.id === "kb-photos-upload"), "search('photos upload') retrieves upload article");
  const designHits = searchKnowledge("the design I selected opened a different template");
  check(
    designHits.some((h) => h.id === "kb-trouble-design"),
    "search('wrong design') retrieves design-troubleshooting article"
  );
  const loginHits = searchKnowledge("google sign in is not working");
  check(loginHits.some((h) => h.id === "kb-account-login"), "search('google login') retrieves account article");
  const founderHits = searchKnowledge("who is the founder of this site");
  check(founderHits.some((h) => h.id === "kb-about-team"), "search('founder') retrieves team article");
  const devHits = searchKnowledge("who is developer of this website");
  check(devHits.some((h) => h.id === "kb-about-team"), "search('developer') retrieves team article");
  check(
    formatKnowledge(founderHits.slice(0, 1)).includes("Ayan Shaikh"),
    "team article publishes the founder name from the live site schema"
  );
  check(searchKnowledge("qwertyuiop zxcvbnm unrelated gibberish").length === 0, "gibberish retrieves nothing");

  const pack = formatKnowledge(priceHits.slice(0, 1));
  check(/\[source: kb-[a-z-]+\]/.test(pack), "knowledge pack includes source citations");
  check(pack.includes(formatINR(PLANS[0].price)), "knowledge pack interpolates the real price");

  /* ── 2. Classification rules ─────────────────────────────────────────── */
  const cases = [
    ["Money was deducted but nothing happened, order missing", "payment", "P1", true],
    ["I selected nikah-emerald but a different design loaded in the editor", "functional_bug", "P2", true],
    ["My edits disappear after refresh — changes lost", "data_integrity", "P2", true],
    ["Your site is down, everyone can not log in", "outage", "P1", true],
    ["Someone else's invitation data is visible in my dashboard", "auth_security", "P1", true],
    ["the selected template opens a different template", "functional_bug", "P2", true],
    ["How do I change the wedding date?", "howto", "P4", false],
    ["The font colour looks off on mobile", "ui_minor", "P4", false],
    ["photos upload fails with an error code", "functional_bug", "P3", false],
  ];
  for (const [text, cat, sev, critical] of cases) {
    const r = ruleClassify(text);
    check(!!r, `rule matches: "${text.slice(0, 48)}…"`);
    if (r) {
      check(r.category === cat, `  → category ${r.category} (want ${cat})`);
      check(r.severity === sev, `  → severity ${r.severity} (want ${sev})`);
      check(r.critical === critical, `  → critical ${r.critical} (want ${critical})`);
    }
  }

  // With no API key, classifyIssue must still return rule verdicts / defaults
  // (never throw, never ask the model).
  delete process.env.GROQ_API_KEY;
  const critical = await classifyIssue("payment deducted but invitation not published");
  check(
    critical.source === "rules" && critical.severity === "P1",
    "classifyIssue(no key, critical text) → rules verdict P1"
  );
  const vague = await classifyIssue("hello team just saying hi");
  check(
    vague.source === "default" && vague.severity === "P4" && vague.category === "question",
    "classifyIssue(no key, vague text) → honest default P4/question"
  );
  check(maxSeverity("P4", "P2") === "P2" && maxSeverity("P1", "P4") === "P1", "maxSeverity never downgrades");
  check(CATEGORY_LABELS.payment === "Payment / checkout issue", "category labels present");

  /* ── 3. Markdown renderer safety ─────────────────────────────────────── */
  const blocks = parseSupportMarkdown(
    "# Heading\n\nSome **bold** and `code` here\n\n- one\n- two\n\n1. first\n2. second"
  );
  const types = blocks.map((b) => b.type);
  check(
    types.includes("heading") && types.includes("para") && types.includes("bullets") && types.includes("numbers"),
    "markdown parses heading/para/bullets/numbers"
  );
  const para = blocks.find((b) => b.type === "para");
  check(
    para.runs.some((r) => r.type === "bold" && r.text === "bold") &&
      para.runs.some((r) => r.type === "code" && r.text === "code"),
    "markdown inline bold/code parsed as typed runs"
  );

  const evil = parseSupportMarkdown('<img src=x onerror="alert(1)"> <script>alert(2)</script>');
  const evilFlat = JSON.stringify(evil);
  check(evil.every((b) => b.type !== "html"), "evil HTML never becomes an html block");
  check(
    evilFlat.includes("&lt;") === false && evilFlat.includes("<img") === true,
    "HTML kept as literal text runs (React escapes on render — no dangerouslySetInnerHTML)"
  );
  const inline = parseInline('say "hi" & <b>x</b>');
  check(
    inline.every((r) => r.type === "text") && inline[0].text.includes("<b>"),
    "quotes/ampersands/tags stay literal text"
  );

  /* ── 4. Screenshot validation (magic bytes) ──────────────────────────── */
  const b64 = (buf) => Buffer.from(buf).toString("base64");
  const jpeg = validateSupportImage(b64(Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46])));
  check("mime" in jpeg && jpeg.mime === "image/jpeg", "JPEG magic bytes accepted as image/jpeg");
  const png = validateSupportImage(
    `data:image/png;base64,${b64(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]))}`
  );
  check("mime" in png && png.mime === "image/png", "PNG data-URL with magic bytes accepted");
  const webp = validateSupportImage(
    b64(Buffer.from([...Buffer.from("RIFF"), ...Buffer.from([0, 0, 0, 0]), ...Buffer.from("WEBP"), Buffer.from("VP8 ")]))
  );
  check("mime" in webp && webp.mime === "image/webp", "WEBP magic bytes accepted");
  const spoof = validateSupportImage(
    `data:text/html;base64,${b64(Buffer.from("<script>document.cookie</script>"))}`
  );
  check("error" in spoof, "declared text/html content REJECTED (magic-byte mismatch)");
  const notImage = validateSupportImage(b64(Buffer.from("MZ\x90\x00 executable bytes")));
  check("error" in notImage, "executable payload rejected");

  // Size cap honours env override (set before call, not before require).
  process.env.SUPPORT_MAX_IMAGE_BYTES = "65536";
  const big = validateSupportImage(
    b64(Buffer.alloc(70 * 1024, 0xff).map((v, i) => (i === 0 ? 0xff : i === 1 ? 0xd8 : i === 2 ? 0xff : v)))
  );
  check("error" in big && /too large/i.test(big.error), "oversized image rejected with clear message");
  check(maxImageBytes() === 65536, "SUPPORT_MAX_IMAGE_BYTES env override honoured");
  delete process.env.SUPPORT_MAX_IMAGE_BYTES;

  /* ── 5. Groq graceful degradation ────────────────────────────────────── */
  delete process.env.GROQ_API_KEY;
  check(groqConfigured() === false, "groqConfigured() false without key");
  check(visionAvailable() === false, "vision unavailable without key");
  const noKey = await groqChat({ messages: [{ role: "user", content: "hi" }] });
  check(noKey.ok === false && noKey.code === "no_key", "groqChat returns code no_key (no throw, no secret)");

  /* ── 6. Owner alert policy ───────────────────────────────────────────── */
  check(
    shouldSendAlert({ alert_status: "pending", severity: "P2" }, "P2") === true,
    "alert: first critical incident sends"
  );
  check(
    shouldSendAlert({ alert_status: "sent", severity: "P2" }, "P2") === false,
    "alert: duplicate at same severity does NOT re-send"
  );
  check(
    shouldSendAlert({ alert_status: "sent", severity: "P3" }, "P2") === true,
    "alert: severity escalation re-notifies"
  );
  check(
    shouldSendAlert({ alert_status: "sent", severity: "P2" }, "P1") === true,
    "alert: P2→P1 escalation notifies"
  );
  check(
    shouldSendAlert({ alert_status: "sent", severity: "P1" }, "P4") === false,
    "alert: downgrade never emails"
  );
  check(
    shouldSendAlert({ alert_status: "failed", severity: "P2" }, "P2") === true,
    "alert: failed delivery retries on next report"
  );

  const email = buildAlertEmail({
    ticketRef: "MF-26-ABC123",
    severity: "P1",
    category: "payment",
    summary: "UPI deducted but nothing published",
    description: "money <script>alert(1)</script> deducted",
    route: "/dashboard/edit/x",
    templateSlug: "nikah-emerald",
    reportCount: 3,
    escalation: false,
    screenshotUrl: null,
    adminUrl: "https://mehfill.in/admin/support?ref=MF-26-ABC123",
    timestamp: "2026-10-26T10:00:00.000Z",
    suggestedSteps: "check orders",
  });
  check(email.subject.includes("MF-26-ABC123") && email.subject.includes("[P1]"), "alert subject has ref + severity");
  check(email.html.includes("&lt;script&gt;"), "alert HTML escapes customer-supplied markup");
  check(email.text.includes("3"), "alert body includes grouped report count");

  const fp1 = incidentFingerprint("payment", "/dashboard", "nikah-emerald", "money deducted today");
  const fp2 = incidentFingerprint("payment", "/dashboard", "nikah-emerald", "money deducted today");
  const fp3 = incidentFingerprint("functional_bug", "/dashboard", "nikah-emerald", "money deducted today");
  check(fp1 === fp2, "incident fingerprint is stable for identical reports");
  check(fp1 !== fp3, "incident fingerprint differs across categories");

  /* ── 7. Prompt builder ───────────────────────────────────────────────── */
  const hits = searchKnowledge("price");
  const prompt = buildSupportSystemPrompt({
    hits,
    context: { path: "/dashboard/edit/abc", templateSlug: "rose-royale", editorStep: "date", saved: false },
  });
  check(prompt.includes("Mehfill Support"), "prompt carries assistant identity");
  check(prompt.includes("[source: kb-"), "prompt includes cited knowledge hits");
  check(prompt.includes(formatINR(PLANS[0].price)), "prompt includes live pricing facts");
  check(prompt.includes("/dashboard/edit/abc"), "prompt includes current page context");
  check(prompt.includes("UNSAVED"), "prompt surfaces unsaved-changes state");
  check(contextBlock({}).length === 0, "empty context renders empty block");
  check(prompt.includes("NEVER claim a bug is fixed"), "prompt forbids fake fix claims");
  check(prompt.includes("Public team info IS allowed"), "prompt explicitly allows founder/developer details");

  /* ── 8. Misc guards ──────────────────────────────────────────────────── */
  const ref = makeTicketRef();
  check(/^MF-\d{2}-[A-Z0-9]{6}$/.test(ref), `ticket ref format valid: ${ref}`);
  check(makeTicketRef() !== ref || true, "ticket ref generator runs");
  check(cleanText("  hello\u0000\u0007 world  ", 100) === "hello world", "cleanText strips control chars");
  check(cleanText("abcdef", 3) === "abc", "cleanText respects max length");

  console.log(failures ? `\n${failures} FAILURE(S)` : "\nALL PASS");
  process.exit(failures ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
