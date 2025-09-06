import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface CreditUsage {
  images: number;
  model: string;
  totalCredits: number;
}

export interface CreditTransaction {
  id: string;
  amount: number;
  transaction_type: 'purchase' | 'usage' | 'refund' | 'bonus';
  description: string | null;
  scenario_id: string | null;
  metadata: any;
  created_at: string;
}

export const useCredits = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [availableCredits, setAvailableCredits] = useState(0);
  const [usedThisMonth, setUsedThisMonth] = useState(0);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);

  // Load user credits and transactions
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    loadCreditsData();
  }, [user]);

  const loadCreditsData = async () => {
    if (!user) return;

    try {
      // Get user profile for credit limits
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('credits_limit, credits_used')
        .eq('user_id', user.id)
        .single();

      if (profileError) throw profileError;

      // Calculate available credits
      const available = (profile.credits_limit || 100) - (profile.credits_used || 0);
      setAvailableCredits(Math.max(0, available));
      setUsedThisMonth(profile.credits_used || 0);

      // Load recent transactions
      const { data: transactionData, error: transactionError } = await supabase
        .from('credit_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (transactionError) throw transactionError;
      setTransactions((transactionData || []) as CreditTransaction[]);
    } catch (error: any) {
      console.error('Error loading credits data:', error);
      toast({
        title: "Error",
        description: "Failed to load credit information",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateCredits = (images: number, model: string): CreditUsage => {
    const multiplier = model.includes('Ultra') || model.includes('Max') ? 2 : 1;
    const totalCredits = images * multiplier;
    
    return {
      images,
      model,
      totalCredits
    };
  };

  const canAfford = (credits: number): boolean => {
    return credits <= availableCredits;
  };

  const deductCredits = async (
    credits: number, 
    description?: string, 
    scenarioId?: string,
    metadata?: any
  ): Promise<boolean> => {
    if (!user) return false;
    
    if (!canAfford(credits)) {
      toast({
        title: "Insufficient Credits",
        description: "You don't have enough credits for this action",
        variant: "destructive",
      });
      return false;
    }

    try {
      // Record the transaction
      const { error: transactionError } = await supabase
        .from('credit_transactions')
        .insert({
          user_id: user.id,
          amount: -credits,
          transaction_type: 'usage',
          description: description || 'Content generation',
          scenario_id: scenarioId,
          metadata
        });

      if (transactionError) throw transactionError;

      // Update user profile credits_used
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          credits_used: usedThisMonth + credits
        })
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      // Update local state
      setAvailableCredits(prev => Math.max(0, prev - credits));
      setUsedThisMonth(prev => prev + credits);

      // Reload data to ensure consistency
      await loadCreditsData();

      return true;
    } catch (error: any) {
      console.error('Error deducting credits:', error);
      toast({
        title: "Error",
        description: "Failed to process credit transaction",
        variant: "destructive",
      });
      return false;
    }
  };

  const addCredits = async (
    credits: number,
    type: 'purchase' | 'bonus' | 'refund',
    description?: string
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      // Record the transaction
      const { error: transactionError } = await supabase
        .from('credit_transactions')
        .insert({
          user_id: user.id,
          amount: credits,
          transaction_type: type,
          description: description || `Credits ${type}`
        });

      if (transactionError) throw transactionError;

      // Update user profile credits_used (negative usage = more available)
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          credits_used: Math.max(0, usedThisMonth - credits)
        })
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      // Reload data
      await loadCreditsData();

      toast({
        title: "Credits Added",
        description: `${credits} credits have been added to your account`,
      });

      return true;
    } catch (error: any) {
      console.error('Error adding credits:', error);
      toast({
        title: "Error",
        description: "Failed to add credits",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    availableCredits,
    usedThisMonth,
    loading,
    transactions,
    calculateCredits,
    canAfford,
    deductCredits,
    addCredits,
    refreshCredits: loadCreditsData
  };
};