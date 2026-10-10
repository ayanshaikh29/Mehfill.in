// Central SEO config — single source of truth for canonical base, titles, descriptions.
export const SITE_URL = "https://mehfill.in";
export const SITE_NAME = "Mehfill.in";
export const BRAND = "Mehfill.in";
export const LOCALE = "en_IN";
export const OG_IMAGE = "/og-cover.png";

export function canonical(path: string) {
  if (!path.startsWith("/")) path = `/${path}`;
  // Homepage canonical keeps trailing slash, others do not.
  if (path === "/") return `${SITE_URL}/`;
  return `${SITE_URL}${path.replace(/\/$/, "")}`;
}

export const DEFAULT_OG = {
  siteName: BRAND,
  locale: LOCALE,
  type: "website" as const,
};
