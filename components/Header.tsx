import React from 'react';
import { PaymentStrategy } from '../types';
import { LayoutDashboard, TrendingDown, TrendingUp, Scale, Bot } from 'lucide-react';

interface Props {
  strategy: PaymentStrategy;
  setStrategy: (strategy: PaymentStrategy) => void;
  totalDebt: number;
}

const Header: React.FC<Props> = ({ strategy, setStrategy, totalDebt }) => {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-neutral-border h-16">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-full">
        {/* Left: Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-500 rounded-md flex items-center justify-center">
            <LayoutDashboard size={18} className="text-white" />
          </div>
          <span className="text-neutral-text font-semibold">DebtCrusher</span>
        </div>

        {/* Center: Strategy Segmented Control */}
        <div className="flex bg-neutral-bg rounded-md p-1 gap-1">
          <button
            onClick={() => setStrategy('avalanche')}
            className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-medium transition-colors ${
              strategy === 'avalanche'
                ? 'bg-white border border-neutral-border text-neutral-text'
                : 'text-neutral-muted hover:text-neutral-secondary'
            }`}
          >
            <TrendingDown size={16} />
            Avalanche
          </button>
          <button
            onClick={() => setStrategy('snowball')}
            className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-medium transition-colors ${
              strategy === 'snowball'
                ? 'bg-white border border-neutral-border text-neutral-text'
                : 'text-neutral-muted hover:text-neutral-secondary'
            }`}
          >
            <TrendingUp size={16} />
            Snowball
          </button>
          <button
            onClick={() => setStrategy('even')}
            className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-medium transition-colors ${
              strategy === 'even'
                ? 'bg-white border border-neutral-border text-neutral-text'
                : 'text-neutral-muted hover:text-neutral-secondary'
            }`}
          >
            <Scale size={16} />
            Even
          </button>
          <button
            onClick={() => setStrategy('llm')}
            className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-medium transition-colors ${
              strategy === 'llm'
                ? 'bg-white border border-neutral-border text-neutral-text'
                : 'text-neutral-muted hover:text-neutral-secondary'
            }`}
          >
            <Bot size={16} />
            AI
          </button>
        </div>

        {/* Right: Total Debt Metric */}
        <div className="text-right">
          <div className="text-xs uppercase font-semibold text-neutral-muted tracking-wide">Total Debt</div>
          <div className="text-xl font-semibold text-neutral-text">${totalDebt.toLocaleString()}</div>
        </div>
      </div>
    </header>
  );
};

export default Header;
