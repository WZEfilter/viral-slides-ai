import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { CheckCircle2, Clock, Zap } from "lucide-react";

interface GenerationStep {
  id: string;
  label: string;
  status: "pending" | "processing" | "completed" | "error";
  duration?: number;
}

interface GenerationProgressProps {
  steps: GenerationStep[];
  currentStep: number;
  className?: string;
}

export const GenerationProgress = ({ 
  steps, 
  currentStep, 
  className 
}: GenerationProgressProps) => {
  const progress = (currentStep / steps.length) * 100;
  
  return (
    <Card className={`p-6 bg-gradient-card border border-neo-purple/20 ${className}`}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Generating Your Slideshow</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Zap className="h-4 w-4" />
            <span>Step {currentStep + 1} of {steps.length}</span>
          </div>
        </div>
        
        <Progress value={progress} className="h-2" />
        
        <div className="space-y-3">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                index === currentStep 
                  ? 'bg-primary/10 border border-primary/20' 
                  : index < currentStep
                  ? 'bg-green-500/10 border border-green-500/20'
                  : 'bg-muted/20'
              }`}
            >
              <div className="flex-shrink-0">
                {step.status === "completed" && (
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                )}
                {step.status === "processing" && (
                  <LoadingSpinner size="sm" />
                )}
                {step.status === "pending" && (
                  <Clock className="h-5 w-5 text-muted-foreground" />
                )}
                {step.status === "error" && (
                  <div className="h-5 w-5 rounded-full bg-red-500" />
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className={`font-medium ${
                    step.status === "completed" ? 'text-green-400' :
                    step.status === "processing" ? 'text-primary' :
                    'text-muted-foreground'
                  }`}>
                    {step.label}
                  </span>
                  {step.duration && (
                    <span className="text-xs text-muted-foreground">
                      ~{step.duration}s
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center pt-2">
          <p className="text-sm text-muted-foreground">
            Creating high-quality content just for you...
          </p>
        </div>
      </div>
    </Card>
  );
};