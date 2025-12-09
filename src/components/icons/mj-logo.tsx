import { cn } from "@/lib/utils";

export function MjLogo({ className }: { className?: string }) {
  return (
    <div className={cn("relative w-[60px] h-[50px] flex items-center justify-center", className)}>
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <path d="M0 0 H100 V100 H0 Z" fill="#1C1C1C" />
        <path d="M100 0 C 50 0, 50 50, 0 50 V 0 Z" fill="#F97316" />
        <circle cx="50" cy="50" r="40" fill="white" />
        <circle cx="60" cy="50" r="20" fill="#F97316" />
        <circle cx="40" cy="50" r="15" fill="#A1A1AA" />
        <path d="M25 65 C 40 40, 60 40, 75 65" fill="none" stroke="black" strokeWidth="8" />
        <path d="M25 65 C 40 40, 60 40, 75 65" fill="none" stroke="white" strokeWidth="1" strokeDasharray="5,5" />
      </svg>
    </div>
  );
}
