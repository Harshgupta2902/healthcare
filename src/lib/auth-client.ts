"use client"
import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
   baseURL: typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL,
  fetchOptions: {
      onRequest: (ctx) => {
        // Dynamically get the token on each request
        const token = typeof window !== 'undefined' ? localStorage.getItem("bearer_token") : "";
        if (token) {
          ctx.headers.set("Authorization", `Bearer ${token}`);
        }
      },
      onSuccess: (ctx) => {
          const authToken = ctx.response.headers.get("set-auth-token")
          if(authToken){
            localStorage.setItem("bearer_token", authToken);
          }
      }
  }
});

export const { useSession } = authClient;