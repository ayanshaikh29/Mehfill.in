// One-time helper: creates (or resets password for) a user in Supabase.
// Usage: node scripts/create-admin.mjs <email> <password> [--customer]
// Default = admin (must be in allowlist). --customer = normal customer/test user.
// Reads URL + service_role key from .env.local — never commit that file.
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);

const args = process.argv.slice(2);
const isCustomer = args.includes("--customer");
const [email, password] = args.filter((a) => a !== "--customer");
if (!email || !password) {
  console.error("Usage: node scripts/create-admin.mjs <email> <password> [--customer]");
  process.exit(1);
}

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

// Pre-approved admin email(s) — must match NEXT_PUBLIC_ADMIN_EMAILS.
// Skipped for plain customer/test users (--customer).
const allowed = (env.NEXT_PUBLIC_ADMIN_EMAILS || env.ADMIN_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);
if (!isCustomer && !allowed.includes(email.toLowerCase())) {
  console.error(`REFUSED: ${email} is not in the admin allowlist (${allowed.join(", ") || "empty"}). Use --customer for non-admin users.`);
  process.exit(1);
}

let { data, error } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true, // no verification mail needed
});

if (error && /already|exists|registered/i.test(error.message)) {
  console.log("User exists — resetting password…");
  const { data: list } = await supabase.auth.admin.listUsers();
  const existing = list?.users.find(
    (u) => u.email?.toLowerCase() === email.toLowerCase()
  );
  if (!existing) {
    console.error("FAILED: user exists but could not be found.");
    process.exit(1);
  }
  const res = await supabase.auth.admin.updateUserById(existing.id, {
    password,
    email_confirm: true,
  });
  data = res.data;
  error = res.error;
}

if (error) {
  console.error("FAILED:", error.message);
  process.exit(1);
}
console.log("OK: admin user ready →", data.user.email, "| id:", data.user.id);
