"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

function AuthCallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("code");

    if (!code) {
      router.replace("/");
      return;
    }

    const handleAuth = async () => {
      const { error } =
        await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error("Authentication error:", error.message);
        router.replace("/?auth=error");
        return;
      }

      router.replace("/");
      router.refresh();
    };

    handleAuth();
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-sm text-slate-500">
        Verifying your sign-in...
      </p>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-sm text-slate-500">
            Loading...
          </p>
        </div>
      }
    >
      <AuthCallbackHandler />
    </Suspense>
  );
}