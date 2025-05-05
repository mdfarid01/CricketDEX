import { cn } from "@/lib/utils";

interface DepthBarProps {
  type: "bid" | "ask";
  percentage: number;
}

export function DepthBar({ type, percentage }: DepthBarProps) {
  return (
    <div 
      className={cn(
        "absolute h-full",
        type === "bid" ? "bg-accent/20 right-0" : "bg-warning/20 left-0",
        "z-0"
      )}
      style={{ width: `${percentage}%` }}
    />
  );
}
