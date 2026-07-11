// Sends the first WhatsApp message to a vendor right after signup,
// so the vendor never has to save our number — they just reply.
//
// WhatsApp rule: a business may only START a conversation with a
// pre-approved template message. We try our own "welcome_vendor"
// template first ("Hi! Welcome to GetWeChaat...") and fall back to
// Meta's built-in "hello_world" while ours is still in review.
// Once the vendor replies, the normal bot (app/api/whatsapp) takes over.
// TODO before v1.0: add te/ta/hi language versions of welcome_vendor.

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://qhrucvdwguxvnbuwrvae.supabase.co";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const db = createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY!, {
    auth: { persistSession: false },
  });

  // Identify the logged-in vendor from their Supabase session token
  const { data: userData, error: userErr } = await db.auth.getUser(token);
  if (userErr || !userData.user)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data: seller } = await db
    .from("sellers")
    .select("phone")
    .eq("auth_user_id", userData.user.id)
    .maybeSingle();
  if (!seller?.phone)
    return NextResponse.json({ error: "no seller profile" }, { status: 404 });

  // Default to India country code when the vendor typed a bare 10-digit number
  const digits = seller.phone.replace(/\D/g, "");
  const to = digits.length === 10 ? `91${digits}` : digits;

  const sendTemplate = async (name: string, langCode: string) => {
    const res = await fetch(
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
          type: "template",
          template: { name, language: { code: langCode } },
        }),
      }
    );
    const body = await res.json().catch(() => ({}));
    return { ok: res.ok, body };
  };

  // Our branded welcome first; hello_world as fallback while in review
  let result = await sendTemplate("welcome_vendor", "en");
  if (!result.ok) result = await sendTemplate("hello_world", "en_US");

  if (!result.ok) {
    console.error("welcome send failed", result.body);
    return NextResponse.json(
      { error: "send failed", detail: result.body },
      { status: 502 }
    );
  }
  return NextResponse.json({ ok: true });
}
