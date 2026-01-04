import React from 'react';
import { CreditCard, OptimizationResult } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { AlertTriangle, CheckCircle, BrainCircuit } from 'lucide-react';

interface Props {
  result: OptimizationResult;
  cards: CreditCard[];
  isLoading: boolean;
}

const StrategyResults: React.FC<Props> = ({ result, cards, isLoading }) => {
  if (isLoading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center bg-white rounded-xl shadow-sm border border-slate-100">
        <BrainCircuit className="h-12 w-12 text-brand-500 animate-pulse mb-4" />
        <p className="text-slate-500 font-medium">Consulting Logic Processing Unit...</p>
      </div>
    );
  }

  // Merge card info with result allocations for display
  const data = result.allocations.map(alloc => {
    const card = cards.find(c => c.id === alloc.cardId);
    return {
      name: card?.name || 'Unknown',
      Min: alloc.minPayment,
      Extra: alloc.extraPayment,
      Total: alloc.totalPayment,
      Remaining: alloc.remainingBalanceAfterPayment,
      Available: alloc.projectedAvailableCredit,
      SafeSpend: alloc.maxSafeSpend,
      Notes: alloc.notes,
      balance: card?.balance || 0
    };
  });

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 space-y-8">
      
      {/* Header & Warnings */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Payment Plan</h2>
        {!result.isValid ? (
           <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3">
             <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
             <div>
               <p className="font-bold">Insufficient Funds</p>
               <p className="text-sm">
                 Your income cannot cover the minimum payments. You are short by <strong>${(result.totalMinPayments - result.totalAvailableForDebt).toFixed(2)}</strong>. Please reduce expenses or contact creditors.
               </p>
             </div>
           </div>
        ) : (
          <div className="flex items-center gap-2 text-brand-700 bg-brand-50 px-3 py-1 rounded-lg w-fit text-sm font-medium">
             <CheckCircle size={16} /> 
             Plan feasible • ${result.remainingCash.toFixed(2)} surplus cash
          </div>
        )}
        
        {result.warnings.length > 0 && (
          <div className="mt-2 space-y-1">
            {result.warnings.map((w, idx) => (
              <p key={idx} className="text-xs text-orange-600 flex items-center gap-1">
                <AlertTriangle size={12} /> {w}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="h-64 w-full">
        <h3 className="text-sm font-semibold text-slate-500 mb-4">Allocation Breakdown</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 0, right: 20 }}>
            <XAxis type="number" hide />
            <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12}} />
            <Tooltip 
              formatter={(value: number) => `$${value.toLocaleString()}`}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Legend />
            <Bar dataKey="Min" stackId="a" fill="#94a3b8" name="Minimum" radius={[0, 0, 0, 0]} />
            <Bar dataKey="Extra" stackId="a" fill="#22c55e" name="Extra Strategy" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-4 py-3">Card</th>
              <th className="px-4 py-3 text-right">Balance</th>
              <th className="px-4 py-3 text-right">Min Pay</th>
              <th className="px-4 py-3 text-right text-brand-600 font-bold">Recommended</th>
              <th className="px-4 py-3 text-right text-emerald-600">Proj. Available</th>
              <th className="px-4 py-3 text-right text-blue-600" title="Max spend to maintain current balance">Safe Spend</th>
              <th className="px-4 py-3 text-right text-slate-400">Projected Rem.</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                <td className="px-4 py-3 font-medium text-slate-700">
                  {row.name}
                  {row.Notes && <div className="text-[10px] text-slate-400 font-normal">{row.Notes}</div>}
                </td>
                <td className="px-4 py-3 text-right text-slate-500">${row.balance.toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-slate-500">${row.Min.toLocaleString()}</td>
                <td className="px-4 py-3 text-right font-bold text-brand-600 bg-brand-50/30">
                  ${row.Total.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right text-emerald-600 font-medium">${row.Available.toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-blue-600 font-medium">${row.SafeSpend.toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-slate-400">${row.Remaining.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StrategyResults;