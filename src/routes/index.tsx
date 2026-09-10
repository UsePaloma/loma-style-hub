import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Heart, Instagram, MessageCircle, Sparkles } from "lucide-react";

import heroImage from "@/assets/hero.jpg";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { ProductCard } from "@/components/site/ProductCard";
import { ProductModal } from "@/components/site/ProductModal";
import { Button } from "@/components/ui/button";
import { brl, useStore, waLink, type Product } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "USE LOMA · Moda feminina com compra em grupo" },
      {
        name: "description",
        content:
          "Peças femininas elegantes com preço individual ou preço especial na compra em grupo. Peça pelo site ou pelo WhatsApp.",
      },
      { property: "og:title", content: "USE LOMA · Moda feminina com compra em grupo" },
      {
        property: "og:description",
        content: "Mais que moda, é você bem vestida ♡ Compre sozinha ou junte as amigas e economize.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const { settings, products, orders } = useStore();
  const [selected, setSelected] = useState<Product | null>(null);
  const [open, setOpen] = useState(false);

  const openProduct = (p: Product) => {
    setSelected(p);
    setOpen(true);
  };

  const activeGroups = products.filter((p) => p.currentPeople < p.minPeople);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* HERO */}
      <section className="bg-hero">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
          <div className="animate-fade-up space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-background/70 px-4 py-1.5 text-xs tracking-[0.2em] text-muted-foreground uppercase">
              <Heart className="h-3.5 w-3.5 text-gold" /> Nova coleção
            </span>
            <h1 className="font-display text-5xl leading-[1.05] text-foreground md:text-6xl">
              {settings.heroTitle}
            </h1>
            <p className="max-w-lg text-base leading-relaxed text-muted-foreground">
              {settings.heroSlogan}
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="#novidades">
                <Button size="lg" className="rounded-full px-7">
                  Ver novidades
                </Button>
              </a>
              <a href={settings.instagramUrl} target="_blank" rel="noreferrer">
                <Button size="lg" variant="outline" className="rounded-full px-7">
                  <Instagram className="mr-2 h-4 w-4" /> Siga nosso Instagram {settings.instagram}
                </Button>
              </a>
            </div>
            <a
              href={waLink(settings.whatsapp, "Olá! Quero pedir uma peça da USE LOMA ♡")}
              target="_blank"
              rel="noreferrer"
              className="block max-w-lg rounded-2xl bg-primary p-4 text-primary-foreground shadow-soft transition-transform hover:-translate-y-0.5"
            >
              <span className="flex items-center gap-2 text-sm font-medium">
                <MessageCircle className="h-4 w-4" /> Pedidos pelo WhatsApp
              </span>
              <span className="mt-1 block text-xs opacity-80">
                Me chama para pedir e separar sua peça ♡
              </span>
            </a>
          </div>
          <img
            src={heroImage}
            alt="Modelo vestindo peça da coleção USE LOMA"
            width={1200}
            height={1500}
            className="animate-fade-up h-[32rem] w-full rounded-2xl object-cover shadow-soft"
          />
        </div>
      </section>

      {/* CATÁLOGO */}
      <section id="novidades" className="mx-auto max-w-6xl scroll-mt-32 px-4 py-16">
        <div className="mb-10 text-center">
          <p className="text-xs tracking-[0.3em] text-muted-foreground uppercase">Coleções</p>
          <h2 id="colecoes" className="mt-2 font-display text-4xl">
            Novidades da semana
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Escolha sua peça sozinha ou entre em um grupo e pague menos.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} onOpen={openProduct} />
          ))}
        </div>
      </section>

      {/* COMPRA EM GRUPO */}
      <section id="grupo" className="scroll-mt-32 bg-card">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="mb-8 text-center">
            <h2 className="font-display text-4xl">Compra em Grupo</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Quando o número mínimo de meninas se junta, o preço especial é liberado para todas.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {activeGroups.map((p) => {
              const missing = p.minPeople - p.currentPeople;
              return (
                <button
                  key={p.id}
                  onClick={() => openProduct(p)}
                  className="flex items-center gap-4 rounded-2xl bg-background p-4 text-left shadow-soft transition-transform hover:-translate-y-0.5"
                >
                  <img
                    src={p.image}
                    alt={p.name}
                    loading="lazy"
                    className="h-20 w-20 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-display text-xl">{p.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Grupo #{p.groupCode} · {p.currentPeople}/{p.minPeople} pessoas
                    </p>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-card">
                      <div
                        className="h-full rounded-full bg-primary transition-[width] duration-700"
                        style={{ width: `${(p.currentPeople / p.minPeople) * 100}%` }}
                      />
                    </div>
                    <p className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary">
                      <Sparkles className="h-3 w-3 text-gold" />
                      {missing === 1
                        ? "Falta apenas 1 pessoa!"
                        : `Faltam ${missing} pessoas`} · {brl(p.groupPrice)}
                    </p>
                  </div>
                </button>
              );
            })}
            {activeGroups.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Todos os grupos atingiram a cota mínima ♡
              </p>
            )}
          </div>
        </div>
      </section>

      {/* PEDIDOS */}
      <section id="pedidos" className="mx-auto max-w-6xl scroll-mt-32 px-4 py-16 text-center">
        <h2 className="font-display text-4xl">Seus pedidos</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
          Já temos {orders.length} pedido{orders.length === 1 ? "" : "s"} registrados. Para
          acompanhar o seu, fale com a gente no WhatsApp informando seu nome e a peça escolhida.
        </p>
        <a
          href={waLink(settings.whatsapp, "Olá! Quero acompanhar o meu pedido ♡")}
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-block"
        >
          <Button size="lg" className="rounded-full px-8">
            <MessageCircle className="mr-2 h-4 w-4" /> Acompanhar pelo WhatsApp
          </Button>
        </a>
      </section>

      <Footer />
      <ProductModal product={selected} open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
