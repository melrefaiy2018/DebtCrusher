export interface CreditCard {
  id: string;
  name: string;
  balance: number;
  apr: number;
  minPayment: number;
  dueDate: string;
}

export interface FinancialProfile {
  monthlyNetIncome: number;
}

export type PaymentStrategy = 'avalanche' | 'snowball' | 'even' | 'llm';

export interface CardRecommendation {
  cardId: string;
  minPayment: number;
  extraPayment: number;
  totalPayment: number;
  remainingBalanceAfterPayment: number;
  notes?: string;
}

export interface OptimizationResult {
  allocations: CardRecommendation[];
  totalAvailableForDebt: number;
  totalMinPayments: number;
  remainingCash: number;
  strategyUsed: PaymentStrategy;
  isValid: boolean;
  warnings: string[];
}

export interface LLMPayload {
  profile: FinancialProfile;
  cards: CreditCard[];
  availableForDebt: number;
}