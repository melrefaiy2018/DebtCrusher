import React from 'react';
import { FinancialProfile } from '../types';

interface Props {
  profile: FinancialProfile;
  setProfile: (p: FinancialProfile) => void;
  onGenerate: () => void;
  isProcessing: boolean;
  canGenerate: boolean;
}

const BudgetInput: React.FC<Props> = ({ profile, setProfile, onGenerate, isProcessing, canGenerate }) => {
  return (
    <section className="max-w-7xl mx-auto px-6 mt-6">
      <div className="bg-white border border-neutral-border rounded-md p-6 flex items-center justify-between">
        <div className="flex-1 max-w-md">
          <label className="block text-xs uppercase font-semibold text-neutral-muted tracking-wide mb-2">
            Monthly Debt Budget
          </label>
          <input
            type="number"
            value={profile.monthlyNetIncome || ''}
            onChange={e => setProfile({...profile, monthlyNetIncome: parseFloat(e.target.value) || 0})}
            className="w-full px-4 py-2 border border-neutral-border rounded-md text-right text-lg font-medium text-neutral-text placeholder:text-neutral-muted focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            placeholder="0.00"
          />
        </div>
        <button
          onClick={onGenerate}
          disabled={!canGenerate || isProcessing}
          className="ml-6 px-6 py-2.5 bg-white border-2 border-brand-500 text-brand-500 rounded-md font-semibold hover:bg-brand-500 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? 'Generating...' : 'Generate Plan'}
        </button>
      </div>
    </section>
  );
};

export default BudgetInput;
