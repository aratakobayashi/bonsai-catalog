# 盆栽イベントデータ管理ガイド

## 📋 概要

このドキュメントは、盆栽カタログサイトにおけるイベントデータの追加・管理・記事との連携に関する包括的なガイドです。

## 🏗️ データベース構造

### メインテーブル

#### `events` テーブル
```sql
-- 必須フィールド
title           TEXT NOT NULL        -- イベント名
slug            TEXT UNIQUE NOT NULL -- URL用スラッグ
start_date      DATE NOT NULL        -- 開始日
end_date        DATE NOT NULL        -- 終了日
prefecture      TEXT NOT NULL        -- 都道府県（統一表記）
types           event_type[] NOT NULL -- イベントタイプ配列
price_type      event_price_type NOT NULL -- 料金タイプ

-- オプションフィールド
venue_name      TEXT                 -- 会場名
address         TEXT                 -- 住所（市区町村含む）
description     TEXT                 -- イベント説明
price_note      TEXT                 -- 料金補足情報
organizer_name  TEXT                 -- 主催者名
official_url    TEXT                 -- 公式サイトURL
lat             NUMERIC              -- 緯度
lng             NUMERIC              -- 経度
garden_id       UUID                 -- 関連盆栽園ID（外部キー）
related_product_tags TEXT[]          -- 関連商品タグ

-- システムフィールド
created_at      TIMESTAMP DEFAULT now()
updated_at      TIMESTAMP DEFAULT now()
```

#### `event_articles` テーブル（記事連携用）
```sql
id              UUID PRIMARY KEY
event_id        UUID REFERENCES events(id)
article_id      UUID REFERENCES articles(id)
relation_type   event_relation_type NOT NULL
created_at      TIMESTAMP DEFAULT now()
```

### ENUM定義

```sql
-- イベントタイプ
CREATE TYPE event_type AS ENUM (
  'exhibition',  -- 展示会・展覧会
  'sale',        -- 即売会・販売会
  'workshop',    -- 体験教室・ワークショップ
  'lecture'      -- 講習会・セミナー・デモ
);

-- 料金タイプ
CREATE TYPE event_price_type AS ENUM (
  'free',        -- 無料
  'paid'         -- 有料
);

-- 記事関連タイプ
CREATE TYPE event_relation_type AS ENUM (
  'announcement', -- 開催告知記事
  'report',      -- 参加レポート記事
  'summary'      -- 総括・まとめ記事
);
```

## 📝 イベント追加ワークフロー

### Step 1: 事前調査

```sql
-- 都道府県表記の確認
SELECT DISTINCT prefecture FROM events ORDER BY prefecture;

-- 既存のslugパターン確認（重複防止）
SELECT slug FROM events WHERE slug LIKE '%キーワード%';

-- 関連盆栽園の確認
SELECT id, name, prefecture FROM gardens
WHERE prefecture = '対象都道府県'
  AND (name LIKE '%会場名%' OR address LIKE '%会場名%');
```

### Step 2: データ準備チェックリスト

#### 必須項目
- [ ] イベント名（正式名称）
- [ ] 開催期間（開始日・終了日）
- [ ] 都道府県（**統一表記**: 東京都、大阪府、北海道など）
- [ ] イベントタイプ（exhibition/sale/workshop/lecture）
- [ ] 料金区分（free/paid）

#### 推奨項目
- [ ] 会場名
- [ ] 住所（市区町村レベル）
- [ ] 主催者名
- [ ] 料金詳細
- [ ] イベント説明文

#### オプション項目
- [ ] 公式サイトURL
- [ ] 関連盆栽園ID
- [ ] 座標情報

### Step 3: SQL挿入テンプレート

```sql
-- ===========================================
-- 盆栽イベント追加用テンプレート（動作確認済み）
-- ===========================================

INSERT INTO events (
  title,
  slug,
  start_date,
  end_date,
  prefecture,
  venue_name,
  address,
  description,
  types,
  price_type,
  price_note,
  organizer_name
) VALUES (
  '【イベント名】',
  '【slug】',                    -- 命名規則: {地域}-{主催者}-{年}-{月}
  '【YYYY-MM-DD】',             -- 開始日
  '【YYYY-MM-DD】',             -- 終了日
  '【都道府県】',               -- 例: '東京都', '京都府'
  '【会場名】',
  '【住所】',
  '【説明文】',
  '["exhibition","sale"]',      -- JSON配列形式（複数可）
  'free',                       -- または 'paid'
  '【料金補足】',               -- 例: '入場無料', '前売券1,200円'
  '【主催者名】'
);
```

### Step 4: データ整合性チェック

```sql
-- 重複チェック
SELECT title, venue_name, start_date, COUNT(*)
FROM events
GROUP BY title, venue_name, start_date
HAVING COUNT(*) > 1;

-- 盆栽園関連付けチェック
SELECT e.title, e.venue_name, g.name as garden_name
FROM events e
LEFT JOIN gardens g ON e.garden_id = g.id
WHERE e.created_at >= CURRENT_DATE - INTERVAL '7 days';
```

## 📰 記事連携システム

### 記事とイベントの関連付け

```sql
-- イベント告知記事の関連付け
INSERT INTO event_articles (event_id, article_id, relation_type)
VALUES (
  'イベントのUUID',
  '記事のUUID',
  'announcement'
);

-- 参加レポート記事の関連付け
INSERT INTO event_articles (event_id, article_id, relation_type)
VALUES (
  'イベントのUUID',
  '記事のUUID',
  'report'
);

-- 総括記事の関連付け
INSERT INTO event_articles (event_id, article_id, relation_type)
VALUES (
  'イベントのUUID',
  '記事のUUID',
  'summary'
);
```

### 関連記事の取得

```sql
-- イベントの関連記事を取得
SELECT
  a.title,
  a.slug,
  ea.relation_type,
  a.published_at
FROM event_articles ea
JOIN articles a ON ea.article_id = a.id
WHERE ea.event_id = 'イベントのUUID'
ORDER BY a.published_at DESC;

-- 記事に関連するイベントを取得
SELECT
  e.title,
  e.slug,
  e.start_date,
  ea.relation_type
FROM event_articles ea
JOIN events e ON ea.event_id = e.id
WHERE ea.article_id = '記事のUUID';
```

## 🎯 運用ガイドライン

### 命名規則

#### slugの命名
- パターン: `{地域}-{識別子}-{年}-{月}`
- 例:
  - `tokyo-shugaten-2024-11`
  - `kyoto-bonsai-taikan-2024-11`
  - `yokohama-ippinkai-2024-10`

#### 都道府県表記
- 必ず正式名称を使用
- ✅ 正しい: `東京都`, `大阪府`, `北海道`, `京都府`
- ❌ 間違い: `東京`, `大阪`, `北海`, `京都`

### イベントタイプの使い分け

| タイプ | 用途 | 例 |
|--------|------|-----|
| `exhibition` | 展示会・展覧会 | 盆栽大観展、地域盆栽展 |
| `sale` | 即売会・販売会 | 盆栽即売会、盆栽市 |
| `workshop` | 体験教室 | 盆栽教室、実技指導 |
| `lecture` | 講習会・セミナー | 講演会、デモンストレーション |

### 記事連携のタイミング

| 段階 | relation_type | タイミング | 内容 |
|------|---------------|------------|------|
| 開催前 | `announcement` | イベント1-2週間前 | 開催告知、見どころ紹介 |
| 開催後 | `report` | イベント翌日-1週間後 | 参加レポート、写真レポート |
| 総括 | `summary` | イベント1-2週間後 | 総括記事、来年への展望 |

## 🔧 メンテナンス・トラブルシューティング

### よくある問題と解決策

#### 1. slug重複エラー
```sql
-- 既存slugの確認
SELECT slug FROM events WHERE slug LIKE '%キーワード%';

-- 連番付きslugの生成
-- 例: event-name-2024-11-2
```

#### 2. 都道府県表記の不整合
```sql
-- 表記揺れのチェック
SELECT DISTINCT prefecture
FROM events
WHERE prefecture NOT IN (
  '北海道','青森県','岩手県','宮城県','秋田県','山形県','福島県',
  '茨城県','栃木県','群馬県','埼玉県','千葉県','東京都','神奈川県',
  '新潟県','富山県','石川県','福井県','山梨県','長野県','岐阜県',
  '静岡県','愛知県','三重県','滋賀県','京都府','大阪府','兵庫県',
  '奈良県','和歌山県','鳥取県','島根県','岡山県','広島県','山口県',
  '徳島県','香川県','愛媛県','高知県','福岡県','佐賀県','長崎県',
  '熊本県','大分県','宮崎県','鹿児島県','沖縄県'
);
```

#### 3. 盆栽園関連付けの確認
```sql
-- 自動関連付け候補の検索
SELECT
  e.title,
  e.venue_name,
  g.name as potential_garden,
  g.id
FROM events e
CROSS JOIN gardens g
WHERE e.garden_id IS NULL
  AND e.prefecture = g.prefecture
  AND (
    e.venue_name ILIKE '%' || g.name || '%'
    OR g.name ILIKE '%' || e.venue_name || '%'
  );
```

## 🤖 AI助手への依頼方法

### イベントデータ追加を依頼する場合

**推奨フレーズ:**
- "イベントデータ管理ガイドを参照して、〇月の盆栽イベントを追加してください"
- "EVENT_DATA_MANAGEMENT.mdに従って、〇〇展のデータを作成してください"
- "盆栽イベントの標準フォーマットで、〇〇のSQLを作成してください"

### 記事連携を依頼する場合

**推奨フレーズ:**
- "〇〇イベントの参加レポート記事を連携してください"
- "イベント記事連携ガイドに従って、〇〇の告知記事を関連付けてください"

### データ整合性チェックを依頼する場合

**推奨フレーズ:**
- "イベントデータの整合性をチェックしてください"
- "重複イベントや表記揺れをチェックしてください"
- "盆栽園との関連付けを確認してください"

---

**最終更新:** 2024年9月21日
**バージョン:** 1.0
**担当:** Claude Code Assistant