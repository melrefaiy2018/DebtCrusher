import React from 'react';
import { FinancialProfile } from '../types';
import { DollarSign } from 'lucide-react';

interface Props {
  profile: FinancialProfile;
  setProfile: (p: FinancialProfile) => void;
}

const FinancialInput: React.FC<Props> = ({ profile, setProfile }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
      <h2 className="text-xl font-bold text-slate-800 mb-4">Budget Settings</h2>
      
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Total Monthly Budget for Debt
        </label>
        <p className="text-xs text-slate-500 mb-3">
          Enter the total cash you have available to pay towards all credit cards this month (must cover at least the minimums).
        </p>
        <div className="relative">
          <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
          <input 
            type="number" 
            value={profile.monthlyNetIncome || ''}
            onChange={e => setProfile({...profile, monthlyNetIncome: parseFloat(e.target.value) || 0})}
            className="pl-10 w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
            placeholder="0.00"
          />
        </div>
      </div>
    </div>
  );
};

export default FinancialInput;