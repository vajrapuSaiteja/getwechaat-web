"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Step = "auth" | "profile";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("auth");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Profile fields
  const [businessName, setBusinessName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [phone, setPhone] = useState("");
  const [upiId, setUpiId] = useState("");

  const goAfterAuth = async () => {
    const { data } = await supabase
      .from("sellers")
      .select("id")
      .maybeSingle();
    if (data) {
      router.push("/dashboard");
    } else {
      setStep("profile");
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) goAfterAuth();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submitAuth = async () => {
    setBusy(true);
    setError("");
    const fn =
      mode === "signup"
        ? supabase.auth.signUp({ email, password })
        : supabase.auth.signInWithPassword({ email, password });
    const { error: err } = await fn;
    setBusy(false);
    if (err) {
      setError(err.message);
      return;
    }
    await goAfterAuth();
  };

  const submitProfile = async () => {
    setBusy(true);
    setError("");
    const { data: userData } = await supabase.auth.getUser();
    const { error: err } = await supabase.from("sellers").insert({
      auth_user_id: userData.user?.id,
      business_name: businessName.trim(),
      owner_name: ownerName.trim(),
      phone: phone.trim(),
      email,
      upi_id: upiId.trim() || null,
    });
    setBusy(false);
    if (err) {
      setError(err.message);
      return;
    }
    router.push("/dashboard");
  };

  if (step === "profile") {
    return (
      <main className="mx-auto min-h-screen max-w-md bg-white px-6 py-10 text-zinc-900">
        <h1 className="text-2xl font-bold">
          Set up your <span className="text-emerald-600">business</span>
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Shown on every invoice you create. You only do this once.
        </p>
        <div className="mt-6 space-y-3">
          <input
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="Business name (e.g. Sri Lakshmi Jewels)"
            className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none"
          />
          <input
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
            placeholder="Your name"
            className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none"
          />
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Business WhatsApp number"
            inputMode="tel"
            className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none"
          />
          <input
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            placeholder="UPI ID for payments (e.g. name@okhdfcbank)"
            className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none"
          />
          <p className="text-xs text-zinc-400">
            Your UPI ID becomes a scan-to-pay QR code on every invoice.
          </p>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            onClick={submitProfile}
            disabled={busy || !businessName.trim() || !ownerName.trim() || !phone.trim()}
            className="w-full rounded-full bg-emerald-600 py-3 font-semibold text-white hover:bg-emerald-700 disabled:bg-zinc-300"
          >
            {busy ? "Saving..." : "Finish setup"}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-md bg-white px-6 py-10 text-zinc-900">
      <h1 className="text-2xl font-bold">
        GetWe<span className="text-emerald-600">Chaat</span> for vendors
      </h1>
      <p className="mt-1 text-sm text-zinc-500">
        {mode === "signin"
          ? "Welcome back. Sign in to your dashboard."
          : "Create your free vendor account."}
      </p>

      <div className="mt-6 flex rounded-full bg-zinc-100 p-1 text-sm font-medium">
        <button
          onClick={() => setMode("signin")}
          className={`flex-1 rounded-full py-2 ${mode === "signin" ? "bg-white shadow" : "text-zinc-500"}`}
        >
          Sign in
        </button>
        <button
          onClick={() => setMode("signup")}
          className={`flex-1 rounded-full py-2 ${mode === "signup" ? "bg-white shadow" : "text-zinc-500"}`}
        >
          New account
        </button>
      </div>

      <div className="mt-6 space-y-3">
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          type="email"
          className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none"
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password (min 6 characters)"
          type="password"
          className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          onClick={submitAuth}
          disabled={busy || !email || password.length < 6}
          className="w-full rounded-full bg-emerald-600 py-3 font-semibold text-white hover:bg-emerald-700 disabled:bg-zinc-300"
        >
          {busy
            ? "Please wait..."
            : mode === "signin"
              ? "Sign in"
              : "Create account"}
        </button>
      </div>
    </main>
  );
}
