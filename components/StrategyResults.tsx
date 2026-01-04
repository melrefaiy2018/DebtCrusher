import React from 'react';
import { CreditCard, OptimizationResult } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, AreaChart, Area, CartesianGrid, LineChart, Line } from 'recharts';
import { AlertTriangle, CheckCircle, BrainCircuit } from 'lucide-react';

interface Props {
  result: OptimizationResult;
  cards: CreditCard[];
  isLoading: boolean;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe', '#00C49F', '#FFBB28', '#FF8042'];

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

      {/* Projection Chart */}
      {result.projections && result.projections.length > 0 && (
        <div className="h-64 w-full border-t border-slate-100 pt-6">
          <h3 className="text-sm font-semibold text-slate-500 mb-4">Total Debt Projection</h3>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={result.projections} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tickFormatter={(val) => `Month ${val}`} tick={{fontSize: 12}} />
              <YAxis tickFormatter={(val) => `$${(val/1000).toFixed(1)}k`} tick={{fontSize: 12}} />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <Tooltip 
                formatter={(value: number) => [`$${Math.round(value).toLocaleString()}`, 'Total Balance']}
                labelFormatter={(label) => `Month ${label}`}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Area type="monotone" dataKey="totalBalance" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorBalance)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Individual Card Projection Chart */}
      {result.projections && result.projections.length > 0 && (
        <div className="h-64 w-full border-t border-slate-100 pt-6">
          <h3 className="text-sm font-semibold text-slate-500 mb-4">Individual Card Projections</h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={result.projections} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <XAxis dataKey="month" tickFormatter={(val) => `Month ${val}`} tick={{fontSize: 12}} />
              <YAxis tickFormatter={(val) => `$${(val/1000).toFixed(1)}k`} tick={{fontSize: 12}} />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <Tooltip 
                formatter={(value: number, name: string) => {
                   // Try to find card name if key is cardBalances.id
                   // name comes in as "cardBalances.someId"
                   const id = name.split('.')[1];
                   const cardName = cards.find(c => c.id === id)?.name || name;
                   return [`$${Math.round(value).toLocaleString()}`, cardName];
                }}
                labelFormatter={(label) => `Month ${label}`}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend formatter={(value) => {
                  const id = value.split('.')[1];
                  return cards.find(c => c.id === id)?.name || value;
              }}/>
              {cards.map((card, index) => (
                <Line 
                  key={card.id}
                  type="monotone" 
                  dataKey={`cardBalances.${card.id}`} 
                  stroke={COLORS[index % COLORS.length]} 
                  strokeWidth={2}
                  dot={false}
                  name={`cardBalances.${card.id}`}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

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