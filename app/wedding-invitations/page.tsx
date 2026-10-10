import { redirect } from "next/navigation";

export const metadata = {
  title: "Wedding Invitations",
  robots: { index: false, follow: true },
};

// /wedding-invitations is a common search variant of our canonical
// /digital-wedding-invitations page — 301-consolidate to avoid thin duplicates.
export default function WeddingInvitationsAlias() {
  redirect("/digital-wedding-invitations");
}
