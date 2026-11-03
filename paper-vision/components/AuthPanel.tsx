"use client";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export default function AuthPanel() {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data } = supabase.auth.onAuthStateChange((_e, s) =>
      setUser(s?.user ?? null),
    );
    return () => data.subscription.unsubscribe();
  }, []);

  if (user)
    return (
      <div className="space-y-1 text-xs">
        <div className="truncate text-slate-500">{user.email}</div>
        <button className="btn w-full" onClick={() => supabase.auth.signOut()}>
          Sign out
        </button>
      </div>
    );

  return (
    <div className="space-y-1">
      <input
        className="input w-full"
        type="email"
        placeholder="Email to sync"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button
        className="btn w-full"
        onClick={async () => {
          const { error } = await supabase.auth.signInWithOtp({
            email,
            options: { emailRedirectTo: window.location.origin },
          });
          setMsg(
            error ? error.message : "Check your email for the sign-in link.",
          );
        }}
      >
        Send sign-in link
      </button>
      {msg && <p className="text-xs text-slate-500">{msg}</p>}
    </div>
  );
}
