"use client"
import { createAuthClient } from "better-auth/react"
import { inferAdditionalFields } from "better-auth/client/plugins"
import type { auth } from "./auth"

export const authClient = createAuthClient({
   baseURL: typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL,
  plugins: [inferAdditionalFields<typeof auth>()],
  fetchOptions: {
      onRequest: (ctx) => {
        const token = typeof window !== 'undefined' ? localStorage.getItem("bearer_token") : "";
        if (token) {
          ctx.headers.set("Authorization", `Bearer ${token}`);
        }
      },
          onSuccess: (ctx) => {
              const authToken = ctx.response.headers.get("set-auth-token") || 
                                ctx.response.headers.get("Authorization")?.split(" ")[1] ||
                                (ctx.data as any)?.token;
              if(authToken){
                localStorage.setItem("bearer_token", authToken);
              }
          }
  }
});

export const { useSession } = authClient;