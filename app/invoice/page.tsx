"use client";

import { useEffect, useState } from "react";

type Item = { name: string; qty: number; price: number };

const emptyItem: Item = { name: "", qty: 1, price: 0 };

function nextInvoiceNumber(): string {
  const year = new Date().getFullYear();
  const key = `gw_invoice_counter_${year}`;
  const last = parseInt(localStorage.getItem(key) || "0", 10);
  const seq = last + 1;
  localStorage.setItem(key, String(seq));
  return `INV-${year}-${String(seq).padStart(4, "0")}`;
}

export default function InvoicePage() {
  // Seller details (saved on this device)
  const [businessName, setBusinessName] = useState("");
  const [sellerPhone, setSellerPhone] = useState("");
  // Customer
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  // Items
  const [items, setItems] = useState<Item[]>([{ ...emptyItem }]);
  // Generated invoice
  const [invoiceNo, setInvoiceNo] = useState<string | null>(null);
  const [invoiceDate, setInvoiceDate] = useState<string>("");

  useEffect(() => {
    setBusinessName(localStorage.getItem("gw_business_name") || "");
    setSellerPhone(localStorage.getItem("gw_seller_phone") || "");
  }, []);

  useEffect(() => {
    localStorage.setItem("gw_business_name", businessName);
  }, [businessName]);
  useEffect(() => {
    localStorage.setItem("gw_seller_phone", sellerPhone);
  }, [sellerPhone]);

  const total = items.reduce((s, it) => s + it.qty * it.price, 0);
  const valid =
    businessName.trim() &&
    customerName.trim() &&
    items.some((it) => it.name.trim() && it.qty > 0);

  const setItem = (i: number, patch: Partial<Item>) =>
    setItems((prev) => prev.map((it, j) => (j === i ? { ...it, ...patch } : it)));

  const generate = () => {
    if (!valid) return;
    setInvoiceNo(nextInvoiceNumber());
    setInvoiceDate(
      new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    );
  };

  const reset = () => {
    setInvoiceNo(null);
    setCustomerName("");
    setCustomerPhone("");
    setItems([{ ...emptyItem }]);
  };

  const inr = (n: number) =>
    n.toLocaleString("en-IN", { style: "currency", currency: "INR" });

  const waText = () => {
    const lines = [
      `*${businessName}*`,
      `Invoice ${invoiceNo} · ${invoiceDate}`,
      ``,
      ...items
        .filter((it) => it.name.trim())
        .map((it) => `• ${it.name} ×${it.qty} — ${inr(it.qty * it.price)}`),
      ``,
      `*Total: ${inr(total)}*`,
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

  // ------- Invoice view (after generate) -------
  if (invoiceNo) {
    return (
      <main className="mx-auto min-h-screen max-w-lg bg-white px-5 py-8 text-zinc-900">
        <div id="invoice-sheet" className="rounded-2xl border border-zinc-200 p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold">{businessName}</h1>
              {sellerPhone && (
                <p className="text-sm text-zinc-500">☎ {sellerPhone}</p>
              )}
            </div>
            <div className="text-right">
              <p className="font-mono text-sm font-semibold">{invoiceNo}</p>
              <p className="text-sm text-zinc-500">{invoiceDate}</p>
            </div>
          </div>

          <div className="mt-6 rounded-lg bg-zinc-50 p-3 text-sm">
            <span className="text-zinc-500">Billed to: </span>
            <span className="font-medium">{customerName}</span>
            {customerPhone && (
              <span className="text-zinc-500"> · {customerPhone}</span>
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

          <div className="mt-4 flex justify-end">
            <div className="text-right">
              <p className="text-sm text-zinc-500">Total</p>
              <p className="text-2xl font-bold">{inr(total)}</p>
            </div>
          </div>

          <p className="mt-8 text-center text-xs text-zinc-400">
            Generated with GetWeChaat
          </p>
        </div>

        {/* Actions — hidden when printing */}
        <div className="mt-6 space-y-3 print:hidden">
          {customerPhone && (
            <a
              href={waLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full rounded-full bg-emerald-600 py-3 text-center font-semibold text-white hover:bg-emerald-700"
            >
              Send on WhatsApp
            </a>
          )}
          <button
            onClick={() => window.print()}
            className="block w-full rounded-full border border-zinc-300 py-3 text-center font-semibold text-zinc-700 hover:bg-zinc-50"
          >
            Download PDF / Print
          </button>
          <button
            onClick={reset}
            className="block w-full py-2 text-center text-sm text-zinc-500 hover:text-zinc-700"
          >
            + New invoice
          </button>
        </div>
      </main>
    );
  }

  // ------- Form view -------
  return (
    <main className="mx-auto min-h-screen max-w-lg bg-white px-5 py-8 text-zinc-900">
      <h1 className="text-2xl font-bold">
        New <span className="text-emerald-600">Invoice</span>
      </h1>
      <p className="mt-1 text-sm text-zinc-500">
        Fill the details, get a numbered invoice, send it on WhatsApp.
      </p>

      <section className="mt-6">
        <h2 className="text-sm font-semibold text-zinc-500">YOUR BUSINESS</h2>
        <input
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          placeholder="Business name (e.g. Sri Lakshmi Jewels)"
          className="mt-2 w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none"
        />
        <input
          value={sellerPhone}
          onChange={(e) => setSellerPhone(e.target.value)}
          placeholder="Your phone (shown on invoice)"
          inputMode="tel"
          className="mt-2 w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none"
        />
      </section>

      <section className="mt-6">
        <h2 className="text-sm font-semibold text-zinc-500">CUSTOMER</h2>
        <input
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="Customer name"
          className="mt-2 w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none"
        />
        <input
          value={customerPhone}
          onChange={(e) => setCustomerPhone(e.target.value)}
          placeholder="Customer WhatsApp number"
          inputMode="tel"
          className="mt-2 w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none"
        />
      </section>

      <section className="mt-6">
        <h2 className="text-sm font-semibold text-zinc-500">ITEMS</h2>
        {items.map((it, i) => (
          <div key={i} className="mt-2 rounded-xl border border-zinc-200 p-3">
            <input
              value={it.name}
              onChange={(e) => setItem(i, { name: e.target.value })}
              placeholder={`Item ${i + 1} (e.g. 1gm Gold Floral Stud)`}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            />
            <div className="mt-2 flex gap-2">
              <input
                type="number"
                min={1}
                value={it.qty || ""}
                onChange={(e) => setItem(i, { qty: Number(e.target.value) })}
                placeholder="Qty"
                className="w-20 rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
              />
              <input
                type="number"
                min={0}
                value={it.price || ""}
                onChange={(e) => setItem(i, { price: Number(e.target.value) })}
                placeholder="Price ₹"
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
          + Add another item
        </button>
      </section>

      <div className="mt-6 flex items-center justify-between rounded-xl bg-zinc-50 px-4 py-3">
        <span className="text-sm text-zinc-500">Total</span>
        <span className="text-xl font-bold">{inr(total)}</span>
      </div>

      <button
        onClick={generate}
        disabled={!valid}
        className="mt-6 w-full rounded-full bg-emerald-600 py-3 font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
      >
        Generate invoice
      </button>
      <p className="mt-3 text-center text-xs text-zinc-400">
        Invoice numbers continue automatically on this device (INV-
        {new Date().getFullYear()}-XXXX)
      </p>
    </main>
  );
}
