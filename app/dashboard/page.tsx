"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase, type Seller } from "@/lib/supabase";
import { getStrings } from "@/lib/i18n";

type InvoiceRow = {
  invoice_number: string;
  is_paid: boolean;
  generated_at: string;
  orders: {
    total_inr: number;
    customers: { name: string } | null;
  } | null;
};

const inr = (n: number) =>
  n.toLocaleString("en-IN", { style: "currency", currency: "INR" });

export default function DashboardPage() {
  const router = useRouter();
  const [seller, setSeller] = useState<Seller | null>(null);
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyInv, setBusyInv] = useState<string | null>(null);

  const t = getStrings(seller?.preferred_language);

  const load = useCallback(async () => {
    const { data: sess } = await supabase.auth.getSession();
    if (!sess.session) {
      router.push("/login");
      return;
    }
    const { data: sellerData } = await supabase
      .from("sellers")
      .select("*")
      .maybeSingle();
    if (!sellerData) {
      router.push("/login");
      return;
    }
    setSeller(sellerData as Seller);

    const { data: invData } = await supabase
      .from("invoices")
      .select(
        "invoice_number, is_paid, generated_at, orders(total_inr, customers(name))"
      )
      .order("generated_at", { ascending: false })
      .limit(100);
    setInvoices((invData as unknown as InvoiceRow[]) || []);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  const markPaid = async (invoiceNumber: string) => {
    setBusyInv(invoiceNumber);
    await supabase.rpc("mark_invoice_paid", {
      p_invoice_number: invoiceNumber,
    });
    await load();
    setBusyInv(null);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const today = new Date().toDateString();
  const todayInvoices = invoices.filter(
    (inv) => new Date(inv.generated_at).toDateString() === today
  );
  const todaySales = todayInvoices.reduce(
    (s, inv) => s + Number(inv.orders?.total_inr || 0),
    0
  );
  const pendingCount = invoices.filter((inv) => !inv.is_paid).length;
  const totalSales = invoices
    .filter((inv) => inv.is_paid)
    .reduce((s, inv) => s + Number(inv.orders?.total_inr || 0), 0);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white text-zinc-400">
        {t.loading}
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-2xl bg-white px-5 py-8 text-zinc-900">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{seller?.business_name}</h1>
          <p className="text-sm text-zinc-500">
            {t.hi} {seller?.owner_name} 👋
          </p>
        </div>
        <button
          onClick={signOut}
          className="text-sm text-zinc-400 hover:text-zinc-600"
        >
          {t.signOut}
        </button>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-emerald-50 p-4">
          <p className="text-xs font-medium text-emerald-700">{t.today}</p>
          <p className="mt-1 text-xl font-bold text-emerald-900">
            {todayInvoices.length}
          </p>
          <p className="text-xs text-emerald-700">{inr(todaySales)}</p>
        </div>
        <div className="rounded-2xl bg-zinc-50 p-4">
          <p className="text-xs font-medium text-zinc-500">{t.collected}</p>
          <p className="mt-1 text-xl font-bold">{inr(totalSales)}</p>
          <p className="text-xs text-zinc-500">{t.allTime}</p>
        </div>
        <div className="rounded-2xl bg-amber-50 p-4">
          <p className="text-xs font-medium text-amber-700">{t.unpaid}</p>
          <p className="mt-1 text-xl font-bold text-amber-900">
            {pendingCount}
          </p>
          <p className="text-xs text-amber-700">{t.invoicesSmall}</p>
        </div>
      </div>

      <a
        href="/invoice"
        className="mt-6 block w-full rounded-full bg-emerald-600 py-3 text-center font-semibold text-white hover:bg-emerald-700"
      >
        {t.plusNewInvoice}
      </a>

      <h2 className="mt-8 text-sm font-semibold text-zinc-500">
        {t.invoicesLabel}
      </h2>
      {invoices.length === 0 ? (
        <p className="mt-4 text-sm text-zinc-400">{t.noInvoices}</p>
      ) : (
        <div className="mt-2 divide-y divide-zinc-100">
          {invoices.map((inv) => (
            <div
              key={inv.invoice_number}
              className="flex items-center justify-between py-3"
            >
              <div>
                <p className="font-mono text-sm font-semibold">
                  {inv.invoice_number}
                </p>
                <p className="text-xs text-zinc-500">
                  {inv.orders?.customers?.name || "—"} ·{" "}
                  {new Date(inv.generated_at).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                  })}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold">
                  {inr(Number(inv.orders?.total_inr || 0))}
                </span>
                {inv.is_paid ? (
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                    {t.paidBadge}
                  </span>
                ) : (
                  <button
                    onClick={() => markPaid(inv.invoice_number)}
                    disabled={busyInv === inv.invoice_number}
                    className="rounded-full border border-amber-400 px-3 py-1 text-xs font-medium text-amber-700 hover:bg-amber-50"
                  >
                    {busyInv === inv.invoice_number ? "..." : t.markPaidShort}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
