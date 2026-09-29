// ─────────────────────────────────────────────
//  Client contact — done-for-you model.
//  The client shares celebration details over WhatsApp,
//  and we design and deliver the invitation.
//  Put your WhatsApp number here once (with country code, no +).
//  Example: "919876543210"
// ─────────────────────────────────────────────
export const WHATSAPP_NUMBER = "917499827349";

export const CONTACT_EMAIL = "mehfill.in029@gmail.com";

export const INSTAGRAM_URL = "https://www.instagram.com/mehfill.inn";

export function waLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export const WA_MSG_GENERAL =
  "Hello! I saw the Mehfill demo invitations and I would like a custom digital invitation for my celebration. Sharing my details below.";

export const WA_MSG_DEMO = (demoName: string) =>
  `Hello! I loved the "${demoName}" demo invitation. I would like a similar custom invitation for my celebration. Sharing my details below.`;
