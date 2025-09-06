import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  Download, 
  Share2, 
  Edit,
  RefreshCw,
  Play,
  Calendar,
  Instagram,
  MessageCircle,
  Globe,
  CheckCircle,
  Zap,
  Eye,
  Heart
} from "lucide-react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";

const GenerationResults = () => {
  const [selectedSlides, setSelectedSlides] = useState<number[]>([]);
  const [generationProgress, setGenerationProgress] = useState(100);
  
  // Mock generated slides data
  const generatedSlides = [
    { id: 1, url: "/api/placeholder/400/600", rerolled: false },
    { id: 2, url: "/api/placeholder/400/600", rerolled: false },
    { id: 3, url: "/api/placeholder/400/600", rerolled: true },
    { id: 4, url: "/api/placeholder/400/600", rerolled: false },
    { id: 5, url: "/api/placeholder/400/600", rerolled: false },
    { id: 6, url: "/api/placeholder/400/600", rerolled: false },
  ];

  const platforms = [
    { id: "instagram", name: "Instagram", icon: Instagram, color: "bg-gradient-to-br from-purple-500 to-pink-500" },
    { id: "tiktok", name: "TikTok", icon: MessageCircle, color: "bg-black" },
    { id: "pinterest", name: "Pinterest", icon: Globe, color: "bg-red-600" },
  ];

  const toggleSlideSelection = (slideId: number) => {
    setSelectedSlides(prev => 
      prev.includes(slideId) 
        ? prev.filter(id => id !== slideId)
        : [...prev, slideId]
    );
  };

  const rerollSlide = (slideId: number) => {
    // Simulate reroll logic
    console.log(`Rerolling slide ${slideId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-primary">
      <Navigation />
      
      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <Link to="/create">
                <Button variant="ghost" size="sm" className="mr-4">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Create
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Generation Complete!</h1>
                <p className="text-muted-foreground">Review and publish your slideshow</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                <CheckCircle className="h-4 w-4 mr-2" />
                Success
              </Badge>
            </div>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Generated Slides Grid */}
            <div className="lg:col-span-3">
              <Card className="p-6 bg-gradient-card border border-neo-purple/20">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-foreground">Generated Slides</h2>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">6 slides</Badge>
                    <Badge className="bg-neo-purple/20 text-neo-purple border-neo-purple/30">
                      <Zap className="h-3 w-3 mr-1" />
                      6 credits used
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  {generatedSlides.map((slide) => (
                    <div
                      key={slide.id}
                      className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                        selectedSlides.includes(slide.id)
                          ? "border-neo-purple shadow-glow-primary"
                          : "border-neo-purple/20 hover:border-neo-purple/40"
                      }`}
                      onClick={() => toggleSlideSelection(slide.id)}
                    >
                      {/* Slide Image */}
                      <div className="aspect-[3/4] bg-gradient-to-br from-neo-purple/30 to-neo-pink/30">
                        <div className="absolute inset-0 bg-gradient-to-br from-neo-purple/20 to-transparent" />
                        
                        {/* Slide Number */}
                        <div className="absolute top-2 left-2 z-10">
                          <Badge className="bg-background/80 text-foreground">
                            {slide.id}
                          </Badge>
                        </div>

                        {/* Reroll Indicator */}
                        {slide.rerolled && (
                          <div className="absolute top-2 right-2 z-10">
                            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                              Rerolled
                            </Badge>
                          </div>
                        )}

                        {/* Selection Indicator */}
                        {selectedSlides.includes(slide.id) && (
                          <div className="absolute inset-0 bg-neo-purple/20 flex items-center justify-center">
                            <CheckCircle className="h-8 w-8 text-neo-purple" />
                          </div>
                        )}

                        {/* Hover Actions */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 backdrop-blur-sm flex items-center justify-center">
                          <div className="flex space-x-2">
                            <Button
                              variant="glass"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                // Preview slide
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="glass"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                rerollSlide(slide.id);
                              }}
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bulk Actions */}
                <div className="flex items-center justify-between p-4 bg-muted/10 rounded-lg border border-neo-purple/20">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-muted-foreground">
                      {selectedSlides.length} slide{selectedSlides.length !== 1 ? 's' : ''} selected
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedSlides(generatedSlides.map(s => s.id))}
                    >
                      Select All
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedSlides([])}
                    >
                      Deselect All
                    </Button>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button variant="glass" size="sm" disabled={selectedSlides.length === 0}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Reroll Selected
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download All
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Video Preview */}
              <Card className="p-6 bg-gradient-card border border-neo-purple/20 mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">Generated Video (1:02)</h3>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    Ready
                  </Badge>
                </div>

                <div className="aspect-[9/16] max-w-xs bg-gradient-to-br from-neo-purple/30 to-neo-pink/30 rounded-lg overflow-hidden relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Button variant="hero" size="lg" className="group">
                      <Play className="h-6 w-6 mr-2 group-hover:scale-110 transition-transform" />
                      Preview Video
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            {/* Sidebar Actions */}
            <div className="space-y-6">
              {/* Publishing Options */}
              <Card className="p-6 bg-gradient-card border border-neo-purple/20">
                <h3 className="text-lg font-semibold text-foreground mb-4">Publish Content</h3>
                
                <div className="space-y-4">
                  {platforms.map((platform) => (
                    <div key={platform.id} className="p-3 rounded-lg border border-neo-purple/20 hover:border-neo-purple/40 transition-colors">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className={`p-2 rounded-lg ${platform.color}`}>
                          <platform.icon className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-medium text-foreground">{platform.name}</span>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button variant="neon" size="sm" className="flex-1">
                          Draft
                        </Button>
                        <Button variant="glass" size="sm" className="flex-1">
                          Publish
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-3 bg-muted/10 rounded-lg border border-neo-purple/20">
                  <div className="flex items-center mb-2">
                    <Calendar className="h-4 w-4 mr-2 text-neo-purple" />
                    <span className="text-sm font-medium text-foreground">Schedule for later</span>
                  </div>
                  <Button variant="ghost" size="sm" className="w-full">
                    Set Schedule
                  </Button>
                </div>
              </Card>

              {/* Save Options */}
              <Card className="p-6 bg-gradient-card border border-neo-purple/20">
                <h3 className="text-lg font-semibold text-foreground mb-4">Save & Share</h3>
                
                <div className="space-y-3">
                  <Button variant="glass" className="w-full justify-start">
                    <Download className="mr-2 h-4 w-4" />
                    Download ZIP
                  </Button>
                  
                  <Button variant="glass" className="w-full justify-start">
                    <Share2 className="mr-2 h-4 w-4" />
                    Share Link
                  </Button>
                  
                  <Button variant="ghost" className="w-full justify-start">
                    <Edit className="mr-2 h-4 w-4" />
                    Save as Scenario
                  </Button>
                </div>
              </Card>

              {/* Stats Preview */}
              <Card className="p-6 bg-gradient-card border border-neo-pink/20">
                <h3 className="text-lg font-semibold text-foreground mb-4">Predicted Performance</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Eye className="h-4 w-4 mr-2 text-neo-blue" />
                      <span className="text-sm text-foreground">Est. Views</span>
                    </div>
                    <span className="font-semibold text-neo-blue">8.2K - 15.6K</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Heart className="h-4 w-4 mr-2 text-neo-pink" />
                      <span className="text-sm text-foreground">Est. Likes</span>
                    </div>
                    <span className="font-semibold text-neo-pink">420 - 890</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Share2 className="h-4 w-4 mr-2 text-neo-purple" />
                      <span className="text-sm text-foreground">Viral Score</span>
                    </div>
                    <span className="font-semibold text-neo-purple">8.5/10</span>
                  </div>
                </div>
                
                <div className="mt-4 text-xs text-muted-foreground">
                  *Based on similar content performance
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerationResults;