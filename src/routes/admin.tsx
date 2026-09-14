import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Heart, Lock, Plus, Save, Trash2, Users } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { deleteMedia, saveMedia, useMediaUrls, type MediaRef } from "@/lib/media";
import { Textarea } from "@/components/ui/textarea";
import {
  ORDER_STATUSES,
  brl,
  useStore,
  type OrderStatus,
  type Product,
} from "@/lib/store";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Painel Admin · USE LOMA" },
      { name: "description", content: "Painel de gestão do site, produtos e pedidos da USE LOMA." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Painel Admin · USE LOMA" },
      { property: "og:description", content: "Gestão do site, produtos e pedidos da USE LOMA." },
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
  price: 0,
  groupPrice: 0,
  minPeople: 5,
  currentPeople: 0,
  groupCode: `GP${Math.floor(100 + Math.random() * 900)}`,
  deadline: new Date(Date.now() + 3 * 86400000).toISOString(),
});

function AdminPage() {
  const store = useStore();
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-hero px-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (password === store.settings.adminPassword) {
              setAuthed(true);
            } else {
              toast.error("Senha incorreta");
            }
          }}
          className="animate-fade-up w-full max-w-sm space-y-4 rounded-2xl bg-background p-8 shadow-soft"
        >
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-gold" />
            <span className="font-display text-2xl tracking-[0.2em] uppercase">Use Loma</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Área restrita. Informe a senha para acessar o painel.
          </p>
          <div className="space-y-1.5">
            <Label htmlFor="pw">Senha</Label>
            <Input
              id="pw"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="loma123"
            />
          </div>
          <Button type="submit" className="w-full rounded-xl">
            <Lock className="mr-2 h-4 w-4" /> Entrar
          </Button>
          <Link to="/" className="block text-center text-xs text-muted-foreground hover:underline">
            Voltar para a loja
          </Link>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
          <div>
            <h1 className="font-display text-3xl">Painel USE LOMA</h1>
            <p className="text-xs text-muted-foreground">
              Tudo que você editar aqui aparece na hora no site.
            </p>
          </div>
          <Link to="/">
            <Button variant="outline" className="rounded-xl">
              <ArrowLeft className="mr-2 h-4 w-4" /> Ver site
            </Button>
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8">
        <Tabs defaultValue="site">
          <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 rounded-2xl bg-card p-1">
            <TabsTrigger value="site" className="rounded-xl">
              Site & Banner
            </TabsTrigger>
            <TabsTrigger value="footer" className="rounded-xl">
              Rodapé
            </TabsTrigger>
            <TabsTrigger value="produtos" className="rounded-xl">
              Produtos & Grupos
            </TabsTrigger>
            <TabsTrigger value="pedidos" className="rounded-xl">
              Pedidos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="site" className="animate-fade-up mt-6">
            <SiteTab />
          </TabsContent>
          <TabsContent value="footer" className="animate-fade-up mt-6">
            <FooterTab />
          </TabsContent>
          <TabsContent value="produtos" className="animate-fade-up mt-6">
            <ProductsTab />
          </TabsContent>
          <TabsContent value="pedidos" className="animate-fade-up mt-6">
            <OrdersTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-card p-6 shadow-soft">
      <h2 className="font-display text-2xl">{title}</h2>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  textarea,
  type = "text",
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  textarea?: boolean;
  type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {textarea ? (
        <Textarea rows={3} value={value} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </div>
  );
}

function SaveBar({ dirty, onSave, onReset }: { dirty: boolean; onSave: () => void; onReset: () => void }) {
  return (
    <div className="flex items-center gap-3">
      <Button className="rounded-xl" onClick={onSave} disabled={!dirty}>
        <Save className="mr-2 h-4 w-4" /> Salvar alterações
      </Button>
      <Button variant="ghost" className="rounded-xl" onClick={onReset} disabled={!dirty}>
        Descartar
      </Button>
      {dirty && <span className="text-xs text-muted-foreground">Alterações não salvas</span>}
    </div>
  );
}

function SiteTab() {
  const { settings, updateSettings } = useStore();
  const [draft, setDraft] = useState(settings);
  useEffect(() => setDraft(settings), [settings]);
  const dirty = JSON.stringify(draft) !== JSON.stringify(settings);
  const set = (patch: Partial<typeof settings>) => setDraft((d) => ({ ...d, ...patch }));

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Barra de avisos & Banner">
          <Field
            label="Barra superior de avisos"
            value={draft.topBar}
            onChange={(v) => set({ topBar: v })}
            textarea
          />
          <Field
            label="Título principal do banner"
            value={draft.heroTitle}
            onChange={(v) => set({ heroTitle: v })}
          />
          <Field
            label="Slogan do banner"
            value={draft.heroSlogan}
            onChange={(v) => set({ heroSlogan: v })}
            textarea
          />
        </Card>
        <Card title="Contatos e redes">
          <Field
            label="WhatsApp do responsável (com DDI, ex: 5511999999999)"
            value={draft.whatsapp}
            onChange={(v) => set({ whatsapp: v })}
          />
          <Field
            label="Usuário do Instagram"
            value={draft.instagram}
            onChange={(v) => set({ instagram: v })}
          />
          <Field
            label="Link do Instagram"
            value={draft.instagramUrl}
            onChange={(v) => set({ instagramUrl: v })}
          />
          <Field
            label="Senha do painel"
            value={draft.adminPassword}
            onChange={(v) => set({ adminPassword: v })}
          />
        </Card>
      </div>
      <SaveBar
        dirty={dirty}
        onReset={() => setDraft(settings)}
        onSave={() => {
          updateSettings(draft);
          toast.success("Alterações salvas ♡");
        }}
      />
    </div>
  );
}

function FooterTab() {
  const { settings, updateSettings } = useStore();
  const [draft, setDraft] = useState(settings);
  useEffect(() => setDraft(settings), [settings]);
  const dirty = JSON.stringify(draft) !== JSON.stringify(settings);

  const updateBadge = (index: number, patch: Partial<(typeof settings.badges)[number]>) => {
    setDraft((d) => ({
      ...d,
      badges: d.badges.map((b, i) => (i === index ? { ...b, ...patch } : b)),
    }));
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Selos de destaque">
          {draft.badges.map((badge, i) => (
            <div key={i} className="space-y-2 rounded-xl bg-background p-4">
              <div className="grid gap-2 sm:grid-cols-[80px_1fr]">
                <Field label="Ícone" value={badge.icon} onChange={(v) => updateBadge(i, { icon: v })} />
                <Field label="Título" value={badge.title} onChange={(v) => updateBadge(i, { title: v })} />
              </div>
              <Field
                label="Subtítulo"
                value={badge.subtitle}
                onChange={(v) => updateBadge(i, { subtitle: v })}
              />
            </div>
          ))}
        </Card>
        <Card title="Textos institucionais">
          <Field
            label="Sobre a marca"
            value={draft.footerAbout}
            onChange={(v) => setDraft((d) => ({ ...d, footerAbout: v }))}
            textarea
          />
          <Field
            label="Direitos autorais"
            value={draft.copyright}
            onChange={(v) => setDraft((d) => ({ ...d, copyright: v }))}
          />
        </Card>
      </div>
      <SaveBar
        dirty={dirty}
        onReset={() => setDraft(settings)}
        onSave={() => {
          updateSettings(draft);
          toast.success("Rodapé salvo ♡");
        }}
      />
    </div>
  );
}


function ProductsTab() {
  const { products, saveProduct, deleteProduct } = useStore();
  const [draft, setDraft] = useState<Product | null>(null);

  const set = (patch: Partial<Product>) => setDraft((d) => (d ? { ...d, ...patch } : d));

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
      <Card title="Produtos cadastrados">
        <div className="space-y-3">
          {products.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-3 rounded-xl bg-background p-3"
            >
              {p.image ? (
                <img src={p.image} alt={p.name} loading="lazy" className="h-14 w-14 rounded-lg object-cover" />
              ) : (
                <div className="h-14 w-14 rounded-lg bg-card" />
              )}
              <div className="flex-1">
                <p className="font-medium">{p.name}</p>
                <p className="text-xs text-muted-foreground">
                  {brl(p.price)} · grupo {brl(p.groupPrice)} · {p.currentPeople}/{p.minPeople} pessoas
                </p>
              </div>
              <Button variant="outline" size="sm" className="rounded-lg" onClick={() => setDraft(p)}>
                Editar
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-lg"
                onClick={() => {
                  deleteProduct(p.id);
                  toast.success("Produto removido");
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        <Button className="rounded-xl" onClick={() => setDraft(emptyProduct())}>
          <Plus className="mr-2 h-4 w-4" /> Adicionar produto
        </Button>
      </Card>

      <Card title={draft ? "Editar produto" : "Nenhum produto selecionado"}>
        {draft ? (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              saveProduct(draft);
              toast.success("Produto salvo ♡");
              setDraft(null);
            }}
          >
            <Field label="Nome" value={draft.name} onChange={(v) => set({ name: v })} />
            <Field label="Categoria" value={draft.category} onChange={(v) => set({ category: v })} />
            <Field
              label="Descrição"
              value={draft.description}
              onChange={(v) => set({ description: v })}
              textarea
            />
            <Field label="URL da imagem" value={draft.image} onChange={(v) => set({ image: v })} />
            <MediaField media={draft.media ?? []} onChange={(media) => set({ media })} />
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="Preço individual"
                type="number"
                value={draft.price}
                onChange={(v) => set({ price: Number(v) })}
              />
              <Field
                label="Preço em grupo"
                type="number"
                value={draft.groupPrice}
                onChange={(v) => set({ groupPrice: Number(v) })}
              />
              <Field
                label="Mínimo de pessoas"
                type="number"
                value={draft.minPeople}
                onChange={(v) => set({ minPeople: Math.max(1, Number(v)) })}
              />
              <Field
                label="Participantes atuais"
                type="number"
                value={draft.currentPeople}
                onChange={(v) => set({ currentPeople: Math.max(0, Number(v)) })}
              />
            </div>
            <Field label="Código do grupo" value={draft.groupCode} onChange={(v) => set({ groupCode: v })} />
            <Field
              label="Prazo da cota (contador)"
              type="datetime-local"
              value={new Date(draft.deadline).toISOString().slice(0, 16)}
              onChange={(v) => set({ deadline: new Date(v).toISOString() })}
            />
            <div className="flex gap-2">
              <Button type="submit" className="flex-1 rounded-xl">
                Salvar
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="rounded-xl"
                onClick={() => setDraft(null)}
              >
                Cancelar
              </Button>
            </div>
          </form>
        ) : (
          <p className="text-sm text-muted-foreground">
            Selecione um produto para editar ou adicione um novo.
          </p>
        )}
      </Card>
    </div>
  );
}

function MediaField({
  media,
  onChange,
}: {
  media?: MediaRef[];
  onChange: (media: MediaRef[]) => void;
}) {
  const list = media ?? [];
  const urls = useMediaUrls(list);

  return (
    <div className="space-y-2">
      <Label>Fotos e vídeos do produto</Label>
      <Input
        type="file"
        accept="image/*,video/*"
        multiple
        onChange={async (e) => {
          const files = Array.from(e.target.files ?? []);
          e.target.value = "";
          if (!files.length) return;
          const refs = await Promise.all(files.map((f) => saveMedia(f)));
          onChange([...list, ...refs]);
          toast.success("Mídia adicionada");
        }}
      />
      {list.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {list.map((m) => (
            <div key={m.id} className="relative overflow-hidden rounded-lg bg-background">
              {m.kind === "video" ? (
                <video src={urls[m.id]} className="h-20 w-full object-cover" muted />
              ) : (
                <img src={urls[m.id]} alt={m.name} className="h-20 w-full object-cover" />
              )}
              <button
                type="button"
                aria-label={`Remover ${m.name}`}
                className="absolute top-1 right-1 rounded-md bg-background/90 p-1"
                onClick={async () => {
                  await deleteMedia(m.id);
                  onChange(list.filter((x) => x.id !== m.id));
                }}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function OrdersTab() {
  const { orders, products, updateOrderStatus, deleteOrder } = useStore();

  return (
    <div className="space-y-6">
      <Card title="Pedidos">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="text-left text-xs tracking-wide text-muted-foreground uppercase">
                <th className="pb-3">Cliente</th>
                <th className="pb-3">Produto</th>
                <th className="pb-3">Tipo</th>
                <th className="pb-3">Origem</th>
                <th className="pb-3">Total</th>
                <th className="pb-3">Status</th>
                <th className="pb-3"></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-t border-border">
                  <td className="py-3">
                    <p className="font-medium">{o.customer}</p>
                    <p className="text-xs text-muted-foreground">{o.phone}</p>
                  </td>
                  <td className="py-3">{o.productName}</td>
                  <td className="py-3">{o.type}</td>
                  <td className="py-3">{o.origin}</td>
                  <td className="py-3">{brl(o.total)}</td>
                  <td className="py-3">
                    <select
                      value={o.status}
                      onChange={(e) => updateOrderStatus(o.id, e.target.value as OrderStatus)}
                      className="rounded-lg border border-border bg-background px-2 py-1.5 text-xs"
                    >
                      {ORDER_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-lg"
                      onClick={() => deleteOrder(o.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-muted-foreground">
                    Nenhum pedido ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Monitor de grupos ativos">
        <div className="grid gap-3 md:grid-cols-2">
          {products.map((p) => {
            const done = p.currentPeople >= p.minPeople;
            return (
              <div key={p.id} className="rounded-xl bg-background p-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium">
                    #{p.groupCode} · {p.name}
                  </p>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] ${
                      done ? "bg-primary text-primary-foreground" : "bg-gold/25 text-foreground"
                    }`}
                  >
                    <Users className="h-3 w-3" />
                    {done ? "Liberado" : "Em formação"}
                  </span>
                </div>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-card">
                  <div
                    className="h-full rounded-full bg-primary transition-[width] duration-700"
                    style={{
                      width: `${Math.min(100, (p.currentPeople / p.minPeople) * 100)}%`,
                    }}
                  />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {p.currentPeople} de {p.minPeople} pessoas ·{" "}
                  {done ? "cota atingida" : `faltam ${p.minPeople - p.currentPeople}`}
                </p>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
