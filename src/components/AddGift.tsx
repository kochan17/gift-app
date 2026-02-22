import React, { useState } from 'react';
import { User } from '../types';
import { Send } from 'lucide-react';
import { cn } from '../utils';

interface AddGiftProps {
  users: User[];
  onAddGift: (senderName: string, receiverName: string, item: string) => void;
}

export function AddGift({ users, onAddGift }: AddGiftProps) {
  const [senderName, setSenderName] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const [item, setItem] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName.trim() || !receiverName.trim() || !item.trim()) return;
    if (senderName.trim().toLowerCase() === receiverName.trim().toLowerCase()) {
      alert("自分自身にギフトを贈ることはできません！");
      return;
    }
    onAddGift(senderName, receiverName, item);
    setSenderName('');
    setReceiverName('');
    setItem('');
  };

  return (
    <div className="px-4 pt-6 pb-24 h-full flex flex-col">
      <div className="bg-white rounded-3xl shadow-sm border border-black/5 p-6 flex-1">
        <h2 className="text-2xl font-semibold mb-6 text-gray-900">ギフトを記録する</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 h-full">
          
          <datalist id="users-list">
            {users.map(u => <option key={u.id} value={u.name} />)}
          </datalist>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700 uppercase tracking-wider text-xs">贈り主 (ニックネーム)</label>
            <input
              type="text"
              list="users-list"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              placeholder="例: アリス"
              className="w-full border-b-2 border-gray-200 focus:border-[#FF6321] outline-none py-3 text-lg transition-colors bg-transparent"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700 uppercase tracking-wider text-xs">受取人 (ニックネーム)</label>
            <input
              type="text"
              list="users-list"
              value={receiverName}
              onChange={(e) => setReceiverName(e.target.value)}
              placeholder="例: ボブ"
              className="w-full border-b-2 border-gray-200 focus:border-[#FF6321] outline-none py-3 text-lg transition-colors bg-transparent"
              required
            />
          </div>

          <div className="flex flex-col gap-2 flex-1">
            <label className="text-sm font-medium text-gray-700 uppercase tracking-wider text-xs">何を贈りましたか？</label>
            <input
              type="text"
              value={item}
              onChange={(e) => setItem(e.target.value)}
              placeholder="例: コーヒー、おすすめの本、引っ越しの手伝い..."
              className="w-full border-b-2 border-gray-200 focus:border-[#FF6321] outline-none py-3 text-lg transition-colors bg-transparent"
              required
            />
          </div>

          <button
            type="submit"
            disabled={!senderName.trim() || !receiverName.trim() || !item.trim() || senderName.trim().toLowerCase() === receiverName.trim().toLowerCase()}
            className="mt-auto w-full bg-[#FF6321] text-white rounded-full py-4 font-semibold text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all"
          >
            <Send className="w-5 h-5" />
            記録する
          </button>
        </form>
      </div>
    </div>
  );
}
