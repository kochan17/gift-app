/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Gift, User } from './types';
import { Feed } from './components/Feed';
import { AddGift } from './components/AddGift';
import { CirculationGraph } from './components/CirculationGraph';
import { Home, PlusCircle, Network } from 'lucide-react';
import { cn } from './utils';
import {
  fetchUsers,
  fetchGifts,
  getOrCreateUser,
  createGift,
  updateGift,
  deleteGift,
  addComment,
  incrementTips,
} from './lib/db';

type Tab = 'feed' | 'add' | 'graph';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('feed');
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [fetchedUsers, fetchedGifts] = await Promise.all([
          fetchUsers(),
          fetchGifts(),
        ]);
        setUsers(fetchedUsers);
        setGifts(fetchedGifts);
      } catch (err) {
        console.error('データの読み込みに失敗しました:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const mergeUser = (user: User) => {
    setUsers(prev =>
      prev.find(u => u.id === user.id) ? prev : [...prev, user]
    );
  };

  const handleAddGift = async (senderName: string, receiverName: string, item: string) => {
    try {
      const [sender, receiver] = await Promise.all([
        getOrCreateUser(senderName),
        getOrCreateUser(receiverName),
      ]);
      mergeUser(sender);
      mergeUser(receiver);

      const newGift = await createGift(sender.id, receiver.id, item);
      setGifts(prev => [newGift, ...prev]);
      setActiveTab('feed');
    } catch (err) {
      console.error('ギフトの追加に失敗しました:', err);
    }
  };

  const handleEditGift = async (
    giftId: string,
    senderName: string,
    receiverName: string,
    item: string
  ) => {
    try {
      const [sender, receiver] = await Promise.all([
        getOrCreateUser(senderName),
        getOrCreateUser(receiverName),
      ]);
      mergeUser(sender);
      mergeUser(receiver);

      await updateGift(giftId, sender.id, receiver.id, item);
      setGifts(prev =>
        prev.map(g =>
          g.id === giftId
            ? { ...g, senderId: sender.id, receiverId: receiver.id, item }
            : g
        )
      );
    } catch (err) {
      console.error('ギフトの更新に失敗しました:', err);
    }
  };

  const handleDeleteGift = async (giftId: string) => {
    try {
      await deleteGift(giftId);
      setGifts(prev => prev.filter(g => g.id !== giftId));
    } catch (err) {
      console.error('ギフトの削除に失敗しました:', err);
    }
  };

  const handleAddComment = async (giftId: string, userName: string, text: string) => {
    try {
      const user = await getOrCreateUser(userName);
      mergeUser(user);

      const newComment = await addComment(giftId, user.name, text);
      setGifts(prev =>
        prev.map(g =>
          g.id === giftId
            ? { ...g, comments: [...g.comments, newComment] }
            : g
        )
      );
    } catch (err) {
      console.error('コメントの追加に失敗しました:', err);
    }
  };

  const handleAddTip = async (giftId: string) => {
    const gift = gifts.find(g => g.id === giftId);
    if (!gift) return;
    try {
      await incrementTips(giftId, gift.tips);
      setGifts(prev =>
        prev.map(g => (g.id === giftId ? { ...g, tips: g.tips + 1 } : g))
      );
    } catch (err) {
      console.error('チップの追加に失敗しました:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f0] flex flex-col max-w-md mx-auto relative shadow-2xl overflow-hidden">
      {/* Header */}
      <header className="bg-white px-6 py-4 sticky top-0 z-10 shadow-sm">
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">ギフトサークル</h1>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6321]" />
          </div>
        ) : (
          <>
            {activeTab === 'feed' && (
              <Feed
                gifts={gifts}
                users={users}
                onEditGift={handleEditGift}
                onDeleteGift={handleDeleteGift}
                onAddComment={handleAddComment}
                onAddTip={handleAddTip}
              />
            )}
            {activeTab === 'add' && <AddGift users={users} onAddGift={handleAddGift} />}
            {activeTab === 'graph' && <CirculationGraph users={users} gifts={gifts} />}
          </>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-white border-t border-gray-200 fixed bottom-0 w-full max-w-md pb-safe z-20">
        <div className="flex justify-around items-center h-16 px-2">
          <button
            onClick={() => setActiveTab('feed')}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors",
              activeTab === 'feed' ? "text-[#FF6321]" : "text-gray-400 hover:text-gray-600"
            )}
          >
            <Home className="w-6 h-6" />
            <span className="text-[10px] font-medium uppercase tracking-wider">フィード</span>
          </button>

          <button
            onClick={() => setActiveTab('add')}
            className="flex flex-col items-center justify-center w-full h-full -mt-6"
          >
            <div className={cn(
              "bg-[#FF6321] text-white p-3 rounded-full shadow-lg transition-transform active:scale-95",
              activeTab === 'add' ? "ring-4 ring-[#FF6321]/20" : ""
            )}>
              <PlusCircle className="w-8 h-8" />
            </div>
          </button>

          <button
            onClick={() => setActiveTab('graph')}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors",
              activeTab === 'graph' ? "text-[#FF6321]" : "text-gray-400 hover:text-gray-600"
            )}
          >
            <Network className="w-6 h-6" />
            <span className="text-[10px] font-medium uppercase tracking-wider">ネットワーク</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
