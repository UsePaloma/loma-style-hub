import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  BarChart3,
  Download,
  LayoutDashboard,
  Package,
  Plus,
  Save,
  Search,
  Settings2,
  ShoppingBag,
  Trash2,
  UserRound,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { deleteMedia, getSharableMediaUrl, saveMedia, useMediaUrls, type MediaRef } from "@/lib/media";
import { supabase } from "@/lib/supabase";
import { ORDER_STATUSES, brl, useStore, type Customer, type OrderStatus, type Product } from "@/lib/store";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Central de Gestão · USE LOMA" },
      { name: "description", content: "Central de gestão da USE LOMA." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

const emptyProduct = (): Product => ({
  id: `p${Date.now()}`,
  name: "",
  category: "",
  description: "",
  image: "",
  media: [],
  price: 0,
  groupPrice: 0,
  minPeople: 5,
  currentPeople: 0,
  groupCode: `GP${Math.floor(100 + Math.random() * 900)}`,
  deadline: new Date(Date.now() + 3 * 86400000).toISOString(),
  weightKg: 0.5,
  lengthCm: 30,
  widthCm: 25,
  heightCm: 10,
});

function AdminPage() {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(false);
  useEffect(() => {
    const allowed = sessionStorage.getItem("useloma-admin-session") === "1";
    setAuthed(allowed);
    if (!allowed) navigate({ to: "/conta" });
  }, [navigate]);
  if (!authed) return null;
  const logout = () => {
    sessionStorage.removeItem("useloma-admin-session");
    navigate({ to: "/conta" });
  };
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_hsl(var(--primary)/.10),_transparent_35%),hsl(var(--background))]">
      <header className="sticky top-0 z-20 border-b border-border/70 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 lg:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-soft"><BarChart3 className="h-5 w-5" /></div>
            <div><p className="text-[11px] font-semibold uppercase tracking-[.24em] text-muted-foreground">USE LOMA</p><h1 className="font-display text-2xl leading-none">Central de Gestão</h1></div>
          </div>
          <div className="flex gap-2"><Link to="/"><Button variant="outline" className="rounded-xl"><ArrowLeft className="mr-2 h-4 w-4" /> Site</Button></Link><Button variant="ghost" className="rounded-xl" onClick={logout}>Sair</Button></div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 lg:px-6 lg:py-8"><Tabs defaultValue="dashboard">
        <TabsList className="grid h-auto w-full grid-cols-2 gap-1 rounded-2xl bg-card/90 p-1 sm:grid-cols-4 lg:grid-cols-7">
          <TabsTrigger value="dashboard" className="rounded-xl"><LayoutDashboard className="mr-2 h-4 w-4" />Visão geral</TabsTrigger>
          <TabsTrigger value="site" className="rounded-xl"><Settings2 className="mr-2 h-4 w-4" />Site</TabsTrigger>
          <TabsTrigger value="produtos" className="rounded-xl"><Package className="mr-2 h-4 w-4" />Produtos</TabsTrigger>
          <TabsTrigger value="pedidos" className="rounded-xl"><ShoppingBag className="mr-2 h-4 w-4" />Pedidos</TabsTrigger>
          <TabsTrigger value="clientes" className="rounded-xl"><Users className="mr-2 h-4 w-4" />Clientes</TabsTrigger>
          <TabsTrigger value="rodape" className="rounded-xl">Rodapé</TabsTrigger>
          <TabsTrigger value="dados" className="rounded-xl">Dados</TabsTrigger>
        </TabsList>
        <TabsContent value="dashboard" className="mt-6"><DashboardTab /></TabsContent>
        <TabsContent value="site" className="mt-6"><SiteTab /></TabsContent>
        <TabsContent value="produtos" className="mt-6"><ProductsTab /></TabsContent>
        <TabsContent value="pedidos" className="mt-6"><OrdersTab /></TabsContent>
        <TabsContent value="clientes" className="mt-6"><CustomersTab /></TabsContent>
        <TabsContent value="rodape" className="mt-6"><FooterTab /></TabsContent>
        <TabsContent value="dados" className="mt-6"><DataTab /></TabsContent>
      </Tabs></main>
    </div>
  );
}

function Card({ title, children, icon: Icon }: { title: string; children: ReactNode; icon?: typeof Users }) {
  return <section className="rounded-3xl border border-border/70 bg-card/90 p-5 shadow-soft lg:p-6"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">{Icon ? <Icon className="h-4 w-4" /> : <span>♡</span>}</div><h2 className="font-display text-2xl">{title}</h2></div><div className="mt-5 space-y-4">{children}</div></section>;
}

function Field({ label, value, onChange, textarea, type = "text" }: { label: string; value: string | number; onChange: (v: string) => void; textarea?: boolean; type?: string }) {
  return <div className="space-y-1.5"><Label>{label}</Label>{textarea ? <Textarea rows={3} value={value} onChange={(e) => onChange(e.target.value)} /> : <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} />}</div>;
}

function SaveBar({ dirty, onSave, onReset }: { dirty: boolean; onSave: () => void; onReset: () => void }) {
  return <div className="flex flex-wrap items-center gap-3"><Button type="button" className="rounded-xl" onClick={onSave} disabled={!dirty}><Save className="mr-2 h-4 w-4" />Salvar alterações</Button><Button type="button" variant="ghost" className="rounded-xl" onClick={onReset} disabled={!dirty}>Descartar</Button>{dirty && <span className="text-xs text-muted-foreground">Há alterações pendentes.</span>}</div>;
}

function DashboardTab() {
  const { settings, products, orders, customers } = useStore();
  const revenue = orders.reduce((sum, order) => sum + order.total, 0);
  const groups = products.filter((p) => p.currentPeople >= p.minPeople).length;
  return <div className="space-y-6">
    <div className="rounded-3xl bg-primary p-6 text-primary-foreground shadow-soft lg:p-8"><div className="max-w-3xl"><p className="text-xs font-semibold uppercase tracking-[.24em] opacity-75">Painel administrativo</p><h2 className="mt-2 font-display text-4xl lg:text-5xl">Tudo sob controle, em um só lugar.</h2><p className="mt-3 max-w-2xl text-sm opacity-80">Gerencie catálogo, clientes, pedidos, conteúdo e mídia com persistência no Supabase.</p></div></div>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Metric title="Produtos" value={products.length} icon={<Package />} /><Metric title="Pedidos" value={orders.length} icon={<ShoppingBag />} /><Metric title="Clientes" value={customers.length} icon={<Users />} /><Metric title="Vendas registradas" value={brl(revenue)} icon={<BarChart3 />} /></div>
    <div className="grid gap-6 lg:grid-cols-2"><Card title="Resumo operacional" icon={BarChart3}><div className="grid grid-cols-2 gap-3"><Info label="Grupos concluídos" value={`${groups}`} /><Info label="Aguardando pagamento" value={`${orders.filter((o) => o.status === "Aguardando Pagamento").length}`} /><Info label="Em separação" value={`${orders.filter((o) => o.status === "Em Separação").length}`} /><Info label="Concluídos" value={`${orders.filter((o) => o.status === "Concluído").length}`} /></div></Card><Card title="Conteúdo atual" icon={Settings2}><div className="space-y-3 rounded-2xl bg-background p-4"><p className="font-medium">{settings.heroTitle}</p><p className="text-sm text-muted-foreground">{settings.heroSlogan}</p><p className="text-xs text-muted-foreground">WhatsApp: {settings.whatsapp} · Instagram: {settings.instagram}</p></div></Card></div>
  </div>;
}

function Metric({ title, value, icon }: { title: string; value: string | number; icon: ReactNode }) { return <div className="rounded-3xl border border-border/70 bg-card/90 p-5 shadow-soft"><div className="flex items-center justify-between"><p className="text-xs uppercase tracking-wider text-muted-foreground">{title}</p><div className="text-primary">{icon}</div></div><p className="mt-3 text-3xl font-semibold tracking-tight">{value}</p></div>; }
function Info({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl bg-background p-4"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-xl font-semibold">{value}</p></div>; }

function HeroImageField({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);
  return <div className="space-y-2"><Label>Imagem do banner (página inicial)</Label>
    <Input type="file" accept="image/*" disabled={uploading} onChange={async (e) => {
      const file = e.target.files?.[0]; e.target.value = ""; if (!file) return;
      setUploading(true);
      try { const ref = await saveMedia(file); const url = await getSharableMediaUrl(ref.id); if (!url) throw new Error("URL indisponível"); onChange(url); toast.success("Imagem enviada. Clique em salvar para publicar."); }
      catch (error) { console.error(error); toast.error("Não foi possível enviar a imagem."); }
      finally { setUploading(false); }
    }} />
    {value ? <div className="space-y-2"><img src={value} alt="Pré-visualização do banner" className="h-40 w-full rounded-2xl object-cover" /><Button type="button" variant="ghost" size="sm" className="rounded-lg" onClick={() => onChange("")}>Usar imagem padrão</Button></div>
      : <p className="text-xs text-muted-foreground">Nenhuma imagem personalizada. A imagem padrão do site será usada.</p>}
  </div>;
}

function SiteTab() {
  const { settings, updateSettings } = useStore(); const [draft, setDraft] = useState(settings); useEffect(() => setDraft(settings), [settings]); const dirty = JSON.stringify(draft) !== JSON.stringify(settings); const set = (patch: Partial<typeof settings>) => setDraft((d) => ({ ...d, ...patch }));
  return <div className="space-y-6"><div className="grid gap-6 lg:grid-cols-2"><Card title="Página inicial" icon={LayoutDashboard}><Field label="Barra superior" value={draft.topBar} onChange={(v) => set({ topBar: v })} textarea /><Field label="Título principal" value={draft.heroTitle} onChange={(v) => set({ heroTitle: v })} /><Field label="Slogan" value={draft.heroSlogan} onChange={(v) => set({ heroSlogan: v })} textarea /><HeroImageField value={draft.heroImage ?? ""} onChange={(heroImage) => set({ heroImage })} /></Card><Card title="Canais e administração" icon={Settings2}><Field label="WhatsApp" value={draft.whatsapp} onChange={(v) => set({ whatsapp: v })} /><Field label="Instagram" value={draft.instagram} onChange={(v) => set({ instagram: v })} /><Field label="URL do Instagram" value={draft.instagramUrl} onChange={(v) => set({ instagramUrl: v })} /><Field label="Senha administrativa" value={draft.adminPassword} onChange={(v) => set({ adminPassword: v })} /><p className="text-xs text-muted-foreground">Acesso atual: admin@useloma.com.</p></Card></div><SaveBar dirty={dirty} onReset={() => setDraft(settings)} onSave={() => { updateSettings(draft); toast.success("Configurações salvas ♡"); }} /></div>;
}

function FooterTab() {
  const { settings, updateSettings } = useStore(); const [draft, setDraft] = useState(settings); useEffect(() => setDraft(settings), [settings]); const dirty = JSON.stringify(draft) !== JSON.stringify(settings); const updateBadge = (index: number, patch: Partial<(typeof settings.badges)[number]>) => setDraft((d) => ({ ...d, badges: d.badges.map((b, i) => i === index ? { ...b, ...patch } : b) }));
  return <div className="grid gap-6 lg:grid-cols-2"><Card title="Selos de destaque">{draft.badges.map((badge, i) => <div key={i} className="rounded-2xl bg-background p-4"><div className="grid gap-3 sm:grid-cols-[90px_1fr]"><Field label="Ícone" value={badge.icon} onChange={(v) => updateBadge(i, { icon: v })} /><Field label="Título" value={badge.title} onChange={(v) => updateBadge(i, { title: v })} /></div><div className="mt-3"><Field label="Subtítulo" value={badge.subtitle} onChange={(v) => updateBadge(i, { subtitle: v })} /></div></div>)}</Card><div className="space-y-6"><Card title="Institucional"><Field label="Sobre a marca" value={draft.footerAbout} onChange={(v) => setDraft((d) => ({ ...d, footerAbout: v }))} textarea /><Field label="Direitos autorais" value={draft.copyright} onChange={(v) => setDraft((d) => ({ ...d, copyright: v }))} /></Card><SaveBar dirty={dirty} onReset={() => setDraft(settings)} onSave={() => { updateSettings(draft); toast.success("Rodapé salvo ♡"); }} /></div></div>;
}

function ProductsTab() {
  const { products, saveProduct, deleteProduct } = useStore(); const [draft, setDraft] = useState<Product | null>(null); const set = (patch: Partial<Product>) => setDraft((d) => d ? { ...d, ...patch } : d);
  return <div className="grid gap-6 lg:grid-cols-[1fr_440px]"><Card title="Catálogo" icon={Package}><div className="space-y-3">{products.map((p) => <div key={p.id} className="flex items-center gap-3 rounded-2xl bg-background p-3"><ProductThumb product={p} /><div className="min-w-0 flex-1"><p className="truncate font-medium">{p.name || "Sem nome"}</p><p className="text-xs text-muted-foreground">{brl(p.price)} · grupo {brl(p.groupPrice)} · {p.currentPeople}/{p.minPeople}</p></div><Button variant="outline" size="sm" className="rounded-lg" onClick={() => setDraft(p)}>Editar</Button><Button variant="ghost" size="icon" className="rounded-lg" onClick={() => { deleteProduct(p.id); toast.success("Produto removido"); }}><Trash2 className="h-4 w-4" /></Button></div>)}</div><Button className="mt-2 rounded-xl" onClick={() => setDraft(emptyProduct())}><Plus className="mr-2 h-4 w-4" />Novo produto</Button></Card><Card title={draft ? "Editor de produto" : "Editor"}>{draft ? <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); if (!draft.name.trim()) { toast.error("Informe o nome do produto."); return; } saveProduct(draft); toast.success("Produto salvo ♡"); setDraft(null); }}><Field label="Nome" value={draft.name} onChange={(v) => set({ name: v })} /><Field label="Categoria" value={draft.category} onChange={(v) => set({ category: v })} /><Field label="Descrição" value={draft.description} onChange={(v) => set({ description: v })} textarea /><Field label="URL da imagem principal" value={draft.image} onChange={(v) => set({ image: v })} /><MediaField media={draft.media ?? []} onChange={(media) => set({ media })} /><div className="grid grid-cols-2 gap-3"><Field label="Preço" type="number" value={draft.price} onChange={(v) => set({ price: Number(v) })} /><Field label="Preço em grupo" type="number" value={draft.groupPrice} onChange={(v) => set({ groupPrice: Number(v) })} /><Field label="Mínimo de pessoas" type="number" value={draft.minPeople} onChange={(v) => set({ minPeople: Math.max(1, Number(v)) })} /><Field label="Participantes" type="number" value={draft.currentPeople} onChange={(v) => set({ currentPeople: Math.max(0, Number(v)) })} /></div><Field label="Código do grupo" value={draft.groupCode} onChange={(v) => set({ groupCode: v })} /><div className="grid grid-cols-2 gap-3"><Field label="Peso (kg)" type="number" value={draft.weightKg ?? ""} onChange={(v) => set({ weightKg: v === "" ? undefined : Number(v) })} /><Field label="Comprimento (cm)" type="number" value={draft.lengthCm ?? ""} onChange={(v) => set({ lengthCm: v === "" ? undefined : Number(v) })} /><Field label="Largura (cm)" type="number" value={draft.widthCm ?? ""} onChange={(v) => set({ widthCm: v === "" ? undefined : Number(v) })} /><Field label="Altura (cm)" type="number" value={draft.heightCm ?? ""} onChange={(v) => set({ heightCm: v === "" ? undefined : Number(v) })} /></div><Field label="Prazo" type="datetime-local" value={new Date(draft.deadline).toISOString().slice(0, 16)} onChange={(v) => set({ deadline: new Date(v).toISOString() })} /><div className="flex gap-2"><Button type="submit" className="flex-1 rounded-xl"><Save className="mr-2 h-4 w-4" />Salvar</Button><Button type="button" variant="ghost" className="rounded-xl" onClick={() => setDraft(null)}>Cancelar</Button></div></form> : <p className="text-sm text-muted-foreground">Selecione um produto ou crie um novo.</p>}</Card></div>;
}

function ProductThumb({ product }: { product: Product }) { const urls = useMediaUrls(product.media ?? []); const first = product.media?.[0]; if (first && urls[first.id]) return first.kind === "video" ? <video src={urls[first.id]} className="h-14 w-14 rounded-xl object-cover" muted /> : <img src={urls[first.id]} alt={product.name} className="h-14 w-14 rounded-xl object-cover" />; return product.image ? <img src={product.image} alt={product.name} className="h-14 w-14 rounded-xl object-cover" /> : <div className="h-14 w-14 rounded-xl bg-card" />; }
function MediaField({ media, onChange }: { media?: MediaRef[]; onChange: (media: MediaRef[]) => void }) { const list = media ?? []; const urls = useMediaUrls(list); return <div className="space-y-2"><Label>Fotos e vídeos</Label><Input type="file" accept="image/*,video/*" multiple onChange={async (e) => { const files = Array.from(e.target.files ?? []); e.target.value = ""; if (!files.length) return; try { const refs = await Promise.all(files.map(saveMedia)); onChange([...list, ...refs]); toast.success("Mídia enviada ao Supabase"); } catch (error) { console.error(error); toast.error("Não foi possível enviar a mídia"); } }} />{list.length > 0 && <div className="grid grid-cols-3 gap-2">{list.map((m) => <div key={m.id} className="relative overflow-hidden rounded-xl bg-background">{m.kind === "video" ? <video src={urls[m.id]} className="h-20 w-full object-cover" controls muted /> : <img src={urls[m.id]} alt={m.name} className="h-20 w-full object-cover" />}<button type="button" aria-label={`Remover ${m.name}`} className="absolute right-1 top-1 rounded-md bg-background/90 p-1" onClick={async () => { await deleteMedia(m.id); onChange(list.filter((x) => x.id !== m.id)); }}><Trash2 className="h-3.5 w-3.5" /></button></div>)}</div>}</div>; }

function OrdersTab() { const { orders, products, updateOrderStatus, deleteOrder } = useStore(); return <div className="space-y-6"><Card title="Pedidos" icon={ShoppingBag}><div className="overflow-x-auto"><table className="w-full min-w-[780px] text-sm"><thead><tr className="text-left text-xs uppercase tracking-wider text-muted-foreground"><th className="pb-3">Cliente</th><th className="pb-3">Produto</th><th className="pb-3">Origem</th><th className="pb-3">Total</th><th className="pb-3">Status</th><th /></tr></thead><tbody>{orders.map((o) => <tr key={o.id} className="border-t border-border"><td className="py-3"><p className="font-medium">{o.customer}</p><p className="text-xs text-muted-foreground">{o.phone}</p></td><td className="py-3">{o.productName}</td><td className="py-3">{o.origin}</td><td className="py-3">{brl(o.total)}</td><td className="py-3"><select value={o.status} onChange={(e) => updateOrderStatus(o.id, e.target.value as OrderStatus)} className="rounded-lg border border-border bg-background px-2 py-1.5 text-xs">{ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}</select></td><td className="py-3 text-right"><Button variant="ghost" size="icon" onClick={() => deleteOrder(o.id)}><Trash2 className="h-4 w-4" /></Button></td></tr>)}</tbody></table></div></Card><Card title="Grupos ativos" icon={Users}><div className="grid gap-3 md:grid-cols-2">{products.map((p) => <div key={p.id} className="rounded-2xl bg-background p-4"><div className="flex justify-between gap-3"><p className="font-medium">#{p.groupCode} · {p.name}</p><span className="text-xs text-muted-foreground">{p.currentPeople}/{p.minPeople}</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-card"><div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, (p.currentPeople / Math.max(1, p.minPeople)) * 100)}%` }} /></div></div>)}</div></Card></div>; }

function CustomersTab() {
  const { customers } = useStore();
  const [items, setItems] = useState<Customer[]>(customers);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Customer | null>(null);
  useEffect(() => setItems(customers), [customers]);
  const filtered = useMemo(() => items.filter((c) => `${c.name} ${c.email} ${c.phone}`.toLowerCase().includes(query.toLowerCase())), [items, query]);
  async function saveCustomer(customer: Customer) {
    if (!supabase) { toast.error("Supabase não está configurado."); return; }
    const { data: row, error } = await supabase.from("site_data").select("data").eq("id", 1).single();
    if (error) { toast.error("Não foi possível carregar os dados."); return; }
    const data = (row?.data ?? {}) as Record<string, unknown>;
    const customersData = Array.isArray(data["customers"]) ? data["customers"] as Customer[] : [];
    const next = customersData.some((c) => c.id === customer.id) ? customersData.map((c) => c.id === customer.id ? customer : c) : [...customersData, customer];
    const result = await supabase.from("site_data").upsert({ id: 1, data: { ...data, customers: next }, updated_at: new Date().toISOString() });
    if (result.error) { toast.error("Falha ao salvar cliente."); return; }
    setItems(next); setEditing(null); localStorage.setItem("useloma-store-v1", JSON.stringify({ ...data, customers: next })); toast.success("Conta atualizada ♡");
  }
  async function removeCustomer(id: string) {
    if (!supabase || !confirm("Excluir esta conta de cliente?")) return;
    const { data: row, error } = await supabase.from("site_data").select("data").eq("id", 1).single();
    if (error) { toast.error("Não foi possível carregar os dados."); return; }
    const data = (row?.data ?? {}) as Record<string, unknown>;
    const next = (Array.isArray(data["customers"]) ? data["customers"] as Customer[] : []).filter((c) => c.id !== id);
    const result = await supabase.from("site_data").upsert({ id: 1, data: { ...data, customers: next }, updated_at: new Date().toISOString() });
    if (result.error) { toast.error("Falha ao excluir conta."); return; }
    setItems(next); localStorage.setItem("useloma-store-v1", JSON.stringify({ ...data, customers: next })); toast.success("Conta excluída");
  }
  return <div className="space-y-6"><Card title="Contas de clientes" icon={Users}><div className="flex flex-col gap-3 sm:flex-row"><div className="relative flex-1"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input className="pl-9" placeholder="Buscar por nome, e-mail ou telefone" value={query} onChange={(e) => setQuery(e.target.value)} /></div><Button variant="outline" className="rounded-xl" onClick={() => setEditing({ id: `CL${Date.now().toString(36)}`, name: "", email: "", phone: "", address: "", passwordHash: "" })}><Plus className="mr-2 h-4 w-4" />Nova conta</Button></div><div className="space-y-3">{filtered.map((customer) => <div key={customer.id} className="flex flex-col gap-3 rounded-2xl bg-background p-4 md:flex-row md:items-center"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"><UserRound className="h-5 w-5" /></div><div className="min-w-0 flex-1"><p className="font-medium">{customer.name || "Conta sem nome"}</p><p className="truncate text-xs text-muted-foreground">{customer.email} · {customer.phone}</p><p className="truncate text-xs text-muted-foreground">{customer.address || "Sem endereço"}</p></div><div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => setEditing(customer)}>Editar</Button><Button variant="ghost" size="icon" onClick={() => void removeCustomer(customer.id)}><Trash2 className="h-4 w-4" /></Button></div></div>)}{filtered.length === 0 && <p className="rounded-2xl bg-background p-6 text-center text-sm text-muted-foreground">Nenhuma conta encontrada.</p>}</div></Card>{editing && <CustomerEditor customer={editing} onCancel={() => setEditing(null)} onSave={saveCustomer} />}</div>;
}

function CustomerEditor({ customer, onCancel, onSave }: { customer: Customer; onCancel: () => void; onSave: (customer: Customer) => void }) {
  const [draft, setDraft] = useState(customer); const set = (patch: Partial<Customer>) => setDraft((d) => ({ ...d, ...patch }));
  return <Card title="Editar conta" icon={UserRound}><div className="grid gap-4 md:grid-cols-2"><Field label="Nome" value={draft.name} onChange={(v) => set({ name: v })} /><Field label="E-mail" value={draft.email} onChange={(v) => set({ email: v })} /><Field label="Telefone" value={draft.phone} onChange={(v) => set({ phone: v })} /><Field label="Endereço" value={draft.address} onChange={(v) => set({ address: v })} /></div><div className="flex gap-2"><Button className="rounded-xl" onClick={() => onSave({ ...draft, email: draft.email.trim().toLowerCase() })}><Save className="mr-2 h-4 w-4" />Salvar conta</Button><Button variant="ghost" className="rounded-xl" onClick={onCancel}>Cancelar</Button></div></Card>;
}

function DataTab() {
  const { settings, products, orders, customers } = useStore();
  const exportData = () => { const blob = new Blob([JSON.stringify({ settings, products, orders, customers }, null, 2)], { type: "application/json" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `useloma-backup-${new Date().toISOString().slice(0, 10)}.json`; a.click(); URL.revokeObjectURL(url); toast.success("Backup exportado"); };
  return <div className="grid gap-6 lg:grid-cols-2"><Card title="Backup e segurança" icon={Download}><p className="text-sm text-muted-foreground">Exporte uma cópia dos dados atualmente carregados no painel. A fonte oficial de persistência continua sendo o Supabase.</p><Button className="rounded-xl" onClick={exportData}><Download className="mr-2 h-4 w-4" />Exportar backup JSON</Button></Card><Card title="Integridade dos dados" icon={BarChart3}><Info label="Produtos" value={`${products.length}`} /><Info label="Pedidos" value={`${orders.length}`} /><Info label="Clientes" value={`${customers.length}`} /><p className="text-xs text-muted-foreground">As alterações do painel são sincronizadas com o Supabase. O navegador é somente cache local.</p></Card></div>;
}