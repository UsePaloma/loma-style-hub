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
  const { settings, addOrder, currentCustomer } = useStore();
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

  useEffect(() => {
    if (open) {
      setMode("grupo");
      setCheckout(null);
      setForm({
        name: currentCustomer?.name ?? "",
        phone: currentCustomer?.phone ?? "",
        address: currentCustomer?.address ?? "",
        payment: "PIX",
        delivery: "Entrega",
        size: "",
      });
    }
  }, [open, product?.id, currentCustomer]);

  if (!product) return null;

  const total = mode === "grupo" ? product.groupPrice : product.price;
  const missing = Math.max(product.minPeople - product.currentPeople, 0);
  const progress = Math.min(100, (product.currentPeople / product.minPeople) * 100);

  const inviteMessage = `Oi! Estou montando um grupo na USE LOMA para comprar "${product.name}" por ${brl(
    product.groupPrice,
  )} (em vez de ${brl(product.price)}). Grupo #${product.groupCode} · ${
    missing > 0 ? `faltam ${missing}` : "cota completa"
  }. Bora comigo? ♡`;

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

    if (channel === "WhatsApp") {
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
      toast.success("Pedido registrado! Continue a conversa no WhatsApp ♡");
    } else {
      toast.success("Pedido registrado! Em breve entramos em contato ♡");
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
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="h-72 w-full rounded-2xl object-cover md:h-full"
          />

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
