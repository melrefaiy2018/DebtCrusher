import React from 'react';
import { FinancialProfile } from '../types';
import { DollarSign } from 'lucide-react';

interface Props {
  profile: FinancialProfile;
  setProfile: (p: FinancialProfile) => void;
}

const FinancialInput: React.FC<Props> = ({ profile, setProfile }) => {
  return (
    <div className="bg-white p-8 rounded-md border border-[#E5E7EB]">
      <h2 className="text-base font-semibold text-[#111827] mb-6">Budget Settings</h2>

      <div>
        <label className="block text-xs font-semibold text-[#374151] mb-1 tracking-wide">
          Total Monthly Budget for Debt
        </label>
        <p className="text-xs text-[#6B7280] mb-3">
          Enter the total cash you have available to pay towards all credit cards this month (must cover at least the minimums).
        </p>
        <div className="relative">
          <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-[#9CA3AF]" />
          <input
            type="number"
            value={profile.monthlyNetIncome || ''}
            onChange={e => setProfile({...profile, monthlyNetIncome: parseFloat(e.target.value) || 0})}
            className="pl-10 w-full px-3 py-2 border border-[#E5E7EB] rounded text-sm text-[#111827] placeholder:text-[#D1D5DB] focus:border-[#059669] focus:ring-1 focus:ring-[#059669] outline-none transition-all"
            placeholder="0.00"
          />
        </div>
      </div>
    </div>
  );
};

export default FinancialInput;