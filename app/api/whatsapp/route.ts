// WhatsApp bot webhook — Meta Cloud API
// Vendor-only assistant: vendors message the bot, customers never do.
//
// Required env vars (set in Vercel):
//   WHATSAPP_TOKEN        - Meta access token
//   WHATSAPP_PHONE_ID     - the bot number's phone-number-id from Meta
//   WHATSAPP_VERIFY_TOKEN - any secret string, same value entered in Meta webhook config
//   SUPABASE_SERVICE_KEY  - Supabase secret key (server-only, bypasses RLS)

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { botStrings } from "@/lib/botStrings";

const SITE = "https://getwechaat-web.vercel.app";
const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://qhrucvdwguxvnbuwrvae.supabase.co";

function serviceDb() {
  return createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY!, {
    auth: { persistSession: false },
  });
}

const inr = (n: number) =>
  Number(n).toLocaleString("en-IN", { style: "currency", currency: "INR" });

const last10 = (phone: string) => phone.replace(/\D/g, "").slice(-10);

async function sendText(to: string, body: string) {
  await fetch(
    `https://graph.facebook.com/v21.0/${process.env.WHATSAPP_PHONE_ID}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body, preview_url: true },
      }),
    }
  );
}

type Item = { name: string; qty: number; price: number };

function parseItems(text: string): Item[] | null {
  const items: Item[] = [];
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    const parts = line.split(",").map((p) => p.trim());
    if (parts.length < 3) return null;
    const price = Number(parts[parts.length - 1]);
    const qty = Number(parts[parts.length - 2]);
    const name = parts.slice(0, parts.length - 2).join(", ");
    if (!name || !Number.isFinite(qty) || qty <= 0 || !Number.isFinite(price) || price < 0)
      return null;
    items.push({ name, qty, price });
  }
  return items.length ? items : null;
}

// ---- Webhook verification (Meta calls this once when you configure it) ----
export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  if (
    p.get("hub.mode") === "subscribe" &&
    p.get("hub.verify_token") === process.env.WHATSAPP_VERIFY_TOKEN
  ) {
    return new NextResponse(p.get("hub.challenge") || "", { status: 200 });
  }
  return new NextResponse("Forbidden", { status: 403 });
}

// ---- Incoming messages ----
export async function POST(req: NextRequest) {
  const payload = await req.json().catch(() => null);
  const msg = payload?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  if (!msg || msg.type !== "text") {
    return NextResponse.json({ ok: true }); // status updates etc. — ack silently
  }

  const from: string = msg.from; // e.g. "919876543210"
  const text: string = (msg.text?.body || "").trim();
  const db = serviceDb();

  // Identify vendor by phone (last 10 digits)
  const { data: sellers } = await db
    .from("sellers")
    .select("id, owner_name, business_name, preferred_language, phone")
    .ilike("phone", `%${last10(from)}%`)
    .limit(1);
  const seller = sellers?.[0];

  if (!seller) {
    await sendText(from, botStrings("en").notRegistered);
    return NextResponse.json({ ok: true });
  }

  const t = botStrings(seller.preferred_language);

  // Load or create session
  const { data: sessData } = await db
    .from("bot_sessions")
    .select("*")
    .eq("phone", last10(from))
    .maybeSingle();

  const session = sessData || {
    phone: last10(from),
    seller_id: seller.id,
    state: "idle",
    draft: {},
  };

  const saveSession = async (state: string, draft: object) => {
    await db.from("bot_sessions").upsert({
      phone: last10(from),
      seller_id: seller.id,
      state,
      draft,
      updated_at: new Date().toISOString(),
    });
  };

  const lower = text.toLowerCase();

  // Global commands work in any state
  if (lower === "cancel") {
    await saveSession("idle", {});
    await sendText(from, t.cancelled);
    return NextResponse.json({ ok: true });
  }

  const paidMatch = text.match(/^paid\s+(\S+)/i);
  if (paidMatch) {
    const invNo = paidMatch[1];
    const { data: ok } = await db.rpc("mark_paid_by_seller", {
      p_seller: seller.id,
      p_invoice_number: invNo,
    });
    await sendText(from, ok ? t.paidOk(invNo.toUpperCase()) : t.paidNotFound(invNo.toUpperCase()));
    return NextResponse.json({ ok: true });
  }

  if (lower === "1" || lower.includes("new invoice") || lower === "invoice") {
    await saveSession("awaiting_name", {});
    await sendText(from, t.askCustomerName);
    return NextResponse.json({ ok: true });
  }

  // State machine
  const draft = (session.draft || {}) as {
    customer_name?: string;
    customer_phone?: string;
    customer_address?: string;
    items?: Item[];
  };

  switch (session.state) {
    case "awaiting_name": {
      draft.customer_name = text;
      await saveSession("awaiting_phone", draft);
      await sendText(from, t.askCustomerPhone);
      break;
    }
    case "awaiting_phone": {
      draft.customer_phone = text;
      await saveSession("awaiting_address", draft);
      await sendText(from, t.askAddress);
      break;
    }
    case "awaiting_address": {
      draft.customer_address = lower === "skip" ? "" : text;
      await saveSession("awaiting_items", draft);
      await sendText(from, t.askItems);
      break;
    }
    case "awaiting_items": {
      const items = parseItems(text);
      if (!items) {
        await sendText(from, t.itemsParseError);
        break;
      }
      draft.items = items;
      const total = items.reduce((s, it) => s + it.qty * it.price, 0);
      const summary =
        `👤 ${draft.customer_name} (${draft.customer_phone})\n` +
        items.map((it) => `• ${it.name} ×${it.qty} — ${inr(it.qty * it.price)}`).join("\n");
      await saveSession("awaiting_confirm", draft);
      await sendText(from, t.confirm(summary, inr(total)));
      break;
    }
    case "awaiting_confirm": {
      if (lower === "yes" || lower === "y") {
        const { data, error } = await db.rpc("create_invoice_by_seller", {
          p_seller: seller.id,
          p_customer_name: draft.customer_name,
          p_customer_phone: draft.customer_phone,
          p_customer_address: draft.customer_address || "",
          p_items: draft.items,
        });
        if (error || !data) {
          await sendText(from, t.help);
          await saveSession("idle", {});
          break;
        }
        const res = data as {
          invoice_number: string;
          total: number;
          public_token: string;
        };
        await saveSession("idle", {});
        await sendText(
          from,
          t.created(res.invoice_number, inr(res.total), `${SITE}/inv/${res.public_token}`)
        );
      } else {
        await saveSession("idle", {});
        await sendText(from, t.cancelled);
      }
      break;
    }
    default: {
      await sendText(from, t.greeting(seller.owner_name));
    }
  }

  return NextResponse.json({ ok: true });
}
