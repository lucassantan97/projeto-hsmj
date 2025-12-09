import { cn } from "@/lib/utils";

export function MjLogo({ className }: { className?: string }) {
  return (
    <div className={cn("relative w-[60px] h-[50px] flex items-center justify-center overflow-hidden", className)}>
      <div className="absolute right-[5px] top-[5px] w-[35px] h-[35px] bg-mjOrange rounded-full z-[1]" />
      <div className="absolute left-[5px] bottom-[5px] w-[30px] h-[30px] bg-mjGray rounded-full z-0" />
      <div className="absolute w-[60px] h-[30px] border-b-4 border-dashed border-white rounded-full top-[15px] left-[-5px] z-[2] transform -rotate-12 shadow-[0_2px_0_rgba(0,0,0,0.1)]" />
    </div>
  );
}