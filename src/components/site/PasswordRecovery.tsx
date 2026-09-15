import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export function PasswordResetRequest() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!supabase) return;

    setSending(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/conta?reset=1`,
    });
    setSending(false);

    if (error) {
      toast.error(error.message || "Não foi possível enviar o e-mail de recuperação.");
      return;
    }

    setSent(true);
  };

  if (!isSupabaseConfigured) {
    return (
      <div className="mx-auto max-w-md rounded-2xl bg-card p-6 text-center shadow-soft">
        <h1 className="font-display text-3xl">Recuperação indisponível</h1>
        <p className="mt-3 text-sm text-muted-foreground">O Supabase Auth ainda não está configurado neste ambiente.</p>
        <a href="/conta" className="mt-6 inline-flex items-center text-sm text-primary hover:underline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para o login
        </a>
      </div>
    );
  }

  if (sent) {
    return (
      <div className="mx-auto max-w-md rounded-2xl bg-card p-6 text-center shadow-soft">
        <LockKeyhole className="mx-auto h-8 w-8 text-gold" />
        <h1 className="mt-4 font-display text-3xl">Verifique seu e-mail</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Se houver uma conta associada a este endereço, enviaremos um link para criar uma nova senha.
        </p>
        <a href="/conta" className="mt-6 inline-flex items-center text-sm text-primary hover:underline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para o login
        </a>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="text-center">
        <LockKeyhole className="mx-auto h-8 w-8 text-gold" />
        <p className="mt-4 text-xs tracking-[0.3em] text-muted-foreground uppercase">Recuperação de acesso</p>
        <h1 className="mt-2 font-display text-4xl">Esqueci minha senha</h1>
        <p className="mt-2 text-sm text-muted-foreground">Informe seu e-mail e enviaremos um link seguro para redefinir sua senha.</p>
      </div>
      <form className="mt-8 space-y-4 rounded-2xl bg-card p-6 shadow-soft" onSubmit={submit}>
        <div className="space-y-1.5">
          <Label htmlFor="recovery-email">E-mail</Label>
          <Input id="recovery-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" autoComplete="email" />
        </div>
        <Button type="submit" className="w-full rounded-xl" disabled={sending}>
          {sending ? "Enviando…" : "Enviar link de recuperação"}
        </Button>
        <a href="/conta" className="flex items-center justify-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para o login
        </a>
      </form>
    </div>
  );
}

export function PasswordRecovery() {
  const [checking, setChecking] = useState(true);
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setChecking(false);
      return;
    }

    let active = true;
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      if (event === "PASSWORD_RECOVERY" && session) {
        setReady(true);
        setChecking(false);
      }
    });

    supabase.auth.getSession().then(({ data: sessionData }) => {
      if (!active) return;
      setReady(Boolean(sessionData.session));
      setChecking(false);
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!supabase) return;
    if (password.length < 8) {
      toast.error("A nova senha deve ter pelo menos 8 caracteres.");
      return;
    }
    if (password !== confirmation) {
      toast.error("As senhas não coincidem.");
      return;
    }

    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSaving(false);

    if (error) {
      toast.error(error.message || "Não foi possível atualizar a senha.");
      return;
    }

    toast.success("Senha atualizada com segurança ♡");
    await supabase.auth.signOut();
    window.location.assign("/conta");
  };

  if (!isSupabaseConfigured) {
    return (
      <div className="mx-auto max-w-md rounded-2xl bg-card p-6 text-center shadow-soft">
        <h1 className="font-display text-3xl">Recuperação indisponível</h1>
        <p className="mt-3 text-sm text-muted-foreground">O Supabase Auth ainda não está configurado neste ambiente.</p>
        <a href="/conta" className="mt-6 inline-flex items-center text-sm text-primary hover:underline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para o login
        </a>
      </div>
    );
  }

  if (checking) return <p className="text-center text-sm text-muted-foreground">Validando o link de recuperação…</p>;

  if (!ready) {
    return (
      <div className="mx-auto max-w-md rounded-2xl bg-card p-6 text-center shadow-soft">
        <h1 className="font-display text-3xl">Link inválido ou expirado</h1>
        <p className="mt-3 text-sm text-muted-foreground">Solicite uma nova recuperação de senha para continuar.</p>
        <a href="/conta?reset=request" className="mt-6 inline-flex items-center text-sm text-primary hover:underline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Solicitar novamente
        </a>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="text-center">
        <LockKeyhole className="mx-auto h-8 w-8 text-gold" />
        <p className="mt-4 text-xs tracking-[0.3em] text-muted-foreground uppercase">Segurança</p>
        <h1 className="mt-2 font-display text-4xl">Criar nova senha</h1>
        <p className="mt-2 text-sm text-muted-foreground">Escolha uma senha nova para proteger sua conta.</p>
      </div>
      <form className="mt-8 space-y-4 rounded-2xl bg-card p-6 shadow-soft" onSubmit={submit}>
        <div className="space-y-1.5">
          <Label htmlFor="new-password">Nova senha</Label>
          <Input id="new-password" type="password" minLength={8} required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="confirm-password">Confirmar nova senha</Label>
          <Input id="confirm-password" type="password" minLength={8} required value={confirmation} onChange={(e) => setConfirmation(e.target.value)} autoComplete="new-password" />
        </div>
        <Button type="submit" className="w-full rounded-xl" disabled={saving}>
          {saving ? "Salvando…" : "Atualizar senha"}
        </Button>
      </form>
    </div>
  );
}
