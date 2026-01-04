import React from 'react';
import { PaymentStrategy } from '../types';
import { Bot } from 'lucide-react';

interface Props {
  strategy: PaymentStrategy;
  isProcessing: boolean;
  timestamp?: Date;
}

const PlanStatus: React.FC<Props> = ({ strategy, isProcessing, timestamp }) => {
  return (
    <section className="max-w-7xl mx-auto px-6 mt-6">
      <div className="bg-white border border-neutral-border rounded-md p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Plan Status */}
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                isProcessing ? 'bg-warning-500 animate-pulse' : 'bg-brand-500'
              }`}
            />
            <span className="text-sm font-medium text-neutral-text">
              {isProcessing ? 'Calculating...' : 'Plan Generated'}
            </span>
          </div>

          {/* LM Studio Status - Only show when AI strategy is selected */}
          {strategy === 'llm' && (
            <div className="flex items-center gap-2 ml-4 pl-4 border-l border-neutral-border">
              <Bot size={16} className="text-brand-500" />
              <span className="text-sm text-neutral-secondary">LM Studio</span>
            </div>
          )}
        </div>

        {/* Timestamp */}
        {timestamp && !isProcessing && (
          <div className="text-sm text-neutral-muted">
            Last updated: {timestamp.toLocaleTimeString()}
          </div>
        )}
      </div>
    </section>
  );
};

export default PlanStatus;
