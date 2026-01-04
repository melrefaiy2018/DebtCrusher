import { CreditCard, FinancialProfile, OptimizationResult, PaymentStrategy, LLMPayload } from '../types';
import { calculateAllocations } from './solver'; // Used for fallback validation

const LM_STUDIO_ENDPOINT = 'http://localhost:1234/v1/chat/completions';

const SYSTEM_PROMPT = `
You are an expert financial algorithm designed to optimize debt repayment.
You always output valid JSON only. No markdown formatting, no explanations outside the JSON.
Your goal is to allocate a monthly budget to a list of credit cards.
Constraint 1: You MUST cover the minimum payment for every card.
Constraint 2: You CANNOT exceed the total available debt cash.
Constraint 3: You should optimize for the user's request (e.g. minimize interest).
`;

export const getLLMRecommendations = async (
  cards: CreditCard[],
  profile: FinancialProfile
): Promise<OptimizationResult> => {
  
  // The user input 'monthlyNetIncome' is now treated as the total budget for debt.
  const availableForDebt = profile.monthlyNetIncome;

  const payload: LLMPayload = {
    profile,
    cards,
    availableForDebt
  };

  const userPrompt = `
  Analyze this financial data and recommend payments.
  Data: ${JSON.stringify(payload)}

  Return a JSON object with this exact structure:
  {
    "allocations": [
      { "cardId": "string", "recommendedPayment": number, "reasoning": "short string" }
    ],
    "analysis": "short summary of strategy"
  }
  
  Ensure sum of recommendedPayment <= ${availableForDebt}.
  Ensure recommendedPayment >= minPayment for each card.
  `;

  try {
    const response = await fetch(LM_STUDIO_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'local-model', // LM Studio usually accepts any model name here or the loaded one
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.2, // Low temp for deterministic math
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error('Failed to connect to LM Studio');
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Attempt to parse JSON (sometimes models wrap in markdown ```json ... ```)
    const jsonStr = content.replace(/```json\n?|```/g, '').trim();
    const result = JSON.parse(jsonStr);

    // Map LLM result back to our strict OptimizationResult type
    // We perform a safety pass here to ensure the LLM didn't hallucinate invalid math
    const totalMinPayments = cards.reduce((sum, c) => sum + c.minPayment, 0);
    let calculatedUsedCash = 0;

    const allocations = cards.map(card => {
        const llmRec = result.allocations?.find((r: any) => r.cardId === card.id);
        const rawPayment = llmRec ? Number(llmRec.recommendedPayment) : card.minPayment;
        
        // Safety Clamp: Must be at least minPayment
        const safePayment = Math.max(rawPayment, card.minPayment);
        calculatedUsedCash += safePayment;

        // Calculate Interest
        const calculatedInterest = (card.balance * (card.apr / 100)) / 12;
        const monthlyInterest = card.monthlyInterestAmount !== undefined && card.monthlyInterestAmount > 0 
          ? card.monthlyInterestAmount 
          : calculatedInterest;

        // Update Remaining Balance with Interest
        const remainingBalanceAfterPayment = Math.max(0, card.balance - safePayment + monthlyInterest);
        
        // Calculate projected metrics
        const limit = card.creditLimit || 0;
        const projectedAvailableCredit = Math.max(0, limit - remainingBalanceAfterPayment);
        
        const safeSpend = safePayment - monthlyInterest;
        const maxSafeSpend = Math.max(0, Math.floor(safeSpend));

        return {
            cardId: card.id,
            minPayment: card.minPayment,
            extraPayment: safePayment - card.minPayment,
            totalPayment: safePayment,
            remainingBalanceAfterPayment,
            projectedAvailableCredit,
            projectedInterest: monthlyInterest,
            maxSafeSpend,
            notes: llmRec?.reasoning || 'AI Recommended'
        };
    });

    const isValid = calculatedUsedCash <= availableForDebt && calculatedUsedCash >= totalMinPayments;
    const warnings = [];
    if (calculatedUsedCash > availableForDebt) warnings.push("LLM attempted to overspend. Amounts may have been clamped or are unsafe.");

    return {
      allocations,
      totalAvailableForDebt: availableForDebt,
      totalMinPayments,
      remainingCash: availableForDebt - calculatedUsedCash,
      strategyUsed: 'llm',
      isValid,
      warnings
    };

  } catch (error) {
    console.error("LLM Error:", error);
    // Fallback to Avalanche if LLM fails
    const fallback = calculateAllocations(cards, profile, 'avalanche');
    fallback.warnings.push("LLM connection failed. Fell back to Avalanche strategy.");
    return fallback;
  }
};