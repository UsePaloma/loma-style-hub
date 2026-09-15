import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Heart, Instagram, MessageCircle, Package, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

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
      { name: "description", content: "Peças femininas elegantes com preço individual ou preço especial na compra em grupo. Peça pelo site ou pelo WhatsApp." },
      { property: "og:title", content: "USE LOMA · Moda feminina com compra em grupo" },
      { property: "og:description", content: "Mais que moda, é você bem vestida ♡ Compre sozinha ou junte as amigas e economize." },
    ],
  }),
  component: Index,
});

function Index() {
  const { settings, products, currentCustomer, myOrders } = useStore();
  const [selected, setSelected] = useState<Product | null>(null);
  const [open, setOpen] = useState(false);
  const [slide, setSlide] = useState(0);

  const openProduct = (p: Product) => { setSelected(p); setOpen(true); };
  const activeGroups = products.filter((p) => p.currentPeople < p.minPeople);
  const featured = products.length ? products.slice(0, Math.min(products.length, 4)) : [];

  useEffect(() => {
    if (featured.length < 2) return;
    const timer = window.setInterval(() => setSlide((value) => (value + 1) % featured.length), 5000);
    return () => window.clearInterval(timer);
  }, [featured.length]);

  const next = () => setSlide((value) => (value + 1) % Math.max(featured.length, 1));
  const previous = () => setSlide((value) => (value - 1 + Math.max(featured.length, 1)) % Math.max(featured.length, 1));
  const featuredProduct = featured[slide];

  return <div className="min-h-screen bg-background">
    <Header />

    <section className="bg-hero">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
        <div className="animate-fade-up space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-background/70 px-4 py-1.5 text-xs tracking-[0.2em] text-muted-foreground uppercase"><Heart className="h-3.5 w-3.5 text-gold" /> Nova coleção</span>
          <h1 className="font-display text-5xl leading-[1.05] text-foreground md:text-6xl">{settings.heroTitle}</h1>
          <p className="max-w-lg text-base leading-relaxed text-muted-foreground">{settings.heroSlogan}</p>
          <div className="flex flex-wrap gap-3"><a href="#novidades"><Button size="lg" className="rounded-full px-7">Ver novidades</Button></a><a href={settings.instagramUrl} target="_blank" rel="noreferrer"><Button size="lg" variant="outline" className="rounded-full px-7"><Instagram className="mr-2 h-4 w-4" /> Siga nosso Instagram {settings.instagram}</Button></a></div>
          <a href={waLink(settings.whatsapp, "Olá! Quero pedir uma peça da USE LOMA ♡")} target="_blank" rel="noreferrer" className="block max-w-lg rounded-2xl bg-primary p-4 text-primary-foreground shadow-soft transition-transform hover:-translate-y-0.5"><span className="flex items-center gap-2 text-sm font-medium"><MessageCircle className="h-4 w-4" /> Pedidos pelo WhatsApp</span><span className="mt-1 block text-xs opacity-80">Me chama para pedir e separar sua peça ♡</span></a>
        </div>
        <img src={settings.heroImage || heroImage} alt="Modelo vestindo peça da coleção USE LOMA" width={1200} height={1500} className="animate-fade-up h-[32rem] w-full rounded-2xl object-cover shadow-soft" />
      </div>
    </section>

    <section id="novidades" className="mx-auto max-w-6xl scroll-mt-32 px-4 py-16">
      <div className="mb-8 text-center"><p className="text-xs tracking-[0.3em] text-muted-foreground uppercase">Curadoria USE LOMA</p><h2 id="colecoes" className="mt-2 font-display text-4xl md:text-5xl">Novidades da semana</h2><p className="mt-2 text-sm text-muted-foreground">Uma seleção especial para destacar seu próximo look.</p></div>
      {featuredProduct ? <div className="relative overflow-hidden rounded-[2rem] bg-card shadow-soft">
        <div className="grid min-h-[30rem] md:grid-cols-2">
          <button type="button" className="group relative min-h-[22rem] overflow-hidden text-left" onClick={() => openProduct(featuredProduct)} aria-label={`Ver ${featuredProduct.name}`}>
            <img src={featuredProduct.image} alt={featuredProduct.name} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
            <div className="absolute bottom-5 left-5 rounded-full bg-background/90 px-4 py-2 text-xs tracking-[0.2em] text-foreground uppercase">Destaque da semana</div>
          </button>
          <div className="flex flex-col justify-center p-7 md:p-12">
            <p className="text-xs tracking-[0.25em] text-muted-foreground uppercase">{featuredProduct.category}</p>
            <h3 className="mt-3 font-display text-4xl leading-tight md:text-5xl">{featuredProduct.name}</h3>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">{featuredProduct.description}</p>
            <div className="mt-7 flex flex-wrap items-end gap-5"><div><p className="text-xs text-muted-foreground">Preço individual</p><p className="font-display text-3xl">{brl(featuredProduct.price)}</p></div><div><p className="text-xs text-muted-foreground">No grupo</p><p className="font-display text-3xl text-primary">{brl(featuredProduct.groupPrice)}</p></div></div>
            <Button size="lg" className="mt-7 w-full rounded-full sm:w-fit" onClick={() => openProduct(featuredProduct)}>Ver produto</Button>
          </div>
        </div>
        {featured.length > 1 && <><button type="button" onClick={previous} aria-label="Slide anterior" className="absolute left-4 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-background/90 shadow-soft transition-transform hover:scale-105"><ChevronLeft className="h-5 w-5" /></button><button type="button" onClick={next} aria-label="Próximo slide" className="absolute right-4 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-background/90 shadow-soft transition-transform hover:scale-105"><ChevronRight className="h-5 w-5" /></button><div className="absolute bottom-5 right-1/2 flex translate-x-1/2 gap-1.5 md:right-6 md:translate-x-0">{featured.map((p, i) => <button key={p.id} type="button" onClick={() => setSlide(i)} aria-label={`Ir para slide ${i + 1}`} className={`h-1.5 rounded-full transition-all ${i === slide ? "w-7 bg-primary" : "w-2 bg-background/80"}`} />)}</div></>}
      </div> : <p className="rounded-2xl bg-card p-8 text-center text-sm text-muted-foreground">Novos produtos em breve ♡</p>}

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{products.map((product) => <ProductCard key={product.id} product={product} onOpen={openProduct} />)}</div>
    </section>

    <section id="grupo" className="scroll-mt-32 bg-card"><div className="mx-auto max-w-6xl px-4 py-16"><div className="mb-8 text-center"><h2 className="font-display text-4xl">Compra em Grupo</h2><p className="mt-2 text-sm text-muted-foreground">Quando o número mínimo de meninas se junta, o preço especial é liberado para todas.</p></div><div className="grid gap-4 md:grid-cols-2">{activeGroups.map((p) => { const missing = p.minPeople - p.currentPeople; return <button key={p.id} onClick={() => openProduct(p)} className="flex items-center gap-4 rounded-2xl bg-background p-4 text-left shadow-soft transition-transform hover:-translate-y-0.5"><img src={p.image} alt={p.name} loading="lazy" className="h-20 w-20 rounded-xl object-cover" /><div className="flex-1"><p className="font-display text-xl">{p.name}</p><p className="text-xs text-muted-foreground">Grupo #{p.groupCode} · {p.currentPeople}/{p.minPeople} pessoas</p><div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-card"><div className="h-full rounded-full bg-primary transition-[width] duration-700" style={{ width: `${Math.min(100, (p.currentPeople / p.minPeople) * 100)}%` }} /></div><p className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary"><Sparkles className="h-3 w-3 text-gold" />{missing === 1 ? "Falta apenas 1 pessoa!" : `Faltam ${missing} pessoas`} · {brl(p.groupPrice)}</p></div></button>; })}{activeGroups.length === 0 && <p className="text-sm text-muted-foreground">Todos os grupos atingiram a cota mínima ♡</p>}</div></div></section>

    <section id="pedidos" className="scroll-mt-32 px-4 py-16"><div className="mx-auto max-w-6xl"><div className="mb-8 text-center"><p className="text-xs tracking-[0.3em] text-muted-foreground uppercase">Acompanhamento</p><h2 className="mt-2 font-display text-4xl">Seus pedidos</h2><p className="mt-2 text-sm text-muted-foreground">{currentCustomer ? `Olá, ${currentCustomer.name.split(" ")[0]}! Aqui estão seus pedidos e os status mais recentes.` : "Entre na sua conta para acompanhar seus pedidos diretamente por aqui."}</p></div>
      {currentCustomer ? <div className="grid gap-4 md:grid-cols-2">{myOrders.length ? myOrders.slice(0, 6).map((order) => <div key={order.id} className="rounded-2xl bg-card p-5 shadow-soft"><div className="flex items-start justify-between gap-3"><div><p className="flex items-center gap-2 font-display text-xl"><Package className="h-4 w-4 text-gold" /> {order.productName}</p><p className="mt-1 text-xs text-muted-foreground">Pedido #{order.id} · {order.type} · {brl(order.total)}</p></div><span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-medium text-primary">{order.status}</span></div><div className="mt-4 h-1.5 overflow-hidden rounded-full bg-background"><div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(12, ((["Aguardando Pagamento", "Aguardando Cota do Grupo", "Em Separação", "Enviado", "Concluído"].indexOf(order.status) + 1) / 5) * 100)}%` }} /></div></div>) : <div className="rounded-2xl bg-card p-8 text-center shadow-soft"><Package className="mx-auto h-8 w-8 text-gold" /><p className="mt-3 font-display text-xl">Você ainda não tem pedidos</p><p className="mt-1 text-sm text-muted-foreground">Quando fizer um pedido pelo site com sua conta, ele aparecerá aqui.</p></div>}<div className="md:col-span-2 text-center"><Link to="/conta"><Button variant="outline" className="rounded-full">Ver minha conta e pedidos</Button></Link></div></div> : <div className="mx-auto max-w-xl rounded-2xl bg-card p-8 text-center shadow-soft"><Package className="mx-auto h-8 w-8 text-gold" /><p className="mt-3 font-display text-2xl">Acompanhe seus pedidos</p><p className="mt-2 text-sm text-muted-foreground">Faça login para visualizar seus pedidos, status, endereço e opções de recebimento.</p><Link to="/conta"><Button className="mt-5 rounded-full px-7">Entrar na minha conta</Button></Link></div>}
    </div></section>

    <Footer /><ProductModal product={selected} open={open} onClose={() => setOpen(false)} />
  </div>;
}
