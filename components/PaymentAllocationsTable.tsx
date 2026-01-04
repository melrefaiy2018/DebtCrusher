import React from 'react';
import { OptimizationResult, CreditCard } from '../types';

interface Props {
  result: OptimizationResult;
  cards: CreditCard[];
}

const PaymentAllocationsTable: React.FC<Props> = ({ result, cards }) => {
  const totalMin = result.allocations.reduce((sum, a) => sum + a.minPayment, 0);
  const totalExtra = result.allocations.reduce((sum, a) => sum + a.extraPayment, 0);
  const totalUsed = totalMin + totalExtra;
  const percentUsed = result.totalAvailableForDebt > 0
    ? ((totalUsed / result.totalAvailableForDebt) * 100).toFixed(1)
    : 0;

  // Get card name by ID
  const getCardName = (cardId: string) => {
    const card = cards.find(c => c.id === cardId);
    return card ? card.name : 'Unknown Card';
  };

  return (
    <section className="max-w-7xl mx-auto px-6 mt-6">
      <div className="bg-white border border-neutral-border rounded-md overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-border">
          <h3 className="text-sm font-semibold text-neutral-text">Payment Allocations</h3>
        </div>

        <table className="w-full">
          <thead className="bg-neutral-bg">
            <tr className="text-xs uppercase font-semibold text-neutral-muted tracking-wide">
              <th className="px-6 py-3 text-left">Card</th>
              <th className="px-6 py-3 text-right">Min</th>
              <th className="px-6 py-3 text-right">Extra</th>
              <th className="px-6 py-3 text-right">Total</th>
              <th className="px-6 py-3 text-right">New Balance</th>
              <th className="px-6 py-3 text-right">Avail Credit</th>
              <th className="px-6 py-3 text-right">Safe Spend</th>
            </tr>
          </thead>
          <tbody>
            {result.allocations.map((alloc) => (
              <tr key={alloc.cardId} className="border-t border-neutral-border">
                <td className="px-6 py-4 font-medium text-neutral-text">
                  {getCardName(alloc.cardId)}
                </td>
                <td className="px-6 py-4 text-right text-neutral-secondary">
                  ${alloc.minPayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-4 text-right text-brand-500 font-medium">
                  ${alloc.extraPayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-4 text-right font-semibold text-neutral-text">
                  ${alloc.totalPayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-4 text-right text-neutral-secondary">
                  ${alloc.remainingBalanceAfterPayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-4 text-right text-neutral-secondary">
                  ${alloc.projectedAvailableCredit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-4 text-right text-neutral-secondary">
                  ${alloc.maxSafeSpend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-neutral-bg border-t-2 border-neutral-border">
            <tr>
              <td className="px-6 py-4 font-semibold text-neutral-text">Total</td>
              <td className="px-6 py-4 text-right font-semibold text-neutral-text">
                ${totalMin.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
              <td className="px-6 py-4 text-right font-semibold text-brand-500">
                ${totalExtra.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
              <td className="px-6 py-4 text-right font-semibold text-neutral-text">
                ${totalUsed.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
              <td colSpan={3} className="px-6 py-4 text-right text-sm text-neutral-muted">
                {percentUsed}% of budget used
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
};

export default PaymentAllocationsTable;
