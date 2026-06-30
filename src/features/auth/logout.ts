"use client";

import { createClient } from "@/lib/supabase/client";
import { signOut } from "@/features/profile/actions";

/** Signs the user out and always navigates to the home page. */
export async function logoutAndRedirectHome() {
  const supabase = createClient();

  try {
    const { error } = await supabase.auth.signOut({ scope: "global" });
    if (error) console.error(error);
  } catch (error) {
    console.error(error);
  }

  try {
    await signOut();
  } catch {
    /* server action may still complete */
  }

  window.location.assign("/");
}
