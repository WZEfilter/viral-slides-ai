/**
 * Credit Management Utilities
 * Handles atomic credit deduction and refunds with row-level locking
 */

import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

export interface CreditTransaction {
  user_id: string;
  amount: number;
  type: 'deduction' | 'refund' | 'purchase';
  reason: string;
  generation_id?: string;
  metadata?: Record<string, any>;
}

/**
 * Deduct credits from user account with row-level locking
 * Returns true if successful, false if insufficient credits
 */
export async function deductCredits(
  supabase: SupabaseClient,
  userId: string,
  amount: number,
  reason: string,
  generationId?: string
): Promise<{ success: boolean; remainingCredits?: number; error?: string }> {
  try {
    // Use RPC function with row-level locking to prevent race conditions
    const { data, error } = await supabase.rpc('deduct_credits', {
      p_user_id: userId,
      p_amount: amount,
      p_reason: reason,
      p_generation_id: generationId,
    });

    if (error) {
      console.error('Credit deduction error:', error);
      return { success: false, error: error.message };
    }

    if (!data || data.success === false) {
      return {
        success: false,
        error: 'Insufficient credits',
        remainingCredits: data?.remaining_credits || 0,
      };
    }

    return {
      success: true,
      remainingCredits: data.remaining_credits,
    };
  } catch (error) {
    console.error('Credit deduction exception:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Refund credits to user account
 * Always succeeds (adds credits, cannot fail due to balance)
 */
export async function refundCredits(
  supabase: SupabaseClient,
  userId: string,
  amount: number,
  reason: string,
  generationId?: string
): Promise<{ success: boolean; newBalance?: number; error?: string }> {
  try {
    const { data, error } = await supabase.rpc('refund_credits', {
      p_user_id: userId,
      p_amount: amount,
      p_reason: reason,
      p_generation_id: generationId,
    });

    if (error) {
      console.error('Credit refund error:', error);
      return { success: false, error: error.message };
    }

    return {
      success: true,
      newBalance: data?.new_balance || 0,
    };
  } catch (error) {
    console.error('Credit refund exception:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get user's current credit balance
 */
export async function getCreditBalance(
  supabase: SupabaseClient,
  userId: string
): Promise<{ balance: number; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('credits')
      .eq('id', userId)
      .single();

    if (error) {
      return { balance: 0, error: error.message };
    }

    return { balance: data?.credits || 0 };
  } catch (error) {
    console.error('Get balance exception:', error);
    return {
      balance: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Calculate credit cost for a generation
 */
export function calculateCreditCost(type: 'image' | 'video', imageCount?: number): number {
  if (type === 'video') {
    return 12; // Fixed cost for video generation
  }

  // Image generation: 1 credit per image
  return imageCount || 1;
}

/**
 * Check if user has sufficient credits
 */
export async function hasEnoughCredits(
  supabase: SupabaseClient,
  userId: string,
  requiredAmount: number
): Promise<{ hasEnough: boolean; current: number; required: number }> {
  const { balance } = await getCreditBalance(supabase, userId);

  return {
    hasEnough: balance >= requiredAmount,
    current: balance,
    required: requiredAmount,
  };
}
