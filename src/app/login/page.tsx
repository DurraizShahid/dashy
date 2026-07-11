"use client";

import { useAuth } from "@/lib/auth/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const { isAuthenticated, isLoading, login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/hive-mind/overview");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="bg-background h-screen flex items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="bg-background h-screen flex items-center justify-center">
      <div className="rounded-[20px] bg-card p-8 shadow-card max-w-md text-center">
        <h1 className="font-poppins text-xl font-semibold text-foreground mb-2">
          Dashy
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          Sign in to access Hive Mind features.
        </p>
        <button
          onClick={login}
          className="inline-flex items-center gap-2 h-10 px-6 rounded-xl text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Sign in with Keycloak
        </button>
      </div>
    </div>
  );
}
