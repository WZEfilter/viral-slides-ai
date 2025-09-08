import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group-fixed';
import { TimePicker } from '@/components/ui/time-picker';
import { CreditMeter } from '@/components/CreditMeter';
import { ArrowLeft, Plus, X, Clock, Calendar } from 'lucide-react';
import { useCredits } from '@/hooks/useCredits';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';
import { useScenarios } from '@/hooks/useScenarios';
import { usePlatforms } from '@/hooks/usePlatforms';
import { supabase } from '@/integrations/supabase/client';

interface ScheduleTime {
  id: string;
  time: string;
}

interface DaySchedule {
  day: string;
  enabled: boolean;
  frequency: number;
  times: ScheduleTime[];
}

interface PlatformSelection {
  platformId: string;
  accountIds: string[];
}

const CreateSlideshow = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { availableCredits, usedThisMonth, canAfford } = useCredits();
  const { profile } = useProfile();
  const { createScenario, updateScenario, getScenarioById, saveDraft, loadDraft, clearDraft } = useScenarios();
  const { platforms, getConnectedPlatforms } = usePlatforms();
  const [searchParams] = useSearchParams();
  const editingId = searchParams.get('edit');
  
  // Core form state
  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [imageCount, setImageCount] = useState(5);
  const [selectedPlatforms, setSelectedPlatforms] = useState<PlatformSelection[]>([]);
  const [isScheduled, setIsScheduled] = useState(false);
  const [publishOption, setPublishOption] = useState<'draft' | 'publish'>('draft');
  const [aiModel, setAiModel] = useState('flux-kontext-pro');
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [weekSchedule, setWeekSchedule] = useState<DaySchedule[]>([
    { day: 'Monday', enabled: false, frequency: 1, times: [{ id: '1', time: '09:00' }] },
    { day: 'Tuesday', enabled: false, frequency: 1, times: [{ id: '1', time: '09:00' }] },
    { day: 'Wednesday', enabled: false, frequency: 1, times: [{ id: '1', time: '09:00' }] },
    { day: 'Thursday', enabled: false, frequency: 1, times: [{ id: '1', time: '09:00' }] },
    { day: 'Friday', enabled: false, frequency: 1, times: [{ id: '1', time: '09:00' }] },
    { day: 'Saturday', enabled: false, frequency: 1, times: [{ id: '1', time: '09:00' }] },
    { day: 'Sunday', enabled: false, frequency: 1, times: [{ id: '1', time: '09:00' }] },
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const connectedPlatforms = getConnectedPlatforms();
  
  // AI Model configurations with credit costs
  const aiModels = [
    { id: 'flux-kontext-max', name: 'Flux.1 Kontext Max', credits: 2, isHot: false, isDefault: false },
    { id: 'flux-kontext-pro', name: 'Flux.1 Kontext Pro', credits: 1, isHot: true, isDefault: true },
    { id: 'flux-1.1-pro', name: 'Flux 1.1 Pro', credits: 1, isHot: true, isDefault: false },
    { id: 'flux-1.1-ultra', name: 'Flux 1.1 Ultra', credits: 1.5, isHot: false, isDefault: false },
  ];
  
  const selectedModelConfig = aiModels.find(model => model.id === aiModel) || aiModels[0];
  const totalCredits = imageCount * selectedModelConfig.credits;
  const canGenerate = title.trim() && prompt.trim() && canAfford(totalCredits) && selectedPlatforms.length > 0;
  const canSaveDraft = title.trim() || prompt.trim(); // Allow saving with just title OR prompt
  
  // Calculate usage cost estimation based on frequency and model selection
  const enabledDays = weekSchedule.filter(day => day.enabled);
  const totalPostsPerWeek = enabledDays.reduce((total, day) => total + day.frequency, 0);
  const creditsPerWeek = totalPostsPerWeek * totalCredits;
  const creditsPerMonth = Math.round(creditsPerWeek * 4.345); // More accurate weeks per month (365.25 days / 84 days)

  // Load draft on mount and handle editing scenario
  useEffect(() => {
    if (editingId) {
      const scenario = getScenarioById(editingId);
      if (scenario) {
        setTitle(scenario.title);
        setPrompt(scenario.description || '');
        setIsScheduled(scenario.is_scheduled);
        const platformSelections = scenario.platforms.map(platformId => ({
          platformId,
          accountIds: []
        }));
        setSelectedPlatforms(platformSelections);
      }
    } else {
      const draft = loadDraft();
      if (draft) {
        setTitle(draft.title || '');
        setPrompt(draft.description || '');
        setIsScheduled(draft.is_scheduled || false);
        const platformSelections = (draft.platforms || []).map(platformId => ({
          platformId,
          accountIds: []
        }));
        setSelectedPlatforms(platformSelections);
      }
    }
  }, [editingId]);

  // Auto-save draft with proper debouncing
  const debouncedSaveDraft = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return () => {
        if (!editingId && (title || prompt)) {
          clearTimeout(timeoutId);
          timeoutId = setTimeout(() => {
            const draftData = {
              title,
              description: prompt,
              niche: 'general',
              platforms: selectedPlatforms.map(p => p.platformId),
              is_scheduled: isScheduled,
            };
            saveDraft(draftData);
          }, 3000);
        }
      };
    })(),
    [title, prompt, selectedPlatforms, isScheduled, editingId]
  );

  useEffect(() => {
    debouncedSaveDraft();
  }, [debouncedSaveDraft]);

  // Event handlers
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
  };

  const handleImageCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(1, Math.min(10, parseInt(e.target.value) || 1));
    setImageCount(value);
  };

  const handlePublishOptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPublishOption(e.target.value as 'draft' | 'publish');
  };

  const handlePublishOptionSelect = (value: string) => {
    setPublishOption(value as 'draft' | 'publish');
  };

  const handlePlatformAccountToggle = (platformId: string, accountId: string, checked: boolean) => {
    if (checked) {
      const existingPlatform = selectedPlatforms.find(p => p.platformId === platformId);
      if (existingPlatform) {
        setSelectedPlatforms(prev => prev.map(p => 
          p.platformId === platformId 
            ? { ...p, accountIds: [...p.accountIds, accountId] }
            : p
        ));
      } else {
        setSelectedPlatforms(prev => [...prev, {
          platformId,
          accountIds: [accountId]
        }]);
      }
    } else {
      setSelectedPlatforms(prev => prev.map(p => {
        if (p.platformId === platformId) {
          const newAccountIds = p.accountIds.filter(id => id !== accountId);
          return newAccountIds.length > 0 
            ? { ...p, accountIds: newAccountIds }
            : null;
        }
        return p;
      }).filter(Boolean) as PlatformSelection[]);
    }
  };

  const handleDayToggle = (dayIndex: number, enabled: boolean) => {
    setWeekSchedule(schedule => schedule.map((day, index) => 
      index === dayIndex ? { ...day, enabled } : day
    ));
  };

  const handleFrequencyChange = (dayIndex: number, frequency: number) => {
    setWeekSchedule(schedule => schedule.map((day, index) => {
      if (index === dayIndex) {
        const newTimes = Array.from({ length: frequency }, (_, i) => 
          day.times[i] || { id: `${i + 1}`, time: '09:00' }
        );
        return { ...day, frequency, times: newTimes };
      }
      return day;
    }));
  };

  const handleTimeChange = (dayIndex: number, timeIndex: number, time: string) => {
    setWeekSchedule(schedule => schedule.map((day, index) => {
      if (index === dayIndex) {
        const newTimes = day.times.map((t, tIndex) => 
          tIndex === timeIndex ? { ...t, time } : t
        );
        return { ...day, times: newTimes };
      }
      return day;
    }));
  };

  const handleSaveDraft = async () => {
    if (!canSaveDraft) return;
    
    setIsSaving(true);
    try {
      const scenarioData = {
        title: title.trim() || 'Untitled Scenario',
        description: prompt.trim() || '',
        niche: 'general',
        platforms: selectedPlatforms.map(p => p.platformId),
        is_scheduled: isScheduled,
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
      const scenarioData = {
        title,
        description: prompt,
        niche: 'general',
        platforms: selectedPlatforms.map(p => p.platformId),
        is_scheduled: isScheduled,
      };

      let scenarioId = editingId;
      if (!editingId) {
        const scenario = await createScenario(scenarioData);
        scenarioId = scenario?.id;
        clearDraft();
      } else {
        await updateScenario(editingId, scenarioData);
      }

      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: {
          prompt,
          imageCount,
          platforms: selectedPlatforms.map(p => p.platformId),
          title,
          scenarioId,
          publishOption,
          aiModel
        }
      });

      if (error) throw error;

      toast({
        title: "Generation Started! 🎨",
        description: "Your content is being created. You'll be notified when it's ready.",
      });

      navigate('/results');
    } catch (error: any) {
      console.error('Error generating content:', error);
      toast({
        title: "Error",
        description: "Failed to start generation",
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
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
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
                  <CardTitle>Scenario Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Scenario Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Daily Tech Updates"
                      value={title}
                      onChange={handleTitleChange}
                      className="transition-all duration-300 focus:scale-[1.02] focus:shadow-glow-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="prompt">Content Prompt *</Label>
                    <Textarea
                      id="prompt"
                      placeholder="Describe what kind of content you want to create..."
                      value={prompt}
                      onChange={handlePromptChange}
                      rows={4}
                      className="transition-all duration-300 focus:scale-[1.02] focus:shadow-glow-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="image-count">Number of Images</Label>
                    <div className="flex items-center gap-4">
                      <Input
                        id="image-count"
                        type="number"
                        min="1"
                        max="10"
                        value={imageCount}
                        onChange={handleImageCountChange}
                        className="w-20"
                      />
                      <Badge variant="outline">{imageCount} image{imageCount !== 1 ? 's' : ''}</Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ai-model">AI Model</Label>
                    <Select value={aiModel} onValueChange={setAiModel}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {aiModels.map((model) => (
                          <SelectItem key={model.id} value={model.id}>
                            <div className="flex items-center gap-2">
                              <span>{model.name}</span>
                              <Badge variant="secondary">{model.credits} credits</Badge>
                              {model.isHot && <Badge variant="destructive" className="text-xs">🔥 Hot</Badge>}
                              {model.isDefault && <Badge variant="outline" className="text-xs">Default</Badge>}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Platform Selection */}
              <Card className="neo-card">
                <CardHeader>
                  <CardTitle>Target Platforms & Accounts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {connectedPlatforms.map((platform) => (
                    <div key={platform.id} className="space-y-3 p-4 border rounded-lg hover:border-neo-purple/40 transition-all duration-300 hover:shadow-glow-primary">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{platform.icon}</span>
                        <Label className="font-medium">{platform.name}</Label>
                      </div>
                      
                      {platform.accounts.length > 0 && (
                        <div className="ml-11 space-y-2">
                          <Label className="text-sm text-muted-foreground">Select accounts:</Label>
                          {platform.accounts.map((account) => {
                            const isSelected = selectedPlatforms.some(p => 
                              p.platformId === platform.id && p.accountIds.includes(account.id)
                            );
                            
                            return (
                              <div key={account.id} className="flex items-center space-x-2 hover:scale-105 transition-transform duration-200">
                                <Checkbox
                                  id={`${platform.id}-${account.id}`}
                                  checked={isSelected}
                                  onCheckedChange={(checked) => 
                                    handlePlatformAccountToggle(platform.id, account.id, checked as boolean)
                                  }
                                  className="transition-all duration-200"
                                />
                                <Label 
                                  htmlFor={`${platform.id}-${account.id}`}
                                  className="text-sm cursor-pointer hover:text-neo-purple transition-colors duration-200"
                                >
                                  {account.username}
                                </Label>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
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
                    <div className="space-y-6 pl-6 border-l-2 border-neo-purple/20">
                      <div className="space-y-2">
                        <Label htmlFor="timezone">Timezone</Label>
                        <Select value={timezone} onValueChange={setTimezone}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                            <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                            <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                            <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                            <SelectItem value="Europe/London">London (GMT)</SelectItem>
                            <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                            <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                            <SelectItem value="Asia/Shanghai">Shanghai (CST)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-4">
                        <Label>Weekly Schedule</Label>
                        {weekSchedule.map((day, dayIndex) => (
                          <div key={day.day} className="space-y-3 p-4 border rounded-lg">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id={`day-${dayIndex}`}
                                  checked={day.enabled}
                                  onCheckedChange={(checked) => 
                                    handleDayToggle(dayIndex, checked as boolean)
                                  }
                                />
                                <Label htmlFor={`day-${dayIndex}`} className="font-medium">
                                  {day.day}
                                </Label>
                              </div>
                              
                              {day.enabled && (
                                <div className="flex items-center space-x-2">
                                  <Label className="text-sm">Posts per day:</Label>
                                  <Select 
                                    value={day.frequency.toString()} 
                                    onValueChange={(value) => handleFrequencyChange(dayIndex, parseInt(value))}
                                  >
                                    <SelectTrigger className="w-16">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {[1, 2, 3, 4, 5].map(num => (
                                        <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              )}
                            </div>
                            
                            {day.enabled && (
                              <div className="ml-6 space-y-2">
                                <Label className="text-sm text-muted-foreground">Post times:</Label>
                                <div className="grid grid-cols-2 gap-2">
                                  {day.times.map((timeSlot, timeIndex) => (
                                    <div key={timeSlot.id} className="flex items-center space-x-2">
                                      <Clock className="h-4 w-4 text-muted-foreground" />
                                      <Input
                                        type="time"
                                        value={timeSlot.time}
                                        onChange={(e) => handleTimeChange(dayIndex, timeIndex, e.target.value)}
                                        className="w-32"
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <CreditMeter 
                availableCredits={availableCredits} 
                usedThisMonth={usedThisMonth}
                creditsLimit={profile?.credits_limit || 100}
                estimatedUsage={{
                  images: imageCount,
                  model: selectedModelConfig.name,
                  totalCredits: totalCredits
                }}
              />
              
              <Card className="neo-card">
                <CardHeader>
                  <CardTitle>Generation Cost</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Model:</span>
                        <span>{selectedModelConfig.name}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Images:</span>
                        <span>{imageCount} × {selectedModelConfig.credits} credits</span>
                      </div>
                      <div className="flex justify-between font-medium border-t pt-2">
                        <span>Per Generation:</span>
                        <span>{totalCredits} credits</span>
                      </div>
                    </div>
                    
                    {isScheduled && totalPostsPerWeek > 0 && (
                      <div className="space-y-2 border-t pt-3">
                        <div className="text-sm font-medium text-muted-foreground">Frequency Cost:</div>
                        <div className="flex justify-between text-sm">
                          <span>Per Week:</span>
                          <span>{creditsPerWeek.toFixed(1)} credits</span>
                        </div>
                        <div className="flex justify-between text-sm font-medium">
                          <span>Per Month:</span>
                          <span>{creditsPerMonth.toFixed(0)} credits</span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="neo-card">
                <CardHeader>
                  <CardTitle>Publish Options</CardTitle>
                </CardHeader>
                 <CardContent className="space-y-4">
                  <RadioGroup value={publishOption} onValueChange={handlePublishOptionSelect}>
                    <RadioGroupItem value="draft" id="publish-draft">
                      Save as Draft Post
                    </RadioGroupItem>
                    <RadioGroupItem value="publish" id="publish-live">
                      Publish Immediately
                    </RadioGroupItem>
                  </RadioGroup>
                </CardContent>
              </Card>

              <div className="space-y-3">
                <Button
                  onClick={handleSaveDraft}
                  variant="outline"
                  disabled={!canSaveDraft || isSaving}
                  className="w-full hover:scale-105 transition-all duration-300"
                >
                  {isSaving ? 'Saving...' : 'Save Scenario as Draft'}
                </Button>
                
                <Button
                  onClick={handleGenerate}
                  disabled={!canGenerate || isGenerating}
                  className="w-full hover:scale-105 transition-all duration-300"
                >
                  {isGenerating ? 'Generating...' : (isScheduled ? 'Schedule' : 'Run')}
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