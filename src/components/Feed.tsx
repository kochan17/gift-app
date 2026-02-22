import React, { useState } from 'react';
import { Gift, User } from '../types';
import { formatDistanceToNow } from './dateUtils';
import { Gift as GiftIcon, Search, Edit2, Trash2, X, Check, MessageCircle, Coins, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FeedProps {
  gifts: Gift[];
  users: User[];
  onEditGift: (giftId: string, senderName: string, receiverName: string, item: string) => void;
  onDeleteGift: (giftId: string) => void;
  onAddComment: (giftId: string, userName: string, text: string) => void;
  onAddTip: (giftId: string) => void;
}

export function Feed({ gifts, users, onEditGift, onDeleteGift, onAddComment, onAddTip }: FeedProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Edit state
  const [editSender, setEditSender] = useState('');
  const [editReceiver, setEditReceiver] = useState('');
  const [editItem, setEditItem] = useState('');

  // Interaction state
  const [expandedComments, setExpandedComments] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [commenterName, setCommenterName] = useState('');
  const [floatingCoins, setFloatingCoins] = useState<{id: number, giftId: string}[]>([]);

  const getUser = (id: string) => users.find((u) => u.id === id);

  const filteredGifts = gifts.filter(gift => {
    const sender = getUser(gift.senderId);
    const receiver = getUser(gift.receiverId);
    const searchLower = searchQuery.toLowerCase();
    
    return (
      gift.item.toLowerCase().includes(searchLower) ||
      (sender && sender.name.toLowerCase().includes(searchLower)) ||
      (receiver && receiver.name.toLowerCase().includes(searchLower))
    );
  });

  const sortedGifts = [...filteredGifts].sort((a, b) => b.timestamp - a.timestamp);

  const startEdit = (gift: Gift, senderName: string, receiverName: string) => {
    setEditingId(gift.id);
    setEditSender(senderName);
    setEditReceiver(receiverName);
    setEditItem(gift.item);
  };

  const saveEdit = (giftId: string) => {
    if (!editSender.trim() || !editReceiver.trim() || !editItem.trim()) return;
    if (editSender.trim().toLowerCase() === editReceiver.trim().toLowerCase()) {
      alert("自分自身にギフトを贈ることはできません！");
      return;
    }
    onEditGift(giftId, editSender, editReceiver, editItem);
    setEditingId(null);
  };

  const handleTip = (giftId: string) => {
    onAddTip(giftId);
    const id = Date.now();
    setFloatingCoins(prev => [...prev, { id, giftId }]);
    setTimeout(() => {
      setFloatingCoins(prev => prev.filter(c => c.id !== id));
    }, 1000);
  };

  const submitComment = (giftId: string) => {
    if (!commenterName.trim() || !commentText.trim()) return;
    onAddComment(giftId, commenterName, commentText);
    setCommentText('');
  };

  return (
    <div className="flex flex-col gap-4 pb-24 pt-4 px-4">
      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="ギフトやユーザーを検索..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-2xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF6321] focus:border-[#FF6321] sm:text-sm transition-shadow shadow-sm"
        />
      </div>

      <datalist id="edit-users-list">
        {users.map(u => <option key={u.id} value={u.name} />)}
      </datalist>

      <AnimatePresence mode="popLayout">
        {sortedGifts.map((gift) => {
          const sender = getUser(gift.senderId);
          const receiver = getUser(gift.receiverId);

          if (!sender || !receiver) return null;

          const isEditing = editingId === gift.id;

          if (isEditing) {
            return (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                key={`edit-${gift.id}`} 
                className="bg-white p-4 rounded-3xl shadow-sm border border-[#FF6321] flex flex-col gap-3"
              >
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    list="edit-users-list"
                    value={editSender}
                    onChange={(e) => setEditSender(e.target.value)}
                    placeholder="贈り主"
                    className="w-full border-b border-gray-200 focus:border-[#FF6321] outline-none py-1 text-sm"
                  />
                  <input
                    type="text"
                    list="edit-users-list"
                    value={editReceiver}
                    onChange={(e) => setEditReceiver(e.target.value)}
                    placeholder="受取人"
                    className="w-full border-b border-gray-200 focus:border-[#FF6321] outline-none py-1 text-sm"
                  />
                  <input
                    type="text"
                    value={editItem}
                    onChange={(e) => setEditItem(e.target.value)}
                    placeholder="ギフト内容"
                    className="w-full border-b border-gray-200 focus:border-[#FF6321] outline-none py-1 text-sm font-medium"
                  />
                </div>
                <div className="flex justify-end gap-2 mt-2">
                  <button onClick={() => setEditingId(null)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
                    <X className="w-5 h-5" />
                  </button>
                  <button onClick={() => saveEdit(gift.id)} className="p-2 text-white bg-[#FF6321] hover:bg-[#e5581e] rounded-full">
                    <Check className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            );
          }

          return (
            <motion.div
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              key={gift.id}
              className="bg-white p-4 rounded-3xl shadow-sm border border-black/5 flex flex-col gap-3 group"
            >
              <div className="flex items-start gap-4">
                <div className="relative flex-shrink-0">
                  <img
                    src={sender.avatar}
                    alt={sender.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                    referrerPolicy="no-referrer"
                  />
                  <img
                    src={receiver.avatar}
                    alt={receiver.name}
                    className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm absolute -bottom-2 -right-2"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <p className="text-sm text-gray-800 leading-snug pr-2">
                      <span className="font-semibold">{sender.name}</span> さんから{' '}
                      <span className="font-semibold">{receiver.name}</span> さんへ
                    </p>
                    <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <button onClick={() => startEdit(gift, sender.name, receiver.name)} className="p-1.5 text-gray-400 hover:text-[#FF6321] hover:bg-orange-50 rounded-full transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => { if(window.confirm('このギフトを削除しますか？')) onDeleteGift(gift.id); }} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <GiftIcon className="w-4 h-4 text-[#FF6321]" />
                    <p className="text-base font-medium text-gray-900 truncate">
                      {gift.item}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1.5">
                    {formatDistanceToNow(gift.timestamp)}前
                  </p>
                </div>
              </div>

              {/* Interaction Bar */}
              <div className="flex items-center gap-4 mt-1 pt-3 border-t border-gray-100">
                <button
                  onClick={() => handleTip(gift.id)}
                  className="flex items-center gap-1.5 text-gray-500 hover:text-yellow-500 transition-colors relative"
                >
                  <Coins className="w-5 h-5" />
                  <span className="text-sm font-medium">{gift.tips > 0 ? gift.tips : 'チップ'}</span>
                  <AnimatePresence>
                    {floatingCoins.filter(c => c.giftId === gift.id).map(c => (
                      <motion.div
                        key={c.id}
                        initial={{ opacity: 1, y: 0, scale: 0.8 }}
                        animate={{ opacity: 0, y: -40, scale: 1.5 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="absolute left-0 bottom-0 pointer-events-none"
                      >
                        <Coins className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </button>

                <button
                  onClick={() => setExpandedComments(expandedComments === gift.id ? null : gift.id)}
                  className="flex items-center gap-1.5 text-gray-500 hover:text-blue-500 transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">{gift.comments.length > 0 ? gift.comments.length : 'コメント'}</span>
                </button>
              </div>

              {/* Comments Section */}
              <AnimatePresence>
                {expandedComments === gift.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-3 flex flex-col gap-3">
                      {/* Comment List */}
                      {gift.comments.map(comment => (
                        <div key={comment.id} className="bg-gray-50 p-3 rounded-2xl text-sm">
                          <div className="flex justify-between items-baseline mb-1">
                            <span className="font-semibold text-gray-800">{comment.userName}</span>
                            <span className="text-[10px] text-gray-400">{formatDistanceToNow(comment.timestamp)}前</span>
                          </div>
                          <p className="text-gray-700">{comment.text}</p>
                        </div>
                      ))}

                      {/* Comment Input */}
                      <div className="flex flex-col gap-2 mt-1">
                        <input
                          type="text"
                          placeholder="あなたのニックネーム"
                          value={commenterName}
                          onChange={e => setCommenterName(e.target.value)}
                          className="text-sm px-3 py-2 bg-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#FF6321]/50 transition-all"
                        />
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="コメントを入力..."
                            value={commentText}
                            onChange={e => setCommentText(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && submitComment(gift.id)}
                            className="flex-1 text-sm px-3 py-2 bg-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#FF6321]/50 transition-all"
                          />
                          <button
                            onClick={() => submitComment(gift.id)}
                            disabled={!commenterName.trim() || !commentText.trim()}
                            className="bg-[#FF6321] text-white p-2 rounded-xl disabled:opacity-50 transition-transform active:scale-95"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </AnimatePresence>
      {sortedGifts.length === 0 && (
        <div className="text-center text-gray-500 mt-10">
          {searchQuery ? '検索結果がありません。' : 'まだギフトはありません。最初のギフトを送りましょう！'}
        </div>
      )}
    </div>
  );
}
