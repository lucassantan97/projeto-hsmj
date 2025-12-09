import { cn } from "@/lib/utils";

export function MjLogo({ className }: { className?: string }) {
  return (
    <div className={cn("relative w-[60px] h-[50px] flex items-center justify-center", className)}>
      <svg viewBox="0 0 100 50" className="w-full h-full">
        {/* Gray Circle */}
        <circle cx="40" cy="25" r="20" fill="hsl(var(--mj-gray))" />
        
        {/* Orange Circle */}
        <circle cx="60" cy="25" r="20" fill="hsl(var(--mj-orange))" />
        
        {/* Road */}
        <path d="M 10 25 H 90" stroke="white" strokeWidth="5" />
        <path d="M 10 25 H 90" stroke="hsl(var(--mj-gray))" strokeWidth="1.5" strokeDasharray="4 4" />
      </svg>
    </div>
  );
}
