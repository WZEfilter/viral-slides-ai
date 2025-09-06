import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Zap, Play, Download, Instagram, Facebook, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";

const CreateSlideshow = () => {
  const [slides, setSlides] = useState(6);
  const [model, setModel] = useState("pro");
  const [generateVideo, setGenerateVideo] = useState(true);
  const [platforms, setPlatforms] = useState(["instagram"]);

  const templates = [
    { id: "business", name: "Business Quotes", description: "Professional quotes for business growth" },
    { id: "motivation", name: "Motivational", description: "Inspiring quotes and visuals" },
    { id: "tech", name: "Tech Innovation", description: "Latest technology trends" },
    { id: "lifestyle", name: "Lifestyle", description: "Daily life and wellness content" },
  ];

  const models = [
    { id: "pro", name: "Flux 1.1 Pro", credits: 1, description: "High quality, fast generation" },
    { id: "ultra", name: "Flux 1.1 Ultra", credits: 2, description: "Maximum quality, slower" },
  ];

  const socialPlatforms = [
    { id: "instagram", name: "Instagram", icon: Instagram },
    { id: "tiktok", name: "TikTok", icon: MessageCircle },
    { id: "pinterest", name: "Pinterest", icon: Facebook },
  ];

  const calculateCredits = () => {
    const baseCredits = slides * (model === "pro" ? 1 : 2);
    return baseCredits;
  };

  const togglePlatform = (platformId: string) => {
    setPlatforms(prev => 
      prev.includes(platformId) 
        ? prev.filter(p => p !== platformId)
        : [...prev, platformId]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-primary">
      <Navigation />
      
      <div className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
              <p className="text-muted-foreground">Generate AI-powered content for your social media</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Creation Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Template Selection */}
              <Card className="p-6 bg-gradient-card border border-neo-purple/20">
                <h2 className="text-xl font-semibold text-foreground mb-4">Choose Template</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      className="p-4 rounded-lg border border-neo-purple/20 hover:border-neo-purple/40 cursor-pointer transition-all bg-muted/10 hover:bg-muted/20"
                    >
                      <h3 className="font-semibold text-foreground">{template.name}</h3>
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                      {template.id === "business" && (
                        <Badge variant="secondary" className="mt-2">Coming Soon</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </Card>

              {/* Content Input */}
              <Card className="p-6 bg-gradient-card border border-neo-purple/20">
                <h2 className="text-xl font-semibold text-foreground mb-4">Content Details</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Prompt
                    </label>
                    <Textarea
                      placeholder="Describe the content you want to create... e.g., 'Create motivational quotes about success and entrepreneurship with modern design'"
                      className="min-h-[100px] bg-muted/10 border-neo-purple/20 focus:border-neo-purple/40"
                    />
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Number of Slides
                      </label>
                      <Input
                        type="number"
                        min="4"
                        max="12"
                        value={slides}
                        onChange={(e) => setSlides(parseInt(e.target.value))}
                        className="bg-muted/10 border-neo-purple/20 focus:border-neo-purple/40"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        AI Model
                      </label>
                      <Select value={model} onValueChange={setModel}>
                        <SelectTrigger className="bg-muted/10 border-neo-purple/20 focus:border-neo-purple/40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {models.map((m) => (
                            <SelectItem key={m.id} value={m.id}>
                              <div className="flex items-center justify-between w-full">
                                <span>{m.name}</span>
                                <Badge variant={m.id === "pro" ? "default" : "secondary"}>
                                  {m.credits}x credits
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Video Options */}
              <Card className="p-6 bg-gradient-card border border-neo-purple/20">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-foreground">Video Generation</h2>
                  <Switch
                    checked={generateVideo}
                    onCheckedChange={setGenerateVideo}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Automatically create a 1:02 video from your slideshow with smooth transitions and effects.
                </p>
              </Card>

              {/* Platform Selection */}
              <Card className="p-6 bg-gradient-card border border-neo-purple/20">
                <h2 className="text-xl font-semibold text-foreground mb-4">Target Platforms</h2>
                <div className="grid sm:grid-cols-3 gap-4">
                  {socialPlatforms.map((platform) => (
                    <div
                      key={platform.id}
                      onClick={() => togglePlatform(platform.id)}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        platforms.includes(platform.id)
                          ? "border-neo-purple bg-neo-purple/10"
                          : "border-neo-purple/20 hover:border-neo-purple/40"
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <platform.icon className="h-5 w-5" />
                        <span className="font-medium text-foreground">{platform.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Credit Calculator */}
              <Card className="p-6 bg-gradient-card border border-neo-pink/20">
                <h3 className="text-lg font-semibold text-foreground mb-4">Credit Usage</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Slides ({slides})</span>
                    <span className="text-sm text-foreground">{slides} × {model === "pro" ? 1 : 2}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Video Generation</span>
                    <span className="text-sm text-foreground">Free</span>
                  </div>
                  <div className="border-t border-neo-purple/20 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-foreground">Total Credits</span>
                      <div className="flex items-center">
                        <Zap className="h-4 w-4 text-neo-purple mr-1" />
                        <span className="font-bold text-neo-purple">{calculateCredits()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Link to="/results">
                  <Button variant="hero" size="lg" className="w-full">
                    <Zap className="mr-2 h-5 w-5" />
                    Generate Slideshow
                  </Button>
                </Link>
                
                <Button variant="glass" size="lg" className="w-full">
                  <Play className="mr-2 h-5 w-5" />
                  Preview Template
                </Button>
                
                <Button variant="ghost" size="lg" className="w-full">
                  <Download className="mr-2 h-5 w-5" />
                  Save as Scenario
                </Button>
              </div>

              {/* Tips */}
              <Card className="p-4 bg-gradient-glass border border-neo-purple/20">
                <h4 className="font-semibold text-foreground mb-2">💡 Pro Tips</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Be specific in your prompts</li>
                  <li>• Use 6-8 slides for optimal engagement</li>
                  <li>• Enable video for TikTok content</li>
                  <li>• Save scenarios for easy reuse</li>
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