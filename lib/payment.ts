// Direct UPI payments — no gateway. The UPI app opening NEVER means
// success: every submission stays "pending" until verified in /studio.

export const UPI_ID =
  process.env.NEXT_PUBLIC_UPI_ID || "7499827349@ibl";

export function upiPayLink(amount: number, note: string) {
  const params = new URLSearchParams({
    pa: UPI_ID,
    pn: "Mehfill",
    am: String(amount),
    cu: "INR",
    tn: note.slice(0, 80),
  });
  return `upi://pay?${params.toString()}`;
}

export function upiQrImage(amount: number, note: string) {
  const data = encodeURIComponent(upiPayLink(amount, note));
  return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&data=${data}`;
}
