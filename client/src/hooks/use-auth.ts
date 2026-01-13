import { useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useLocation } from "wouter";
import { z } from "zod";

type LoginInput = z.infer<typeof api.auth.login.input>;

export function useLogin() {
  const [, setLocation] = useLocation();
  
  return useMutation({
    mutationFn: async (credentials: LoginInput) => {
      const res = await fetch(api.auth.login.path, {
        method: api.auth.login.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 401) {
          const error = api.auth.login.responses[401].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Login failed");
      }

      return api.auth.login.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      setLocation("/dashboard");
    },
  });
}

// Simple logout just by client side redirect for this app structure
// Ideally backend would have a logout endpoint to clear cookies
export function useLogout() {
  const [, setLocation] = useLocation();
  return () => {
    // In a real app we'd call an API. Here we just redirect to login
    // which effectively forces re-login since we can't clear httpOnly cookies easily from JS
    // but the backend session handling would normally handle expiration.
    // For this simple app, we just redirect.
    setLocation("/");
    window.location.reload(); // Force reload to clear client state
  };
}
