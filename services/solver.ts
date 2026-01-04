import { CreditCard, FinancialProfile, OptimizationResult, CardRecommendation, PaymentStrategy } from '../types';

export const calculateAllocations = (
  cards: CreditCard[],
  profile: FinancialProfile,
  strategy: PaymentStrategy,
  projectionMonths: number = 6
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

  const projections = generateProjections(cards, totalAvailableForDebt, strategy, projectionMonths);

  return {
    allocations: recommendations,
    totalAvailableForDebt,
    totalMinPayments,
    remainingCash,
    strategyUsed: strategy,
    isValid,
    warnings,
    projections
  };
};

export const generateProjections = (
  initialCards: CreditCard[],
  monthlyBudgetTotal: number,
  strategy: PaymentStrategy,
  months: number = 6
) => {
  const projections: { month: number; totalBalance: number; totalInterestPaid: number; cardBalances: Record<string, number> }[] = [];
  
  // Clone cards for simulation
  let simCards = initialCards.map(c => ({ ...c }));
  let simMonth = 0;
  const MAX_MONTHS = months;

  // Initial state (Month 0)
  const initialBalances: Record<string, number> = {};
  simCards.forEach(c => initialBalances[c.id] = c.balance);

  projections.push({
    month: 0,
    totalBalance: simCards.reduce((sum, c) => sum + c.balance, 0),
    totalInterestPaid: 0,
    cardBalances: initialBalances
  });

  while (simMonth < MAX_MONTHS) {
    simMonth++;
    let monthlyInterestTotal = 0;
    let currentMonthBudget = monthlyBudgetTotal;

    // 1. Apply Interest & Min Payments
    
    // First pass: Add Interest
    simCards.forEach(card => {
        if (card.balance <= 0) return;
        const interest = (card.balance * (card.apr / 100)) / 12;
        monthlyInterestTotal += interest;
        card.balance += interest;
    });

    // Second pass: Pay Minimums
    simCards.forEach(card => {
        if (card.balance <= 0) return;
        const minPay = Math.min(card.balance, card.minPayment);
        card.balance -= minPay;
        currentMonthBudget -= minPay;
    });

    // 3. Distribute Surplus
    if (currentMonthBudget > 0) {
        if (strategy === 'even') {
            const activeCards = simCards.filter(c => c.balance > 0);
            if (activeCards.length > 0) {
                const split = currentMonthBudget / activeCards.length;
                activeCards.forEach(c => {
                    const pay = Math.min(c.balance, split);
                    c.balance -= pay;
                    currentMonthBudget -= pay;
                });
            }
        } else {
            // Avalanche / Snowball / LLM (fallback to Avalanche for projection)
            const sortStrategy = strategy === 'llm' ? 'avalanche' : strategy;
            
            const sortedSim = [...simCards].filter(c => c.balance > 0).sort((a, b) => {
                 if (sortStrategy === 'avalanche') return b.apr - a.apr;
                 return a.balance - b.balance;
            });

            for (const card of sortedSim) {
                if (currentMonthBudget <= 0.01) break;
                const pay = Math.min(card.balance, currentMonthBudget);
                card.balance -= pay;
                currentMonthBudget -= pay;
            }
        }
    }

    const currentBalances: Record<string, number> = {};
    simCards.forEach(c => currentBalances[c.id] = Math.max(0, c.balance));

    projections.push({
        month: simMonth,
        totalBalance: Math.max(0, simCards.reduce((sum, c) => sum + c.balance, 0)),
        totalInterestPaid: monthlyInterestTotal,
        cardBalances: currentBalances
    });
  }
  return projections;
};