import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface Scenario {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  niche: string;
  target_audience: string | null;
  content_style: string | null;
  platforms: string[];
  status: 'draft' | 'active' | 'paused' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface CreateScenarioData {
  title: string;
  description?: string;
  niche: string;
  target_audience?: string;
  content_style?: string;
  platforms: string[];
}

export const useScenarios = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    loadScenarios();
  }, [user]);

  const loadScenarios = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('scenarios')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setScenarios((data || []) as Scenario[]);
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

  const createScenario = async (scenarioData: CreateScenarioData): Promise<Scenario | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('scenarios')
        .insert({
          user_id: user.id,
          ...scenarioData
        })
        .select()
        .single();

      if (error) throw error;

      setScenarios(prev => [data as Scenario, ...prev]);
      
      toast({
        title: "Success",
        description: "Scenario created successfully",
      });

      return data as Scenario;
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
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from('scenarios')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setScenarios(prev => prev.map(scenario => 
        scenario.id === id ? (data as Scenario) : scenario
      ));

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
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('scenarios')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setScenarios(prev => prev.filter(scenario => scenario.id !== id));
      
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

  return {
    scenarios,
    loading,
    createScenario,
    updateScenario,
    deleteScenario,
    getScenarioById,
    refreshScenarios: loadScenarios
  };
};