import { useState, useEffect } from 'react';

export interface CreditUsage {
  images: number;
  model: string;
  totalCredits: number;
}

export const useCredits = () => {
  const [availableCredits, setAvailableCredits] = useState(180); // Default for demo
  const [usedThisMonth, setUsedThisMonth] = useState(24);

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

  const deductCredits = (credits: number) => {
    setAvailableCredits(prev => Math.max(0, prev - credits));
    setUsedThisMonth(prev => prev + credits);
  };

  return {
    availableCredits,
    usedThisMonth,
    calculateCredits,
    canAfford,
    deductCredits
  };
};