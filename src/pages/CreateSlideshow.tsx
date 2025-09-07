import React, { useState, useEffect } from 'react';
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
import { CreditMeter } from '@/components/CreditMeter';
import { ArrowLeft, Plus, X, Clock, Calendar } from 'lucide-react';
import { useCredits } from '@/hooks/useCredits';
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
  const { createScenario, updateScenario, getScenarioById, saveDraft, loadDraft, clearDraft } = useScenarios();
  const { platforms, getConnectedPlatforms } = usePlatforms();
  const [searchParams] = useSearchParams();
  const editingId = searchParams.get('edit');
  
  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [imageCount, setImageCount] = useState(5);
  const [selectedPlatforms, setSelectedPlatforms] = useState<PlatformSelection[]>([]);
  const [isScheduled, setIsScheduled] = useState(false);
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
  const totalCredits = imageCount * 1; // Base credit cost
  const canGenerate = title.trim() && prompt.trim() && canAfford(totalCredits) && selectedPlatforms.length > 0;
  const canSaveDraft = title.trim() && prompt.trim();

  // Load draft on mount and handle editing scenario
  useEffect(() => {
    if (editingId) {
      const scenario = getScenarioById(editingId);
      if (scenario) {
        setTitle(scenario.title);
        setPrompt(scenario.description || '');
        setIsScheduled(scenario.is_scheduled);
        // Initialize platform selections from stored platforms array
        const platformSelections = scenario.platforms.map(platformId => ({
          platformId,
          accountIds: [] // Default to empty, would need to be stored in DB
        }));
        setSelectedPlatforms(platformSelections);
      }
    } else {
      // Load draft for new scenario
      const draft = loadDraft();
      if (draft) {
        setTitle(draft.title || '');
        setPrompt(draft.description || '');
        setIsScheduled(draft.is_scheduled || false);
        // Load platform selections from draft
        const platformSelections = (draft.platforms || []).map(platformId => ({
          platformId,
          accountIds: []
        }));
        setSelectedPlatforms(platformSelections);
      }
    }
  }, [editingId, getScenarioById, loadDraft]);

  // Auto-save draft
  useEffect(() => {
    if (!editingId && (title || prompt)) {
      const draftData = {
        title,
        description: prompt,
        niche: 'general', // Default niche
        platforms: selectedPlatforms.map(p => p.platformId),
        is_scheduled: isScheduled,
      };
      saveDraft(draftData);
    }
  }, [title, prompt, selectedPlatforms, isScheduled, editingId, saveDraft]);

  const handlePlatformToggle = (platformId: string, checked: boolean) => {
    if (checked) {
      const platform = connectedPlatforms.find(p => p.id === platformId);
      if (platform && platform.accounts.length > 0) {
        setSelectedPlatforms([...selectedPlatforms, {
          platformId,
          accountIds: [platform.accounts[0].id] // Default to first account
        }]);
      }
    } else {
      setSelectedPlatforms(selectedPlatforms.filter(p => p.platformId !== platformId));
    }
  };

  const handleAccountToggle = (platformId: string, accountId: string, checked: boolean) => {
    setSelectedPlatforms(selectedPlatforms.map(platform => {
      if (platform.platformId === platformId) {
        if (checked) {
          return { ...platform, accountIds: [...platform.accountIds, accountId] };
        } else {
          return { ...platform, accountIds: platform.accountIds.filter(id => id !== accountId) };
        }
      }
      return platform;
    }));
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
        title,
        description: prompt,
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
      // First save/update the scenario
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

      // Then generate content
      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: {
          prompt,
          imageCount,
          platforms: selectedPlatforms.map(p => p.platformId),
          title,
          scenarioId
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
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="prompt">Content Prompt *</Label>
                    <Textarea
                      id="prompt"
                      placeholder="Describe what kind of content you want to create..."
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      rows={4}
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
                        onChange={(e) => setImageCount(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                        className="w-20"
                      />
                      <Badge variant="outline">{imageCount} image{imageCount !== 1 ? 's' : ''}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Platform Selection */}
              <Card className="neo-card">
                <CardHeader>
                  <CardTitle>Target Platforms & Accounts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {connectedPlatforms.map((platform) => {
                    const isSelected = selectedPlatforms.some(p => p.platformId === platform.id);
                    const selectedPlatform = selectedPlatforms.find(p => p.platformId === platform.id);
                    
                    return (
                      <div key={platform.id} className="space-y-3 p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            id={platform.id}
                            checked={isSelected}
                            onCheckedChange={(checked) => 
                              handlePlatformToggle(platform.id, checked as boolean)
                            }
                          />
                          <span className="text-2xl">{platform.icon}</span>
                          <Label htmlFor={platform.id} className="font-medium">{platform.name}</Label>
                        </div>
                        
                        {isSelected && platform.accounts.length > 0 && (
                          <div className="ml-6 space-y-2">
                            <Label className="text-sm text-muted-foreground">Select accounts:</Label>
                            {platform.accounts.map((account) => (
                              <div key={account.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`${platform.id}-${account.id}`}
                                  checked={selectedPlatform?.accountIds.includes(account.id) || false}
                                  onCheckedChange={(checked) => 
                                    handleAccountToggle(platform.id, account.id, checked as boolean)
                                  }
                                />
                                <Label 
                                  htmlFor={`${platform.id}-${account.id}`}
                                  className="text-sm"
                                >
                                  {account.username}
                                </Label>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
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
              />
              
              <Card className="neo-card">
                <CardHeader>
                  <CardTitle>Generation Cost</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Images:</span>
                      <span>{imageCount} × 1 credit</span>
                    </div>
                    <div className="flex justify-between font-medium border-t pt-2">
                      <span>Total:</span>
                      <span>{totalCredits} credits</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-3">
                <Button
                  onClick={handleSaveDraft}
                  variant="outline"
                  disabled={!canSaveDraft || isSaving}
                  className="w-full"
                >
                  {isSaving ? 'Saving...' : 'Save as Draft'}
                </Button>
                
                <Button
                  onClick={handleGenerate}
                  disabled={!canGenerate || isGenerating}
                  className="w-full"
                >
                  {isGenerating ? 'Generating...' : 'Generate Content'}
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