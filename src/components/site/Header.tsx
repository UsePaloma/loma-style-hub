import { Link } from "@tanstack/react-router";
import { Heart, Instagram, Lock, MessageCircle } from "lucide-react";

import { useStore, waLink } from "@/lib/store";

export function Header() {
  const { settings } = useStore();

  const nav = [
    { label: "Novidades", href: "#novidades" },
    { label: "Coleções", href: "#colecoes" },
    { label: "Compra em Grupo", href: "#grupo" },
    { label: "Pedidos", href: "#pedidos" },
  ];

  return (
    <header className="sticky top-0 z-40">
      <div className="bg-primary px-4 py-2 text-center text-xs tracking-wide text-primary-foreground sm:text-sm">
        {settings.topBar}
      </div>
      <div className="border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <Link to="/" className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-gold" strokeWidth={1.5} />
            <span className="font-display text-2xl leading-none font-semibold tracking-[0.18em] text-foreground uppercase">
              Use Loma
              <span className="ml-2 hidden font-sans text-[10px] tracking-[0.3em] text-muted-foreground sm:inline">
                MODA FEMININA
              </span>
            </span>
          </Link>

          <nav className="order-3 flex w-full flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground sm:order-2 sm:w-auto">
            {nav.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="transition-colors hover:text-foreground"
              >
                {item.label}
              </a>
            ))}
            <a
              href={waLink(settings.whatsapp, "Olá! Vim pelo site da USE LOMA ♡")}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
            <a
              href={settings.instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
            >
              <Instagram className="h-4 w-4" /> Instagram
            </a>
          </nav>

          <div className="order-2 flex items-center gap-2 sm:order-3">
            <Link
              to="/conta"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-medium tracking-wide text-primary-foreground transition-opacity hover:opacity-90"
            >
              <User className="h-3.5 w-3.5" /> Área do Cliente
            </Link>
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 rounded-full border border-primary/25 px-4 py-2 text-xs font-medium tracking-wide text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              <Lock className="h-3.5 w-3.5" /> Área Admin
            </Link>
          </div>

        </div>
      </div>
    </header>
  );
}
