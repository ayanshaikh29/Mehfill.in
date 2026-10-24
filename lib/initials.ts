// Single source of truth for couple initials.
//
// Every monogram / seal / avatar / scratch-card initial shown anywhere in the
// product (personalised HTML, editor, runtime override) is derived from the
// saved BRIDE and GROOM names through this module — never from hardcoded demo
// strings ("A & Z") and never from unrelated profile/account fields.
//
// Rules:
//   • Bride first, groom second — e.g. bride "Hina", groom "Ayaan" → "H & A".
//   • First meaningful word's first Unicode letter, uppercased
//     ("Maryam Khan" → "M", "  hina " → "H", "Dr. Hina" → "H").
//   • No initials are ever invented: empty/missing names yield "" (the template's
//     own safe fallback applies, never "undefined", "null", or fabricated initials).
//   • If one name is missing, that side is emitted without a dangling separator.

const TITLE_PREFIXES = new Set([
  "dr", "doctor",
  "mr", "mister",
  "mrs",
  "ms",
  "miss",
  "er", "engineer",
  "prof", "professor",
  "adv", "advocate",
]);

/**
 * Returns the first meaningful Unicode letter of a person's name, uppercased.
 * Handles leading/trailing whitespace, multi-word names with common honorifics,
 * emojis/symbols, and Unicode characters.
 * Returns "" if no valid letter is found.
 */
export function firstInitial(name?: string | null): string {
  if (!name || typeof name !== "string") return "";
  const trimmed = name.trim();
  if (!trimmed) return "";

  // Split into words by whitespace
  const words = trimmed.split(/\s+/).filter(Boolean);
  if (!words.length) return "";

  // Look for the first meaningful word
  let targetWord = words[0];

  // If there are multiple words and the first word is a known honorific/title,
  // skip it and use the next word that contains a letter.
  if (words.length > 1) {
    const cleanFirst = words[0].toLowerCase().replace(/[^\p{L}]/gu, "");
    if (TITLE_PREFIXES.has(cleanFirst)) {
      for (let i = 1; i < words.length; i++) {
        if (/\p{L}/u.test(words[i])) {
          targetWord = words[i];
          break;
        }
      }
    }
  }

  // Find the first Unicode letter in targetWord
  for (const ch of targetWord) {
    if (/\p{L}/u.test(ch)) {
      return ch.toLocaleUpperCase("en-US");
    }
  }

  // Fallback: search subsequent words in the name for any letter
  for (const w of words) {
    for (const ch of w) {
      if (/\p{L}/u.test(ch)) {
        return ch.toLocaleUpperCase("en-US");
      }
    }
  }

  return "";
}

export interface CoupleInitials {
  /** Bride's initial (first position in every couple monogram). */
  bride: string;
  /** Groom's initial (second position). */
  groom: string;
  /** Combined "B & G" (or the single available initial). Empty string when no names. */
  combined: string;
  /** Helper to format initials with custom separator, e.g. " · ", " | ", " ♡ ". */
  format: (separator?: string) => string;
}

/** Derive couple initials from the saved names. Names ALWAYS win. Bride first. */
export function deriveInitials(
  brideName?: string | null,
  groomName?: string | null
): CoupleInitials {
  const bride = firstInitial(brideName);
  const groom = firstInitial(groomName);

  const format = (separator = " & "): string => {
    if (bride && groom) {
      return `${bride}${separator}${groom}`;
    }
    return bride || groom || "";
  };

  const combined = format(" & ");

  return { bride, groom, combined, format };
}
