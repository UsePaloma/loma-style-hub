import { useEffect, useState } from "react";
import { Timer } from "lucide-react";

function diff(target: string) {
  const ms = new Date(target).getTime() - Date.now();
  if (Number.isNaN(ms) || ms <= 0) return null;
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  const s = Math.floor((ms % 60_000) / 1000);
  return `${String(h).padStart(2, "0")}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`;
}

export function Countdown({ deadline }: { deadline: string }) {
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    setLabel(diff(deadline));
    const id = setInterval(() => setLabel(diff(deadline)), 1000);
    return () => clearInterval(id);
  }, [deadline]);

  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-primary/8 px-3 py-1.5 text-xs font-medium text-primary">
      <Timer className="h-3.5 w-3.5" />
      {label ? `A cota fecha em ${label}` : "Cota encerrada"}
    </div>
  );
}
