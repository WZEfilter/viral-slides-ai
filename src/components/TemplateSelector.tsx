import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Crown, Sparkles } from "lucide-react";
import { useState } from "react";

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  isPremium: boolean;
  preview: string;
  tags: string[];
}

interface TemplateSelectorProps {
  templates: Template[];
  selectedTemplate: string;
  onTemplateChange: (templateId: string) => void;
  className?: string;
}

export const TemplateSelector = ({
  templates,
  selectedTemplate,
  onTemplateChange,
  className
}: TemplateSelectorProps) => {
  const [filter, setFilter] = useState<string>("all");
  
  const categories = ["all", ...Array.from(new Set(templates.map(t => t.category)))];
  
  const filteredTemplates = filter === "all" 
    ? templates 
    : templates.filter(t => t.category === filter);

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Choose Template</h3>
        <div className="flex gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setFilter(category)}
              className={`px-3 py-1 rounded-full text-sm transition-all ${
                filter === category
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map((template) => (
          <Card
            key={template.id}
            className={`relative cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
              selectedTemplate === template.id
                ? 'ring-2 ring-primary bg-primary/5 border-primary'
                : 'border-border hover:border-primary/50'
            }`}
            onClick={() => onTemplateChange(template.id)}
          >
            <div className="p-4">
              {/* Preview */}
              <div className="aspect-[9/16] bg-gradient-to-br from-muted/50 to-muted rounded-lg mb-3 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl opacity-50">{template.preview}</span>
                </div>
                {template.isPremium && (
                  <Crown className="absolute top-2 right-2 h-4 w-4 text-yellow-400" />
                )}
                {selectedTemplate === template.id && (
                  <CheckCircle2 className="absolute top-2 left-2 h-4 w-4 text-primary" />
                )}
              </div>
              
              {/* Content */}
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <h4 className="font-medium text-foreground">{template.name}</h4>
                  {template.isPremium && (
                    <Badge variant="secondary" className="text-xs">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Pro
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {template.description}
                </p>
                <div className="flex flex-wrap gap-1">
                  {template.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};