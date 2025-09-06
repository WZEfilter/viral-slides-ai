import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  user_id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  credits_used: number;
  credits_limit: number;
  subscription_tier: string;
  created_at: string;
  updated_at: string;
}

export const useProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        // If profile doesn't exist, create one
        if (error.code === 'PGRST116') {
          await createProfile();
          return;
        }
        throw error;
      }

      setProfile(data);
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          user_id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || null,
          credits_used: 0,
          credits_limit: 100,
          subscription_tier: 'free'
        })
        .select()
        .single();

      if (error) throw error;

      setProfile(data);
    } catch (error: any) {
      console.error('Error creating profile:', error);
      toast({
        title: "Error",
        description: "Failed to create profile",
        variant: "destructive",
      });
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user || !profile) return null;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setProfile(data);
      return data;
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
      return null;
    }
  };

  const deductCredits = async (amount: number, description?: string) => {
    if (!user || !profile) return false;

    const newCreditsUsed = profile.credits_used + amount;
    
    if (newCreditsUsed > profile.credits_limit) {
      toast({
        title: "Insufficient Credits",
        description: "You don't have enough credits for this action. Please upgrade your plan.",
        variant: "destructive",
      });
      return false;
    }

    try {
      // Update profile credits
      const updatedProfile = await updateProfile({
        credits_used: newCreditsUsed
      });

      if (!updatedProfile) return false;

      // Record the transaction
      await supabase
        .from('credit_transactions')
        .insert({
          user_id: user.id,
          amount: -amount,
          transaction_type: 'deduction',
          description: description || 'Credit usage',
          metadata: { 
            credits_before: profile.credits_used,
            credits_after: newCreditsUsed
          }
        });

      return true;
    } catch (error: any) {
      console.error('Error deducting credits:', error);
      toast({
        title: "Error",
        description: "Failed to process credit deduction",
        variant: "destructive",
      });
      return false;
    }
  };

  const getRemainingCredits = () => {
    if (!profile) return 0;
    return profile.credits_limit - profile.credits_used;
  };

  const getUsagePercentage = () => {
    if (!profile) return 0;
    return (profile.credits_used / profile.credits_limit) * 100;
  };

  return {
    profile,
    loading,
    fetchProfile,
    updateProfile,
    deductCredits,
    getRemainingCredits,
    getUsagePercentage,
  };
};