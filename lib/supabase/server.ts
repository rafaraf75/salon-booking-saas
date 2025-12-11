import { cookies } from "next/headers";
import {
  createRouteHandlerClient,
  createServerComponentClient,
} from "@supabase/auth-helpers-nextjs";

import type { Database } from "@/types/supabase";

export const createServerSupabaseClient = () =>
  createServerComponentClient<Database>({ cookies });

export const createRouteSupabaseClient = (cookieStore = cookies) =>
  createRouteHandlerClient<Database>({ cookies: cookieStore });
