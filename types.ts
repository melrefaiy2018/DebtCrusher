export interface CreditCard {
  id: string;
  name: string;
  balance: number;
  creditLimit: number;
  apr: number;
  monthlyInterestAmount?: number;
  minPayment: number;
  dueDate: string;
}

export interface FinancialProfile {
  monthlyNetIncome: number;
  strategy?: PaymentStrategy;
}

export type PaymentStrategy = 'avalanche' | 'snowball' | 'even' | 'llm';

export interface CardRecommendation {
  cardId: string;
  minPayment: number;
  extraPayment: number;
  totalPayment: number;
  remainingBalanceAfterPayment: number;
  projectedAvailableCredit: number;
  projectedInterest: number;
  maxSafeSpend: number;
  notes?: string;
}

export interface ProjectionPoint {
  month: number;
  totalBalance: number;
  totalInterestPaid: number;
  cardBalances: Record<string, number>;
}

export interface OptimizationResult {
  allocations: CardRecommendation[];
  totalAvailableForDebt: number;
  totalMinPayments: number;
  remainingCash: number;
  strategyUsed: PaymentStrategy;
  isValid: boolean;
  warnings: string[];
  projections: ProjectionPoint[];
}

export interface LLMPayload {
  profile: FinancialProfile;
  cards: CreditCard[];
  availableForDebt: number;
  strategy: PaymentStrategy;
}