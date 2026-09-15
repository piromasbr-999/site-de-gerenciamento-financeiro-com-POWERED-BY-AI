"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import Onboarding from "@/components/Onboarding";
import Dashboard from "@/components/Dashboard";

export default function DashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const load = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      setSession(sessionData.session);

      if (sessionData.session?.user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", sessionData.session.user.id)
          .single();
        setProfile(data ?? null);
      } else {
        setProfile(null);
      }
      setLoading(false);
    };

    load();

    const { data: authSubscription } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
        if (newSession?.user) {
          supabase
            .from("profiles")
            .select("*")
            .eq("id", newSession.user.id)
            .single()
            .then(({ data }) => setProfile(data ?? null));
        } else {
          setProfile(null);
        }
      }
    );

    return () => authSubscription?.subscription.unsubscribe();
  }, [refreshKey]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#070b16]">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-white/10 border-t-emerald-400" />
      </div>
    );
  }

  if (session?.user && profile && !profile.onboarding_completed) {
    return (
      <Onboarding
        defaultEmail={profile.email}
        onComplete={() => setRefreshKey((key) => key + 1)}
      />
    );
  }

  if (session?.user && profile && profile.onboarding_completed && !profile.has_access) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#070b16] px-6">
        <div className="max-w-md rounded-3xl border border-white/10 bg-zinc-900/50 p-8 text-center backdrop-blur-xl">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-amber-400/10 text-amber-300">
            <ShieldCheck size={26} />
          </span>
          <h1 className="mt-5 text-xl font-black text-white">Acesso pendente</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            Seu perfil foi criado, mas esta conta ainda não tem acesso liberado. Conclua o
            pagamento único de R$ 27,00 para desbloquear seu painel.
          </p>
          <a
            href="/#checkout"
            className="mt-6 inline-flex items-center rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-500 px-6 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-500/30"
          >
            Ir para o pagamento
          </a>
        </div>
      </div>
    );
  }

  if (!session) {
    const savedEmail =
      typeof window !== "undefined"
        ? localStorage.getItem("financeflow_email") || ""
        : "";
    return (
      <Onboarding
        defaultEmail={savedEmail}
        onComplete={() => setRefreshKey((key) => key + 1)}
      />
    );
  }

  if (!profile?.onboarding_completed) {
    return (
      <Onboarding
        defaultEmail={session.user.email || ""}
        onComplete={() => setRefreshKey((key) => key + 1)}
      />
    );
  }

  return (
    <Dashboard
      user={session.user}
      profile={profile}
      onLogout={handleLogout}
    />
  );
}