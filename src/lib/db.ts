import { supabase } from './supabase';
import { User, Gift, Comment } from '../types';

// --- Supabase row types ---

interface UserRow {
  id: string;
  name: string;
  avatar: string;
  color: string;
}

interface CommentRow {
  id: string;
  gift_id: string;
  user_name: string;
  text: string;
  created_at: string;
}

interface GiftRow {
  id: string;
  sender_id: string;
  receiver_id: string;
  item: string;
  tips: number;
  created_at: string;
  comments: CommentRow[];
}

// --- Mappers ---

function mapComment(row: CommentRow): Comment {
  return {
    id: row.id,
    userName: row.user_name,
    text: row.text,
    timestamp: new Date(row.created_at).getTime(),
  };
}

function mapGift(row: GiftRow): Gift {
  return {
    id: row.id,
    senderId: row.sender_id,
    receiverId: row.receiver_id,
    item: row.item,
    timestamp: new Date(row.created_at).getTime(),
    tips: row.tips,
    comments: (row.comments || [])
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .map(mapComment),
  };
}

// --- Queries ---

export async function fetchUsers(): Promise<User[]> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at');
  if (error) throw error;
  return (data as UserRow[]) || [];
}

export async function fetchGifts(): Promise<Gift[]> {
  const { data, error } = await supabase
    .from('gifts')
    .select('*, comments(*)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return ((data as GiftRow[]) || []).map(mapGift);
}

export async function getOrCreateUser(name: string): Promise<User> {
  const trimmed = name.trim();

  const { data: existing } = await supabase
    .from('users')
    .select('*')
    .ilike('name', trimmed)
    .maybeSingle();

  if (existing) return existing as User;

  const newUser: UserRow = {
    id: `u${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    name: trimmed,
    avatar: `https://picsum.photos/seed/${encodeURIComponent(trimmed)}/100/100`,
    color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`,
  };

  const { data, error } = await supabase
    .from('users')
    .insert(newUser)
    .select()
    .single();
  if (error) throw error;
  return data as User;
}

export async function createGift(
  senderId: string,
  receiverId: string,
  item: string
): Promise<Gift> {
  const { data, error } = await supabase
    .from('gifts')
    .insert({
      id: `g${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      sender_id: senderId,
      receiver_id: receiverId,
      item,
      tips: 0,
    })
    .select('*, comments(*)')
    .single();
  if (error) throw error;
  return mapGift(data as GiftRow);
}

export async function updateGift(
  giftId: string,
  senderId: string,
  receiverId: string,
  item: string
): Promise<void> {
  const { error } = await supabase
    .from('gifts')
    .update({ sender_id: senderId, receiver_id: receiverId, item })
    .eq('id', giftId);
  if (error) throw error;
}

export async function deleteGift(giftId: string): Promise<void> {
  const { error } = await supabase.from('gifts').delete().eq('id', giftId);
  if (error) throw error;
}

export async function addComment(
  giftId: string,
  userName: string,
  text: string
): Promise<Comment> {
  const { data, error } = await supabase
    .from('comments')
    .insert({
      id: `c${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      gift_id: giftId,
      user_name: userName,
      text,
    })
    .select()
    .single();
  if (error) throw error;
  return mapComment(data as CommentRow);
}

export async function incrementTips(giftId: string, currentTips: number): Promise<void> {
  const { error } = await supabase
    .from('gifts')
    .update({ tips: currentTips + 1 })
    .eq('id', giftId);
  if (error) throw error;
}
