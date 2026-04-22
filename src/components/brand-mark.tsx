import { cn } from "@/lib/utils";

export function BrandMark({ className, showTagline = false }: { className?: string; showTagline?: boolean }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="relative flex h-11 w-11 items-center justify-center rounded-full border-2 border-accent bg-primary text-primary-foreground shadow-soft">
        <MomoIcon className="h-6 w-6 text-accent" />
      </div>
      <div className="flex flex-col leading-none">
        <span className="font-display text-lg font-bold tracking-tight text-primary">
          Asansol Momos
        </span>
        {showTagline && (
          <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Authentic Steamed Delights
          </span>
        )}
      </div>
    </div>
  );
}

export function MomoIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      {/* steam */}
      <path d="M9 3c0 1.5 1 1.5 1 3s-1 1.5-1 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M14 3c0 1.5 1 1.5 1 3s-1 1.5-1 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      {/* dumpling */}
      <path
        d="M3 14c0-3 4-5 9-5s9 2 9 5-4 5-9 5-9-2-9-5z"
        stroke="currentColor"
        strokeWidth="1.6"
        fill="currentColor"
        fillOpacity="0.18"
      />
      <path d="M7 14c1-1 3-1.5 5-1.5s4 .5 5 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M12 9v5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
