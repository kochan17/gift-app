/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MOCK_GIFTS, MOCK_USERS } from './data';
import { Gift, User } from './types';
import { Feed } from './components/Feed';
import { AddGift } from './components/AddGift';
import { CirculationGraph } from './components/CirculationGraph';
import { Home, PlusCircle, Network } from 'lucide-react';
import { cn } from './utils';

type Tab = 'feed' | 'add' | 'graph';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('feed');
  const [gifts, setGifts] = useState<Gift[]>(MOCK_GIFTS);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);

  const getOrCreateUser = (name: string, currentUsers: User[]): { user: User, isNew: boolean } => {
    const existing = currentUsers.find(u => u.name.toLowerCase() === name.trim().toLowerCase());
    if (existing) return { user: existing, isNew: false };
    const newUser: User = {
      id: `u${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name: name.trim(),
      avatar: `https://picsum.photos/seed/${encodeURIComponent(name.trim())}/100/100`,
      color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`
    };
    return { user: newUser, isNew: true };
  };

  const handleAddGift = (senderName: string, receiverName: string, item: string) => {
    let currentUsers = [...users];
    const senderResult = getOrCreateUser(senderName, currentUsers);
    if (senderResult.isNew) currentUsers.push(senderResult.user);
    
    const receiverResult = getOrCreateUser(receiverName, currentUsers);
    if (receiverResult.isNew) currentUsers.push(receiverResult.user);

    setUsers(currentUsers);

    const newGift: Gift = {
      id: `g${Date.now()}`,
      senderId: senderResult.user.id,
      receiverId: receiverResult.user.id,
      item,
      timestamp: Date.now(),
      tips: 0,
      comments: []
    };
    setGifts([newGift, ...gifts]);
    setActiveTab('feed');
  };

  const handleEditGift = (giftId: string, senderName: string, receiverName: string, item: string) => {
    let currentUsers = [...users];
    const senderResult = getOrCreateUser(senderName, currentUsers);
    if (senderResult.isNew) currentUsers.push(senderResult.user);
    
    const receiverResult = getOrCreateUser(receiverName, currentUsers);
    if (receiverResult.isNew) currentUsers.push(receiverResult.user);

    setUsers(currentUsers);

    setGifts(gifts.map(g => g.id === giftId ? {
      ...g,
      senderId: senderResult.user.id,
      receiverId: receiverResult.user.id,
      item
    } : g));
  };

  const handleDeleteGift = (giftId: string) => {
    setGifts(gifts.filter(g => g.id !== giftId));
  };

  const handleAddComment = (giftId: string, userName: string, text: string) => {
    let currentUsers = [...users];
    const userResult = getOrCreateUser(userName, currentUsers);
    if (userResult.isNew) currentUsers.push(userResult.user);
    setUsers(currentUsers);

    setGifts(gifts.map(g => {
      if (g.id === giftId) {
        return {
          ...g,
          comments: [...g.comments, {
            id: `c${Date.now()}`,
            userName: userResult.user.name,
            text,
            timestamp: Date.now()
          }]
        };
      }
      return g;
    }));
  };

  const handleAddTip = (giftId: string) => {
    setGifts(gifts.map(g => g.id === giftId ? { ...g, tips: g.tips + 1 } : g));
  };

  return (
    <div className="min-h-screen bg-[#f5f5f0] flex flex-col max-w-md mx-auto relative shadow-2xl overflow-hidden">
      {/* Header */}
      <header className="bg-white px-6 py-4 sticky top-0 z-10 shadow-sm">
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">ギフトサークル</h1>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative">
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
