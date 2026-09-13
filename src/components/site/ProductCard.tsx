import { Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useMediaUrls } from "@/lib/media";
import { brl, type Product } from "@/lib/store";

export function ProductCard({
  product,
  onOpen,
}: {
  product: Product;
  onOpen: (p: Product) => void;
}) {
  const missing = Math.max(product.minPeople - product.currentPeople, 0);
  const urls = useMediaUrls(product.media);
  const firstPhoto = (product.media ?? []).find((m) => m.kind === "image" && urls[m.id]);
  const cover = firstPhoto ? urls[firstPhoto.id] : product.image;

  return (
    <article className="group animate-fade-up overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-transform duration-300 hover:-translate-y-1">
      <div className="relative overflow-hidden bg-background">
        <img
          src={cover}
          alt={product.name}
          loading="lazy"
          className="h-80 w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-[11px] font-medium tracking-wide text-primary-foreground">
          <Users className="h-3 w-3" /> Compra Coletiva Ativa
        </span>
      </div>
      <div className="space-y-3 p-5">
        <p className="text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
          {product.category}
        </p>
        <h3 className="font-display text-2xl leading-tight text-foreground">{product.name}</h3>
        <div className="flex items-end gap-3">
          <span className="text-sm text-muted-foreground line-through">{brl(product.price)}</span>
          <span className="text-xl font-semibold text-primary">{brl(product.groupPrice)}</span>
          <span className="text-xs text-gold-soft">em grupo</span>
        </div>
        <p className="text-xs text-muted-foreground">
          {missing > 0
            ? `Faltam ${missing} ${missing === 1 ? "pessoa" : "pessoas"} para liberar o preço em grupo`
            : "Cota completa · preço em grupo liberado"}
        </p>
        <Button className="w-full rounded-xl" onClick={() => onOpen(product)}>
          Ver oferta
        </Button>
      </div>
    </article>
  );
}
