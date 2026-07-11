"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  getStrings,
  getStoredLang,
  storeLang,
  langNames,
  type Lang,
} from "@/lib/i18n";

type Step = "auth" | "profile";

export default function LoginPage() {
  const router = useRouter();
  const [lang, setLang] = useState<Lang>("en");
  const [step, setStep] = useState<Step>("auth");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [businessName, setBusinessName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [phone, setPhone] = useState("");
  const [upiId, setUpiId] = useState("");

  const t = getStrings(lang);

  const pickLang = (l: Lang) => {
    setLang(l);
    storeLang(l);
  };

  const goAfterAuth = async () => {
    const { data } = await supabase.from("sellers").select("id").maybeSingle();
    if (data) {
      router.push("/dashboard");
    } else {
      setStep("profile");
    }
  };

  useEffect(() => {
    setLang(getStoredLang());
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
      preferred_language: lang,
    });
    setBusy(false);
    if (err) {
      setError(err.message);
      return;
    }
    router.push("/dashboard");
  };

  const LangPicker = (
    <div className="mb-6 flex gap-2">
      {(Object.keys(langNames) as Lang[]).map((l) => (
        <button
          key={l}
          onClick={() => pickLang(l)}
          className={`rounded-full px-4 py-1.5 text-sm font-medium ${
            lang === l
              ? "bg-emerald-600 text-white"
              : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
          }`}
        >
          {langNames[l]}
        </button>
      ))}
    </div>
  );

  if (step === "profile") {
    return (
      <main className="mx-auto min-h-screen max-w-md bg-white px-6 py-10 text-zinc-900">
        {LangPicker}
        <h1 className="text-2xl font-bold">
          <span className="text-emerald-600">{t.setupTitle}</span>
        </h1>
        <p className="mt-1 text-sm text-zinc-500">{t.setupSub}</p>
        <div className="mt-6 space-y-3">
          <input
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder={t.bizName}
            className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none"
          />
          <input
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
            placeholder={t.yourName}
            className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none"
          />
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={t.waNumber}
            inputMode="tel"
            className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none"
          />
          <input
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            placeholder={t.upiId}
            className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none"
          />
          <p className="text-xs text-zinc-400">{t.upiHint}</p>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            onClick={submitProfile}
            disabled={
              busy || !businessName.trim() || !ownerName.trim() || !phone.trim()
            }
            className="w-full rounded-full bg-emerald-600 py-3 font-semibold text-white hover:bg-emerald-700 disabled:bg-zinc-300"
          >
            {busy ? t.saving : t.finishSetup}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-md bg-white px-6 py-10 text-zinc-900">
      {LangPicker}
      <h1 className="text-2xl font-bold">
        GetWe<span className="text-emerald-600">Chaat</span> {t.forVendors}
      </h1>
      <p className="mt-1 text-sm text-zinc-500">
        {mode === "signin" ? t.welcomeBack : t.createFree}
      </p>

      <div className="mt-6 flex rounded-full bg-zinc-100 p-1 text-sm font-medium">
        <button
          onClick={() => setMode("signin")}
          className={`flex-1 rounded-full py-2 ${mode === "signin" ? "bg-white shadow" : "text-zinc-500"}`}
        >
          {t.signIn}
        </button>
        <button
          onClick={() => setMode("signup")}
          className={`flex-1 rounded-full py-2 ${mode === "signup" ? "bg-white shadow" : "text-zinc-500"}`}
        >
          {t.newAccount}
        </button>
      </div>

      <div className="mt-6 space-y-3">
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t.email}
          type="email"
          className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none"
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t.password}
          type="password"
          className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          onClick={submitAuth}
          disabled={busy || !email || password.length < 6}
          className="w-full rounded-full bg-emerald-600 py-3 font-semibold text-white hover:bg-emerald-700 disabled:bg-zinc-300"
        >
          {busy ? t.pleaseWait : mode === "signin" ? t.signIn : t.createAccount}
        </button>
      </div>
    </main>
  );
}
