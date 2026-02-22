-- ================================================
-- Supabase 状態確認 & 修正スクリプト
-- Supabase Dashboard の SQL Editor で実行してください
-- ================================================

-- 1. サンプルデータの削除 (ボブ、チャーリーなど)
-- ※ すでにデータがある場合は全削除されます。
TRUNCATE TABLE public.comments CASCADE;
TRUNCATE TABLE public.gifts CASCADE;
TRUNCATE TABLE public.users CASCADE;

-- 2. テーブル構成の再確認 (存在しない場合のみ作成)
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  avatar TEXT,
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.gifts (
  id TEXT PRIMARY KEY,
  sender_id TEXT NOT NULL REFERENCES public.users(id),
  receiver_id TEXT NOT NULL REFERENCES public.users(id),
  item TEXT NOT NULL,
  tips INT4 DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.comments (
  id TEXT PRIMARY KEY,
  gift_id TEXT NOT NULL REFERENCES public.gifts(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. RLS (Row Level Security) の設定
-- 開発・プロトタイプ用に、認証なしで誰でも読み書きできるように設定します
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- 既存のポリシーを一度削除して再作成
DROP POLICY IF EXISTS "public_all" ON public.users;
CREATE POLICY "public_all" ON public.users FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "public_all" ON public.gifts;
CREATE POLICY "public_all" ON public.gifts FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "public_all" ON public.comments;
CREATE POLICY "public_all" ON public.comments FOR ALL USING (true) WITH CHECK (true);

-- 4. 完了確認メッセージ
SELECT '設定が完了しました。アプリからデータの保存をお試しください。' as message;
