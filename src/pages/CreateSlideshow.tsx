import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { CreditMeter } from '@/components/CreditMeter';
import { Sparkles, Flame, Zap, AlertTriangle } from 'lucide-react';
import { useCredits } from '@/hooks/useCredits';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const CreateSlideshow = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { availableCredits, usedThisMonth, canAfford } = useCredits();
  
  const [prompt, setPrompt] = useState('');
  const [enhancedPrompt, setEnhancedPrompt] = useState('');
  const [imageCount, setImageCount] = useState([5]);
  const [resolution, setResolution] = useState('portrait');
  const [isDraft, setIsDraft] = useState(true);
  const [model, setModel] = useState('flux-kontext-pro');
  const [tags, setTags] = useState('');
  const [title, setTitle] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);

  const models = [
    { id: 'flux-kontext-max', name: 'Flux.1 Kontext Max', credits: 2, icon: <Flame className="w-4 h-4" />, isHot: true },
    { id: 'flux-kontext-pro', name: 'Flux.1 Kontext Pro', credits: 1, icon: <Flame className="w-4 h-4" />, isHot: true, isDefault: true },
    { id: 'flux-pro', name: 'Flux1.1 Pro', credits: 1, icon: <Flame className="w-4 h-4" />, isHot: true },
    { id: 'flux-ultra', name: 'Flux 1.1 Ultra', credits: 1.5, icon: <Zap className="w-4 h-4" />, isHot: false }
  ];

  const resolutions = [
    { id: 'portrait', name: '9:16 (Portrait)', size: '1080x1920' },
    { id: 'square', name: '1:1 (Square)', size: '1080x1080' },
    { id: 'landscape', name: '16:9 (Landscape)', size: '1920x1080' }
  ];

  const selectedModel = models.find(m => m.id === model);
  const totalCredits = (selectedModel?.credits || 1) * imageCount[0];
  const canGenerate = prompt.trim() && title.trim() && canAfford(totalCredits);

  const handleEnhancePrompt = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt first",
        variant: "destructive",
      });
      return;
    }

    setIsEnhancing(true);
    try {
      const { data, error } = await supabase.functions.invoke('enhance-prompt', {
        body: { prompt }
      });

      if (error) throw error;

      setEnhancedPrompt(data.enhanced_prompt);
      toast({
        title: "Prompt Enhanced! ✨",
        description: "Your prompt has been enhanced with AI",
      });
    } catch (error: any) {
      console.error('Error enhancing prompt:', error);
      toast({
        title: "Error",
        description: "Failed to enhance prompt",
        variant: "destructive",
      });
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleGenerate = async () => {
    if (!canGenerate) return;

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: {
          prompt: enhancedPrompt || prompt,
          imageCount: imageCount[0],
          resolution,
          isDraft,
          model,
          tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
          title
        }
      });

      if (error) throw error;

      toast({
        title: "Generation Started! 🎨",
        description: "Your slideshow is being created. You'll be notified when it's ready.",
      });

      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error generating content:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to start generation",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Create AI Slideshow
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter slideshow title..."
                  />
                </div>

                {/* Prompt */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="prompt">Content Prompt</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleEnhancePrompt}
                      disabled={isEnhancing || !prompt.trim()}
                      className="text-xs"
                    >
                      {isEnhancing ? (
                        <>Enhancing...</>
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3 mr-1" />
                          AI Enhance (Free)
                        </>
                      )}
                    </Button>
                  </div>
                  <Textarea
                    id="prompt"
                    value={enhancedPrompt || prompt}
                    onChange={(e) => {
                      setPrompt(e.target.value);
                      if (enhancedPrompt) setEnhancedPrompt('');
                    }}
                    placeholder="Describe what you want your slideshow to be about..."
                    className="min-h-[120px]"
                  />
                  {enhancedPrompt && (
                    <p className="text-sm text-muted-foreground">
                      ✨ Prompt enhanced with AI
                    </p>
                  )}
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="technology, business, social media..."
                  />
                </div>

                <Separator />

                {/* Image Count */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Number of Images</Label>
                    <Badge variant="secondary">{imageCount[0]} images</Badge>
                  </div>
                  <Slider
                    value={imageCount}
                    onValueChange={setImageCount}
                    max={20}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                </div>

                {/* AI Model Selection */}
                <div className="space-y-3">
                  <Label>AI Model</Label>
                  <RadioGroup value={model} onValueChange={setModel} className="space-y-2">
                    {models.map((modelOption) => (
                      <div key={modelOption.id} className="flex items-center space-x-2">
                        <RadioGroupItem value={modelOption.id} id={modelOption.id} />
                        <Label htmlFor={modelOption.id} className="flex items-center gap-2 cursor-pointer flex-1">
                          {modelOption.icon}
                          <span>{modelOption.name}</span>
                          <Badge variant="outline">{modelOption.credits} credits</Badge>
                          {modelOption.isHot && <Badge variant="destructive" className="text-xs">HOT</Badge>}
                          {modelOption.isDefault && <Badge variant="secondary" className="text-xs">DEFAULT</Badge>}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {/* Resolution */}
                <div className="space-y-3">
                  <Label>Resolution</Label>
                  <RadioGroup value={resolution} onValueChange={setResolution} className="space-y-2">
                    {resolutions.map((res) => (
                      <div key={res.id} className="flex items-center space-x-2">
                        <RadioGroupItem value={res.id} id={res.id} />
                        <Label htmlFor={res.id} className="cursor-pointer flex-1">
                          {res.name} - {res.size}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {/* Draft/Post Toggle */}
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Status</Label>
                    <p className="text-sm text-muted-foreground">
                      {isDraft ? 'Save as draft' : 'Ready to post'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="draft-mode">Draft</Label>
                    <Switch
                      id="draft-mode"
                      checked={!isDraft}
                      onCheckedChange={(checked) => setIsDraft(!checked)}
                    />
                    <Label htmlFor="draft-mode">Post</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Info & Actions */}
          <div className="space-y-6">
            <CreditMeter
              availableCredits={availableCredits}
              usedThisMonth={usedThisMonth}
            />

            {/* Generation Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Generation Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Images:</span>
                  <span className="font-medium">{imageCount[0]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Model:</span>
                  <span className="font-medium">{selectedModel?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Credits per image:</span>
                  <span className="font-medium">{selectedModel?.credits}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total Credits:</span>
                  <span>{totalCredits}</span>
                </div>
              </CardContent>
            </Card>

            {/* Validation & Generate Button */}
            <Card>
              <CardContent className="pt-6">
                {!canAfford(totalCredits) && (
                  <div className="flex items-center gap-2 text-destructive mb-4">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-sm">Insufficient credits</span>
                  </div>
                )}
                
                <Button
                  onClick={handleGenerate}
                  disabled={!canGenerate || isGenerating}
                  className="w-full"
                  size="lg"
                >
                  {isGenerating ? (
                    <>Generating...</>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Slideshow
                    </>
                  )}
                </Button>

                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-muted-foreground">
                      <strong>Note:</strong> We cannot choose the sound of the video. 
                      The recommended sound will be based on your regularly used sound and favorite sounds.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateSlideshow;