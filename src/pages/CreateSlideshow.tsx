import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreditMeter } from '@/components/CreditMeter';
import { Sparkles, Flame, Zap, AlertTriangle, Calendar, Clock, Save, ArrowLeft } from 'lucide-react';
import { useCredits } from '@/hooks/useCredits';
import { useToast } from '@/hooks/use-toast';
import { useScenarios } from '@/hooks/useScenarios';
import { supabase } from '@/integrations/supabase/client';

const CreateSlideshow = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { availableCredits, usedThisMonth, canAfford } = useCredits();
  const { createScenario, updateScenario, getScenarioById, saveDraft, loadDraft, clearDraft } = useScenarios();
  const [searchParams] = useSearchParams();
  const editingId = searchParams.get('edit');
  
  const [prompt, setPrompt] = useState('');
  const [enhancedPrompt, setEnhancedPrompt] = useState('');
  const [imageCount, setImageCount] = useState([5]);
  const [resolution, setResolution] = useState('portrait');
  const [isDraft, setIsDraft] = useState(true);
  const [model, setModel] = useState('flux-kontext-pro');
  const [title, setTitle] = useState('');
  const [niche, setNiche] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [contentStyle, setContentStyle] = useState('');
  const [platforms, setPlatforms] = useState<string[]>(['instagram']);
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledTime, setScheduledTime] = useState('');
  const [scheduleFrequency, setScheduleFrequency] = useState('once');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load draft on mount and handle editing scenario
  useEffect(() => {
    if (editingId) {
      const scenario = getScenarioById(editingId);
      if (scenario) {
        setTitle(scenario.title);
        setPrompt(scenario.description || '');
        setNiche(scenario.niche);
        setTargetAudience(scenario.target_audience || '');
        setContentStyle(scenario.content_style || '');
        setPlatforms(scenario.platforms);
        setIsScheduled(scenario.is_scheduled);
        setScheduledTime(scenario.scheduled_time || '');
        setScheduleFrequency(scenario.schedule_frequency || 'once');
      }
    } else {
      // Load draft for new scenario
      const draft = loadDraft();
      if (draft) {
        setTitle(draft.title || '');
        setPrompt(draft.description || '');
        setNiche(draft.niche || '');
        setTargetAudience(draft.target_audience || '');
        setContentStyle(draft.content_style || '');
        setPlatforms(draft.platforms || ['instagram']);
        setIsScheduled(draft.is_scheduled || false);
        setScheduledTime(draft.scheduled_time || '');
        setScheduleFrequency(draft.schedule_frequency || 'once');
      }
    }
  }, [editingId, getScenarioById, loadDraft]);

  // Auto-save draft
  useEffect(() => {
    if (!editingId && (title || prompt || niche)) {
      const draftData = {
        title,
        description: prompt,
        niche,
        target_audience: targetAudience,
        content_style: contentStyle,
        platforms,
        is_scheduled: isScheduled,
        scheduled_time: scheduledTime,
        schedule_frequency: scheduleFrequency
      };
      saveDraft(draftData);
    }
  }, [title, prompt, niche, targetAudience, contentStyle, platforms, isScheduled, scheduledTime, scheduleFrequency, editingId, saveDraft]);

  const platformOptions = [
    { id: 'instagram', name: 'Instagram' },
    { id: 'tiktok', name: 'TikTok' },
    { id: 'youtube', name: 'YouTube' },
    { id: 'facebook', name: 'Facebook' },
    { id: 'twitter', name: 'Twitter' },
  ];

  const frequencyOptions = [
    { id: 'once', name: 'Once' },
    { id: 'daily', name: 'Daily' },
    { id: 'weekly', name: 'Weekly' },
    { id: 'monthly', name: 'Monthly' },
  ];

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
  const canGenerate = prompt.trim() && title.trim() && niche.trim() && canAfford(totalCredits);
  const canSaveDraft = title.trim() && niche.trim();

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

  const handleSaveDraft = async () => {
    if (!canSaveDraft) return;
    
    setIsSaving(true);
    try {
      const scenarioData = {
        title,
        description: prompt,
        niche,
        target_audience: targetAudience,
        content_style: contentStyle,
        platforms,
        is_scheduled: isScheduled,
        scheduled_time: isScheduled ? scheduledTime : undefined,
        schedule_frequency: isScheduled ? scheduleFrequency : undefined,
      };

      if (editingId) {
        await updateScenario(editingId, scenarioData);
        toast({
          title: "Scenario Updated! 📝",
          description: "Your scenario has been saved successfully.",
        });
      } else {
        await createScenario(scenarioData);
        clearDraft();
        toast({
          title: "Draft Saved! 📝",
          description: "Your scenario has been saved as a draft.",
        });
      }
      
      navigate('/my-scenarios');
    } catch (error: any) {
      console.error('Error saving scenario:', error);
      toast({
        title: "Error",
        description: "Failed to save scenario",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerate = async () => {
    if (!canGenerate) return;

    setIsGenerating(true);
    try {
      // First save/update the scenario
      const scenarioData = {
        title,
        description: prompt,
        niche,
        target_audience: targetAudience,
        content_style: contentStyle,
        platforms,
        is_scheduled: isScheduled,
        scheduled_time: isScheduled ? scheduledTime : undefined,
        schedule_frequency: isScheduled ? scheduleFrequency : undefined,
      };

      let scenarioId = editingId;
      if (!editingId) {
        const scenario = await createScenario(scenarioData);
        scenarioId = scenario?.id;
        clearDraft();
      } else {
        await updateScenario(editingId, scenarioData);
      }

      // Then generate content
      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: {
          prompt: enhancedPrompt || prompt,
          imageCount: imageCount[0],
          resolution,
          isDraft,
          model,
          platforms,
          title,
          scenarioId
        }
      });

      if (error) throw error;

      toast({
        title: "Generation Started! 🎨",
        description: "Your slideshow is being created. You'll be notified when it's ready.",
      });

      navigate('/results');
    } catch (error: any) {
      console.error('Error generating slideshow:', error);
      toast({
        title: "Error",
        description: "Failed to start generation",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePlatformChange = (platformId: string, checked: boolean) => {
    if (checked) {
      setPlatforms([...platforms, platformId]);
    } else {
      setPlatforms(platforms.filter(p => p !== platformId));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-primary">
      <Navigation />
      
      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/my-scenarios')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Scenarios
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {editingId ? 'Edit Scenario' : 'Create New Scenario'}
              </h1>
              <p className="text-muted-foreground">Set up your content creation scenario</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card className="neo-card">
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Scenario Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Tech Innovation Campaign"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="niche">Niche/Industry *</Label>
                    <Input
                      id="niche"
                      placeholder="e.g., Technology, Fashion, Food"
                      value={niche}
                      onChange={(e) => setNiche(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="target-audience">Target Audience</Label>
                    <Input
                      id="target-audience"
                      placeholder="e.g., Tech enthusiasts, 25-35 years old"
                      value={targetAudience}
                      onChange={(e) => setTargetAudience(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content-style">Content Style</Label>
                    <Input
                      id="content-style"
                      placeholder="e.g., Professional, Casual, Humorous"
                      value={contentStyle}
                      onChange={(e) => setContentStyle(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Content Prompt */}
              <Card className="neo-card">
                <CardHeader>
                  <CardTitle>Content Prompt</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="prompt">Describe your content idea *</Label>
                    <Textarea
                      id="prompt"
                      placeholder="Describe what kind of content you want to create..."
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      rows={4}
                    />
                  </div>

                  <Button 
                    variant="outline" 
                    onClick={handleEnhancePrompt}
                    disabled={!prompt.trim() || isEnhancing}
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    {isEnhancing ? 'Enhancing...' : 'Enhance with AI'}
                  </Button>

                  {enhancedPrompt && (
                    <div className="p-4 bg-muted/50 rounded-lg border border-neo-purple/20">
                      <Label className="text-sm font-medium">Enhanced Prompt:</Label>
                      <p className="text-sm text-muted-foreground mt-1">{enhancedPrompt}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Platform Selection */}
              <Card className="neo-card">
                <CardHeader>
                  <CardTitle>Target Platforms</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {platformOptions.map((platform) => (
                      <div key={platform.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={platform.id}
                          checked={platforms.includes(platform.id)}
                          onCheckedChange={(checked) => 
                            handlePlatformChange(platform.id, checked as boolean)
                          }
                        />
                        <Label htmlFor={platform.id}>{platform.name}</Label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Scheduling */}
              <Card className="neo-card">
                <CardHeader>
                  <CardTitle>Scheduling</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="scheduled"
                      checked={isScheduled}
                      onCheckedChange={setIsScheduled}
                    />
                    <Label htmlFor="scheduled">Schedule this scenario</Label>
                  </div>

                  {isScheduled && (
                    <div className="space-y-4 pl-6 border-l-2 border-neo-purple/20">
                      <div className="space-y-2">
                        <Label htmlFor="scheduled-time">When to run</Label>
                        <Input
                          id="scheduled-time"
                          type="datetime-local"
                          value={scheduledTime}
                          onChange={(e) => setScheduledTime(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="frequency">Frequency</Label>
                        <Select value={scheduleFrequency} onValueChange={setScheduleFrequency}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {frequencyOptions.map((option) => (
                              <SelectItem key={option.id} value={option.id}>
                                {option.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Generation Settings */}
              <Card className="neo-card">
                <CardHeader>
                  <CardTitle>Generation Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Image Count */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Number of Images</Label>
                      <Badge variant="outline">{imageCount[0]} images</Badge>
                    </div>
                    <Slider
                      value={imageCount}
                      onValueChange={setImageCount}
                      max={12}
                      min={3}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  {/* AI Model Selection */}
                  <div className="space-y-4">
                    <Label>AI Model</Label>
                    <RadioGroup value={model} onValueChange={setModel}>
                      {models.map((m) => (
                        <div key={m.id} className="flex items-center space-x-2">
                          <RadioGroupItem value={m.id} id={m.id} />
                          <Label htmlFor={m.id} className="flex items-center gap-2 flex-1">
                            {m.icon}
                            <span>{m.name}</span>
                            {m.isHot && <Badge variant="destructive" className="text-xs">HOT</Badge>}
                            <Badge variant="secondary" className="ml-auto text-xs">
                              {m.credits} credit{m.credits > 1 ? 's' : ''}/image
                            </Badge>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  {/* Resolution */}
                  <div className="space-y-4">
                    <Label>Resolution</Label>
                    <RadioGroup value={resolution} onValueChange={setResolution}>
                      {resolutions.map((res) => (
                        <div key={res.id} className="flex items-center space-x-2">
                          <RadioGroupItem value={res.id} id={res.id} />
                          <Label htmlFor={res.id} className="flex items-center justify-between flex-1">
                            <span>{res.name}</span>
                            <span className="text-sm text-muted-foreground">{res.size}</span>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  {/* Draft Toggle */}
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="draft"
                      checked={isDraft}
                      onCheckedChange={setIsDraft}
                    />
                    <Label htmlFor="draft">Save as draft (don't publish to platforms)</Label>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <CreditMeter availableCredits={availableCredits} usedThisMonth={usedThisMonth} />

              {/* Generation Summary */}
              <Card className="neo-card">
                <CardHeader>
                  <CardTitle>Generation Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Images:</span>
                      <span>{imageCount[0]}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Model:</span>
                      <span>{selectedModel?.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Resolution:</span>
                      <span>{resolutions.find(r => r.id === resolution)?.name}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-medium">
                      <span>Total Credits:</span>
                      <span>{totalCredits}</span>
                    </div>
                  </div>

                  {!canAfford(totalCredits) && (
                    <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                      <span className="text-sm text-destructive">
                        Insufficient credits ({availableCredits} available)
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={handleSaveDraft}
                  disabled={!canSaveDraft || isSaving}
                  variant="outline"
                  size="lg"
                  className="w-full"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isSaving ? 'Saving...' : editingId ? 'Update Scenario' : 'Save Draft'}
                </Button>

                <Button
                  onClick={handleGenerate}
                  disabled={!canGenerate || isGenerating}
                  variant="hero"
                  size="lg"
                  className="w-full"
                >
                  <Zap className="mr-2 h-4 w-4" />
                  {isGenerating ? 'Generating...' : `Generate Now (${totalCredits} credits)`}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateSlideshow;