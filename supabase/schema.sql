-- ============================================================
-- 勤怠管理アプリ Supabase スキーマ
-- Supabase SQL Editor に貼り付けて実行してください
-- ============================================================

-- ① users テーブル
CREATE TABLE IF NOT EXISTS public.users (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT        NOT NULL,
  employee_code TEXT        NOT NULL UNIQUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.users IS '社員マスター';
COMMENT ON COLUMN public.users.employee_code IS '社員コード（ユニーク）';

-- ② attendance テーブル
CREATE TABLE IF NOT EXISTS public.attendance (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  work_date      DATE        NOT NULL,
  clock_in       TIMESTAMPTZ,
  clock_out      TIMESTAMPTZ,
  break_minutes  INTEGER     CHECK (break_minutes >= 0),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, work_date)
);

COMMENT ON TABLE public.attendance IS '打刻記録';
COMMENT ON COLUMN public.attendance.break_minutes IS '休憩時間（分）';

-- インデックス
CREATE INDEX IF NOT EXISTS idx_attendance_work_date ON public.attendance (work_date DESC);
CREATE INDEX IF NOT EXISTS idx_attendance_user_id   ON public.attendance (user_id);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================
ALTER TABLE public.users     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- anon ロール（タブレット用：認証なし）に全操作を許可
-- ※本番では IP制限 または Supabase Auth を追加することを推奨
CREATE POLICY "anon_all_users" ON public.users
  FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE POLICY "anon_all_attendance" ON public.attendance
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- ============================================================
-- サンプルデータ（初期ユーザー）
-- ============================================================
INSERT INTO public.users (name, employee_code) VALUES
  ('山田 太郎', '1001'),
  ('鈴木 花子', '1002'),
  ('佐藤 次郎', '1003'),
  ('田中 美咲', '1004'),
  ('伊藤 健一', '1005')
ON CONFLICT (employee_code) DO NOTHING;
