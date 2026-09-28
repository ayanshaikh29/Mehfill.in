import PetalFall from "./PetalFall";
import BotanicalShadows from "./BotanicalShadows";
import GoldThreads from "./GoldThreads";

// One-line aura: botanical light + gold threads + falling petals,
// composed per surface. Parent must be relative + overflow-hidden.

export default function MehfillAura({
  variant = "hero",
  className = "",
}: {
  variant?: "hero" | "signature" | "dark" | "veil";
  className?: string;
}) {
  if (variant === "dark") {
    return (
      <div aria-hidden="true" className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
        <PetalFall density={10} tone="dark" />
        <GoldThreads className="opacity-70" />
      </div>
    );
  }
  if (variant === "veil") {
    return (
      <div aria-hidden="true" className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
        <PetalFall density={10} tone="dark" />
      </div>
    );
  }
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <BotanicalShadows strength={variant === "signature" ? 1.15 : 0.9} />
      <GoldThreads flip={variant === "signature"} className={variant === "signature" ? "" : "opacity-60"} />
      <PetalFall density={variant === "signature" ? 18 : 12} tone="light" />
    </div>
  );
}
