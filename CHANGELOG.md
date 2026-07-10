# GetWeChaat Web — Changelog

All notable changes to the showcase website, in plain language.
Versions follow v MAJOR.MINOR.PATCH — we stay on v0.x until the first real seller is live.

## v0.2.0 — 2026-07-09 · Live site + Invoice maker

- Website hosted on Vercel: https://getwechaat-web.vercel.app (auto-deploys from `main`)
- New vendor-first strategy: build tools vendors use daily, add the WhatsApp bot on top later
- **Invoice maker** at /invoice — vendor fills customer + items on their phone,
  gets a numbered invoice (INV-2026-0001, continues automatically per device),
  can send it to the customer's WhatsApp in one tap or download/print as PDF
- Business name and phone remembered on the vendor's device

## v0.1.0 — 2026-07-07 · Foundation

- Project created with Next.js + TypeScript + Tailwind
- GitHub repo set up with `main` (production) and `develop` (working) branches
- Full landing page: hero, 6 feature cards, how-it-works, "Start on WhatsApp" buttons
  (WhatsApp number is a placeholder until the bot exists)

## Planned (one feature at a time)

- v0.3.0 — Invoices stored permanently in Supabase (numbering shared across devices)
- v0.4.0 — Product list: save catalog once, invoices autofill
- v0.5.0 — Customer book: invoices build the contact list automatically
- v0.6.0 — Stock counts: each sale reduces inventory
- v0.7.0 — Payment tracking: mark invoices paid/unpaid
- v0.8.0 — WhatsApp bot: generate invoices from inside WhatsApp chat
- v1.0.0 — First seller live end-to-end
