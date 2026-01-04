import React from 'react';
import { CreditCard } from '../types';

interface Props {
  cards: CreditCard[];
  onAddCard: () => void;
  onEditCard: (card: CreditCard) => void;
  onDeleteCard: (id: string) => void;
}

const DebtsTable: React.FC<Props> = ({ cards, onAddCard, onEditCard, onDeleteCard }) => {
  return (
    <section className="max-w-7xl mx-auto px-6 mt-6">
      <div className="bg-white border border-neutral-border rounded-md overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-border">
          <h3 className="text-sm font-semibold text-neutral-text">Your Debts</h3>
          <button
            onClick={onAddCard}
            className="px-3 py-1.5 text-sm font-medium text-neutral-secondary hover:text-brand-500 transition-colors"
          >
            + Add Card
          </button>
        </div>

        {cards.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-neutral-muted">No cards added yet. Click "+ Add Card" to get started.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-neutral-bg">
              <tr className="text-xs uppercase font-semibold text-neutral-muted tracking-wide">
                <th className="px-6 py-3 text-left">Card</th>
                <th className="px-6 py-3 text-right">Balance</th>
                <th className="px-6 py-3 text-right">Limit</th>
                <th className="px-6 py-3 text-right">Min Pay</th>
                <th className="px-6 py-3 text-right">APR</th>
                <th className="px-6 py-3 text-left">Due</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {cards.map((card) => (
                <tr
                  key={card.id}
                  className="border-t border-neutral-border hover:bg-neutral-bg transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-neutral-text">{card.name}</td>
                  <td className="px-6 py-4 text-right text-neutral-secondary">
                    ${card.balance.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right text-neutral-secondary">
                    ${(card.creditLimit || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right text-neutral-secondary">
                    ${card.minPayment.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right text-neutral-secondary">{card.apr}%</td>
                  <td className="px-6 py-4 text-neutral-secondary">{card.dueDate}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => onEditCard(card)}
                      className="text-neutral-muted hover:text-brand-500 text-sm font-medium transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDeleteCard(card.id)}
                      className="ml-3 text-neutral-muted hover:text-warning-500 text-sm font-medium transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
};

export default DebtsTable;
