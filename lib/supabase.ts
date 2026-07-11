import { createClient } from "@supabase/supabase-js";

// The publishable key is safe to expose in the browser (RLS protects the data).
const url =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://qhrucvdwguxvnbuwrvae.supabase.co";
const key =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_MlpFXcvzNtUHPZGn4RH2Ng_K_DTy5p2";

export const supabase = createClient(url, key);

export type Seller = {
  id: string;
  business_name: string;
  owner_name: string;
  phone: string;
  email: string | null;
  upi_id: string | null;
  preferred_language: string | null;
};
