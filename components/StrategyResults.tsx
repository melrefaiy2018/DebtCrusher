import React from 'react';
import { CreditCard, OptimizationResult } from '../types';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, AreaChart, Area, CartesianGrid, LineChart, Line } from 'recharts';

interface Props {
  result: OptimizationResult;
  cards: CreditCard[];
}

const COLORS = ['#475569', '#64748B', '#94A3B8', '#10B981', '#CBD5E1', '#71717A', '#A1A1AA', '#E2E8F0'];

const StrategyResults: React.FC<Props> = ({ result, cards }) => {
  // Only render if we have projections data
  if (!result.projections || result.projections.length === 0) {
    return null;
  }

  return (
    <section className="max-w-7xl mx-auto px-6 mt-6 mb-12">
      <div className="bg-white border border-neutral-border rounded-md overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-border">
          <h3 className="text-sm font-semibold text-neutral-text">Debt Projections</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
          {/* Total Debt Chart */}
          <div>
            <h4 className="text-xs uppercase font-semibold text-neutral-muted tracking-wide mb-4">
              Total Debt Over Time
            </h4>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={result.projections} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#475569" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#475569" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="month"
                  tickFormatter={(val) => `M${val}`}
                  tick={{fontSize: 11, fill: '#64748B'}}
                  stroke="#E2E8F0"
                />
                <YAxis
                  tickFormatter={(val) => `$${(val/1000).toFixed(0)}k`}
                  tick={{fontSize: 11, fill: '#64748B'}}
                  stroke="#E2E8F0"
                />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <Tooltip
                  formatter={(value: number) => [`$${Math.round(value).toLocaleString()}`, 'Total Balance']}
                  labelFormatter={(label) => `Month ${label}`}
                  contentStyle={{
                    borderRadius: '6px',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.05)',
                    fontSize: '12px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="totalBalance"
                  stroke="#475569"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorBalance)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Individual Cards Chart */}
          <div>
            <h4 className="text-xs uppercase font-semibold text-neutral-muted tracking-wide mb-4">
              Individual Card Balances
            </h4>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={result.projections} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <XAxis
                  dataKey="month"
                  tickFormatter={(val) => `M${val}`}
                  tick={{fontSize: 11, fill: '#64748B'}}
                  stroke="#E2E8F0"
                />
                <YAxis
                  tickFormatter={(val) => `$${(val/1000).toFixed(0)}k`}
                  tick={{fontSize: 11, fill: '#64748B'}}
                  stroke="#E2E8F0"
                />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <Tooltip
                  formatter={(value: number, name: string) => {
                    const id = name.split('.')[1];
                    const cardName = cards.find(c => c.id === id)?.name || name;
                    return [`$${Math.round(value).toLocaleString()}`, cardName];
                  }}
                  labelFormatter={(label) => `Month ${label}`}
                  contentStyle={{
                    borderRadius: '6px',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.05)',
                    fontSize: '12px'
                  }}
                />
                <Legend
                  formatter={(value) => {
                    const id = value.split('.')[1];
                    return cards.find(c => c.id === id)?.name || value;
                  }}
                  wrapperStyle={{fontSize: '11px'}}
                />
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
        </div>
      </div>
    </section>
  );
};

export default StrategyResults;