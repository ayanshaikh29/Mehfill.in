import { permanentRedirect } from "next/navigation";

export const metadata = {
  title: "Wedding Invitations",
  robots: { index: false, follow: true },
};

export default function WeddingInvitationAlias() {
  permanentRedirect("/digital-wedding-invitations");
}
