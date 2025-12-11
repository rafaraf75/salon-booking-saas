"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

import type { Database } from "@/types/supabase";

export const createSupabaseClient = () => {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return null;
  }
  return createClientComponentClient<Database>();
};
