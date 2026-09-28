import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8").split("\n")
    .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);

const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const EMAIL = "admin123@gmail.com";
const PASSWORD = "Admin@123";

let userId = null;
const created = await admin.auth.admin.createUser({
  email: EMAIL,
  password: PASSWORD,
  email_confirm: true,
  user_metadata: { role: "owner" },
});

if (created.error) {
  console.log("create:", created.error.message, "— trying password reset on existing user");
  const { data } = await admin.auth.admin.listUsers();
  const found = data.users.find((u) => u.email?.toLowerCase() === EMAIL);
  if (!found) {
    console.error("ERR: user not found and create failed");
    process.exit(1);
  }
  const updated = await admin.auth.admin.updateUserById(found.id, {
    password: PASSWORD,
    email_confirm: true,
  });
  if (updated.error) {
    console.error("ERR:", updated.error.message);
    process.exit(1);
  }
  userId = found.id;
} else {
  userId = created.data.user.id;
}
console.log("OK owner ready:", userId, EMAIL);
