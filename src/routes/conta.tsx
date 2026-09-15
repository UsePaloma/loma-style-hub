import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { LogOut, MapPin, Package, Ruler, Truck } from "lucide-react";
import { toast } from "sonner";

import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { brl, SIZES, useStore, type Delivery, type Order } from "@/lib/store";

export const Route = createFileRoute("/conta")({
  head: () => ({
    meta: [
      { title: "Área do Cliente · USE LOMA" },
      { name: "description", content: "Acesse sua conta USE LOMA para acompanhar pedidos, atualizar endereço, escolher entrega ou retirada e o tamanho da peça." },
      { property: "og:title", content: "Área do Cliente · USE LOMA" },
      { property: "og:description", content: "Acompanhe seus pedidos e atualize entrega, endereço e tamanho." },
    ],
  }),
  component: ContaPage,
});

function ContaPage() {
  const { currentCustomer } = useStore();
  return <div className="min-h-screen bg-background"><Header /><section className="mx-auto max-w-4xl px-4 py-14">{currentCustomer ? <Painel /> : <Auth />}</section><Footer /></div>;
}

function Auth() {
  const navigate = useNavigate();
  const { settings, loginCustomer, registerCustomer } = useStore();
  const [tab, setTab] = useState<"login" | "cadastro">("login");
  const [login, setLogin] = useState({ email: "", password: "" });
  const [signup, setSignup] = useState({ name: "", email: "", phone: "", address: "", password: "" });

  const submitLogin = () => {
    const email = login.email.trim().toLowerCase();
    if (email === "admin@useloma.com" && login.password === settings.adminPassword) {
      sessionStorage.setItem("useloma-admin-session", "1");
      toast.success("Acesso administrativo autorizado ♡");
      navigate({ to: "/admin" });
      return;
    }
    const res = loginCustomer(email, login.password);
    if (res.ok) toast.success("Bem-vinda de volta ♡");
    else toast.error(res.error ?? "Não foi possível entrar.");
  };

  return <div className="mx-auto max-w-md">
    <div className="text-center"><p className="text-xs tracking-[0.3em] text-muted-foreground uppercase">Minha conta</p><h1 className="mt-2 font-display text-4xl">Área do Cliente</h1><p className="mt-2 text-sm text-muted-foreground">O mesmo login atende clientes e administração. Cada perfil recebe somente as funções permitidas.</p></div>
    <div className="mt-8 flex gap-2 rounded-full bg-card p-1">{(["login", "cadastro"] as const).map((t) => <button key={t} type="button" onClick={() => setTab(t)} className={`flex-1 rounded-full px-4 py-2 text-sm transition-colors ${tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>{t === "login" ? "Entrar" : "Criar conta"}</button>)}</div>
    {tab === "login" ? <form className="animate-fade-up mt-6 space-y-4 rounded-2xl bg-card p-6 shadow-soft" onSubmit={(e) => { e.preventDefault(); submitLogin(); }}>
      <div className="space-y-1.5"><Label htmlFor="l-email">E-mail</Label><Input id="l-email" type="email" required value={login.email} onChange={(e) => setLogin({ ...login, email: e.target.value })} placeholder="seu@email.com" /></div>
      <div className="space-y-1.5"><Label htmlFor="l-senha">Senha</Label><Input id="l-senha" type="password" required value={login.password} onChange={(e) => setLogin({ ...login, password: e.target.value })} /></div>
      <Button type="submit" className="w-full rounded-xl">Entrar</Button>
      <p className="text-center text-[11px] text-muted-foreground">Conta administrativa: use o e-mail <strong>admin@useloma.com</strong> e a senha definida no painel.</p>
    </form> : <form className="animate-fade-up mt-6 space-y-4 rounded-2xl bg-card p-6 shadow-soft" onSubmit={(e) => { e.preventDefault(); const res = registerCustomer(signup); if (res.ok) toast.success("Conta criada! Seja bem-vinda ♡"); else toast.error(res.error ?? "Não foi possível criar a conta."); }}>
      <div className="space-y-1.5"><Label htmlFor="c-nome">Nome completo</Label><Input id="c-nome" required value={signup.name} onChange={(e) => setSignup({ ...signup, name: e.target.value })} /></div>
      <div className="space-y-1.5"><Label htmlFor="c-email">E-mail</Label><Input id="c-email" type="email" required value={signup.email} onChange={(e) => setSignup({ ...signup, email: e.target.value })} /></div>
      <div className="space-y-1.5"><Label htmlFor="c-tel">Telefone (o mesmo usado nos pedidos)</Label><Input id="c-tel" required value={signup.phone} onChange={(e) => setSignup({ ...signup, phone: e.target.value })} /></div>
      <div className="space-y-1.5"><Label htmlFor="c-end">Endereço de entrega</Label><Textarea id="c-end" rows={2} required value={signup.address} onChange={(e) => setSignup({ ...signup, address: e.target.value })} /></div>
      <div className="space-y-1.5"><Label htmlFor="c-senha">Senha</Label><Input id="c-senha" type="password" required minLength={4} value={signup.password} onChange={(e) => setSignup({ ...signup, password: e.target.value })} /></div>
      <Button type="submit" className="w-full rounded-xl">Criar conta</Button>
    </form>}
  </div>;
}

function Painel() {
  const { currentCustomer, myOrders, logoutCustomer, updateCustomer } = useStore();
  const customer = currentCustomer!;
  const [address, setAddress] = useState(customer.address);
  return <div className="space-y-8">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs tracking-[0.3em] text-muted-foreground uppercase">Área do Cliente</p><h1 className="mt-2 font-display text-4xl">Olá, {customer.name.split(" ")[0]} ♡</h1><p className="mt-1 text-sm text-muted-foreground">{customer.email}</p></div><Button variant="outline" className="rounded-full" onClick={() => { sessionStorage.removeItem("useloma-admin-session"); logoutCustomer(); }}><LogOut className="mr-2 h-4 w-4" /> Sair</Button></div>
    <form className="space-y-3 rounded-2xl bg-card p-6 shadow-soft" onSubmit={(e) => { e.preventDefault(); updateCustomer({ address: address.trim() }); toast.success("Endereço atualizado ♡"); }}><h2 className="flex items-center gap-2 font-display text-2xl"><MapPin className="h-5 w-5 text-gold" /> Meu endereço de entrega</h2><Textarea rows={2} value={address} onChange={(e) => setAddress(e.target.value)} required /><Button type="submit" className="rounded-xl">Salvar endereço</Button></form>
    <div className="space-y-4"><h2 className="flex items-center gap-2 font-display text-2xl"><Package className="h-5 w-5 text-gold" /> Meus pedidos</h2>{myOrders.length === 0 ? <p className="rounded-2xl bg-card p-6 text-sm text-muted-foreground shadow-soft">Você ainda não tem pedidos por aqui. Ao fazer um pedido pelo site logada, ele aparece nesta lista.</p> : myOrders.map((order) => <OrderCard key={order.id} order={order} />)}</div>
  </div>;
}

function OrderCard({ order }: { order: Order }) {
  const { updateMyOrder, currentCustomer } = useStore();
  const [address, setAddress] = useState(order.address);
  const [delivery, setDelivery] = useState<Delivery>(order.delivery ?? "Entrega");
  const [size, setSize] = useState(order.size ?? "");
  return <form className="space-y-4 rounded-2xl bg-card p-6 shadow-soft" onSubmit={(e) => { e.preventDefault(); const ok = updateMyOrder(order.id, { address: delivery === "Retirada" ? currentCustomer?.address ?? address : address, delivery, size }); toast[ok ? "success" : "error"](ok ? "Pedido atualizado ♡" : "Não foi possível atualizar este pedido."); }}>
    <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-display text-xl">{order.productName}</p><p className="text-xs text-muted-foreground">Pedido #{order.id} · {order.type} · {brl(order.total)}</p></div><span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">{order.status}</span></div>
    <div className="space-y-1.5"><Label className="flex items-center gap-2"><Truck className="h-4 w-4" /> Forma de recebimento</Label><div className="flex gap-2">{(["Entrega", "Retirada"] as Delivery[]).map((d) => <button key={d} type="button" onClick={() => setDelivery(d)} className={`flex-1 rounded-xl border px-3 py-2 text-sm transition-colors ${delivery === d ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>{d === "Entrega" ? "Envio / Entrega" : "Retirada"}</button>)}</div></div>
    {delivery === "Entrega" && <div className="space-y-1.5"><Label htmlFor={`end-${order.id}`}>Endereço deste pedido</Label><Textarea id={`end-${order.id}`} rows={2} value={address} onChange={(e) => setAddress(e.target.value)} required /></div>}
    <div className="space-y-1.5"><Label className="flex items-center gap-2"><Ruler className="h-4 w-4" /> Tamanho da peça</Label><div className="flex flex-wrap gap-2">{SIZES.map((s) => <button key={s} type="button" onClick={() => setSize(s)} className={`rounded-xl border px-4 py-2 text-sm transition-colors ${size === s ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>{s}</button>)}</div></div>
    <Button type="submit" className="rounded-xl">Salvar alterações</Button>
  </form>;
}
