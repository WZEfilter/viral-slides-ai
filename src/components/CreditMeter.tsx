import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Zap, TrendingUp } from "lucide-react";
import { CreditUsage } from "@/hooks/useCredits";

interface CreditMeterProps {
  availableCredits: number;
  usedThisMonth: number;
  creditsLimit: number;
  estimatedUsage?: CreditUsage;
  className?: string;
}

export const CreditMeter = ({ 
  availableCredits, 
  usedThisMonth, 
  creditsLimit,
  estimatedUsage,
  className 
}: CreditMeterProps) => {
  const remainingCredits = availableCredits - (estimatedUsage?.totalCredits || 0);
  const availablePercentage = (availableCredits / creditsLimit) * 100;
  const willExceedLimit = estimatedUsage && (usedThisMonth + estimatedUsage.totalCredits) > creditsLimit;
  
  return (
    <Card className={`p-6 bg-gradient-card border border-neo-purple/20 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <Zap className="h-5 w-5 text-neo-blue" />
        <span className="font-semibold text-foreground">Credit Usage</span>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Available credits</span>
          <span className="text-foreground font-medium">
            {availableCredits} / {creditsLimit}
          </span>
        </div>
        
        <Progress 
          value={Math.max(0, availablePercentage)} 
          className="h-3"
        />
        
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0</span>
          <span>{usedThisMonth} used this month</span>
          <span>{creditsLimit}</span>
        </div>
        
        {estimatedUsage && (
          <div className="pt-3 border-t border-neo-purple/10">
            <div className="flex justify-between items-center">
              <span className="text-sm text-foreground">This job will use:</span>
              <div className="flex items-center gap-2">
                <Badge 
                  variant={!willExceedLimit ? "default" : "destructive"}
                  className="text-xs"
                >
                  {estimatedUsage.totalCredits} credits
                </Badge>
                {willExceedLimit && (
                  <TrendingUp className="h-3 w-3 text-red-400" />
                )}
              </div>
            </div>
            {willExceedLimit && (
              <p className="text-xs text-red-400 mt-1">
                This will exceed your monthly limit
              </p>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};