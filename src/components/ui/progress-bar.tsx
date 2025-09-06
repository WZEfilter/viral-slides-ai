import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max: number;
  className?: string;
  showLabel?: boolean;
  variant?: "default" | "success" | "warning" | "danger";
}

const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  ({ value, max, className, showLabel = false, variant = "default", ...props }, ref) => {
    const percentage = Math.min((value / max) * 100, 100);
    
    const getVariantClasses = () => {
      switch (variant) {
        case "success":
          return "bg-green-500/20 after:bg-green-500";
        case "warning":
          return "bg-yellow-500/20 after:bg-yellow-500";
        case "danger":
          return "bg-red-500/20 after:bg-red-500";
        default:
          return "bg-primary/20 after:bg-gradient-hero";
      }
    };

    return (
      <div ref={ref} className={cn("w-full", className)} {...props}>
        {showLabel && (
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Usage</span>
            <span>{value} / {max}</span>
          </div>
        )}
        <div 
          className={cn(
            "relative h-2 rounded-full overflow-hidden",
            getVariantClasses()
          )}
        >
          <div 
            className="absolute top-0 left-0 h-full rounded-full transition-all duration-500 ease-out after:content-[''] after:absolute after:inset-0 after:rounded-full"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  }
);

ProgressBar.displayName = "ProgressBar";

export { ProgressBar };