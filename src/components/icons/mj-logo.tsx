import { cn } from "@/lib/utils";

export function MjLogo({ className }: { className?: string }) {
  return (
    <div className={cn("relative w-[60px] h-[50px] flex items-center justify-center", className)}>
      <svg width="60" height="50" viewBox="0 0 78 57" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M54.593 56.1102C66.8624 56.1102 76.702 46.417 76.702 34.3313C76.702 22.2455 66.8624 12.5524 54.593 12.5524C42.3236 12.5524 32.484 22.2455 32.484 34.3313C32.484 46.417 42.3236 56.1102 54.593 56.1102Z" fill="#EA702E"/>
        <path d="M22.8468 43.1539C35.1162 43.1539 44.9558 33.4608 44.9558 21.375C44.9558 9.28923 35.1162 -0.40387 22.8468 -0.40387C10.5774 -0.40387 0.737793 9.28923 0.737793 21.375C0.737793 33.4608 10.5774 43.1539 22.8468 43.1539Z" fill="#A1A1A1"/>
        <path d="M-5.32178 30.2949H12.9231L16.9529 26.307H36.3197M79.7318 30.2949H61.487L57.4572 26.307H38.0904" stroke="white" strokeWidth="3.96154" strokeDasharray="7.92 7.92"/>
      </svg>
    </div>
  );
}
