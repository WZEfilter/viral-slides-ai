import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { RotateCcw, Download, Share, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

interface Slide {
  id: string;
  imageUrl: string;
  caption: string;
  order: number;
  isSelected: boolean;
}

interface SlideEditorProps {
  slides: Slide[];
  onSlideUpdate: (slideId: string, updates: Partial<Slide>) => void;
  onRerollSlide: (slideId: string) => void;
  onSelectionChange: (slideIds: string[]) => void;
  className?: string;
}

export const SlideEditor = ({
  slides,
  onSlideUpdate,
  onRerollSlide,
  onSelectionChange,
  className
}: SlideEditorProps) => {
  const [previewMode, setPreviewMode] = useState(false);
  const selectedSlides = slides.filter(s => s.isSelected);

  const toggleSlideSelection = (slideId: string) => {
    const updatedSlides = slides.map(slide =>
      slide.id === slideId 
        ? { ...slide, isSelected: !slide.isSelected }
        : slide
    );
    onSelectionChange(updatedSlides.filter(s => s.isSelected).map(s => s.id));
  };

  const selectAll = () => {
    const allSelected = slides.every(s => s.isSelected);
    slides.forEach(slide => {
      onSlideUpdate(slide.id, { isSelected: !allSelected });
    });
    onSelectionChange(allSelected ? [] : slides.map(s => s.id));
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold text-foreground">
            Edit Slides ({slides.length})
          </h3>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={selectAll}
            >
              {slides.every(s => s.isSelected) ? 'Deselect All' : 'Select All'}
            </Button>
            {selectedSlides.length > 0 && (
              <Badge variant="secondary">
                {selectedSlides.length} selected
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPreviewMode(!previewMode)}
          >
            {previewMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {previewMode ? 'Edit' : 'Preview'}
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Share className="h-4 w-4 mr-1" />
            Share
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {slides.map((slide) => (
          <Card
            key={slide.id}
            className={`relative transition-all duration-300 ${
              slide.isSelected 
                ? 'ring-2 ring-primary border-primary' 
                : 'border-border hover:border-primary/50'
            }`}
          >
            <div className="p-4">
              {/* Slide Preview */}
              <div 
                className="aspect-[9/16] bg-muted rounded-lg mb-3 relative overflow-hidden cursor-pointer"
                onClick={() => toggleSlideSelection(slide.id)}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl opacity-50">🎨</span>
                </div>
                
                {/* Selection Indicator */}
                {slide.isSelected && (
                  <div className="absolute inset-0 bg-primary/20 border-2 border-primary rounded-lg" />
                )}
                
                {/* Slide Number */}
                <Badge className="absolute top-2 left-2 bg-background/80">
                  {slide.order}
                </Badge>
              </div>
              
              {/* Caption Editor */}
              {!previewMode && (
                <div className="space-y-3">
                  <Textarea
                    placeholder="Add a caption for this slide..."
                    value={slide.caption}
                    onChange={(e) => onSlideUpdate(slide.id, { caption: e.target.value })}
                    className="min-h-[80px] resize-none"
                  />
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onRerollSlide(slide.id)}
                      className="flex-1"
                    >
                      <RotateCcw className="h-3 w-3 mr-1" />
                      Reroll
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Preview Mode */}
              {previewMode && slide.caption && (
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-sm text-foreground">{slide.caption}</p>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
      
      {selectedSlides.length > 0 && (
        <Card className="mt-4 p-4 bg-primary/5 border-primary/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">
                Bulk Actions ({selectedSlides.length} slides)
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => selectedSlides.forEach(slide => onRerollSlide(slide.id))}
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Reroll Selected
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};