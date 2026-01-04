import React, { useState, useEffect, useCallback } from 'react';
import { CreditCard, FinancialProfile, PaymentStrategy, OptimizationResult } from './types';
import { calculateAllocations } from './services/solver';
import { getLLMRecommendations } from './services/lmStudio';
import CardInput from './components/CardInput';
import FinancialInput from './components/FinancialInput';
import StrategyResults from './components/StrategyResults';
import { LayoutDashboard, TrendingDown, TrendingUp, Scale, Bot } from 'lucide-react';

const INITIAL_PROFILE: FinancialProfile = {
  monthlyNetIncome: 0
};

const App: React.FC = () => {
  // State
  const [profile, setProfile] = useState<FinancialProfile>(() => {
    const saved = localStorage.getItem('dc_profile');
    return saved ? JSON.parse(saved) : INITIAL_PROFILE;
  });

  const [cards, setCards] = useState<CreditCard[]>(() => {
    const saved = localStorage.getItem('dc_cards');
    return saved ? JSON.parse(saved) : [];
  });

  const [strategy, setStrategy] = useState<PaymentStrategy>('avalanche');
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Persistence
  useEffect(() => {
    localStorage.setItem('dc_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('dc_cards', JSON.stringify(cards));
  }, [cards]);

  // Logic Engine
  const runOptimization = useCallback(async () => {
    if (cards.length === 0) {
        setResult(null);
        return;
    }

    setIsProcessing(true);

    try {
      if (strategy === 'llm') {
        const aiResult = await getLLMRecommendations(cards, profile);
        setResult(aiResult);
      } else {
        // Local deterministic calculation
        // Small timeout to allow UI to show loading state for better UX feeling
        await new Promise(r => setTimeout(r, 400)); 
        const algoResult = calculateAllocations(cards, profile, strategy);
        setResult(algoResult);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  }, [cards, profile, strategy]);

  // Debounced auto-run for local strategies, manual for LLM
  useEffect(() => {
    if (strategy !== 'llm') {
      const timer = setTimeout(() => {
        runOptimization();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [profile, cards, strategy, runOptimization]);

  const handleManualRun = () => {
    runOptimization();
  };

  const totalDebt = cards.reduce((acc, c) => acc + c.balance, 0);

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-brand-600 text-white p-2 rounded-lg">
              <LayoutDashboard size={20} />
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">DebtCrusher</h1>
          </div>
          <div className="text-sm font-medium text-slate-500">
             Total Debt: <span className="text-slate-800">${totalDebt.toLocaleString()}</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Strategy Toggles */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Dashboard</h2>
            <p className="text-slate-500">Manage your income and optimize your payoff plan.</p>
          </div>
          
          <div className="bg-white p-1 rounded-lg border border-slate-200 shadow-sm flex overflow-hidden">
            <button
              onClick={() => setStrategy('avalanche')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${
                strategy === 'avalanche' ? 'bg-brand-50 text-brand-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <TrendingDown size={16} /> Avalanche (APR)
            </button>
            <button
              onClick={() => setStrategy('snowball')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${
                strategy === 'snowball' ? 'bg-brand-50 text-brand-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <TrendingUp size={16} /> Snowball (Bal)
            </button>
            <button
              onClick={() => setStrategy('even')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${
                strategy === 'even' ? 'bg-brand-50 text-brand-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <Scale size={16} /> Even Split
            </button>
             <button
              onClick={() => setStrategy('llm')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${
                strategy === 'llm' ? 'bg-purple-50 text-purple-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <Bot size={16} /> AI Assistant
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Inputs */}
          <div className="lg:col-span-4 space-y-6">
            <FinancialInput profile={profile} setProfile={setProfile} />
            <CardInput cards={cards} setCards={setCards} />
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-8 space-y-6">
            
            {strategy === 'llm' && (
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex justify-between items-center">
                <div>
                   <h3 className="font-bold text-purple-800 flex items-center gap-2">
                     <Bot size={18} /> LM Studio Connected
                   </h3>
                   <p className="text-xs text-purple-600 mt-1">
                     Ensure LM Studio is running locally on port 1234.
                   </p>
                </div>
                <button 
                  onClick={handleManualRun}
                  disabled={isProcessing}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {isProcessing ? 'Thinking...' : 'Ask AI for Plan'}
                </button>
              </div>
            )}

            {result ? (
              <StrategyResults result={result} cards={cards} isLoading={isProcessing} />
            ) : (
              <div className="h-64 bg-white rounded-xl border border-dashed border-slate-300 flex items-center justify-center text-slate-400">
                Add your debt budget and cards to generate a plan.
              </div>
            )}
            
            {/* Context/Info Block */}
            <div className="bg-slate-100 rounded-xl p-6 text-sm text-slate-600">
              <h4 className="font-bold mb-2">How this works</h4>
              <p>
                We use your <strong>Total Monthly Budget</strong>.
                First, we allocate the <strong>Minimum Payment</strong> to every card to avoid fees.
                Then, we take the remaining cash and apply it based on your strategy: 
                <strong> Avalanche</strong> targets high interest rates to save money, while 
                <strong> Snowball</strong> targets small balances for psychological wins.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;