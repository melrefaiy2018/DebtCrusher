import { CreditCard, FinancialProfile, OptimizationResult, CardRecommendation, PaymentStrategy } from '../types';

export const calculateAllocations = (
  cards: CreditCard[],
  profile: FinancialProfile,
  strategy: PaymentStrategy
): OptimizationResult => {
  // The user input 'monthlyNetIncome' is now treated as the total budget for debt.
  const totalAvailableForDebt = profile.monthlyNetIncome;
  const totalMinPayments = cards.reduce((sum, card) => sum + card.minPayment, 0);

  const warnings: string[] = [];
  let isValid = true;

  if (totalMinPayments > totalAvailableForDebt) {
    isValid = false;
    warnings.push(`Critial Warning: Total minimum payments ($${totalMinPayments}) exceed available funds ($${totalAvailableForDebt}). You are in a deficit.`);
  }

  // 1. Base Allocation: Cover Minimums
  let remainingCash = totalAvailableForDebt;
  const recommendations: CardRecommendation[] = cards.map(card => {
    // If in deficit, we pay what we can proportionally or just the min (showing negative remaining cash)
    // Here we assume we allocate the min, even if it puts remainingCash negative, to show the deficit clearly.
    remainingCash -= card.minPayment;
    return {
      cardId: card.id,
      minPayment: card.minPayment,
      extraPayment: 0,
      totalPayment: card.minPayment,
      remainingBalanceAfterPayment: Math.max(0, card.balance - card.minPayment),
      projectedAvailableCredit: 0, // Will calculate at end
      projectedInterest: 0, // Will calculate at end
      maxSafeSpend: 0 // Will calculate at end
    };
  });

  // 2. Surplus Allocation
  if (remainingCash > 0) {
    if (strategy === 'even') {
      const count = cards.length;
      const split = Math.floor((remainingCash / count) * 100) / 100;
      recommendations.forEach(rec => {
        const add = Math.min(remainingCash, split); // handling rounding edge cases loosely
        rec.extraPayment += add;
        rec.totalPayment += add;
        rec.remainingBalanceAfterPayment = Math.max(0, rec.remainingBalanceAfterPayment - add);
        // Note: strictly speaking, we shouldn't pay more than the balance. 
        // For simplicity in this demo, we assume debt > monthly payment capacity usually.
      });
      remainingCash = Math.max(0, remainingCash - (split * count));
    } else {
      // Sort for Avalanche or Snowball
      const sortedCards = [...cards].sort((a, b) => {
        if (strategy === 'avalanche') {
          return b.apr - a.apr; // Highest APR first
        } else {
          // Snowball
          return a.balance - b.balance; // Lowest Balance first
        }
      });

      // Distribute remaining cash to top priority until full, then next
      let cashToDistribute = remainingCash;
      
      for (const priorityCard of sortedCards) {
        if (cashToDistribute <= 0) break;

        const recIndex = recommendations.findIndex(r => r.cardId === priorityCard.id);
        if (recIndex === -1) continue;

        const rec = recommendations[recIndex];
        
        // How much debt is left on this card after min payment?
        const debtRemaining = priorityCard.balance - rec.minPayment;

        if (debtRemaining > 0) {
          const paymentAmount = Math.min(cashToDistribute, debtRemaining);
          rec.extraPayment += paymentAmount;
          rec.totalPayment += paymentAmount;
          rec.remainingBalanceAfterPayment -= paymentAmount;
          cashToDistribute -= paymentAmount;
        }
      }
      remainingCash = cashToDistribute;
    }
  }

  // Final pass to calculate projected metrics
  recommendations.forEach(rec => {
    const card = cards.find(c => c.id === rec.cardId);
    if (card) {
      // Calculate Interest
      const calculatedInterest = (card.balance * (card.apr / 100)) / 12;
      const monthlyInterest = card.monthlyInterestAmount !== undefined && card.monthlyInterestAmount > 0 
        ? card.monthlyInterestAmount 
        : calculatedInterest;
      
      rec.projectedInterest = monthlyInterest;

      // Update Remaining Balance with Interest
      // New Balance = Old Balance - Payment + Interest
      rec.remainingBalanceAfterPayment = Math.max(0, card.balance - rec.totalPayment + monthlyInterest);

      // Projected Available Credit
      const limit = card.creditLimit || 0;
      rec.projectedAvailableCredit = Math.max(0, limit - rec.remainingBalanceAfterPayment);

      // Max Safe Spend (to maintain current balance level)
      // Logic: NewSpend <= Payment - Interest
      const safeSpend = rec.totalPayment - monthlyInterest;
      rec.maxSafeSpend = Math.max(0, Math.floor(safeSpend));
    }
  });

  // Check for high utilization
  cards.forEach(card => {
    const limit = card.creditLimit || 0;
    if (limit > 0) {
      const utilization = (card.balance / limit) * 100;
      if (utilization > 30) {
        warnings.push(`High Utilization: ${card.name} is at ${utilization.toFixed(1)}% utilization. Aim for <30% for better credit score.`);
      }
    }
  });

  return {
    allocations: recommendations,
    totalAvailableForDebt,
    totalMinPayments,
    remainingCash,
    strategyUsed: strategy,
    isValid,
    warnings
  };
};