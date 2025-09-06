import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Share2, RefreshCw, Play, Calendar, ArrowLeft, CheckCircle, Eye } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import Navigation from "@/components/Navigation";
import { useToast } from "@/hooks/use-toast";
import { usePlatforms } from "@/hooks/usePlatforms";
import { useCredits } from "@/hooks/useCredits";

const GenerationResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getPlatformById } = usePlatforms();
  const { deductCredits } = useCredits();
  
  const [selectedSlides, setSelectedSlides] = useState<number[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  const [rerollingSlides, setRerollingSlides] = useState<number[]>([]);
  
  // Get data from navigation state
  const { slides = 6, model = "flux-pro", template = "modern", platforms = [] } = location.state || {};
  const slideCount = typeof slides === 'number' ? slides : slides[0] || 6;

  // Mock slide data - in real app this would come from API
  const slideData = Array.from({ length: slideCount }, (_, i) => ({
    id: i + 1,
    url: "/placeholder.svg",
    prompt: "A beautiful gradient background with motivational quote",
    viralScore: Math.floor(Math.random() * 30) + 70,
  }));

  const toggleSlideSelection = (slideId: number) => {
    setSelectedSlides(prev => 
      prev.includes(slideId) 
        ? prev.filter(id => id !== slideId)
        : [...prev, slideId]
    );
  };

  const handleReroll = async (slideId: number) => {
    setRerollingSlides(prev => [...prev, slideId]);
    
    try {
      // Simulate reroll API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const creditCost = model.includes('ultra') || model.includes('max') ? 2 : 1;
      deductCredits(creditCost);
      
      toast({
        title: "Slide Rerolled",
        description: `Slide ${slideId} regenerated using ${creditCost} credit${creditCost > 1 ? 's' : ''}.`,
      });
    } catch (error) {
      toast({
        title: "Reroll Failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setRerollingSlides(prev => prev.filter(id => id !== slideId));
    }
  };

  const handlePost = async () => {
    setIsPosting(true);
    
    try {
      // Simulate posting to selected platforms
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Posted Successfully!",
        description: `Slideshow posted to ${platforms.length} platform${platforms.length > 1 ? 's' : ''} as Draft.`,
      });
      
      navigate("/library");
    } catch (error) {
      toast({
        title: "Posting Failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsPosting(false);
    }
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
                <p className="text-muted-foreground">Review your slideshow and post to platforms</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
                <CheckCircle className="h-4 w-4 mr-2" />
                {slideCount} slides ready
              </Badge>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Slides Grid */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6 bg-gradient-card border border-neo-purple/20">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-foreground">Generated Slides</h2>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{slideCount} slides</Badge>
                    <Badge className="bg-neo-purple/20 text-neo-purple border-neo-purple/30">
                      Model: {model}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  {slideData.map((slide) => (
                    <div
                      key={slide.id}
                      className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                        selectedSlides.includes(slide.id)
                          ? "border-neo-purple shadow-glow-primary"
                          : "border-neo-purple/20 hover:border-neo-purple/40"
                      }`}
                      onClick={() => toggleSlideSelection(slide.id)}
                    >
                      <div className="aspect-[9/16] bg-gradient-to-br from-neo-purple/30 to-neo-pink/30 relative">
                        {/* Slide Preview */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center p-4">
                            <div className="text-white font-bold mb-2">Slide {slide.id}</div>
                            <div className="text-white/80 text-sm">Viral Score: {slide.viralScore}%</div>
                          </div>
                        </div>
                        
                        {/* Selection Indicator */}
                        {selectedSlides.includes(slide.id) && (
                          <div className="absolute top-2 right-2">
                            <CheckCircle className="h-6 w-6 text-neo-purple bg-background rounded-full" />
                          </div>
                        )}
                        
                        {/* Hover Actions */}
                        <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="flex gap-2">
                            <Button 
                              variant="glass" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                // Preview functionality
                              }}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReroll(slide.id);
                              }}
                              disabled={rerollingSlides.includes(slide.id)}
                            >
                              {rerollingSlides.includes(slide.id) ? (
                                <div className="h-3 w-3 mr-1 animate-spin rounded-full border border-foreground border-t-transparent" />
                              ) : (
                                <RefreshCw className="h-3 w-3 mr-1" />
                              )}
                              {rerollingSlides.includes(slide.id) ? 'Rerolling...' : 'Reroll'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Bulk Actions */}
                <div className="flex items-center justify-between p-4 bg-background/30 rounded-lg border border-neo-purple/10">
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">
                      {selectedSlides.length} selected
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedSlides(slideData.map(s => s.id))}
                    >
                      Select All
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedSlides([])}
                    >
                      Clear
                    </Button>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="glass" size="sm" disabled={selectedSlides.length === 0}>
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Reroll Selected
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Video Preview */}
              <Card className="p-6 bg-gradient-card border border-neo-purple/20">
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

            {/* Post Options */}
            <Card className="p-6 bg-gradient-card border border-neo-purple/20">
              <h3 className="text-lg font-semibold text-foreground mb-4">Post Options</h3>
              
              <div className="space-y-4">
                {platforms.map((platformId: string) => {
                  const platform = getPlatformById(platformId);
                  if (!platform) return null;
                  
                  return (
                    <div key={platformId} className="flex items-center justify-between p-3 bg-muted/10 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{platform.icon}</span>
                        <div>
                          <p className="font-medium text-foreground">{platform.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {platform.accounts[0]?.username || 'Not connected'}
                          </p>
                        </div>
                      </div>
                      <Badge variant={platform.capabilities.canPublish ? "default" : "outline"}>
                        {platform.capabilities.canPublish ? "Publish" : "Draft Only"}
                      </Badge>
                    </div>
                  );
                })}
              </div>
              
              <div className="flex gap-3 mt-6">
                <Button 
                  variant="hero" 
                  className="flex-1"
                  onClick={handlePost}
                  disabled={isPosting}
                >
                  {isPosting ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                      Posting...
                    </>
                  ) : (
                    <>
                      <Share2 className="mr-2 h-4 w-4" />
                      Post Now
                    </>
                  )}
                </Button>
                <Button variant="glass">
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule
                </Button>
              </div>
              
              {platforms.length > 0 && (
                <div className="mt-4 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <p className="text-sm text-green-400">
                      Ready to post to {platforms.length} platform{platforms.length > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerationResults;