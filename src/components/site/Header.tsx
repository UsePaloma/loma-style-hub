import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Heart, Instagram, Menu, MessageCircle, User, X } from "lucide-react";

import { useStore, waLink } from "@/lib/store";

export function Header() {
  const { settings } = useStore();
  const [isHidden, setIsHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY <= 0) {
        setIsHidden(false);
      } else if (currentScrollY > lastScrollY.current) {
        setIsHidden(true);
        setMenuOpen(false);
      } else if (currentScrollY < lastScrollY.current) {
        setIsHidden(false);
        setMenuOpen(false);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const nav = [
    { label: "Novidades", href: "#novidades" },
    { label: "Coleções", href: "#colecoes" },
    { label: "Compra em Grupo", href: "#grupo" },
    { label: "Pedidos", href: "#pedidos" },
  ];

  return (
    <header
      className={`sticky top-0 z-40 transition-transform duration-300 ease-in-out ${
        isHidden ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="bg-primary px-3 py-2 text-center text-[10px] leading-tight tracking-wide text-primary-foreground sm:px-4 sm:text-xs md:text-sm">
        {settings.topBar}
      </div>
      <div className="border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-3 py-3 sm:px-4 sm:py-4">
          <Link to="/" className="flex min-w-0 items-center gap-2" onClick={() => setMenuOpen(false)}>
            <Heart className="h-5 w-5 shrink-0 text-gold" strokeWidth={1.5} />
            <span className="truncate font-display text-xl leading-none font-semibold tracking-[0.12em] text-foreground uppercase sm:text-2xl sm:tracking-[0.18em]">
              Use Loma
              <span className="ml-2 hidden font-sans text-[10px] tracking-[0.3em] text-muted-foreground lg:inline">
                MODA FEMININA
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-x-5 gap-y-2 text-sm text-muted-foreground md:flex lg:gap-x-6">
            {nav.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="whitespace-nowrap transition-colors hover:text-foreground"
              >
                {item.label}
              </a>
            ))}
            <a
              href={waLink(settings.whatsapp, "Olá! Vim pelo site da USE LOMA ♡")}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 whitespace-nowrap transition-colors hover:text-foreground"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
            <a
              href={settings.instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 whitespace-nowrap transition-colors hover:text-foreground"
            >
              <Instagram className="h-4 w-4" /> Instagram
            </a>
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <Link
              to="/conta"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-3 py-2 text-xs font-medium tracking-wide text-primary-foreground transition-opacity hover:opacity-90 sm:px-4"
              onClick={() => setMenuOpen(false)}
            >
              <User className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Área do Cliente</span>
              <span className="sm:hidden">Conta</span>
            </Link>
            <button
              type="button"
              aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:bg-muted md:hidden"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="border-t border-border px-3 pb-4 pt-2 md:hidden">
            <nav className="mx-auto flex max-w-6xl flex-col gap-1 rounded-2xl bg-card p-2 shadow-soft">
              {nav.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl px-4 py-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {item.label}
                </a>
              ))}
              <a
                href={waLink(settings.whatsapp, "Olá! Vim pelo site da USE LOMA ♡")}
                target="_blank"
                rel="noreferrer"
                onClick={() => setMenuOpen(false)}
                className="inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
              <a
                href={settings.instagramUrl}
                target="_blank"
                rel="noreferrer"
                onClick={() => setMenuOpen(false)}
                className="inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Instagram className="h-4 w-4" /> Instagram
              </a>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
