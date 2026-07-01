export function Logo({ size = 40 }: { size?: number }) {
  return (
    <div className="flex items-center gap-3">
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden>
        <defs>
          <linearGradient id="taaraaStar" x1="0" y1="0" x2="48" y2="48">
            <stop stopColor="#aecbff" />
            <stop offset="1" stopColor="#ffd877" />
          </linearGradient>
        </defs>
        <path
          d="M24 2l4.9 13.1L42 18l-10.4 8.3L35 40 24 32l-11 8 3.4-13.7L6 18l13.1-2.9L24 2z"
          fill="url(#taaraaStar)"
        />
      </svg>
      <span className="text-2xl font-bold tracking-[0.25em] text-white">
        TAARAA
      </span>
    </div>
  );
}
