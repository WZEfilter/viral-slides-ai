import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Badge } from "@/components/ui/badge";
import { Zap, TrendingUp } from "lucide-react";
import { CreditUsage } from "@/hooks/useCredits";

interface CreditMeterProps {
  availableCredits: number;
  usedThisMonth: number;
  estimatedUsage?: CreditUsage;
  className?: string;
}

export const CreditMeter = ({ 
  availableCredits, 
  usedThisMonth, 
  estimatedUsage,
  className 
}: CreditMeterProps) => {
  const totalCredits = 180; // For demo - would come from plan
  const remainingCredits = availableCredits - (estimatedUsage?.totalCredits || 0);
  
  return (
    <Card className={`p-4 bg-gradient-card border border-neo-purple/20 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-neo-blue" />
          <span className="font-semibold text-foreground">Credits</span>
        </div>
        <Badge variant="outline" className="border-neo-purple/30">
          {availableCredits} left
        </Badge>
      </div>
      
      <ProgressBar 
        value={usedThisMonth} 
        max={totalCredits}
        variant={usedThisMonth > totalCredits * 0.8 ? "warning" : "default"}
        className="mb-3"
      />
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span>Used this month</span>
          <span>{usedThisMonth} / {totalCredits}</span>
        </div>
        
        {estimatedUsage && (
          <div className="flex justify-between items-center pt-2 border-t border-neo-purple/10">
            <span className="text-foreground">This job will use:</span>
            <div className="flex items-center gap-2">
              <Badge 
                variant={remainingCredits >= 0 ? "default" : "destructive"}
                className="text-xs"
              >
                {estimatedUsage.totalCredits} credits
              </Badge>
              {remainingCredits < 0 && (
                <TrendingUp className="h-3 w-3 text-red-400" />
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};