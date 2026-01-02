import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface Scenario {
  id: string;
  user_id: string;
  title: string;
  prompt: string;
  type: 'image' | 'video';
  ai_model: string;
  image_count: number | null;
  custom_thumbnail_url: string | null;
  schedule_type: 'daily' | 'custom';
  schedule_time: string;
  schedule_days: string[] | null;
  target_accounts: string[];
  privacy: 'public' | 'private';
  status: 'draft' | 'active' | 'inactive';
  next_run_at: string | null;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface CreateScenarioData {
  title: string;
  prompt: string;
  type: 'image' | 'video';
  ai_model: string;
  image_count?: number;
  custom_thumbnail_url?: string;
  schedule_type: 'daily' | 'custom';
  schedule_time: string;
  schedule_days?: string[];
  target_accounts: string[];
  privacy: 'public' | 'private';
  timezone?: string;
}

// Mock data storage - replace with actual API calls
const SCENARIOS_STORAGE_KEY = 'mock_scenarios';

export const useScenarios = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const userId = (user as any)?._id || (user as any)?.id || null;

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    loadScenarios();
  }, [userId]);

  const loadScenarios = async () => {
    if (!userId) return;

    try {
      // Mock implementation - load from localStorage
      // In a real app, this would be an API call to your backend
      const storedScenarios = localStorage.getItem(SCENARIOS_STORAGE_KEY);
      const allScenarios: Scenario[] = storedScenarios ? JSON.parse(storedScenarios) : [];

      // Filter scenarios for the current user
      const userScenarios = allScenarios.filter(s => s.user_id === userId);
      setScenarios(userScenarios);
    } catch (error: any) {
      console.error('Error loading scenarios:', error);
      toast({
        title: "Error",
        description: "Failed to load scenarios",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveToStorage = (updatedScenarios: Scenario[]) => {
    // Get all scenarios from storage
    const storedScenarios = localStorage.getItem(SCENARIOS_STORAGE_KEY);
    const allScenarios: Scenario[] = storedScenarios ? JSON.parse(storedScenarios) : [];

    // Remove current user's scenarios and add updated ones
    const otherUsersScenarios = allScenarios.filter(s => s.user_id !== userId);
    const newAllScenarios = [...otherUsersScenarios, ...updatedScenarios];

    // Save back to storage
    localStorage.setItem(SCENARIOS_STORAGE_KEY, JSON.stringify(newAllScenarios));
  };

  const createScenario = async (scenarioData: CreateScenarioData): Promise<Scenario | null> => {
    if (!userId) return null;

    try {
      // Mock implementation - in a real app, this would call your backend API
      const newScenario: Scenario = {
        id: crypto.randomUUID(),
        user_id: userId,
        ...scenarioData,
        image_count: scenarioData.image_count ?? null,
        custom_thumbnail_url: scenarioData.custom_thumbnail_url ?? null,
        schedule_days: scenarioData.schedule_days ?? null,
        status: 'draft',
        next_run_at: null,
        timezone: scenarioData.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const updatedScenarios = [newScenario, ...scenarios];
      setScenarios(updatedScenarios);
      saveToStorage(updatedScenarios);

      toast({
        title: "Success",
        description: "Scenario created successfully",
      });

      return newScenario;
    } catch (error: any) {
      console.error('Error creating scenario:', error);
      toast({
        title: "Error",
        description: "Failed to create scenario",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateScenario = async (id: string, updates: Partial<Scenario>): Promise<boolean> => {
    if (!userId) return false;

    try {
      // Mock implementation - in a real app, this would call your backend API
      const updatedScenarios = scenarios.map(scenario =>
        scenario.id === id
          ? { ...scenario, ...updates, updated_at: new Date().toISOString() }
          : scenario
      );

      setScenarios(updatedScenarios);
      saveToStorage(updatedScenarios);

      return true;
    } catch (error: any) {
      console.error('Error updating scenario:', error);
      toast({
        title: "Error",
        description: "Failed to update scenario",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteScenario = async (id: string): Promise<boolean> => {
    if (!userId) return false;

    try {
      // Mock implementation - in a real app, this would call your backend API
      const updatedScenarios = scenarios.filter(scenario => scenario.id !== id);
      setScenarios(updatedScenarios);
      saveToStorage(updatedScenarios);

      toast({
        title: "Success",
        description: "Scenario deleted successfully",
      });

      return true;
    } catch (error: any) {
      console.error('Error deleting scenario:', error);
      toast({
        title: "Error",
        description: "Failed to delete scenario",
        variant: "destructive",
      });
      return false;
    }
  };

  const getScenarioById = (id: string): Scenario | undefined => {
    return scenarios.find(scenario => scenario.id === id);
  };

  const getScheduledScenarios = (): Scenario[] => {
    return scenarios.filter(scenario => scenario.status === 'active' && scenario.next_run_at);
  };

  const getUnscheduledScenarios = (): Scenario[] => {
    return scenarios.filter(scenario => scenario.status === 'draft');
  };

  const pauseScenario = async (id: string): Promise<boolean> => {
    return updateScenario(id, { status: 'inactive' });
  };

  const resumeScenario = async (id: string): Promise<boolean> => {
    return updateScenario(id, { status: 'active' });
  };

  const saveDraft = (draftData: Partial<CreateScenarioData>) => {
    localStorage.setItem('scenario_draft', JSON.stringify(draftData));
  };

  const loadDraft = (): Partial<CreateScenarioData> | null => {
    const draft = localStorage.getItem('scenario_draft');
    return draft ? JSON.parse(draft) : null;
  };

  const clearDraft = () => {
    localStorage.removeItem('scenario_draft');
  };

  return {
    scenarios,
    loading,
    createScenario,
    updateScenario,
    deleteScenario,
    getScenarioById,
    getScheduledScenarios,
    getUnscheduledScenarios,
    pauseScenario,
    resumeScenario,
    saveDraft,
    loadDraft,
    clearDraft,
    refreshScenarios: loadScenarios
  };
};
