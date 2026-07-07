// GetWeChaat landing page
// CTA points to WhatsApp — replace WHATSAPP_NUMBER when the bot goes live.
const WHATSAPP_NUMBER = "910000000000"; // TODO: real number, no + sign
const WA_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=Hi!%20I%27d%20like%20to%20see%20the%20catalog`;

const features = [
  {
    title: "Your own showcase website",
    body: "A clean, mobile-first storefront generated from your catalog. Share it on WhatsApp Status, Instagram bio, or anywhere your customers are.",
  },
  {
    title: "Customers shop inside WhatsApp",
    body: "The bot answers product questions, shows live availability, captures orders, and confirms payments — in the chat your customers already use.",
  },
  {
    title: "One catalog, zero double-selling",
    body: "Website and WhatsApp orders draw from the same real-time stock. Every item has a unique serial number, so nothing gets sold twice.",
  },
  {
    title: "Professional PDF invoices",
    body: "Branded invoices with automatic numbering (INV-2026-0001) generated for every order. No templates, no manual formatting.",
  },
  {
    title: "UPI payment tracking",
    body: "See payment status live next to each order. No more chasing screenshots to confirm who paid.",
  },
  {
    title: "Your customers, your data",
    body: "Every order builds your own customer list with consent-based WhatsApp opt-in, ready for festival and new-collection promotions.",
  },
];

const steps = [
  {
    n: "01",
    title: "Share your store link",
    body: "You get a branded URL after setup. Put it in your WhatsApp Status, Instagram bio, or send it directly.",
  },
  {
    n: "02",
    title: "Customers browse and order on WhatsApp",
    body: "They tap the link, the chat opens, and the bot shows your catalog with live stock. No app to install.",
  },
  {
    n: "03",
    title: "Orders land in your dashboard",
    body: "Items, quantities, customer details, and payment status — organized automatically.",
  },
  {
    n: "04",
    title: "You fulfill, we handle the paperwork",
    body: "Mark it dispatched, the customer gets notified, and the PDF invoice is ready to share.",
  },
];

export default function Home() {
  return (
    <main className="flex-1 bg-white text-zinc-900">
      {/* Nav */}
      <header className="sticky top-0 z-10 border-b border-zinc-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-lg font-bold tracking-tight">
            GetWe<span className="text-emerald-600">Chaat</span>
          </span>
          <nav className="hidden gap-8 text-sm text-zinc-600 sm:flex">
            <a href="#features" className="hover:text-zinc-900">Features</a>
            <a href="#how-it-works" className="hover:text-zinc-900">How it works</a>
          </nav>
          <a
            href={WA_LINK}
            className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Start on WhatsApp
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pb-20 pt-24 text-center">
        <p className="mb-4 inline-block rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1 text-xs font-medium text-emerald-700">
          WhatsApp-powered · Real-time inventory · No app download
        </p>
        <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">
          Your WhatsApp store,{" "}
          <span className="text-emerald-600">always in sync</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-600">
          GetWeChaat gives home-based sellers a branded showcase website and a
          WhatsApp bot that handles browsing, orders, live stock, PDF invoices,
          and UPI payment tracking — without asking customers to download
          anything.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <a
            href={WA_LINK}
            className="rounded-full bg-emerald-600 px-8 py-3 font-semibold text-white hover:bg-emerald-700"
          >
            Start on WhatsApp →
          </a>
          <a
            href="#how-it-works"
            className="rounded-full border border-zinc-300 px-8 py-3 font-semibold text-zinc-700 hover:bg-zinc-50"
          >
            See how it works
          </a>
        </div>
        <p className="mt-6 text-sm text-zinc-500">
          Built for India&apos;s home-based sellers — starting with one-gram
          gold jewelry.
        </p>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-zinc-100 bg-zinc-50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-3xl font-bold tracking-tight">
            Everything a home seller needs
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-zinc-600">
            Replace the chaos of chats, DMs, and notebooks with one platform for
            catalog, orders, and payments.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-zinc-200 bg-white p-6"
              >
                <h3 className="font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                  {f.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-center text-3xl font-bold tracking-tight">
            From setup to first order in days
          </h2>
          <div className="mt-12 space-y-8">
            {steps.map((s) => (
              <div key={s.n} className="flex gap-6">
                <span className="text-2xl font-bold text-emerald-600">{s.n}</span>
                <div>
                  <h3 className="font-semibold">{s.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-zinc-600">
                    {s.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-zinc-100 bg-emerald-600 py-16 text-center text-white">
        <h2 className="text-3xl font-bold tracking-tight">
          Your WhatsApp store is waiting
        </h2>
        <p className="mx-auto mt-3 max-w-xl px-6 text-emerald-50">
          Stop losing orders to manual chats. Get a branded storefront and a bot
          that never forgets stock.
        </p>
        <a
          href={WA_LINK}
          className="mt-8 inline-block rounded-full bg-white px-8 py-3 font-semibold text-emerald-700 hover:bg-emerald-50"
        >
          Start on WhatsApp →
        </a>
      </section>

      <footer className="py-8 text-center text-sm text-zinc-500">
        © {new Date().getFullYear()} GetWeChaat
      </footer>
    </main>
  );
}
