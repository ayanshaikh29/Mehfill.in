// Issue classification + severity assignment for support tickets.
//
// SECURITY RULE: deterministic keyword rules run FIRST and can only RAISE
// severity — the model's judgment is never the sole source for payment,
// privacy, security or data-loss incidents, and the model can never
// downgrade a rule-detected critical issue.

import type { IssueCategory, Severity } from "./types";
import { groqChat, groqConfigured } from "./groq";

export const CATEGORY_LABELS: Record<IssueCategory, string> = {
  question: "General question",
  howto: "Usage / how-to support",
  ui_minor: "Minor UI issue",
  functional_bug: "Functional bug",
  data_integrity: "Data persistence / integrity issue",
  auth_security: "Authentication / security issue",
  payment: "Payment / checkout issue",
  outage: "Service outage / widespread failure",
};

export const SEVERITY_LABELS: Record<Severity, string> = {
  P1: "P1 — Critical (outage, data corruption, security, major payment incident)",
  P2: "P2 — Major functionality broken",
  P3: "P3 — Isolated non-critical bug",
  P4: "P4 — General question / cosmetic",
};

const SEVERITY_RANK: Record<Severity, number> = { P1: 1, P2: 2, P3: 3, P4: 4 };

export function maxSeverity(a: Severity, b: Severity): Severity {
  return SEVERITY_RANK[a] <= SEVERITY_RANK[b] ? a : b;
}

export interface Classification {
  category: IssueCategory;
  severity: Severity;
  /** True for signals that must reach the owner promptly. */
  critical: boolean;
  source: "rules" | "ai" | "default";
}

interface Rule {
  test: RegExp;
  category: IssueCategory;
  severity: Severity;
  critical?: boolean;
}

/* ── Deterministic critical/major signals (order matters: first match wins) ── */

const RULES: Rule[] = [
  // P1 — security / privacy / data destruction / payment loss / outage.
  {
    test: /another (customer|user)(s)? (data|invitation|details)|someone else'?s? (invitation|data|dashboard)|exposed (my|another)|leak(ed)? (my|their|private) (data|invitation)|unauthori[sz]ed access|hack(ed)?|data breach/i,
    category: "auth_security",
    severity: "P1",
    critical: true,
  },
  {
    test: /money (was |got )?deducted|payment deducted|amount deducted|paisa (kat|cut)|charged but (no|nothing)|debited but|payment captured but (no|nothing|lost)|order (state )?(lost|missing) after payment/i,
    category: "payment",
    severity: "P1",
    critical: true,
  },
  {
    test: /all (my )?(data|details|draft|content) (deleted|lost|disappeared|gone)|completely wiped|server down|site (is )?(down|offline|unreachable)|everyone can(t| not) log ?in|login (is )?(down|failing) for (everyone|all)|whole (site|website) (is )?(down|broken)/i,
    category: "outage",
    severity: "P1",
    critical: true,
  },
  {
    test: /bypass|skip payment|publish(ed)? without pay(ment)?|free publish|exploit/i,
    category: "auth_security",
    severity: "P1",
    critical: true,
  },
  // P2 — major functional / data persistence / stuck payments.
  {
    test: /edits? (disappear|disappeared|lost|vanish|gone)|changes (disappear|disappeared|lost|vanish)|not sav(e|ing)|save (is )?(not )?work(ing)?|automatically rever(s|t)/i,
    category: "data_integrity",
    severity: "P2",
    critical: true,
  },
  {
    test: /selected \w[\w -]{1,40} (but|and) (a |the )?(different|wrong|other) (template|design)|wrong (template|design) (opened|showing|loaded|applied)|opens? (a |the )?(different|wrong) template/i,
    category: "functional_bug",
    severity: "P2",
    critical: true,
  },
  {
    test: /payment (stuck|pending forever|still pending)|money (gone|deducted).*(no|nothing)|refund not|checkout (is )?(down|broken|not working)|can(t| not) (complete )?pay/i,
    category: "payment",
    severity: "P2",
    critical: true,
  },
  {
    test: /editor (is )?(down|not (loading|working|opening))|checkout (is )?(down|not working)|completely broken|nothing works|can(t| not) (even )?(login|log in|open)/i,
    category: "outage",
    severity: "P2",
    critical: true,
  },
  {
    test: /wrong (date|name|names|weekday|month)|date (is |was )?(wrong|incorrect|corrupted)|scratch.?card (date )?(wrong|incorrect)|old (date|name)s? (still )?(showing|appearing)/i,
    category: "data_integrity",
    severity: "P2",
  },
  // P3 — isolated functional bugs.
  {
    test: /upload (failing|failed|not working|error)|can(t| not) upload|image(s)? (not |fail)|photo(s)? (not |fail)|404|500|error code/i,
    category: "functional_bug",
    severity: "P3",
  },
  {
    test: /preview (is )?(different|wrong|not (updating|matching|loading))|demo (data|names|venue) still|google (maps|map) link (not|wrong)|countdown (wrong|not)/i,
    category: "functional_bug",
    severity: "P3",
  },
  {
    test: /google (sign|login|sso) (not|isn t|failing)|password (reset )?(not|isn t)|session (expired|keeps)|always log(ged|ged out)/i,
    category: "auth_security",
    severity: "P3",
  },
  // P4 — questions / how-to / cosmetic.
  {
    test: /how (do|can|to)|kaise|karna|where (do|can)|what is|which (one|plan)|price|pricing|cost|feature/i,
    category: "howto",
    severity: "P4",
  },
  {
    test: /colour|color|font|layout looks|cosmetic|alignment|spacing/i,
    category: "ui_minor",
    severity: "P4",
  },
];

export function ruleClassify(text: string): Classification | null {
  for (const r of RULES) {
    if (r.test.test(text)) {
      return {
        category: r.category,
        severity: r.severity,
        critical: Boolean(r.critical),
        source: "rules",
      };
    }
  }
  return null;
}

/* ── AI-assisted classification (only for non-critical, ticket-time only) ── */

interface AiVerdict {
  category?: unknown;
  severity?: unknown;
}

const VALID_CATEGORIES: IssueCategory[] = [
  "question", "howto", "ui_minor", "functional_bug",
  "data_integrity", "auth_security", "payment", "outage",
];

/**
 * Classify a reported issue. Deterministic rules run first; the AI is only
 * consulted for non-critical leftovers (cost control) and its answer is
 * range-checked — a hallucinated category/severity falls back to defaults.
 */
export async function classifyIssue(text: string): Promise<Classification> {
  const rules = ruleClassify(text);
  if (rules) return rules;

  if (groqConfigured()) {
    try {
      const res = await groqChat({
        maxTokens: 160,
        jsonMode: true,
        timeoutMs: 12_000,
        messages: [
          {
            role: "system",
            content:
              'Classify this customer support issue for a digital invitation website. Reply ONLY with JSON: {"category":"question|howto|ui_minor|functional_bug|data_integrity|auth_security|payment|outage","severity":"P1|P2|P3|P4"}. P1=critical outage/data corruption/security/major payment, P2=major broken feature, P3=isolated bug, P4=question/cosmetic.',
          },
          { role: "user", content: text.slice(0, 800) },
        ],
      });
      if (res.ok && res.text) {
        const parsed = JSON.parse(res.text) as AiVerdict;
        const category = VALID_CATEGORIES.includes(parsed.category as IssueCategory)
          ? (parsed.category as IssueCategory)
          : null;
        const severity =
          parsed.severity === "P1" || parsed.severity === "P2" || parsed.severity === "P3" || parsed.severity === "P4"
            ? (parsed.severity as Severity)
            : null;
        if (category && severity) {
          // Only deterministic rules may assign P1 — the model's P1 is capped
          // at P2 so it can raise attention but never fake a critical alert.
          const capped: Severity = severity === "P1" ? "P2" : severity;
          return {
            category,
            severity: capped,
            critical: capped === "P2",
            source: "ai",
          };
        }
      }
    } catch {
      /* fall through to default */
    }
  }
  return { category: "question", severity: "P4", critical: false, source: "default" };
}
