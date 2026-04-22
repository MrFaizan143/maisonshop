import { cn } from "@/lib/utils";

export function BrandMark({ className, showTagline = false }: { className?: string; showTagline?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <MomoIcon className="h-5 w-5 text-foreground" />
      <div className="flex flex-col leading-none">
        <span className="font-display text-base font-medium tracking-tight text-foreground">
          Asansol Momos
        </span>
        {showTagline && (
          <span className="mt-1 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            Est. 2023
          </span>
        )}
      </div>
    </div>
  );
}

export function MomoIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M9 3c0 1.5 1 1.5 1 3s-1 1.5-1 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M14 3c0 1.5 1 1.5 1 3s-1 1.5-1 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M3 14c0-3 4-5 9-5s9 2 9 5-4 5-9 5-9-2-9-5z" stroke="currentColor" strokeWidth="1.2" />
      <path d="M7 14c1-1 3-1.5 5-1.5s4 .5 5 1.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}
