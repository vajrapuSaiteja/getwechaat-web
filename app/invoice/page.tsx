"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import QRCode from "react-qr-code";
import { supabase, type Seller } from "@/lib/supabase";
import { getStrings } from "@/lib/i18n";

type Item = { name: string; qty: number; price: number };
const emptyItem: Item = { name: "", qty: 1, price: 0 };

const inr = (n: number) =>
  n.toLocaleString("en-IN", { style: "currency", currency: "INR" });

export default function InvoicePage() {
  const router = useRouter();
  const [seller, setSeller] = useState<Seller | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [items, setItems] = useState<Item[]>([{ ...emptyItem }]);

  const [invoiceNo, setInvoiceNo] = useState<string | null>(null);
  const [invoiceDate, setInvoiceDate] = useState("");
  const [isPaid, setIsPaid] = useState(false);

  const t = getStrings(seller?.preferred_language);

  useEffect(() => {
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        router.push("/login");
        return;
      }
      const { data } = await supabase.from("sellers").select("*").maybeSingle();
      if (!data) {
        router.push("/login");
        return;
      }
      setSeller(data as Seller);
      setLoading(false);
    })();
  }, [router]);

  const total = items.reduce((s, it) => s + it.qty * it.price, 0);
  const valid =
    customerName.trim() &&
    customerPhone.trim() &&
    items.some((it) => it.name.trim() && it.qty > 0);

  const setItem = (i: number, patch: Partial<Item>) =>
    setItems((prev) => prev.map((it, j) => (j === i ? { ...it, ...patch } : it)));

  const generate = async () => {
    if (!valid) return;
    setBusy(true);
    setError("");
    const { data, error: err } = await supabase.rpc("create_invoice", {
      p_customer_name: customerName.trim(),
      p_customer_phone: customerPhone.trim(),
      p_customer_address: customerAddress.trim(),
      p_customer_email: "",
      p_items: items
        .filter((it) => it.name.trim() && it.qty > 0)
        .map((it) => ({ name: it.name.trim(), qty: it.qty, price: it.price })),
    });
    setBusy(false);
    if (err) {
      setError(err.message);
      return;
    }
    setInvoiceNo((data as { invoice_number: string }).invoice_number);
    setIsPaid(false);
    setInvoiceDate(
      new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    );
  };

  const markPaid = async () => {
    if (!invoiceNo) return;
    setBusy(true);
    const { error: err } = await supabase.rpc("mark_invoice_paid", {
      p_invoice_number: invoiceNo,
    });
    setBusy(false);
    if (!err) setIsPaid(true);
  };

  const reset = () => {
    setInvoiceNo(null);
    setIsPaid(false);
    setCustomerName("");
    setCustomerPhone("");
    setCustomerAddress("");
    setItems([{ ...emptyItem }]);
  };

  const upiLink = () =>
    seller?.upi_id
      ? `upi://pay?pa=${encodeURIComponent(seller.upi_id)}&pn=${encodeURIComponent(seller.business_name)}&am=${total.toFixed(2)}&cu=INR&tn=${encodeURIComponent(invoiceNo || "")}`
      : "";

  const waText = () => {
    const lines = [
      `*${seller?.business_name}*`,
      `Invoice ${invoiceNo} · ${invoiceDate}${isPaid ? " · PAID ✅" : ""}`,
      ``,
      ...items
        .filter((it) => it.name.trim())
        .map((it) => `• ${it.name} ×${it.qty} — ${inr(it.qty * it.price)}`),
      ``,
      `*Total: ${inr(total)}*`,
      ...(seller?.upi_id && !isPaid ? [``, `Pay via UPI: ${seller.upi_id}`] : []),
      ``,
      `Thank you, ${customerName}! 🙏`,
    ];
    return encodeURIComponent(lines.join("\n"));
  };

  const waLink = () => {
    const digits = customerPhone.replace(/\D/g, "");
    const phone = digits.length === 10 ? `91${digits}` : digits;
    return `https://wa.me/${phone}?text=${waText()}`;
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white text-zinc-400">
        {t.loading}
      </main>
    );
  }

  // ------- Invoice view -------
  if (invoiceNo) {
    return (
      <main className="mx-auto min-h-screen max-w-lg bg-white px-5 py-8 text-zinc-900">
        <div className="relative rounded-2xl border border-zinc-200 p-6">
          {isPaid && (
            <div className="absolute right-4 top-4 rotate-12 rounded border-4 border-emerald-600 px-3 py-1 text-xl font-black tracking-widest text-emerald-600">
              {t.paidStamp}
            </div>
          )}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold">{seller?.business_name}</h1>
              <p className="text-sm text-zinc-500">☎ {seller?.phone}</p>
            </div>
            <div className="text-right">
              <p className="font-mono text-sm font-semibold">{invoiceNo}</p>
              <p className="text-sm text-zinc-500">{invoiceDate}</p>
            </div>
          </div>

          <div className="mt-6 rounded-lg bg-zinc-50 p-3 text-sm">
            <span className="text-zinc-500">{t.billedTo} </span>
            <span className="font-medium">{customerName}</span>
            <span className="text-zinc-500"> · {customerPhone}</span>
            {customerAddress && (
              <p className="mt-1 text-zinc-500">{customerAddress}</p>
            )}
          </div>

          <table className="mt-6 w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-left text-zinc-500">
                <th className="pb-2 font-medium">{t.colItem}</th>
                <th className="pb-2 text-center font-medium">{t.colQty}</th>
                <th className="pb-2 text-right font-medium">{t.colPrice}</th>
                <th className="pb-2 text-right font-medium">{t.colAmount}</th>
              </tr>
            </thead>
            <tbody>
              {items
                .filter((it) => it.name.trim())
                .map((it, i) => (
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
            {seller?.upi_id && !isPaid ? (
              <div className="text-center">
                <div className="rounded-lg border border-zinc-200 bg-white p-2">
                  <QRCode value={upiLink()} size={110} />
                </div>
                <p className="mt-1 text-xs text-zinc-500">{t.scanToPay}</p>
                <p className="text-xs text-zinc-400">{seller.upi_id}</p>
              </div>
            ) : (
              <div />
            )}
            <div className="text-right">
              <p className="text-sm text-zinc-500">{t.total}</p>
              <p className="text-2xl font-bold">{inr(total)}</p>
            </div>
          </div>

          <p className="mt-8 text-center text-xs text-zinc-400">
            Generated with GetWeChaat
          </p>
        </div>

        <div className="mt-6 space-y-3 print:hidden">
          <a
            href={waLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full rounded-full bg-emerald-600 py-3 text-center font-semibold text-white hover:bg-emerald-700"
          >
            {t.sendWA}
          </a>
          {!isPaid && (
            <button
              onClick={markPaid}
              disabled={busy}
              className="block w-full rounded-full border-2 border-emerald-600 py-3 text-center font-semibold text-emerald-700 hover:bg-emerald-50"
            >
              {busy ? "..." : t.markPaid}
            </button>
          )}
          <button
            onClick={() => window.print()}
            className="block w-full rounded-full border border-zinc-300 py-3 text-center font-semibold text-zinc-700 hover:bg-zinc-50"
          >
            {t.downloadPdf}
          </button>
          <div className="flex justify-between text-sm text-zinc-500">
            <button onClick={reset} className="py-2 hover:text-zinc-700">
              {t.plusNewInvoice}
            </button>
            <a href="/dashboard" className="py-2 hover:text-zinc-700">
              {t.dashboard} →
            </a>
          </div>
        </div>
      </main>
    );
  }

  // ------- Form view -------
  return (
    <main className="mx-auto min-h-screen max-w-lg bg-white px-5 py-8 text-zinc-900">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          <span className="text-emerald-600">{t.newInvoice}</span>
        </h1>
        <a href="/dashboard" className="text-sm text-zinc-500 hover:text-zinc-700">
          {t.dashboard} →
        </a>
      </div>
      <p className="mt-1 text-sm text-zinc-500">{seller?.business_name}</p>

      <section className="mt-6">
        <h2 className="text-sm font-semibold text-zinc-500">{t.customer}</h2>
        <input
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder={t.custName}
          className="mt-2 w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none"
        />
        <input
          value={customerPhone}
          onChange={(e) => setCustomerPhone(e.target.value)}
          placeholder={t.custPhone}
          inputMode="tel"
          className="mt-2 w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none"
        />
        <input
          value={customerAddress}
          onChange={(e) => setCustomerAddress(e.target.value)}
          placeholder={t.custAddress}
          className="mt-2 w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none"
        />
      </section>

      <section className="mt-6">
        <h2 className="text-sm font-semibold text-zinc-500">{t.items}</h2>
        {items.map((it, i) => (
          <div key={i} className="mt-2 rounded-xl border border-zinc-200 p-3">
            <input
              value={it.name}
              onChange={(e) => setItem(i, { name: e.target.value })}
              placeholder={`${t.itemPh} ${i + 1}`}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            />
            <div className="mt-2 flex gap-2">
              <input
                type="number"
                min={1}
                value={it.qty || ""}
                onChange={(e) => setItem(i, { qty: Number(e.target.value) })}
                placeholder={t.qty}
                className="w-20 rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
              />
              <input
                type="number"
                min={0}
                value={it.price || ""}
                onChange={(e) => setItem(i, { price: Number(e.target.value) })}
                placeholder={t.pricePh}
                className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
              />
              {items.length > 1 && (
                <button
                  onClick={() =>
                    setItems((prev) => prev.filter((_, j) => j !== i))
                  }
                  className="rounded-lg border border-zinc-200 px-3 text-zinc-400 hover:text-red-500"
                  aria-label="Remove item"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        ))}
        <button
          onClick={() => setItems((prev) => [...prev, { ...emptyItem }])}
          className="mt-2 text-sm font-medium text-emerald-600 hover:text-emerald-700"
        >
          {t.addItem}
        </button>
      </section>

      <div className="mt-6 flex items-center justify-between rounded-xl bg-zinc-50 px-4 py-3">
        <span className="text-sm text-zinc-500">{t.total}</span>
        <span className="text-xl font-bold">{inr(total)}</span>
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <button
        onClick={generate}
        disabled={!valid || busy}
        className="mt-6 w-full rounded-full bg-emerald-600 py-3 font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
      >
        {busy ? t.generating : t.generate}
      </button>
      <p className="mt-3 text-center text-xs text-zinc-400">{t.savedNote}</p>
    </main>
  );
}
