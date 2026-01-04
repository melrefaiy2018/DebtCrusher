import React, { useState, useEffect } from 'react';
import { CreditCard } from '../types';
import { X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (card: Omit<CreditCard, 'id'> | CreditCard) => void;
  editCard?: CreditCard | null;
}

const emptyCard: Omit<CreditCard, 'id'> = {
  name: '',
  balance: 0,
  creditLimit: 0,
  apr: 0,
  monthlyInterestAmount: 0,
  minPayment: 0,
  dueDate: ''
};

const CardModal: React.FC<Props> = ({ isOpen, onClose, onSave, editCard }) => {
  const [formData, setFormData] = useState<Omit<CreditCard, 'id'> | CreditCard>(emptyCard);

  useEffect(() => {
    if (editCard) {
      setFormData(editCard);
    } else {
      setFormData(emptyCard);
    }
  }, [editCard, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    onSave(formData);
    setFormData(emptyCard);
  };

  const handleClose = () => {
    setFormData(emptyCard);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-neutral-text/20 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-md border border-neutral-border shadow-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-border sticky top-0 bg-white">
          <h2 className="text-lg font-semibold text-neutral-text">
            {editCard ? 'Edit Card' : 'Add New Card'}
          </h2>
          <button
            onClick={handleClose}
            className="text-neutral-muted hover:text-neutral-text transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card Name */}
            <div className="md:col-span-2">
              <label className="block text-xs uppercase font-semibold text-neutral-muted tracking-wide mb-2">
                Card Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-neutral-border rounded-md text-sm text-neutral-text placeholder:text-neutral-muted focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                placeholder="e.g. Visa Sapphire"
                autoFocus
                required
              />
            </div>

            {/* Current Balance */}
            <div>
              <label className="block text-xs uppercase font-semibold text-neutral-muted tracking-wide mb-2">
                Current Balance ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.balance || ''}
                onChange={(e) => setFormData({ ...formData, balance: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-neutral-border rounded-md text-sm text-neutral-text placeholder:text-neutral-muted focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                placeholder="0.00"
                required
              />
            </div>

            {/* Credit Limit */}
            <div>
              <label className="block text-xs uppercase font-semibold text-neutral-muted tracking-wide mb-2">
                Credit Limit ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.creditLimit || ''}
                onChange={(e) => setFormData({ ...formData, creditLimit: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-neutral-border rounded-md text-sm text-neutral-text placeholder:text-neutral-muted focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                placeholder="0.00"
                required
              />
            </div>

            {/* APR */}
            <div>
              <label className="block text-xs uppercase font-semibold text-neutral-muted tracking-wide mb-2">
                APR (%)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.apr || ''}
                onChange={(e) => setFormData({ ...formData, apr: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-neutral-border rounded-md text-sm text-neutral-text placeholder:text-neutral-muted focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                placeholder="24.99"
                required
              />
            </div>

            {/* Min Payment */}
            <div>
              <label className="block text-xs uppercase font-semibold text-neutral-muted tracking-wide mb-2">
                Min Payment ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.minPayment || ''}
                onChange={(e) => setFormData({ ...formData, minPayment: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-neutral-border rounded-md text-sm text-neutral-text placeholder:text-neutral-muted focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                placeholder="25.00"
                required
              />
            </div>

            {/* Monthly Interest Amount */}
            <div>
              <label className="block text-xs uppercase font-semibold text-neutral-muted tracking-wide mb-2">
                Monthly Interest ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.monthlyInterestAmount || ''}
                onChange={(e) => setFormData({ ...formData, monthlyInterestAmount: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-neutral-border rounded-md text-sm text-neutral-text placeholder:text-neutral-muted focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                placeholder="Optional (Auto-calculated)"
              />
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-xs uppercase font-semibold text-neutral-muted tracking-wide mb-2">
                Due Date
              </label>
              <input
                type="text"
                value={formData.dueDate || ''}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-4 py-2 border border-neutral-border rounded-md text-sm text-neutral-text placeholder:text-neutral-muted focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                placeholder="Day of month (1-31)"
                required
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-neutral-border">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-neutral-secondary bg-white border border-neutral-border rounded-md hover:bg-neutral-bg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-brand-500 rounded-md hover:bg-brand-600 transition-colors"
            >
              {editCard ? 'Save Changes' : 'Add Card'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CardModal;
