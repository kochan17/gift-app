import { User, Gift } from './types';

export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'アリス', avatar: 'https://picsum.photos/seed/alice/100/100', color: '#FF6B6B' },
  { id: 'u2', name: 'ボブ', avatar: 'https://picsum.photos/seed/bob/100/100', color: '#4ECDC4' },
  { id: 'u3', name: 'チャーリー', avatar: 'https://picsum.photos/seed/charlie/100/100', color: '#45B7D1' },
  { id: 'u4', name: 'ダイアナ', avatar: 'https://picsum.photos/seed/diana/100/100', color: '#F9A826' },
  { id: 'u5', name: 'イブ', avatar: 'https://picsum.photos/seed/eve/100/100', color: '#9B59B6' },
];

export const MOCK_GIFTS: Gift[] = [
  { 
    id: 'g1', senderId: 'u1', receiverId: 'u2', item: 'コーヒー', timestamp: Date.now() - 1000 * 60 * 60 * 24 * 2, 
    tips: 5, 
    comments: [
      { id: 'c1', userName: 'チャーリー', text: 'いいなー！僕も飲みたい☕️', timestamp: Date.now() - 1000 * 60 * 60 * 24 * 1.5 },
      { id: 'c2', userName: 'ボブ', text: '美味しかったよ！ありがとう！', timestamp: Date.now() - 1000 * 60 * 60 * 24 * 1 }
    ] 
  },
  { id: 'g2', senderId: 'u2', receiverId: 'u3', item: '本', timestamp: Date.now() - 1000 * 60 * 60 * 24 * 1, tips: 2, comments: [] },
  { id: 'g3', senderId: 'u3', receiverId: 'u1', item: 'ランチ', timestamp: Date.now() - 1000 * 60 * 60 * 5, tips: 12, comments: [{ id: 'c3', userName: 'ダイアナ', text: 'どこのお店行ったの？', timestamp: Date.now() - 1000 * 60 * 60 * 2 }] },
  { id: 'g4', senderId: 'u4', receiverId: 'u5', item: '観葉植物', timestamp: Date.now() - 1000 * 60 * 60 * 2, tips: 0, comments: [] },
  { id: 'g5', senderId: 'u5', receiverId: 'u1', item: 'プロジェクトの手伝い', timestamp: Date.now() - 1000 * 60 * 30, tips: 8, comments: [{ id: 'c4', userName: 'アリス', text: '本当に助かりました😭', timestamp: Date.now() - 1000 * 60 * 10 }] },
  { id: 'g6', senderId: 'u2', receiverId: 'u4', item: '映画のチケット', timestamp: Date.now() - 1000 * 60 * 15, tips: 1, comments: [] },
];
