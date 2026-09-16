import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LogOut, MapPin, Package, Truck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { User, Session } from "@supabase/supabase-js";

import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { PasswordRecovery, PasswordResetRequest } from "@/components/site/PasswordRecovery";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { brl, useStore } from "@/lib/store";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/conta")({
  head: () => ({
    meta: [
      { title: "Área do Cliente · USE LOMA" },
      { name: "description", content: "Acesse sua conta USE LOMA para acompanhar pedidos, atualizar endereço, escolher entrega ou retirada." },
      { property: "og:title", content: "Área do Cliente · USE LOMA" },
      { property: "og:description", content: "Acompanhe seus pedidos e atualize entrega e endereço com segurança." },
    ],
  }),
  component: ContaPage,
});

export type DbOrder = {
  id: string;
  customer_name: string;
  phone: string;
  address: string;
  payment_method: string;
  product_id: string | null;
  product_name: string;
  purchase_type: string;
  group_code: string;
  total: number;
  status: string;
  source: string;
  created_at: string;
  destination_postal_code: string;
  delivery_mode: string;
  shipping_service_id: string;
  shipping_method: string;
  shipping_cost: number;
  shipping_delivery_days: number | null;
  subtotal: number;
  user_id: string | null;
};

function ContaPage() {
  const resetMode = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("reset") : null;
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-between">
        <Header />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="mx-auto max-w-4xl px-4 py-14">
        {resetMode === "1" ? (
          <PasswordRecovery />
        ) : resetMode === "request" ? (
          <PasswordResetRequest />
        ) : session?.user ? (
          <Painel user={session.user} />
        ) : (
          <Auth />
        )}
      </section>
      <Footer />
    </div>
  );
}

function Auth() {
  const navigate = useNavigate();
  const { settings } = useStore();
  const [tab, setTab] = useState<"login" | "cadastro">("login");
  const [loading, setLoading] = useState(false);
  const [login, setLogin] = useState({ email: "", password: "" });
  const [signup, setSignup] = useState({ name: "", email: "", phone: "", address: "", password: "" });

  const submitLogin = async () => {
    const email = login.email.trim().toLowerCase();
    if (email === "admin@useloma.com" && login.password === settings.adminPassword) {
      sessionStorage.setItem("useloma-admin-session", "1");
      toast.success("Acesso administrativo autorizado ♡");
      navigate({ to: "/admin" });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: login.password,
    });
    setLoading(false);

    if (error) {
      toast.error(error.message || "Não foi possível entrar. Verifique seus dados.");
    } else {
      toast.success("Bem-vinda de volta ♡");
    }
  };

  const submitSignup = async () => {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: signup.email.trim().toLowerCase(),
      password: signup.password,
      options: {
        data: {
          full_name: signup.name.trim(),
          phone: signup.phone.trim(),
          address: signup.address.trim(),
        },
      },
    });

    if (error) {
      setLoading(false);
      toast.error(error.message || "Erro ao criar conta.");
      return;
    }

    if (data.user) {
      const { error: profileError } = await supabase.from("profiles").insert({
        id: data.user.id,
        full_name: signup.name.trim(),
        phone: signup.phone.trim(),
        address: signup.address.trim(),
      });
      if (profileError) {
        console.error("Erro ao criar perfil:", profileError);
      }
    }

    setLoading(false);
    toast.success("Conta criada! Seja bem-vinda ♡");
  };

  return (
    <div className="mx-auto max-w-md">
      <div className="text-center">
        <p className="text-xs tracking-[0.3em] text-muted-foreground uppercase">Minha conta</p>
        <h1 className="mt-2 font-display text-4xl">Área do Cliente</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Acesse com sua conta para gerenciar seus pedidos e dados com segurança.
        </p>
      </div>
      <div className="mt-8 flex gap-2 rounded-full bg-card p-1">
        {(["login", "cadastro"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex-1 rounded-full px-4 py-2 text-sm transition-colors ${
              tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground"
            }`}
          >
            {t === "login" ? "Entrar" : "Criar conta"}
          </button>
        ))}
      </div>
      {tab === "login" ? (
        <form
          className="animate-fade-up mt-6 space-y-4 rounded-2xl bg-card p-6 shadow-soft"
          onSubmit={(e) => {
            e.preventDefault();
            submitLogin();
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="l-email">E-mail</Label>
            <Input
              id="l-email"
              type="email"
              required
              value={login.email}
              onChange={(e) => setLogin({ ...login, email: e.target.value })}
              placeholder="seu@email.com"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="l-senha">Senha</Label>
            <Input
              id="l-senha"
              type="password"
              required
              value={login.password}
              onChange={(e) => setLogin({ ...login, password: e.target.value })}
            />
          </div>
          <div className="flex justify-end">
            <a href="/conta?reset=request" className="text-xs text-muted-foreground hover:text-foreground hover:underline">
              Esqueci minha senha
            </a>
          </div>
          <Button type="submit" className="w-full rounded-xl" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Entrar"}
          </Button>
          <p className="text-center text-[11px] text-muted-foreground">
            Conta administrativa: use o e-mail <strong>admin@useloma.com</strong> e a senha definida no painel.
          </p>
        </form>
      ) : (
        <form
          className="animate-fade-up mt-6 space-y-4 rounded-2xl bg-card p-6 shadow-soft"
          onSubmit={(e) => {
            e.preventDefault();
            submitSignup();
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="c-nome">Nome completo</Label>
            <Input
              id="c-nome"
              required
              value={signup.name}
              onChange={(e) => setSignup({ ...signup, name: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="c-email">E-mail</Label>
            <Input
              id="c-email"
              type="email"
              required
              value={signup.email}
              onChange={(e) => setSignup({ ...signup, email: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="c-tel">Telefone</Label>
            <Input
              id="c-tel"
              required
              value={signup.phone}
              onChange={(e) => setSignup({ ...signup, phone: e.target.value })}
              placeholder="(11) 99999-9999"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="c-end">Endereço de entrega</Label>
            <Textarea
              id="c-end"
              rows={2}
              required
              value={signup.address}
              onChange={(e) => setSignup({ ...signup, address: e.target.value })}
              placeholder="Rua, número, bairro, cidade - UF"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="c-senha">Senha</Label>
            <Input
              id="c-senha"
              type="password"
              required
              minLength={6}
              value={signup.password}
              onChange={(e) => setSignup({ ...signup, password: e.target.value })}
            />
          </div>
          <Button type="submit" className="w-full rounded-xl" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Criar conta"}
          </Button>
        </form>
      )}
    </div>
  );
}

function Painel({ user }: { user: User }) {
  const [address, setAddress] = useState(user.user_metadata?.address ?? "");
  const [orders, setOrders] = useState<DbOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [updatingAddress, setUpdatingAddress] = useState(false);

  const userName = user.user_metadata?.full_name || user.email?.split("@")[0] || "Cliente";

  const fetchProfile = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("address")
      .eq("id", user.id)
      .maybeSingle();
    if (!error && data?.address) {
      setAddress(data.address);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user.id]);

  const fetchOrders = async () => {
    setLoadingOrders(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao carregar pedidos:", error);
    } else if (data) {
      setOrders(data as DbOrder[]);
    }
    setLoadingOrders(false);
  };

  useEffect(() => {
    fetchOrders();
  }, [user.id]);

  const handleUpdateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingAddress(true);
    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      address: address.trim(),
    });
    if (!error) {
      await supabase.auth.updateUser({ data: { address: address.trim() } });
    }
    setUpdatingAddress(false);

    if (error) {
      toast.error("Erro ao atualizar endereço.");
    } else {
      toast.success("Endereço atualizado com sucesso ♡");
    }
  };

  const handleLogout = async () => {
    sessionStorage.removeItem("useloma-admin-session");
    await supabase.auth.signOut();
    toast.success("Sessão encerrada.");
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs tracking-[0.3em] text-muted-foreground uppercase">Área do Cliente</p>
          <h1 className="mt-2 font-display text-4xl">Olá, {userName.split(" ")[0]} ♡</h1>
          <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
        </div>
        <Button variant="outline" className="rounded-full" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" /> Sair
        </Button>
      </div>

      <form className="space-y-3 rounded-2xl bg-card p-6 shadow-soft" onSubmit={handleUpdateAddress}>
        <h2 className="flex items-center gap-2 font-display text-2xl">
          <MapPin className="h-5 w-5 text-gold" /> Meu endereço de entrega
        </h2>
        <Textarea
          rows={2}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Digite seu endereço completo"
          required
        />
        <Button type="submit" className="rounded-xl" disabled={updatingAddress}>
          {updatingAddress ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar endereço"}
        </Button>
      </form>

      <div className="space-y-4">
        <h2 className="flex items-center gap-2 font-display text-2xl">
          <Package className="h-5 w-5 text-gold" /> Meus pedidos
        </h2>
        {loadingOrders ? (
          <div className="flex items-center justify-center py-8 rounded-2xl bg-card shadow-soft">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : orders.length === 0 ? (
          <p className="rounded-2xl bg-card p-6 text-sm text-muted-foreground shadow-soft">
            Você ainda não tem pedidos cadastrados. Ao realizar uma compra logada, seus pedidos aparecerão aqui vinculados com segurança ao seu usuário.
          </p>
        ) : (
          orders.map((order) => (
            <OrderCard key={order.id} order={order} userId={user.id} onRefresh={fetchOrders} />
          ))
        )}
      </div>
    </div>
  );
}

function OrderCard({
  order,
  userId,
  onRefresh,
}: {
  order: DbOrder;
  userId: string;
  onRefresh: () => void;
}) {
  const [address, setAddress] = useState(order.address);
  const [deliveryMode, setDeliveryMode] = useState(order.delivery_mode || "arrange");
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase
      .from("orders")
      .update({
        address: address.trim(),
        delivery_mode: deliveryMode,
      })
      .eq("id", order.id)
      .eq("user_id", userId);

    setSaving(false);
    if (error) {
      toast.error("Erro ao atualizar pedido.");
    } else {
      toast.success("Pedido atualizado ♡");
      onRefresh();
    }
  };

  return (
    <form className="space-y-4 rounded-2xl bg-card p-6 shadow-soft" onSubmit={handleSave}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-display text-xl">{order.product_name}</p>
          <p className="text-xs text-muted-foreground">
            Pedido #{order.id} · {order.purchase_type === "group" ? "Grupo" : "Individual"} · {brl(Number(order.total))}
          </p>
        </div>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          {order.status}
        </span>
      </div>

      <div className="space-y-1.5">
        <Label className="flex items-center gap-2">
          <Truck className="h-4 w-4" /> Forma de recebimento
        </Label>
        <div className="flex gap-2">
          {[
            { id: "arrange", label: "Envio / Entrega" },
            { id: "pickup", label: "Retirada" },
          ].map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => setDeliveryMode(d.id)}
              className={`flex-1 rounded-xl border px-3 py-2 text-sm transition-colors ${
                deliveryMode === d.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {deliveryMode === "arrange" && (
        <div className="space-y-1.5">
          <Label htmlFor={`end-${order.id}`}>Endereço deste pedido</Label>
          <Textarea
            id={`end-${order.id}`}
            rows={2}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
        </div>
      )}

      <Button type="submit" className="rounded-xl" disabled={saving}>
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar alterações"}
      </Button>
    </form>
  );
}
