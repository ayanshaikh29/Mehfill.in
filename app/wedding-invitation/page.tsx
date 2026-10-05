import { redirect } from "next/navigation";

export const metadata = {
  title: "Wedding Invitations",
  robots: { index: false, follow: true },
};

export default function WeddingInvitationAlias() {
  redirect("/digital-wedding-invitations");
}
