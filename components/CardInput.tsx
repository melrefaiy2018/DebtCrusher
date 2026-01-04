import React, { useState } from 'react';
import { CreditCard } from '../types';
import { Plus, Trash2, Edit2, Save, X } from 'lucide-react';

interface Props {
  cards: CreditCard[];
  setCards: (cards: CreditCard[]) => void;
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

const CardInput: React.FC<Props> = ({ cards, setCards }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newCard, setNewCard] = useState<Omit<CreditCard, 'id'>>(emptyCard);
  
  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<CreditCard | null>(null);

  const handleAdd = () => {
    if (!newCard.name) return;
    const id = Math.random().toString(36).substr(2, 9);
    setCards([...cards, { ...newCard, id }]);
    setNewCard(emptyCard);
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    setCards(cards.filter(c => c.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setEditForm(null);
    }
  };

  const startEditing = (card: CreditCard) => {
    setEditingId(card.id);
    setEditForm({ ...card });
    setIsAdding(false); // Close add form if open to reduce clutter
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const saveEditing = () => {
    if (!editForm) return;
    setCards(cards.map(c => c.id === editForm.id ? editForm : c));
    setEditingId(null);
    setEditForm(null);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-slate-800">Your Debts</h2>
        <button 
          onClick={() => {
            setIsAdding(!isAdding);
            if (editingId) cancelEditing();
          }}
          className={`text-sm px-3 py-1 rounded-full font-medium transition-colors ${
            isAdding 
              ? 'bg-slate-100 text-slate-500 hover:bg-slate-200' 
              : 'bg-brand-50 text-brand-700 hover:bg-brand-100'
          }`}
        >
          {isAdding ? 'Cancel' : '+ Add Card'}
        </button>
      </div>

      {isAdding && (
        <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200 animate-in fade-in slide-in-from-top-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Card Name</label>
              <input 
                type="text" 
                value={newCard.name}
                onChange={e => setNewCard({...newCard, name: e.target.value})}
                className="w-full p-2 border rounded text-sm"
                placeholder="e.g. Visa Sapphire"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Current Balance ($)</label>
              <input 
                type="number" 
                value={newCard.balance || ''}
                onChange={e => setNewCard({...newCard, balance: parseFloat(e.target.value) || 0})}
                className="w-full p-2 border rounded text-sm"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Credit Limit ($)</label>
              <input 
                type="number" 
                value={newCard.creditLimit || ''}
                onChange={e => setNewCard({...newCard, creditLimit: parseFloat(e.target.value) || 0})}
                className="w-full p-2 border rounded text-sm"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">APR (%)</label>
              <input 
                type="number" 
                value={newCard.apr || ''}
                onChange={e => setNewCard({...newCard, apr: parseFloat(e.target.value) || 0})}
                className="w-full p-2 border rounded text-sm"
                placeholder="24.99"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Monthly Interest ($)</label>
              <input 
                type="number" 
                value={newCard.monthlyInterestAmount || ''}
                onChange={e => setNewCard({...newCard, monthlyInterestAmount: parseFloat(e.target.value) || 0})}
                className="w-full p-2 border rounded text-sm"
                placeholder="Optional (Auto-calc if empty)"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Min Payment ($)</label>
              <input 
                type="number" 
                value={newCard.minPayment || ''}
                onChange={e => setNewCard({...newCard, minPayment: parseFloat(e.target.value) || 0})}
                className="w-full p-2 border rounded text-sm"
                placeholder="25.00"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Due Date</label>
              <input 
                type="text" 
                value={newCard.dueDate || ''}
                onChange={e => setNewCard({...newCard, dueDate: e.target.value})}
                className="w-full p-2 border rounded text-sm"
                placeholder="Day of month (1-31)"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button 
              onClick={handleAdd}
              className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 flex items-center gap-2"
            >
              <Plus size={16} /> Add Card
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
        {cards.length === 0 && !isAdding && (
          <div className="text-center py-10 text-slate-400 italic">
            No cards added yet. Start adding your debts!
          </div>
        )}
        {cards.map(card => {
          const isEditing = editingId === card.id;

          if (isEditing && editForm) {
            return (
              <div key={card.id} className="p-4 bg-brand-50/50 rounded-lg border border-brand-200 shadow-inner">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <div className="col-span-2 md:col-span-1">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Name</label>
                        <input 
                            type="text" 
                            value={editForm.name}
                            onChange={e => setEditForm({...editForm, name: e.target.value})}
                            className="w-full p-1.5 border border-slate-300 rounded text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
                        />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Balance</label>
                        <input 
                            type="number" 
                            value={editForm.balance}
                            onChange={e => setEditForm({...editForm, balance: parseFloat(e.target.value) || 0})}
                            className="w-full p-1.5 border border-slate-300 rounded text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
                        />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Credit Limit</label>
                        <input 
                            type="number" 
                            value={editForm.creditLimit}
                            onChange={e => setEditForm({...editForm, creditLimit: parseFloat(e.target.value) || 0})}
                            className="w-full p-1.5 border border-slate-300 rounded text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">APR (%)</label>
                        <input 
                            type="number" 
                            value={editForm.apr}
                            onChange={e => setEditForm({...editForm, apr: parseFloat(e.target.value) || 0})}
                            className="w-full p-1.5 border border-slate-300 rounded text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Interest ($)</label>
                        <input 
                            type="number" 
                            value={editForm.monthlyInterestAmount || ''}
                            onChange={e => setEditForm({...editForm, monthlyInterestAmount: parseFloat(e.target.value) || 0})}
                            className="w-full p-1.5 border border-slate-300 rounded text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
                            placeholder="Auto"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Min Pay</label>
                        <input 
                            type="number" 
                            value={editForm.minPayment}
                            onChange={e => setEditForm({...editForm, minPayment: parseFloat(e.target.value) || 0})}
                            className="w-full p-1.5 border border-slate-300 rounded text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
                        />
                    </div>
                      <div className="col-span-2">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Due Day</label>
                        <input 
                            type="text" 
                            value={editForm.dueDate}
                            onChange={e => setEditForm({...editForm, dueDate: e.target.value})}
                            className="w-full p-1.5 border border-slate-300 rounded text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
                        />
                    </div>
                </div>
                <div className="flex justify-end gap-2">
                      <button onClick={cancelEditing} className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-300 rounded hover:bg-slate-50 flex items-center gap-1">
                        <X size={14}/> Cancel
                      </button>
                      <button onClick={saveEditing} className="px-3 py-1.5 text-xs font-medium text-white bg-brand-600 rounded hover:bg-brand-700 flex items-center gap-1 shadow-sm">
                        <Save size={14}/> Save Changes
                      </button>
                </div>
              </div>
            )
          }

          return (
            <div key={card.id} className="group flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-brand-300 hover:bg-white transition-all shadow-sm hover:shadow-md">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-slate-700">{card.name}</h3>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 font-medium">Due {card.dueDate}</span>
                </div>
                <div className="flex gap-4 mt-1">
                  <div className="text-xs text-slate-500">
                    <span className="block text-[10px] uppercase font-bold text-slate-400">Balance</span>
                    ${card.balance.toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-500">
                    <span className="block text-[10px] uppercase font-bold text-slate-400">Available</span>
                    ${(Math.max(0, (card.creditLimit || 0) - card.balance)).toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-500">
                    <span className="block text-[10px] uppercase font-bold text-slate-400">Min Pay</span>
                    ${card.minPayment.toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-500">
                    <span className="block text-[10px] uppercase font-bold text-slate-400">APR</span>
                    {card.apr}%
                  </div>
                </div>
              </div>
              <div className="flex gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity pl-2">
                <button 
                  onClick={() => startEditing(card)}
                  className="text-slate-400 hover:text-brand-600 p-2 rounded-full hover:bg-brand-50 transition-colors"
                  title="Edit details"
                >
                  <Edit2 size={18} />
                </button>
                <button 
                  onClick={() => handleDelete(card.id)}
                  className="text-slate-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors"
                  title="Delete card"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CardInput;