import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Wand2, Zap, Calendar, TrendingUp, Settings, Play, AlertTriangle, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import Navigation from "@/components/Navigation";
import { CreditMeter } from "@/components/CreditMeter";
import { PlatformSelector } from "@/components/PlatformSelector";
import { TemplateSelector } from "@/components/TemplateSelector";
import { useCredits } from "@/hooks/useCredits";
import { usePlatforms } from "@/hooks/usePlatforms";
import { useToast } from "@/hooks/use-toast";

const CreateSlideshow = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { availableCredits, usedThisMonth, calculateCredits, canAfford, deductCredits } = useCredits();
  const { platforms } = usePlatforms();
  
  const [prompt, setPrompt] = useState("");
  const [slides, setSlides] = useState([6]);
  const [model, setModel] = useState("flux-pro");
  const [template, setTemplate] = useState("modern");
  const [generateVideo, setGenerateVideo] = useState(true);
  const [schedulePost, setSchedulePost] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const templates = [
    {
      id: "motivational",
      name: "Motivational Quotes",
      description: "Inspiring quotes with dynamic backgrounds",
      category: "lifestyle",
      isPremium: false,
      preview: "💪",
      tags: ["motivation", "quotes", "lifestyle"]
    },
    {
      id: "business",
      name: "Business Tips",
      description: "Professional business advice content",
      category: "business",
      isPremium: true,
      preview: "📊",
      tags: ["business", "tips", "professional"]
    },
    {
      id: "travel",
      name: "Travel Stories",
      description: "Beautiful travel destination showcases",
      category: "lifestyle",
      isPremium: false,
      preview: "✈️",
      tags: ["travel", "adventure", "explore"]
    },
    {
      id: "tech",
      name: "Tech Reviews",
      description: "Modern tech product presentations",
      category: "technology",
      isPremium: true,
      preview: "📱",
      tags: ["tech", "reviews", "gadgets"]
    },
    {
      id: "minimal",
      name: "Minimal Clean",
      description: "Clean and simple designs",
      category: "design",
      isPremium: false,
      preview: "⚪",
      tags: ["minimal", "clean", "simple"]
    },
    {
      id: "neon",
      name: "Neon Vibes",
      description: "Vibrant neon aesthetic content",
      category: "design",
      isPremium: true,
      preview: "✨",
      tags: ["neon", "vibrant", "aesthetic"]
    }
  ];

  const models = [
    { id: "flux-pro", name: "Flux 1.1 Pro", credits: "1x", speed: "Fast" },
    { id: "flux-ultra", name: "Flux 1.1 Ultra", credits: "2x", speed: "Premium" },
    { id: "kontext-pro", name: "Kontext Pro", credits: "1x", speed: "Fast" },
    { id: "kontext-max", name: "Kontext Max", credits: "2x", speed: "Premium" },
  ];

  const estimatedUsage = calculateCredits(slides[0], model);
  const canGenerate = canAfford(estimatedUsage.totalCredits) && prompt.trim().length > 0 && selectedPlatforms.length > 0;

  const handleGenerate = async () => {
    if (!canGenerate) return;
    
    setIsGenerating(true);
    
    try {
      // Simulate generation time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      deductCredits(estimatedUsage.totalCredits);
      toast({
        title: "Slideshow Generated!",
        description: `Created ${slides[0]} slides using ${estimatedUsage.totalCredits} credits.`,
      });
      
      navigate("/results", { 
        state: { 
          slides: slides[0], 
          model, 
          template,
          platforms: selectedPlatforms 
        } 
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Please try again. Your credits have been refunded.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-primary">
      <Navigation />
      
      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center mb-8">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm" className="mr-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Create Slideshow</h1>
              <p className="text-muted-foreground">Generate AI-powered viral content in minutes</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Template Selection */}
              <TemplateSelector
                templates={templates}
                selectedTemplate={template}
                onTemplateChange={setTemplate}
                className="mb-6"
              />

              {/* Content Input */}
              <Card className="p-6 bg-gradient-card border border-neo-purple/20">
                <h2 className="text-xl font-semibold text-foreground mb-4">Content Prompt</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="prompt" className="text-foreground">Describe your slideshow content</Label>
                    <Textarea
                      id="prompt"
                      placeholder="e.g., 'Create motivational quotes about success and entrepreneurship with modern gradient backgrounds and bold typography'"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="mt-2 min-h-[120px] bg-background/50 border-neo-purple/20 focus:border-neo-purple"
                    />
                  </div>
                </div>
              </Card>

              {/* Settings */}
              <Card className="p-6 bg-gradient-card border border-neo-purple/20">
                <h2 className="text-xl font-semibold text-foreground mb-4">Generation Settings</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-foreground mb-3 block">Number of Slides</Label>
                    <div className="px-3">
                      <Slider
                        value={slides}
                        onValueChange={setSlides}
                        max={12}
                        min={4}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground mt-2">
                        <span>4</span>
                        <span className="font-medium text-foreground">{slides[0]} slides</span>
                        <span>12</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-foreground mb-3 block">AI Model</Label>
                    <Select value={model} onValueChange={setModel}>
                      <SelectTrigger className="bg-background/50 border-neo-purple/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {models.map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            <div className="flex items-center justify-between w-full pr-4">
                              <span>{m.name}</span>
                              <Badge variant={m.credits === "1x" ? "default" : "secondary"}>
                                {m.credits}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between p-4 bg-background/30 rounded-lg border border-neo-purple/10">
                  <div>
                    <h3 className="font-medium text-foreground">Generate 1:02 Video</h3>
                    <p className="text-sm text-muted-foreground">Automatically create video from slides</p>
                  </div>
                  <Switch
                    checked={generateVideo}
                    onCheckedChange={setGenerateVideo}
                  />
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Credit Meter */}
              <CreditMeter
                availableCredits={availableCredits}
                usedThisMonth={usedThisMonth}
                estimatedUsage={estimatedUsage}
                className="mb-6"
              />

              {/* Platform Selection */}
              <PlatformSelector
                platforms={platforms}
                selectedPlatforms={selectedPlatforms}
                onSelectionChange={setSelectedPlatforms}
                className="mb-6"
              />

              {/* Validation Warning */}
              {(!canGenerate && prompt.trim().length > 0) && (
                <Card className="p-4 bg-destructive/10 border border-destructive/20 mb-6">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    <div className="text-sm">
                      {!canAfford(estimatedUsage.totalCredits) && (
                        <p className="text-destructive">Insufficient credits. Need {estimatedUsage.totalCredits}, have {availableCredits}.</p>
                      )}
                      {selectedPlatforms.length === 0 && (
                        <p className="text-destructive">Please select at least one platform to post to.</p>
                      )}
                    </div>
                  </div>
                </Card>
              )}

              {/* Generate Button */}
              <Button 
                variant="hero" 
                size="lg" 
                className="w-full group"
                disabled={!canGenerate || isGenerating}
                onClick={handleGenerate}
              >
                {isGenerating ? (
                  <>
                    <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-background border-t-transparent" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-5 w-5 group-hover:animate-spin" />
                    Generate Slideshow ({estimatedUsage.totalCredits} credits)
                  </>
                )}
              </Button>

              {/* Quick Actions */}
              <div className="space-y-3">
                <Button variant="glass" size="lg" className="w-full">
                  <Play className="mr-2 h-4 w-4" />
                  Preview Template
                </Button>
                <Button variant="ghost" size="lg" className="w-full">
                  <Settings className="mr-2 h-4 w-4" />
                  Save as Scenario
                </Button>
              </div>

              {/* Tips Card */}
              <Card className="p-4 bg-gradient-glass border border-neo-purple/20">
                <h4 className="font-semibold text-foreground mb-2">💡 Pro Tips</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Be specific with your content prompt</li>
                  <li>• 6-8 slides work best for engagement</li>
                  <li>• Ultra models create higher quality images</li>
                  <li>• Enable video for TikTok optimization</li>
                </ul>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateSlideshow;