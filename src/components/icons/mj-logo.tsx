
import { cn } from "@/lib/utils";

export function MjLogo({ className }: { className?: string }) {
  return (
    <div className={cn("relative w-[60px] h-[50px] flex items-center justify-center", className)}>
      <svg viewBox="0 0 100 50" className="w-full h-full">
        <defs>
            <clipPath id="clip-half">
                <rect x="0" y="0" width="30" height="50" />
            </clipPath>
        </defs>
        <g transform="translate(10, 0)">
            <circle cx="30" cy="25" r="20" fill="#A1A1AA" clipPath="url(#clip-half)" />
            <path d="M10 25 H 50" stroke="white" strokeWidth="3" strokeDasharray="5,3" />
        </g>
        <g transform="translate(0, 2)">
            <circle cx="70" cy="23" r="23" fill="#F97316" />
            <path d="M47 23 H 93" stroke="white" strokeWidth="4" strokeDasharray="7,4" />
        </g>
      </svg>
    </div>
  );
}
