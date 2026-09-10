import { Heart, Instagram, MessageCircle } from "lucide-react";

import { useStore, waLink } from "@/lib/store";

export function Footer() {
  const { settings } = useStore();

  return (
    <footer className="mt-24 border-t border-border bg-card">
      <div className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {settings.badges.map((badge, i) => (
            <div
              key={i}
              className="rounded-2xl bg-background/70 p-5 text-center shadow-soft"
            >
              <div className="text-2xl">{badge.icon}</div>
              <h3 className="mt-3 font-display text-xl text-foreground">{badge.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{badge.subtitle}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-[2fr_1fr]">
          <div>
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-gold" strokeWidth={1.5} />
              <span className="font-display text-xl tracking-[0.2em] uppercase">Use Loma</span>
            </div>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
              {settings.footerAbout}
            </p>
          </div>
          <div className="flex flex-col gap-3 text-sm">
            <a
              href={settings.instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-foreground transition-colors hover:text-gold"
            >
              <Instagram className="h-4 w-4" /> {settings.instagram}
            </a>
            <a
              href={waLink(settings.whatsapp, "Olá! Quero saber mais sobre as peças ♡")}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-foreground transition-colors hover:text-gold"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp de pedidos
            </a>
          </div>
        </div>

        <p className="mt-10 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          {settings.copyright}
        </p>
      </div>
    </footer>
  );
}
