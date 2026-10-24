import { en } from "./dictionaries/en";
import { hi } from "./dictionaries/hi";
import { mr } from "./dictionaries/mr";
import { ur } from "./dictionaries/ur";
import type { Locale } from "./config";

export type Dictionary = typeof en;
export type Translation = { [K in keyof Dictionary]?: Partial<Dictionary[K]> };

const dictionaries: Record<Locale, Translation | Dictionary> = { en, hi, mr, ur };

function lookup(dict: object | undefined, path: string[]): string | undefined {
  let node: unknown = dict;
  for (const key of path) {
    if (typeof node !== "object" || node === null) return undefined;
    node = (node as Record<string, unknown>)[key];
  }
  return typeof node === "string" ? node : undefined;
}

/** Dot-path translate with graceful fallback: locale → English → key itself. */
export function translate(locale: Locale, key: string, vars?: Record<string, string | number>): string {
  const path = key.split(".");
  let value = lookup(dictionaries[locale] as object, path);
  if (value === undefined) value = lookup(en as unknown as object, path);
  if (value === undefined) return key;
  if (vars) {
    for (const [name, v] of Object.entries(vars)) {
      value = value.replace(new RegExp(`\\{${name}\\}`, "g"), String(v));
    }
  }
  return value;
}

export function getDictionary(locale: Locale): Translation | Dictionary {
  return dictionaries[locale];
}
