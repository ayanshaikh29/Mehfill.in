"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Package, Heart, CreditCard, LogOut, Menu, X, Plus, Minus, Trash2, ArrowRight, Calendar, MapPin, Eye } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { PLANS, formatINR, type Plan } from "@/lib/plans";
import { TEMPLATES, type Template } from "@/lib/templates";
import { WhatsAppIcon } from "@/components/BrandIcons";
import { waLink } from "@/lib/contact";
import { displayName } from "@/lib/displayName";

type CartItem = {
  templateId: string;
  planId: string;
  qty: number;
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [activeTab, setActiveTab] = useState<"designs" | "cart" | "orders">("designs");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

  // Load user and cart from localStorage
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      if (!data.session?.user) router.push("/login?callbackUrl=/dashboard");
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) router.push("/login?callbackUrl=/dashboard");
    });
    return () => subscription.unsubscribe();
  }, [router]);

  useEffect(() => {
    if (user) {
      const saved = localStorage.getItem(`mehfill_cart_${user.id}`);
      if (saved) setCart(JSON.parse(saved));
      fetchOrders();
    }
  }, [user]);

  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    if (user) localStorage.setItem(`mehfill_cart_${user.id}`, JSON.stringify(newCart));
  };

  const addToCart = (templateId: string, planId: string) => {
    setCart(prev => {
      const exists = prev.find(c => c.templateId === templateId && c.planId === planId);
      const updated = exists
        ? prev.map(c => c.templateId === templateId && c.planId === planId ? { ...c, qty: c.qty + 1 } : c)
        : [...prev, { templateId, planId, qty: 1 }];
      saveCart(updated);
      return updated;
    });
    setActiveTab("cart");
  };

  const updateQty = (templateId: string, planId: string, delta: number) => {
    setCart(prev => {
      const updated = prev.map(c => 
        c.templateId === templateId && c.planId === planId ? { ...c, qty: Math.max(1, c.qty + delta) } : c
      ).filter(c => c.qty > 0);
      saveCart(updated);
      return updated;
    });
  };

  const removeFromCart = (templateId: string, planId: string) => {
    setCart(prev => {
      const updated = prev.filter(c => !(c.templateId === templateId && c.planId === planId));
      saveCart(updated);
      return updated;
    });
  };

  const getCartTotal = () => {
    return cart.reduce((sum, item) => {
      const plan = PLANS.find(p => p.id === item.planId);
      return sum + (plan?.price || 0) * item.qty;
    }, 0);
  };

  const fetchOrders = async () => {
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from("upi_payments")
        .select("*")
        .eq("email", user?.email)
        .order("created_at", { ascending: false });
      setOrders(data || []);
    } catch {
      setOrders([]);
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    router.push(`/checkout?cart=${encodeURIComponent(JSON.stringify(cart))}`);
  };

  if (loading) return <div className="min-h-screen bg-ivory flex items-center justify-center"><div className="font-serif text-2xl">Loading…</div></div>;

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <main className="min-h-screen bg-ivory">
      {/* Header */}
      <header className="fixed inset-x-0 top-0 z-50 bg-ivory/95 backdrop-blur-xl border-b hairline">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 md:px-8 py-4">
          <Link href="/" className="font-serif text-2xl md:text-[1.7rem] tracking-tight leading-none">
            <span className="font-semibold">Mehfill</span><span className="text-terracotta">.in</span>
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            <button onClick={() => setActiveTab("designs")} className={`font-medium tracking-wide ${activeTab === "designs" ? "text-terracotta" : "text-charcoal/70 hover:text-charcoal"}`}>Browse Designs</button>
            <button onClick={() => setActiveTab("cart")} className={`relative font-medium tracking-wide ${activeTab === "cart" ? "text-terracotta" : "text-charcoal/70 hover:text-charcoal"}`}>
              Cart
              {cartCount > 0 && <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-terracotta text-[10px] flex items-center justify-center text-ivory">{cartCount}</span>}
            </button>
            <button onClick={() => setActiveTab("orders")} className={`font-medium tracking-wide ${activeTab === "orders" ? "text-terracotta" : "text-charcoal/70 hover:text-charcoal"}`}>My Orders</button>
          </div>

          <div className="hidden lg:flex items-center gap-4">
            <span className="text-sm text-charcoal/60">Namaste, <b className="text-charcoal">{displayName(user)}</b></span>
            <button onClick={async () => { await createClient().auth.signOut(); router.push("/"); }} className="rounded-full border hairline px-4 py-2 text-[12px] font-bold hover:border-charcoal/40">Logout</button>
          </div>

          <button className="lg:hidden" onClick={() => setMobileMenu(!mobileMenu)}>
            {mobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>

        {mobileMenu && (
          <div className="lg:hidden border-t hairline bg-ivory px-5 py-4 flex flex-col gap-3">
            <button onClick={() => { setActiveTab("designs"); setMobileMenu(false); }} className={`text-left font-medium ${activeTab === "designs" ? "text-terracotta" : ""}`}>Browse Designs</button>
            <button onClick={() => { setActiveTab("cart"); setMobileMenu(false); }} className={`text-left font-medium relative ${activeTab === "cart" ? "text-terracotta" : ""}`}>
              Cart {cartCount > 0 && <span className="ml-2 h-5 w-5 rounded-full bg-terracotta text-[10px] flex items-center justify-center text-ivory">{cartCount}</span>}
            </button>
            <button onClick={() => { setActiveTab("orders"); setMobileMenu(false); }} className={`text-left font-medium ${activeTab === "orders" ? "text-terracotta" : ""}`}>My Orders</button>
            <button onClick={async () => { await createClient().auth.signOut(); router.push("/"); }} className="text-left rounded-full border hairline px-4 py-2 text-[12px] font-bold">Logout</button>
          </div>
        )}
      </header>

      <div className="pt-24 pb-16 px-5 md:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Tab Content */}
          {activeTab === "designs" && (
            <DesignBrowser onAddToCart={addToCart} />
          )}

          {activeTab === "cart" && (
            <CartView cart={cart} onUpdateQty={updateQty} onRemove={removeFromCart} onCheckout={handleCheckout} onBrowse={() => setActiveTab("designs")} total={getCartTotal()} empty={cart.length === 0} />
          )}

          {activeTab === "orders" && (
            <OrdersView orders={orders} onBrowse={() => setActiveTab("designs")} />
          )}
        </div>
      </div>
    </main>
  );
}

// ─────────────────────────────────────────────
// Design Browser Tab
// ─────────────────────────────────────────────
function DesignBrowser({ onAddToCart }: { onAddToCart: (templateId: string, planId: string) => void }) {
  const [filter, setFilter] = useState("All");
  const filtered = filter === "All" ? TEMPLATES : TEMPLATES.filter(t => t.occasion === filter);
  const categories = ["All", ...new Set(TEMPLATES.map(t => t.occasion))];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <p className="eyebrow text-terracotta">BROWSE DESIGNS</p>
          <h2 className="mt-2 font-serif font-light text-4xl md:text-5xl">Choose your invitation style</h2>
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {categories.map(c => (
            <button key={c} onClick={() => setFilter(c)} className={`whitespace-nowrap rounded-full px-5 py-2.5 text-[13px] font-semibold border transition-all ${filter === c ? "bg-charcoal text-ivory border-charcoal" : "bg-white/60 border-charcoal/15 text-charcoal/70 hover:border-charcoal/30"}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-7">
        {filtered.map((t, i) => (
          <DesignCard key={t.slug} template={t} index={i} onAddToCart={onAddToCart} />
        ))}
      </div>
    </div>
  );
}

function DesignCard({ template, index, onAddToCart }: { template: Template; index: number; onAddToCart: (templateId: string, planId: string) => void }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay: (index % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="group relative overflow-hidden rounded-[1.6rem] bg-white border hairline shadow-[0_10px_40px_rgba(28,25,23,0.07)] hover:shadow-[0_24px_60px_rgba(28,25,23,0.14)] transition-shadow duration-500"
    >
      <div className="relative overflow-hidden aspect-[4/5]">
        <img src={template.image} alt={`${template.name} — ${template.occasion} invitation`} loading="lazy" className="h-full w-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.06]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-80" />
        <span className="absolute left-4 top-4 rounded-full bg-ivory/90 backdrop-blur px-3.5 py-1.5 text-[11px] font-bold tracking-[0.14em] uppercase">{template.occasion}</span>
        <div className="absolute inset-x-0 bottom-0 p-5 text-ivory">
          <p className="font-serif text-3xl leading-none">{template.name}</p>
          <p className="mt-1.5 text-[13px] text-ivory/80">{template.tagline}</p>
        </div>
      </div>
      <div className="p-5">
        <p className="text-[13.5px] leading-relaxed text-charcoal/60 line-clamp-2">{template.description}</p>
      </div>
      <div className="px-5 pb-5">
        <PlanSelector template={template} onAddToCart={onAddToCart} />
      </div>
    </motion.article>
  );
}

function PlanSelector({ template, onAddToCart }: { template: Template; onAddToCart: (templateId: string, planId: string) => void }) {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(PLANS[1]); // Default Signature

  return (
    <div className="space-y-3">
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
        {PLANS.map(p => (
          <button
            key={p.id}
            onClick={() => setSelectedPlan(p)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-[12px] font-semibold border transition-all ${selectedPlan?.id === p.id ? "bg-charcoal text-ivory border-charcoal" : "bg-white/60 border-charcoal/15 text-charcoal/70 hover:border-charcoal/30"}`}
          >
            {p.name} — {formatINR(p.price)}
          </button>
        ))}
      </div>
      <button
        onClick={() => selectedPlan && onAddToCart(template.slug, selectedPlan.id)}
        className="w-full rounded-full bg-terracotta py-3 text-sm font-bold text-ivory hover:bg-terracotta-deep transition-colors"
      >
        Add to Cart — {selectedPlan ? formatINR(selectedPlan.price) : ""}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────
// Cart View Tab
// ─────────────────────────────────────────────
function CartView({ cart, onUpdateQty, onRemove, onCheckout, onBrowse, total, empty }: {
  cart: CartItem[];
  onUpdateQty: (templateId: string, planId: string, delta: number) => void;
  onRemove: (templateId: string, planId: string) => void;
  onCheckout: () => void;
  onBrowse: () => void;
  total: number;
  empty: boolean;
}) {
  if (empty) {
    return (
      <div className="text-center py-20">
        <p className="font-serif text-3xl italic text-charcoal/50">Your cart is empty</p>
        <p className="mt-2 text-sm text-charcoal/60">Browse designs and add your favorites to the cart.</p>
        <button onClick={onBrowse} className="mt-6 rounded-full bg-charcoal px-7 py-3.5 text-sm font-bold text-ivory hover:bg-espresso">Browse Designs</button>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-[1fr_380px] gap-8">
      <div className="space-y-4">
        <h2 className="font-serif font-light text-3xl">Your Cart ({cart.length} item{cart.length > 1 ? "s" : ""})</h2>
        {cart.map(item => {
          const plan = PLANS.find(p => p.id === item.planId);
          const template = TEMPLATES.find(t => t.slug === item.templateId);
          return (
            <div key={`${item.templateId}-${item.planId}`} className="flex flex-col sm:flex-row gap-4 rounded-2xl border hairline bg-white p-5 shadow-sm">
              <img src={template?.image || ""} alt={template?.name || ""} className="w-full sm:w-32 h-32 sm:h-auto rounded-xl object-cover flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{template?.name}</p>
                    <p className="text-sm text-charcoal/60">{template?.occasion} · {plan?.name}</p>
                  </div>
                  <button onClick={() => onRemove(item.templateId, item.planId)} className="text-charcoal/40 hover:text-terracotta"><Trash2 className="h-5 w-5" /></button>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 border hairline rounded-full">
                    <button onClick={() => onUpdateQty(item.templateId, item.planId, -1)} className="w-9 h-9 rounded-full flex items-center justify-center text-charcoal/60 hover:bg-cream"><Minus className="h-4 w-4" /></button>
                    <span className="w-10 text-center font-bold">{item.qty}</span>
                    <button onClick={() => onUpdateQty(item.templateId, item.planId, 1)} className="w-9 h-9 rounded-full flex items-center justify-center text-charcoal/60 hover:bg-cream"><Plus className="h-4 w-4" /></button>
                  </div>
                  <p className="font-bold text-lg">{formatINR((plan?.price || 0) * item.qty)}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="lg:sticky lg:top-24">
        <div className="rounded-2xl border hairline bg-white p-6 shadow-sm">
          <h3 className="font-serif text-2xl mb-4">Order Summary</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span>Subtotal ({cart.reduce((s, i) => s + i.qty, 0)} items)</span><span>{formatINR(total)}</span></div>
            <div className="flex justify-between text-charcoal/60"><span>GST (18%)</span><span>{formatINR(Math.round(total * 0.18))}</span></div>
            <div className="flex justify-between"><span>Delivery</span><span className="text-olive">FREE</span></div>
            <div className="border-t hairline pt-3 flex justify-between font-bold text-lg">
              <span>Total</span><span>{formatINR(total + Math.round(total * 0.18))}</span>
            </div>
          </div>
          <button onClick={onCheckout} disabled={cart.length === 0} className="mt-6 w-full rounded-full bg-terracotta py-4 text-sm font-bold text-ivory hover:bg-terracotta-deep transition-colors">
            Proceed to Payment — {formatINR(total + Math.round(total * 0.18))}
          </button>
          <p className="mt-3 text-center text-[12px] text-charcoal/50">Secure UPI payment · GST invoice included</p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Orders View Tab
// ─────────────────────────────────────────────
function OrdersView({ orders, onBrowse }: { orders: any[]; onBrowse: () => void }) {
  if (orders.length === 0) {
    return (
      <div className="text-center py-20">
        <Package className="mx-auto h-12 w-12 text-charcoal/30" />
        <p className="mt-4 font-serif text-2xl italic text-charcoal/50">No orders yet</p>
        <p className="mt-2 text-sm text-charcoal/60">Your completed invitations will appear here.</p>
        <button onClick={onBrowse} className="mt-6 rounded-full bg-charcoal px-7 py-3.5 text-sm font-bold text-ivory hover:bg-espresso">Browse Designs</button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="font-serif font-light text-3xl">Your Orders</h2>
      <div className="rounded-2xl border hairline bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[11px] tracking-[0.15em] text-charcoal/45 bg-cream/50">
              <th className="pb-3 pr-4 pl-5 font-bold text-left">DATE</th>
              <th className="pb-3 pr-4 font-bold text-left">INVITATION</th>
              <th className="pb-3 pr-4 font-bold text-left">PLAN</th>
              <th className="pb-3 pr-4 font-bold text-left">AMOUNT</th>
              <th className="pb-3 font-bold text-left">STATUS</th>
              <th className="pb-3 font-bold text-left">ACTION</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id} className="border-t border-charcoal/10 hover:bg-cream/30">
                <td className="py-4 pl-5 text-charcoal/70">{new Date(o.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
                <td className="py-4 pr-4">
                  <p className="font-semibold capitalize">{o.template_slug || o.plan}</p>
                  <p className="text-[12px] text-charcoal/55">{o.occasion || ""} · {o.city || ""}, {o.state || ""}</p>
                </td>
                <td className="py-4 pr-4 capitalize">{o.plan}</td>
                <td className="py-4 pr-4">{formatINR(o.amount)}</td>
                <td className="py-4 pr-4">
                  <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${o.status === "paid" ? "bg-olive/15 text-olive" : o.status === "rejected" ? "bg-white/10 text-charcoal/50" : "bg-champagne/20 text-terracotta"}`}>
                    {o.status.toUpperCase()}
                  </span>
                </td>
                <td className="py-4">
                  {o.status === "paid" && (
                    <button className="inline-flex items-center gap-1.5 rounded-full bg-charcoal px-4 py-2 text-[12px] font-bold text-ivory hover:bg-espresso">
                      <Eye className="h-3.5 w-3.5" /> View
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Need to import motion for DesignCard
import { motion } from "framer-motion";