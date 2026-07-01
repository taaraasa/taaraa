import Cover from "@/components/music/Cover";

export default function PageHeader({
  eyebrow,
  title,
  subtitle,
  seed,
  coverSrc,
  round = false,
}: {
  eyebrow: string;
  title: string;
  subtitle?: React.ReactNode;
  seed: string;
  coverSrc?: string | null;
  round?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-end">
      <div className="relative h-40 w-40 shrink-0 shadow-glow sm:h-52 sm:w-52">
        <Cover
          src={coverSrc}
          seed={seed}
          alt={title}
          className="absolute inset-0 h-full w-full"
          rounded={round ? "rounded-full" : "rounded-2xl"}
        />
      </div>
      <div className="text-center sm:text-left">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-starlight">{eyebrow}</p>
        <h1 className="mt-2 text-4xl font-black text-white sm:text-6xl">{title}</h1>
        {subtitle && <div className="mt-3 text-sm text-white/60">{subtitle}</div>}
      </div>
    </div>
  );
}
