import { useEffect, useState } from "react";
import { MessageCircle, Send, ShoppingBag, Sparkles, Users } from "lucide-react";
import { toast } from "sonner";

import { Countdown } from "@/components/site/Countdown";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { brl, useStore, waLink, type Product } from "@/lib/store";

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
  const { settings, addOrder } = useStore();
  const [mode, setMode] = useState<Mode>("grupo");
  const [checkout, setCheckout] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", address: "", payment: "PIX" });

  useEffect(() => {
    if (open) {
      setMode("grupo");
      setCheckout(false);
      setForm({ name: "", phone: "", address: "", payment: "PIX" });
    }
  }, [open, product?.id]);

  if (!product) return null;

  const total = mode === "grupo" ? product.groupPrice : product.price;
  const missing = Math.max(product.minPeople - product.currentPeople, 0);
  const progress = Math.min(100, (product.currentPeople / product.minPeople) * 100);

  const waMessage = `Olá! Quero pedir o produto ${product.name}. Tipo de Compra: ${
    mode === "grupo" ? `Grupo ${brl(product.groupPrice)}` : `Individual ${brl(product.price)}`
  }. Grupo ID: #${product.groupCode} (${
    missing > 0 ? `Falta${missing > 1 ? "m" : ""} ${missing} pessoa${missing > 1 ? "s" : ""}` : "cota completa"
  }). Por favor, separe minha peça! ♡`;

  const inviteMessage = `Oi! Estou montando um grupo na USE LOMA para comprar "${product.name}" por ${brl(
    product.groupPrice,
  )} (em vez de ${brl(product.price)}). Grupo #${product.groupCode} · ${
    missing > 0 ? `faltam ${missing}` : "cota completa"
  }. Bora comigo? ♡`;

  const submitSite = (e: React.FormEvent) => {
    e.preventDefault();
    addOrder({
      customer: form.name,
      phone: form.phone,
      address: form.address,
      payment: form.payment,
      productId: product.id,
      productName: product.name,
      type: mode === "grupo" ? "Grupo" : "Individual",
      total,
      status: mode === "grupo" && missing > 0 ? "Aguardando Cota do Grupo" : "Aguardando Pagamento",
      origin: "Site",
    });
    toast.success("Pedido registrado! Em breve entramos em contato ♡");
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
                <Button className="w-full rounded-xl" onClick={() => setCheckout(true)}>
                  {mode === "grupo"
                    ? `Participar deste grupo (${brl(product.groupPrice)})`
                    : `Comprar agora (${brl(product.price)})`}
                </Button>
                <a href={waLink(settings.whatsapp, waMessage)} target="_blank" rel="noreferrer">
                  <Button variant="outline" className="w-full rounded-xl">
                    <MessageCircle className="mr-2 h-4 w-4" /> Finalizar pelo WhatsApp
                  </Button>
                </a>
              </div>
            ) : (
              <form onSubmit={submitSite} className="animate-fade-up space-y-3">
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
                  <Label htmlFor="end">Endereço de entrega</Label>
                  <Textarea
                    id="end"
                    required
                    rows={2}
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                  />
                </div>
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
                  Finalizar pedido · {brl(total)}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full rounded-xl"
                  onClick={() => setCheckout(false)}
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
