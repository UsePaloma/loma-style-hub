import { useEffect, useState } from "react";
import { MessageCircle, Send, ShoppingBag, Sparkles, Users } from "lucide-react";
import { toast } from "sonner";

import { Countdown } from "@/components/site/Countdown";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMediaUrls } from "@/lib/media";
import { SIZES, brl, useStore, waLink, type Delivery, type Product } from "@/lib/store";

type Mode = "individual" | "grupo";

export function ProductModal({
  product,
  open,
  onClose,
}: {
  product: Product | null;
  open: boolean;
  onClose: () => void;
}) {
  const { settings, addOrder, currentCustomer, loginCustomer, registerCustomer } = useStore();
  const [authMode, setAuthMode] = useState<"login" | "cadastro">("login");
  const [auth, setAuth] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    password: "",
  });
  const [mode, setMode] = useState<Mode>("grupo");
  const [checkout, setCheckout] = useState<null | "site" | "whatsapp">(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    payment: "PIX",
    delivery: "Entrega" as Delivery,
    size: "",
  });
  const [active, setActive] = useState(0);
  const urls = useMediaUrls(product?.media);

  useEffect(() => {
    if (open) {
      setMode("grupo");
      setCheckout(null);
      setActive(0);
      setAuthMode("login");
      setAuth({ name: "", email: "", phone: "", address: "", password: "" });
      setForm({
        name: currentCustomer?.name ?? "",
        phone: currentCustomer?.phone ?? "",
        address: currentCustomer?.address ?? "",
        payment: "PIX",
        delivery: "Entrega",
        size: "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, product?.id]);

  useEffect(() => {
    if (!currentCustomer) return;
    setForm((f) => ({
      ...f,
      name: f.name || currentCustomer.name,
      phone: f.phone || currentCustomer.phone,
      address: f.address || currentCustomer.address,
    }));
  }, [currentCustomer]);

  if (!product) return null;

  const total = mode === "grupo" ? product.groupPrice : product.price;
  const missing = Math.max(product.minPeople - product.currentPeople, 0);
  const progress = Math.min(100, (product.currentPeople / product.minPeople) * 100);

  const economy = Math.max(product.price - product.groupPrice, 0);
  const deadlineLabel = new Date(product.deadline).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });
  const inviteMessage = [
    `Oi, amiga! 💛 Achei uma peça linda na USE LOMA e quero te chamar pro grupo de compra:`,
    "",
    `✨ *${product.name}* (${product.category})`,
    product.description,
    "",
    `Preço normal: ${brl(product.price)}`,
    `👯 Preço no grupo: *${brl(product.groupPrice)}* — você economiza ${brl(economy)}!`,
    `Grupo #${product.groupCode} · ${product.currentPeople} de ${product.minPeople} pessoas`,
    missing > 0
      ? missing === 1
        ? `⏳ Falta só *1 pessoa* para liberar o preço em grupo — pode ser você!`
        : `⏳ Faltam só *${missing} pessoas* para liberar o preço em grupo!`
      : `🎉 A cota já está completa, dá tempo de entrar também!`,
    `Prazo: até ${deadlineLabel}`,
    "",
    `Bora comigo? É só entrar no site da USE LOMA e escolher "Compra em Grupo" ♡`,
  ].join("\n");

  const submitAuth = (e: React.FormEvent) => {
    e.preventDefault();
    const res =
      authMode === "login"
        ? loginCustomer(auth.email, auth.password)
        : registerCustomer({
            name: auth.name,
            email: auth.email,
            phone: auth.phone,
            address: auth.address,
            password: auth.password,
          });
    if (!res.ok) {
      toast.error(res.error ?? "Não foi possível continuar.");
      return;
    }
    toast.success(authMode === "login" ? "Bem-vinda de volta ♡" : "Conta criada ♡");
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const channel = checkout === "whatsapp" ? "WhatsApp" : "Site";
    const order = addOrder({
      customer: form.name,
      phone: form.phone,
      address: form.delivery === "Entrega" ? form.address : "",
      payment: form.payment,
      productId: product.id,
      productName: product.name,
      type: mode === "grupo" ? "Grupo" : "Individual",
      total,
      status: mode === "grupo" && missing > 0 ? "Aguardando Cota do Grupo" : "Aguardando Pagamento",
      origin: channel,
      delivery: form.delivery,
      ...(form.size ? { size: form.size } : {}),
      ...(currentCustomer ? { customerId: currentCustomer.id } : {}),
    });

    {
      const lines = [
        "*Novo pedido · USE LOMA ♡*",
        `Pedido: #${order.id}`,
        `Cliente: ${form.name}`,
        `Telefone: ${form.phone}`,
        `Produto: ${product.name}`,
        `Tipo de compra: ${mode === "grupo" ? "Grupo" : "Individual"}`,
      ];
      if (mode === "grupo") {
        lines.push(
          `Grupo: #${product.groupCode} (${
            missing > 0
              ? `falta${missing > 1 ? "m" : ""} ${missing} pessoa${missing > 1 ? "s" : ""}`
              : "cota completa"
          })`,
        );
      }
      if (form.size) lines.push(`Tamanho: ${form.size}`);
      lines.push(`Recebimento: ${form.delivery === "Entrega" ? "Envio/Entrega" : "Retirada"}`);
      if (form.delivery === "Entrega") lines.push(`Endereço: ${form.address}`);
      lines.push(`Pagamento: ${form.payment}`);
      lines.push(`Total: ${brl(total)}`);
      lines.push("Por favor, confirme meu pedido ♡");
      window.open(waLink(settings.whatsapp, lines.join("\n")), "_blank", "noopener");
      toast.success("Pedido salvo na sua conta e enviado no WhatsApp ♡");
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto rounded-2xl bg-background">
        <DialogHeader>
          <DialogTitle className="font-display text-3xl">{product.name}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            {(() => {
              const items = (product.media ?? [])
                .filter((m) => urls[m.id])
                .map((m) => ({ key: m.id, kind: m.kind, src: urls[m.id] }));
              if (items.length === 0)
                items.push({ key: "cover", kind: "image" as const, src: product.image });
              const current = items[Math.min(active, items.length - 1)]!;
              return (
                <>
                  {current.kind === "video" ? (
                    <video
                      src={current.src}
                      controls
                      className="h-72 w-full rounded-2xl bg-card object-cover"
                    />
                  ) : (
                    <img
                      src={current.src}
                      alt={product.name}
                      loading="lazy"
                      className="h-72 w-full rounded-2xl object-cover"
                    />
                  )}
                  {items.length > 1 && (
                    <div className="flex flex-wrap gap-2">
                      {items.map((it, i) => (
                        <button
                          key={it.key}
                          type="button"
                          onClick={() => setActive(i)}
                          className={`h-16 w-16 overflow-hidden rounded-xl border transition-colors ${
                            i === Math.min(active, items.length - 1)
                              ? "border-primary"
                              : "border-border"
                          }`}
                        >
                          {it.kind === "video" ? (
                            <video src={it.src} className="h-full w-full object-cover" muted />
                          ) : (
                            <img
                              src={it.src}
                              alt=""
                              loading="lazy"
                              className="h-full w-full object-cover"
                            />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              );
            })()}
          </div>


          <div className="space-y-4">
            <p className="text-sm leading-relaxed text-muted-foreground">{product.description}</p>

            <div className="grid gap-3">
              <button
                type="button"
                onClick={() => setMode("individual")}
                className={`rounded-2xl border p-4 text-left transition-all ${
                  mode === "individual"
                    ? "border-primary bg-card shadow-soft"
                    : "border-border hover:border-primary/40"
                }`}
              >
                <span className="flex items-center gap-2 text-sm font-medium">
                  <ShoppingBag className="h-4 w-4" /> Compra Individual
                </span>
                <span className="mt-1 block text-lg font-semibold text-primary">
                  {brl(product.price)}
                </span>
                <span className="text-xs text-muted-foreground">Compra direta, sem meta de grupo</span>
              </button>

              <button
                type="button"
                onClick={() => setMode("grupo")}
                className={`rounded-2xl border p-4 text-left transition-all ${
                  mode === "grupo"
                    ? "border-primary bg-card shadow-soft"
                    : "border-border hover:border-primary/40"
                }`}
              >
                <span className="flex items-center gap-2 text-sm font-medium">
                  <Users className="h-4 w-4" /> Compra em Grupo · #{product.groupCode}
                </span>
                <span className="mt-1 block text-lg font-semibold text-primary">
                  {brl(product.groupPrice)}
                </span>
                <span className="text-xs text-muted-foreground">
                  A partir de {product.minPeople} pessoas
                </span>
              </button>
            </div>

            {mode === "grupo" && (
              <div className="animate-fade-up space-y-3 rounded-2xl bg-card p-4">
                <div className="flex items-center justify-between text-xs font-medium text-foreground">
                  <span>
                    {product.currentPeople} de {product.minPeople} pessoas
                  </span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-background">
                  <div
                    className="h-full rounded-full bg-primary transition-[width] duration-700 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                {missing > 0 ? (
                  <p className="flex items-center gap-2 rounded-xl bg-gold/20 px-3 py-2 text-sm font-medium text-foreground">
                    <Sparkles className="h-4 w-4 text-gold" />
                    {missing === 1
                      ? "Falta apenas 1 pessoa para que a compra em grupo ocorra!"
                      : `Faltam ${missing} pessoas para que a compra em grupo ocorra!`}
                  </p>
                ) : (
                  <p className="rounded-xl bg-gold/20 px-3 py-2 text-sm font-medium">
                    Cota completa! Preço em grupo liberado ♡
                  </p>
                )}
                <Countdown deadline={product.deadline} />
                <a
                  href={waLink(settings.whatsapp, inviteMessage)}
                  target="_blank"
                  rel="noreferrer"
                  className="block"
                >
                  <Button variant="outline" className="w-full rounded-xl">
                    <Send className="mr-2 h-4 w-4" /> Convidar amigas no WhatsApp
                  </Button>
                </a>
              </div>
            )}

            {!checkout ? (
              <div className="space-y-2">
                <Button className="w-full rounded-xl" onClick={() => setCheckout("site")}>
                  {mode === "grupo"
                    ? `Participar deste grupo (${brl(product.groupPrice)})`
                    : `Comprar agora (${brl(product.price)})`}
                </Button>
                <Button
                  variant="outline"
                  className="w-full rounded-xl"
                  onClick={() => setCheckout("whatsapp")}
                >
                  <MessageCircle className="mr-2 h-4 w-4" /> Finalizar pelo WhatsApp
                </Button>
              </div>
            ) : !currentCustomer ? (
              <form onSubmit={submitAuth} className="animate-fade-up space-y-3">
                <p className="rounded-xl bg-card px-3 py-2 text-xs text-muted-foreground">
                  Para finalizar o pedido, entre na sua conta ou crie uma. Assim o pedido fica
                  salvo na sua Área do Cliente ♡
                </p>
                <div className="flex gap-2">
                  {(["login", "cadastro"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setAuthMode(m)}
                      className={`flex-1 rounded-xl border px-3 py-2 text-sm transition-colors ${
                        authMode === m
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border"
                      }`}
                    >
                      {m === "login" ? "Já tenho conta" : "Criar conta"}
                    </button>
                  ))}
                </div>
                {authMode === "cadastro" && (
                  <>
                    <div className="space-y-1.5">
                      <Label htmlFor="ac-nome">Nome completo</Label>
                      <Input
                        id="ac-nome"
                        required
                        value={auth.name}
                        onChange={(e) => setAuth({ ...auth, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="ac-tel">Telefone</Label>
                      <Input
                        id="ac-tel"
                        required
                        value={auth.phone}
                        onChange={(e) => setAuth({ ...auth, phone: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="ac-end">Endereço</Label>
                      <Textarea
                        id="ac-end"
                        rows={2}
                        value={auth.address}
                        onChange={(e) => setAuth({ ...auth, address: e.target.value })}
                      />
                    </div>
                  </>
                )}
                <div className="space-y-1.5">
                  <Label htmlFor="ac-mail">E-mail</Label>
                  <Input
                    id="ac-mail"
                    type="email"
                    required
                    value={auth.email}
                    onChange={(e) => setAuth({ ...auth, email: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ac-senha">Senha</Label>
                  <Input
                    id="ac-senha"
                    type="password"
                    required
                    value={auth.password}
                    onChange={(e) => setAuth({ ...auth, password: e.target.value })}
                  />
                </div>
                <Button type="submit" className="w-full rounded-xl">
                  {authMode === "login" ? "Entrar e continuar" : "Criar conta e continuar"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full rounded-xl"
                  onClick={() => setCheckout(null)}
                >
                  Voltar
                </Button>
              </form>
            ) : (
              <form onSubmit={submit} className="animate-fade-up space-y-3">
                {checkout === "whatsapp" && (
                  <p className="rounded-xl bg-card px-3 py-2 text-xs text-muted-foreground">
                    Confirme seus dados abaixo. Vamos abrir o WhatsApp com o resumo completo do
                    pedido ♡
                  </p>
                )}
                <div className="space-y-1.5">
                  <Label htmlFor="nome">Nome completo</Label>
                  <Input
                    id="nome"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="tel">Telefone</Label>
                  <Input
                    id="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Tamanho</Label>
                  <div className="flex flex-wrap gap-2">
                    {SIZES.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setForm({ ...form, size: form.size === s ? "" : s })}
                        className={`min-w-12 rounded-xl border px-3 py-2 text-sm transition-colors ${
                          form.size === s
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Forma de recebimento</Label>
                  <div className="flex gap-2">
                    {(["Entrega", "Retirada"] as const).map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setForm({ ...form, delivery: d })}
                        className={`flex-1 rounded-xl border px-3 py-2 text-sm transition-colors ${
                          form.delivery === d
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border"
                        }`}
                      >
                        {d === "Entrega" ? "Envio/Entrega" : "Retirada"}
                      </button>
                    ))}
                  </div>
                </div>
                {form.delivery === "Entrega" && (
                  <div className="space-y-1.5">
                    <Label htmlFor="end">Endereço de entrega</Label>
                    <Textarea
                      id="end"
                      required
                      rows={2}
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                    />
                  </div>
                )}
                <div className="space-y-1.5">
                  <Label>Forma de pagamento</Label>
                  <div className="flex gap-2">
                    {["PIX", "Cartão"].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setForm({ ...form, payment: p })}
                        className={`flex-1 rounded-xl border px-3 py-2 text-sm transition-colors ${
                          form.payment === p
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                <Button type="submit" className="w-full rounded-xl">
                  {checkout === "whatsapp" ? (
                    <>
                      <MessageCircle className="mr-2 h-4 w-4" /> Enviar pedido no WhatsApp ·{" "}
                      {brl(total)}
                    </>
                  ) : (
                    <>Finalizar pedido · {brl(total)}</>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full rounded-xl"
                  onClick={() => setCheckout(null)}
                >
                  Voltar
                </Button>
              </form>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
