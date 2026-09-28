"use client";
import { useState } from "react";

export default function VerifyButton({ id, action }: { id: number; action: "paid" | "rejected" }) {
  const [busy, setBusy] = useState(false);
  const paid = action === "paid";
  return (
    <button
      disabled={busy}
      onClick={async () => {
        if (!confirm(`Mark this payment as ${action.toUpperCase()}?`)) return;
        setBusy(true);
        const res = await fetch("/api/admin/verify-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, status: action }),
        });
        if (res.ok) window.location.reload();
        else setBusy(false);
      }}
      className={`rounded-full px-3 py-1 text-[11px] font-bold disabled:opacity-50 ${
        paid ? "bg-[#25D366]/20 text-[#7be3a3] hover:bg-[#25D366]/30" : "bg-white/10 text-ivory/60 hover:bg-white/20"
      }`}
    >
      {busy ? "…" : paid ? "Mark Paid" : "Reject"}
    </button>
  );
}
