
import { cn } from "@/lib/utils";

export function MjLogo({ className }: { className?: string }) {
  return (
    <div className={cn("relative w-[60px] h-[50px] flex items-center justify-center", className)}>
      <svg viewBox="0 0 100 50" className="w-full h-full">
        {/* Grey half-sphere with a dashed line inside */}
        <path d="M 40 45 A 25 25 0 0 1 40 5" fill="none" stroke="#808080" strokeWidth="15" />
        <path d="M 32 35 A 15 15 0 0 1 32 15" fill="none" stroke="white" strokeWidth="3" strokeDasharray="4 3" />
        
        {/* Orange sphere */}
        <circle cx="65" cy="25" r="25" fill="#F97316" />
        
        {/* Dashed line over the orange sphere */}
        <path d="M 40 25 H 90" stroke="white" strokeWidth="3" strokeDasharray="5 4" />
      </svg>
    </div>
  );
}
