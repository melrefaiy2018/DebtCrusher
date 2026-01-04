import { CreditCard, FinancialProfile, OptimizationResult, PaymentStrategy, LLMPayload } from '../types';
import { calculateAllocations, generateProjections } from './solver'; // Used for fallback validation

const LM_STUDIO_ENDPOINT = 'http://localhost:1234/v1/chat/completions';

// Validates that allocations match the requested strategy
const validateStrategyCompliance = (
  cards: CreditCard[],
  allocations: { cardId: string; totalPayment: number; minPayment: number }[],
  strategy: PaymentStrategy
): { isValid: boolean; warning?: string } => {
  // Get cards with extra payments
  const cardsWithExtras = allocations
    .map(alloc => {
      const card = cards.find(c => c.id === alloc.cardId)!;
      const extraPayment = alloc.totalPayment - alloc.minPayment;
      return { ...card, extraPayment, totalPayment: alloc.totalPayment };
    })
    .filter(c => c.extraPayment > 0.01); // Ignore trivial extras

  if (cardsWithExtras.length === 0) {
    // No extras to validate
    return { isValid: true };
  }

  switch (strategy) {
    case 'avalanche': {
      // Extras should go to highest APR cards first
      const sorted = [...cardsWithExtras].sort((a, b) => b.apr - a.apr);
      const sortedByExtra = [...cardsWithExtras].sort((a, b) => b.extraPayment - a.extraPayment);

      // Check if highest extra payments align with highest APRs
      const topCard = sorted[0];
      const cardWithMostExtra = sortedByExtra[0];

      if (Math.abs(topCard.apr - cardWithMostExtra.apr) > 0.1) {
        return {
          isValid: false,
          warning: `LLM allocation pattern does not match requested avalanche strategy (highest extra should go to highest APR)`
        };
      }
      break;
    }

    case 'snowball': {
      // Extras should go to smallest balance cards first
      const sorted = [...cardsWithExtras].sort((a, b) => a.balance - b.balance);
      const sortedByExtra = [...cardsWithExtras].sort((a, b) => b.extraPayment - a.extraPayment);

      const topCard = sorted[0];
      const cardWithMostExtra = sortedByExtra[0];

      if (topCard.id !== cardWithMostExtra.id) {
        return {
          isValid: false,
          warning: `LLM allocation pattern does not match requested snowball strategy (highest extra should go to smallest balance)`
        };
      }
      break;
    }

    case 'even': {
      // Extras should be distributed evenly
      const extraPayments = cardsWithExtras.map(c => c.extraPayment);
      const mean = extraPayments.reduce((a, b) => a + b, 0) / extraPayments.length;
      const variance = extraPayments.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / extraPayments.length;
      const stdDev = Math.sqrt(variance);

      // Allow 10% tolerance
      if (stdDev > mean * 0.1) {
        return {
          isValid: false,
          warning: `LLM allocation pattern does not match requested even strategy (extras are not evenly distributed)`
        };
      }
      break;
    }
  }

  return { isValid: true };
};

const SYSTEM_PROMPT = `
You are an expert financial allocation engine that optimizes credit card debt repayment for a single month.

You MUST follow ALL of these rules:

1. Output format:
   - You MUST respond with a single valid JSON object only.
   - Do NOT include markdown, backticks, comments, or any text outside the JSON.
   - Do NOT add extra top-level fields beyond those requested.
   - All numeric values MUST be JSON numbers, not strings.

2. Objective:
   - Allocate a given monthly debt budget ("availableForDebt") across a list of credit cards.
   - Always respect hard constraints first, then optimize for the user's strategy (e.g. minimize interest).

3. Hard constraints (must NEVER be violated):
   - You MUST cover at least the minimum payment for every card when the total budget allows it.
   - You MUST NOT allocate more than the total availableForDebt.
   - You MUST NOT allocate a negative payment.
   - You MUST NOT allocate more than the current balance of a card.
   - If availableForDebt is less than the sum of all minimum payments, you MUST:
     - Allocate proportionally or by priority, but NEVER exceed availableForDebt.
     - Clearly indicate this shortfall in the "analysis" field.

4. Strategy compliance (CRITICAL):
   - You MUST read the "strategy" field from the input.
   - You MUST follow the specified strategy EXACTLY when allocating extra payments beyond minimums:
     - "avalanche": prioritize extra payments to highest APR cards first (descending APR order).
     - "snowball": prioritize extra payments to smallest balances first (ascending balance order).
     - "even": distribute remaining cash as evenly as possible after minimums.
   - You MUST echo back the EXACT strategy value in the "strategyUsed" field of your response.
   - Do NOT invent or choose a different strategy than the one provided.
   - Avoid leaving tiny residual balances when a card can be fully paid off with a small extra amount.

5. Consistency and safety:
   - The sum of all "recommendedPayment" values MUST be <= availableForDebt.
   - When possible, the sum of all "recommendedPayment" values SHOULD be >= the sum of minPayment values.
   - If any card has clearly invalid data (e.g. negative balance, negative minPayment, negative APR), treat it as non-payable this month and explain this in the "analysis" field.
   - Your output must be internally consistent: IDs must match the input card IDs and totals must add up correctly.

If you cannot respect the required JSON structure or detect fatally invalid input, return:
{
  "strategyUsed": "avalanche",
  "allocations": [],
  "analysis": "error: invalid input or constraints cannot be satisfied"
}
`;

export const getLLMRecommendations = async (
  cards: CreditCard[],
  profile: FinancialProfile,
  projectionMonths: number = 6
): Promise<OptimizationResult> => {
  // Default strategy to 'avalanche' for deterministic behavior
  const strategy: PaymentStrategy = profile.strategy || 'avalanche';

  // The user input 'monthlyNetIncome' is now treated as the total budget for debt.
  const availableForDebt = profile.monthlyNetIncome;

  // Sort cards by ID for deterministic input order
  const sortedCards = [...cards].sort((a, b) => a.id.localeCompare(b.id));

  const payload: LLMPayload = {
    profile: { ...profile, strategy },
    cards: sortedCards,
    availableForDebt,
    strategy
  };

  const userPrompt = `
You are given this financial data as JSON:
${JSON.stringify(payload)}

The "strategy" field is set to "${strategy}". You MUST follow this strategy when allocating extra payments beyond minimums.

Allocate the availableForDebt amount across the provided cards for THIS MONTH ONLY.

You MUST return a single JSON object with EXACTLY this structure:

{
  "strategyUsed": "${strategy}",
  "allocations": [
    { "cardId": "string", "recommendedPayment": number, "reasoning": "short string" }
  ],
  "analysis": "short summary of strategy and any constraint issues"
}

Rules you MUST follow:
- "strategyUsed" MUST be the exact value "${strategy}" (echo back the input strategy).
- "cardId" MUST match one of the input cards' "id" fields.
- "recommendedPayment" MUST be:
  - >= the card's minimum payment when the total budget allows,
  - >= 0,
  - <= the card's current balance,
  - and the sum of all recommendedPayment values MUST be <= ${availableForDebt}.
- If ${availableForDebt} is not enough to cover all minimum payments:
  - Allocate the budget in a reasonable, prioritized way (e.g. by due date or APR),
  - And clearly mention in "analysis" that minimums could not all be met.
- Use "reasoning" to briefly explain per-card decisions in 1–2 short sentences each.
- Follow the "${strategy}" strategy exactly for allocating extra payments.

Return ONLY the JSON object. Do NOT wrap it in backticks or markdown.
`;

  try {
    const response = await fetch(LM_STUDIO_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'local-model', // Replace with the actual LM Studio model identifier you load.[web:20][web:21]
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0, // Maximum determinism
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
      const monthlyInterest =
        card.monthlyInterestAmount !== undefined && card.monthlyInterestAmount > 0
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
    const warnings: string[] = [];
    if (calculatedUsedCash > availableForDebt)
      warnings.push('LLM attempted to overspend. Amounts may have been clamped or are unsafe.');
    if (calculatedUsedCash < totalMinPayments)
      warnings.push('Total allocated is below total minimums; check LLM output and constraints.');

    // Validate that LLM echoed back the correct strategy
    const llmStrategyUsed = result.strategyUsed || 'llm';
    if (llmStrategyUsed !== strategy) {
      warnings.push(`LLM returned strategy "${llmStrategyUsed}" but requested strategy was "${strategy}". Using fallback.`);
      // Fall back to deterministic calculation
      const fallback = calculateAllocations(sortedCards, profile, strategy, projectionMonths);
      fallback.warnings.push(...warnings);
      fallback.warnings.push('LLM strategy mismatch. Fell back to deterministic calculation.');
      return fallback;
    }

    // Validate that allocation pattern matches the requested strategy
    const strategyValidation = validateStrategyCompliance(sortedCards, allocations, strategy);
    if (!strategyValidation.isValid && strategyValidation.warning) {
      warnings.push(strategyValidation.warning);
      warnings.push('Strategy pattern mismatch detected. Using fallback.');
      // Fall back to deterministic calculation
      const fallback = calculateAllocations(sortedCards, profile, strategy, projectionMonths);
      fallback.warnings.push(...warnings);
      return fallback;
    }

    // Generate projections using the validated strategy
    const projections = generateProjections(sortedCards, availableForDebt, strategy, projectionMonths);

    return {
      allocations,
      totalAvailableForDebt: availableForDebt,
      totalMinPayments,
      remainingCash: availableForDebt - calculatedUsedCash,
      strategyUsed: strategy,
      isValid,
      warnings,
      projections
    };
  } catch (error) {
    console.error('LLM Error:', error);
    // Fallback to the requested strategy if LLM fails
    const fallback = calculateAllocations(sortedCards, profile, strategy, projectionMonths);
    fallback.warnings.push(`LLM connection failed. Fell back to ${strategy} strategy.`);
    return fallback;
  }
};
