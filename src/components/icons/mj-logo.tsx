import { cn } from "@/lib/utils";

export function MjLogo({ className }: { className?: string }) {
  return (
    <div className={cn("relative w-[60px] h-[50px] flex items-center justify-center", className)}>
      <img 
        src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADgAAAAoCAYAAACrUDmFAAACXklEQVR4nO2YvWtUQRjGnz2p3YQoihgsbGz9CjY+QD+AZMF/YGFhYWWWloVdLAQLG8V/YGNhYSAIgpVFLRQD0bCwUYyJk4hf/BGh8w7c7e5u3r37DtwzMw/ffmfe2ZnF6bS6sClnFTOZHAYCgX5isbhc3kCgRNCr2h+8Z+f8bY/X69UaNzc3XcbjcfVwDhzAm3N9Go12qNfrZ/htgP5/DOB5qSSTyXo+n99c2scyU/gS4O3t7fVlKBTyK/zlsYJgB17Lso3W2V5W2TCA6XRa9ff3m6vA9HAhOD4+Pnl5eXn4VwG+DfgLcLgJgT2B8x2EAJSgHc34zC94wVf+s/01gAOCg0I1v8b+4eERgQJsm+L7vWxtbZkBHIZwTg+A1Wp1oHw+v3NxcfGL6el/AqxWC4jFYv8r/BfS9/f3h9PpvKswGvH4sOMKAPwV8JmBgNvt9gUAAIB2u50vAOcBvj+eZUlW9fX1pciy7E8L/gXwO4DP0xAg9q/xG4BOJpMtwzAUAIaGhq6j0WgrDBBCdDqdRyiKCnwB8D+gC4jGje+NfHh4+PH5+fkJgAt4HMBjBODLsixLz/O1gJ+J+N4H2yEAmUzWT09PDwI4D+B/i5fUArBH4uPjY8+y7BfH4/FLAacAPgDwXk+gVADs+xbgC4AnAZ4GuBHgNvz10Gg0dmpqanq/TqenpycAzwD8D+B+gMWKA2CvA/gMwF+APutHQ5/DMNQRhuHd7pS/APpA+6/pBwZElAAAAABJRU5ErkJggg==" 
        alt="MJ Locadora Logo" 
        className="w-full h-full object-contain"
      />
    </div>
  );
}
