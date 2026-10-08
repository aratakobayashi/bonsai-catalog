-- 盆栽園の掲載情報の確認状況を記録する
-- verification_status: verified（確認済み）/ partially_verified（一部確認）/ not_found（実在を確認できない）/ closed（閉園）
-- is_published = false の園は、一覧・詳細・サイトマップに出さない
ALTER TABLE gardens ADD COLUMN IF NOT EXISTS verification_status text;
ALTER TABLE gardens ADD COLUMN IF NOT EXISTS verified_at timestamptz;
ALTER TABLE gardens ADD COLUMN IF NOT EXISTS source_urls text[];
ALTER TABLE gardens ADD COLUMN IF NOT EXISTS is_published boolean NOT NULL DEFAULT true;

CREATE INDEX IF NOT EXISTS idx_gardens_is_published ON gardens (is_published);
