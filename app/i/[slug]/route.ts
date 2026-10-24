import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient, isAdminEmail } from "@/lib/supabase/server";
import { renderPersonalizedInvitation } from "@/lib/templates/personalize";
import type { InvitationContent } from "@/lib/invitation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Serve the customer's invitation as the EXACT original template they selected
// (site-N), with only their content bound in. This replaces the old behaviour
// that rendered a generic React re-skin — the selected template is the source
// of truth; customer input changes its content, not its design.
//
// Supports ?preview=1 so the owner can view their own draft with the same
// renderer the public URL uses — preview and publish are always identical.
async function loadInvitation(slug: string) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }
  if (!/^[a-z0-9-]{1,60}$/.test(slug)) return null;
  const admin = createAdminClient();
  const { data } = await admin
    .from("invitations")
    .select("id, user_id, slug, template_slug, status, content, published_at")
    .eq("slug", slug)
    .maybeSingle();
  return data;
}

function notFoundHtml(): string {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta name="robots" content="noindex,nofollow"/>
<title>Invitation unavailable · Mehfill.in</title>
<style>body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#faf6ef;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#24211d;text-align:center;padding:24px}
.card{max-width:420px}h1{font-weight:400;font-size:1.9rem;margin:0 0 8px}p{color:#6b6259;line-height:1.6;margin:0 0 20px}a{display:inline-block;background:#24211d;color:#faf6ef;text-decoration:none;padding:12px 28px;border-radius:999px;font-weight:600;font-size:.9rem}</style>
</head><body><div class="card"><h1>This invitation is no longer available.</h1>
<p>It may have been unpublished or removed.</p>
<a href="https://mehfill.in/">Create your own on Mehfill.in</a></div></body></html>`;
}

// Canonical + Open Graph URL injection — /i/[slug] is a raw route handler, so
// Next's metadata API never runs here. Previews get noindex; published
// invitations get a stable canonical so shares and crawlers land on one URL.
function injectSeo(html: string, slug: string, noindex: boolean): string {
  const url = `https://mehfill.in/i/${encodeURIComponent(slug)}`;
  const robots = noindex ? "noindex,nofollow" : "index,follow";
  const out = html
    .replace(/<link rel="canonical"[^>]*>\s*/gi, "")
    .replace(/<meta property="og:url"[^>]*>\s*/gi, "")
    .replace(/<meta name="robots"[^>]*>\s*/gi, "");
  let tags =
    `<link rel="canonical" href="${url}" />` +
    `<meta property="og:url" content="${url}" />` +
    `<meta name="robots" content="${robots}" />`;
  if (!/<meta property="og:image"/i.test(out)) {
    tags += `<meta property="og:image" content="https://mehfill.in/og-cover.png" />`;
  }
  return out.replace(/<\/head>/i, `${tags}</head>`);
}

export async function GET(request: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const inv = await loadInvitation(slug);
  const preview = new URL(request.url).searchParams.get("preview") === "1";

  if (!inv) {
    return new NextResponse(notFoundHtml(), {
      status: 404,
      headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
    });
  }

  if (inv.status !== "published") {
    // Drafts are private — only the owner (or admin) may preview them, and they
    // see the exact same renderer the public URL will use once published.
    if (!preview) {
      return new NextResponse(notFoundHtml(), {
        status: 404,
        headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
      });
    }
    let allowed = false;
    try {
      const supabase = await createClient();
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        allowed = isAdminEmail(data.user.email) || data.user.id === inv.user_id;
      }
    } catch {
      allowed = false;
    }
    if (!allowed) {
      return new NextResponse(notFoundHtml(), {
        status: 404,
        headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
      });
    }
  }

  const content = inv.content as InvitationContent;
  const rendered = await renderPersonalizedInvitation(inv.template_slug, content, inv.slug);

  if (!rendered) {
    // Template file missing — graceful branded fallback (never a generic skin).
    return new NextResponse(notFoundHtml(), {
      status: 404,
      headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
    });
  }

  return new NextResponse(injectSeo(rendered.html, slug, preview), {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": preview ? "no-store" : "public, max-age=60, s-maxage=300",
    },
  });
}
