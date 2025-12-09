import { cn } from "@/lib/utils";

export function HsLogo({ className }: { className?: string }) {
  return (
    <div className={cn("relative w-[60px] h-[50px] flex items-center justify-center", className)}>
      <div className="absolute left-[-5px] top-[-5px] w-[40px] h-[40px] bg-hsYellow rounded-full shadow-[0_0_10px_rgba(251,191,36,0.4)] z-0" />
      <span className="relative z-10 font-black text-4xl text-hsRed leading-none text-shadow-[2px_2px_0px_white] tracking-[-2px]" style={{ fontFamily: "'Arial Black', sans-serif" }}>
        HS
      </span>
    </div>
  );
}