/**
 * Login page — redirects to Clerk sign-in.
 */

"use client";

import { SignInButton, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LogIn, Loader2 } from "lucide-react";

export default function LoginPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace("/hive-mind/overview");
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) {
    return (
      <div className="bg-background h-screen overflow-hidden flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="size-6 animate-spin" />
          <p className="text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (isSignedIn) {
    return (
      <div className="bg-background h-screen overflow-hidden flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="size-6 animate-spin" />
          <p className="text-sm">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background h-screen overflow-hidden flex items-center justify-center">
      <div className="w-full max-w-sm px-4">
        <div className="rounded-[20px] bg-card p-8 shadow-card text-center">
          <div className="size-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <LogIn className="size-7 text-primary" />
          </div>
          <h1 className="font-poppins text-xl font-semibold text-foreground mb-2">
            Sign in to Dashy
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            Authenticate with your account to access Hive Mind and protected features.
          </p>
          <SignInButton mode="modal">
            <button className="inline-flex items-center gap-2 h-10 px-6 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors w-full justify-center">
              <LogIn className="size-4" />
              Sign in
            </button>
          </SignInButton>
        </div>
      </div>
    </div>
  );
}
