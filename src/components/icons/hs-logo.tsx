// Force rebuild: 2024-07-29T12:00:00Z
import { cn } from "@/lib/utils";

export function HsLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 65 50"
      className={cn("w-[65px] h-[50px]", className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="20" cy="20" r="20" fill="hsl(var(--hs-yellow))" />
      <text
        x="12"
        y="35"
        fontFamily="'Arial Black', sans-serif"
        fontSize="34"
        fontWeight="900"
        letterSpacing="-2"
        fill="hsl(var(--hs-red))"
      >
        HS
      </text>
    </svg>
  );
}
