import { coverGradient } from "@/lib/cover";

export default function DetailHeader({
  kind,
  title,
  subtitle,
  seed,
  round = false,
}: {
  kind: string;
  title: string;
  subtitle?: string;
  seed: string;
  round?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-end">
      <div
        className={`h-44 w-44 shrink-0 shadow-glow ${round ? "rounded-full" : "rounded-2xl"}`}
        style={{ background: coverGradient(seed) }}
      />
      <div className="text-center sm:text-left">
        <p className="text-xs font-semibold uppercase tracking-widest text-starlight">
          {kind}
        </p>
        <h1 className="mt-1 text-4xl font-bold text-white sm:text-5xl">{title}</h1>
        {subtitle && <p className="mt-3 text-sm text-white/60">{subtitle}</p>}
      </div>
    </div>
  );
}
