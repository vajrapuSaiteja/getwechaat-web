"use client";

// Public invoice page — the link the vendor sends to their customer.
// Shows the invoice with UPI QR (unpaid) or PAID stamp (paid). No login needed.

import { use, useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { supabase } from "@/lib/supabase";

type PublicInvoice = {
  invoice_number: string;
  is_paid: boolean;
  generated_at: string;
  business_name: string;
  seller_phone: string;
  upi_id: string | null;
  customer_name: string;
  customer_phone: string;
  customer_address: string | null;
  total: number;
  items: { name: string; qty: number; price: number }[] | null;
};

const inr = (n: number) =>
  Number(n).toLocaleString("en-IN", { style: "currency", currency: "INR" });

export default function PublicInvoicePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const [inv, setInv] = useState<PublicInvoice | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    supabase
      .rpc("get_public_invoice", { p_token: token })
      .then(({ data, error }) => {
        if (error || !data) setNotFound(true);
        else setInv(data as PublicInvoice);
      });
  }, [token]);

  if (notFound) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white text-zinc-400">
        Invoice not found.
      </main>
    );
  }
  if (!inv) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white text-zinc-400">
        Loading...
      </main>
    );
  }

  const upiLink = inv.upi_id
    ? `upi://pay?pa=${encodeURIComponent(inv.upi_id)}&pn=${encodeURIComponent(inv.business_name)}&am=${Number(inv.total).toFixed(2)}&cu=INR&tn=${encodeURIComponent(inv.invoice_number)}`
    : "";

  return (
    <main className="mx-auto min-h-screen max-w-lg bg-white px-5 py-8 text-zinc-900">
      <div className="relative rounded-2xl border border-zinc-200 p-6">
        {inv.is_paid && (
          <div className="absolute right-4 top-4 rotate-12 rounded border-4 border-emerald-600 px-3 py-1 text-xl font-black tracking-widest text-emerald-600">
            PAID
          </div>
        )}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold">{inv.business_name}</h1>
            <p className="text-sm text-zinc-500">☎ {inv.seller_phone}</p>
          </div>
          <div className="text-right">
            <p className="font-mono text-sm font-semibold">{inv.invoice_number}</p>
            <p className="text-sm text-zinc-500">
              {new Date(inv.generated_at).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-lg bg-zinc-50 p-3 text-sm">
          <span className="text-zinc-500">Billed to: </span>
          <span className="font-medium">{inv.customer_name}</span>
          <span className="text-zinc-500"> · {inv.customer_phone}</span>
          {inv.customer_address && (
            <p className="mt-1 text-zinc-500">{inv.customer_address}</p>
          )}
        </div>

        <table className="mt-6 w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-left text-zinc-500">
              <th className="pb-2 font-medium">Item</th>
              <th className="pb-2 text-center font-medium">Qty</th>
              <th className="pb-2 text-right font-medium">Price</th>
              <th className="pb-2 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            {(inv.items || []).map((it, i) => (
              <tr key={i} className="border-b border-zinc-100">
                <td className="py-2">{it.name}</td>
                <td className="py-2 text-center">{it.qty}</td>
                <td className="py-2 text-right">{inr(it.price)}</td>
                <td className="py-2 text-right">{inr(it.qty * it.price)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 flex items-end justify-between">
          {inv.upi_id && !inv.is_paid ? (
            <div className="text-center">
              <div className="rounded-lg border border-zinc-200 bg-white p-2">
                <QRCode value={upiLink} size={110} />
              </div>
              <p className="mt-1 text-xs text-zinc-500">Scan to pay via UPI</p>
              <p className="text-xs text-zinc-400">{inv.upi_id}</p>
            </div>
          ) : (
            <div />
          )}
          <div className="text-right">
            <p className="text-sm text-zinc-500">Total</p>
            <p className="text-2xl font-bold">{inr(inv.total)}</p>
          </div>
        </div>

        {inv.upi_id && !inv.is_paid && (
          <a
            href={upiLink}
            className="mt-6 block w-full rounded-full bg-emerald-600 py-3 text-center font-semibold text-white hover:bg-emerald-700 print:hidden"
          >
            Pay {inr(inv.total)} via UPI
          </a>
        )}

        <p className="mt-8 text-center text-xs text-zinc-400">
          Generated with GetWeChaat
        </p>
      </div>

      <button
        onClick={() => window.print()}
        className="mt-4 block w-full rounded-full border border-zinc-300 py-3 text-center font-semibold text-zinc-700 hover:bg-zinc-50 print:hidden"
      >
        Download PDF / Print
      </button>
    </main>
  );
}
