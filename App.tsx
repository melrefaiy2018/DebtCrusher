import React, { useState, useEffect, useCallback } from 'react';
import { CreditCard, FinancialProfile, PaymentStrategy, OptimizationResult } from './types';
import { calculateAllocations } from './services/solver';
import { getLLMRecommendations } from './services/lmStudio';
import { DB } from './services/db';
import Header from './components/Header';
import BudgetInput from './components/BudgetInput';
import DebtsTable from './components/DebtsTable';
import CardModal from './components/CardModal';
import PlanStatus from './components/PlanStatus';
import PaymentAllocationsTable from './components/PaymentAllocationsTable';
import StrategyResults from './components/StrategyResults';

const App: React.FC = () => {
  // Initialize State
  const [profile, setProfileState] = useState<FinancialProfile>({ monthlyNetIncome: 0 });
  const [cards, setCardsState] = useState<CreditCard[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const [strategy, setStrategy] = useState<PaymentStrategy>('avalanche');
  const [projectionMonths, setProjectionMonths] = useState<number>(6);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | undefined>(undefined);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CreditCard | null>(null);

  // Load Data on Mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [loadedProfile, loadedCards] = await Promise.all([
          DB.getProfile(),
          DB.getCards()
        ]);
        setProfileState(loadedProfile);
        setCardsState(loadedCards);
      } catch (e) {
        console.error("Failed to load initial data", e);
      } finally {
        setIsDataLoaded(true);
      }
    };
    loadData();
  }, []);

  // Wrappers to sync State with DB
  const setProfile = (newProfile: FinancialProfile) => {
    setProfileState(newProfile);
    DB.saveProfile(newProfile);
  };

  const setCards = (newCards: CreditCard[]) => {
    setCardsState(newCards);
    DB.saveCards(newCards);
  };

  // Modal Handlers
  const handleAddCard = () => {
    setEditingCard(null);
    setIsModalOpen(true);
  };

  const handleEditCard = (card: CreditCard) => {
    setEditingCard(card);
    setIsModalOpen(true);
  };

  const handleDeleteCard = (id: string) => {
    if (window.confirm('Are you sure you want to delete this card?')) {
      setCards(cards.filter(c => c.id !== id));
    }
  };

  const handleSaveCard = (cardData: Omit<CreditCard, 'id'> | CreditCard) => {
    if ('id' in cardData) {
      // Editing existing card
      setCards(cards.map(c => c.id === cardData.id ? cardData : c));
    } else {
      // Adding new card
      const id = Math.random().toString(36).substr(2, 9);
      setCards([...cards, { ...cardData, id }]);
    }
    setIsModalOpen(false);
    setEditingCard(null);
  };

  // Logic Engine
  const runOptimization = useCallback(async () => {
    if (!isDataLoaded) return; // Don't run if data isn't ready

    if (cards.length === 0) {
        setResult(null);
        return;
    }

    setIsProcessing(true);

    try {
      if (strategy === 'llm') {
        const aiResult = await getLLMRecommendations(cards, profile, projectionMonths);
        setResult(aiResult);
        setLastUpdated(new Date());
      } else {
        // Local deterministic calculation
        // Small timeout to allow UI to show loading state for better UX feeling
        await new Promise(r => setTimeout(r, 400));
        const algoResult = calculateAllocations(cards, profile, strategy, projectionMonths);
        setResult(algoResult);
        setLastUpdated(new Date());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  }, [cards, profile, strategy, projectionMonths, isDataLoaded]);

  // Debounced auto-run for local strategies, manual for LLM
  useEffect(() => {
    if (strategy !== 'llm') {
      const timer = setTimeout(() => {
        runOptimization();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [profile, cards, strategy, projectionMonths, runOptimization]);

  const handleManualRun = () => {
    runOptimization();
  };

  const totalDebt = cards.reduce((acc, c) => acc + c.balance, 0);
  const canGenerate = cards.length > 0 && profile.monthlyNetIncome > 0;

  return (
    <div className="min-h-screen bg-neutral-bg pb-20">
      {/* Header */}
      <Header strategy={strategy} setStrategy={setStrategy} totalDebt={totalDebt} />

      {/* Budget Input */}
      <BudgetInput
        profile={profile}
        setProfile={setProfile}
        onGenerate={handleManualRun}
        isProcessing={isProcessing}
        canGenerate={canGenerate}
      />

      {/* Debts Table */}
      <DebtsTable
        cards={cards}
        onAddCard={handleAddCard}
        onEditCard={handleEditCard}
        onDeleteCard={handleDeleteCard}
      />

      {/* Conditional Sections - Only show after plan is generated */}
      {result && (
        <>
          {/* Plan Status */}
          <PlanStatus
            strategy={strategy}
            isProcessing={isProcessing}
            timestamp={lastUpdated}
          />

          {/* Payment Allocations Table */}
          <PaymentAllocationsTable result={result} cards={cards} />

          {/* Projections Charts */}
          <StrategyResults result={result} cards={cards} />
        </>
      )}

      {/* Card Modal */}
      <CardModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCard(null);
        }}
        onSave={handleSaveCard}
        editCard={editingCard}
      />
    </div>
  );
};

export default App;