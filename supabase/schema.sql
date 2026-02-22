-- ================================================
-- Gift Circle - Supabase Schema
-- Supabase SQL Editor でこのファイルを実行してください
-- ================================================

-- users テーブル
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  avatar TEXT,
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- gifts テーブル
CREATE TABLE IF NOT EXISTS gifts (
  id TEXT PRIMARY KEY,
  sender_id TEXT NOT NULL REFERENCES users(id),
  receiver_id TEXT NOT NULL REFERENCES users(id),
  item TEXT NOT NULL,
  tips INT4 DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- comments テーブル (gift削除時にコメントも自動削除)
CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  gift_id TEXT NOT NULL REFERENCES gifts(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- Row Level Security (RLS) 設定
-- 認証なしで誰でも読み書きできる設定（プロトタイプ用）
-- ================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_all" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all" ON gifts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all" ON comments FOR ALL USING (true) WITH CHECK (true);
