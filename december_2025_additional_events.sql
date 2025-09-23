-- =========================================================
-- 2025年12月 盆栽イベント追加データ（年末・クリスマス・正月準備版）
-- 年末総決算・クリスマス・正月準備・一年感謝・冬の美シーズン
-- EVENT_DATA_MANAGEMENT.mdの形式に準拠
-- =========================================================

-- ==================== 北海道・東北地方 ====================

-- イベント1: 札幌雪まつり盆栽氷雪展
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '札幌雪まつり盆栽氷雪展',
  'hokkaido-sapporo-yukimatsuri-hyousetsu-2025-12',
  '2025-12-20',
  '2025-12-25',
  '北海道',
  'さっぽろ雪まつり会場',
  '北海道札幌市中央区大通公園',
  '雪まつりに合わせた特別展示。雪と氷に映える常緑盆栽の美しさと、極寒での盆栽管理技術を紹介する北海道ならではの企画。',
  '["exhibition","workshop"]',
  'free',
  '入場無料',
  '札幌氷雪盆栽会'
);

-- イベント2: 青森ねぶた師盆栽年末感謝祭
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '青森ねぶた師盆栽年末感謝祭',
  'aomori-nebuta-nenmatsu-kansha-2025-12',
  '2025-12-28',
  '2025-12-30',
  '青森県',
  'ねぶたの家 ワ・ラッセ',
  '青森県青森市安方',
  'ねぶた師と盆栽師のコラボ企画。一年の感謝を込めて、伝統工芸の技が光る特別展示。りんごの木の盆栽と津軽塗鉢の組み合わせ。',
  '["exhibition","sale"]',
  'paid',
  '入場料：大人800円、学生400円',
  '津軽伝統工芸盆栽会'
);

-- イベント3: 仙台光のページェント盆栽イルミネーション
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '仙台光のページェント盆栽イルミネーション',
  'miyagi-sendai-hikari-illumination-2025-12',
  '2025-12-12',
  '2025-12-31',
  '宮城県',
  '定禅寺通り',
  '宮城県仙台市青葉区定禅寺通',
  '光のページェントに合わせた盆栽ライトアップ展示。イルミネーションに映える盆栽の美しさと、光と影が織りなす幻想的な空間。',
  '["exhibition"]',
  'free',
  '入場無料',
  '杜の都光盆栽協会'
);

-- ==================== 関東地方 ====================

-- イベント4: 大宮盆栽村年末大感謝祭
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '大宮盆栽村年末大感謝祭2025',
  'saitama-omiya-nenmatsu-dai-kansha-2025-12',
  '2025-12-28',
  '2025-12-30',
  '埼玉県',
  '大宮盆栽村',
  '埼玉県さいたま市北区盆栽町',
  '一年の締めくくりとなる盆栽村最大のイベント。村内全園参加の特別価格セール、来年の運気向上祈願盆栽の特別展示。',
  '["sale","exhibition","lecture"]',
  'free',
  '入場無料',
  '大宮盆栽協同組合'
);

-- イベント5: 東京丸の内クリスマス盆栽展
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '東京丸の内クリスマス盆栽展',
  'tokyo-marunouchi-christmas-2025-12',
  '2025-12-20',
  '2025-12-25',
  '東京都',
  '丸の内仲通り',
  '東京都千代田区丸の内',
  'クリスマスイルミネーションとコラボした盆栽展。西洋のクリスマスと東洋の盆栽文化の美しい融合。モミの木盆栽が特に人気。',
  '["exhibition"]',
  'free',
  '入場無料',
  '東京都心クリスマス盆栽会'
);

-- イベント6: 横浜みなとみらい年末盆栽カウントダウン
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '横浜みなとみらい年末盆栽カウントダウン',
  'kanagawa-yokohama-minatomirai-countdown-2025-12',
  '2025-12-31',
  '2025-12-31',
  '神奈川県',
  'みなとみらい21',
  '神奈川県横浜市西区みなとみらい',
  '年越しカウントダウンと盆栽展示のコラボ企画。新年への希望を込めた盆栽展示と、来年の抱負を盆栽に込める特別ワークショップ。',
  '["exhibition","workshop"]',
  'paid',
  '参加費：2025円（記念品付き）',
  '横浜みなとみらい新年盆栽会'
);

-- イベント7: 千葉成田山正月準備盆栽市
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '千葉成田山正月準備盆栽市',
  'chiba-naritasan-shougatsu-junbi-2025-12',
  '2025-12-26',
  '2025-12-30',
  '千葉県',
  '成田山新勝寺',
  '千葉県成田市成田',
  '正月を迎える準備として開催される特別盆栽市。縁起の良い盆栽（松、梅、竹）を中心に、新年の福を招く盆栽を厳選販売。',
  '["sale","exhibition"]',
  'free',
  '入場無料',
  '成田山正月盆栽講'
);

-- ==================== 中部地方 ====================

-- イベント8: 富士山初日の出盆栽祈願展
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '富士山初日の出盆栽祈願展',
  'yamanashi-fujisan-hatsuhinode-kigan-2025-12',
  '2025-12-31',
  '2025-12-31',
  '山梨県',
  '河口湖畔',
  '山梨県南都留郡富士河口湖町',
  '富士山の初日の出を拝む特別企画。来年への願いを込めた盆栽展示と、富士山をバックにした年越し盆栽鑑賞会。',
  '["exhibition","lecture"]',
  'paid',
  '参加費：3000円（甘酒・記念品付き）',
  '富士五湖初日の出盆栽会'
);

-- イベント9: 名古屋熱田神宮年末盆栽奉納展
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '名古屋熱田神宮年末盆栽奉納展',
  'aichi-nagoya-atsuta-nenmatsu-hounou-2025-12',
  '2025-12-28',
  '2025-12-31',
  '愛知県',
  '熱田神宮',
  '愛知県名古屋市熱田区神宮',
  '一年の感謝を込めた盆栽奉納展。神宮の神聖な雰囲気の中で、厳選された盆栽を奉納展示。初詣の準備としても人気。',
  '["exhibition"]',
  'free',
  '入場無料',
  '熱田神宮盆栽奉納会'
);

-- イベント10: 金沢雪化粧兼六園冬景色盆栽展
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '金沢雪化粧兼六園冬景色盆栽展',
  'ishikawa-kanazawa-yukigeshō-fuyugeshiki-2025-12',
  '2025-12-01',
  '2025-12-25',
  '石川県',
  '兼六園',
  '石川県金沢市兼六町',
  '雪化粧した兼六園での冬景色盆栽展。雪吊りが美しい庭園と、冬の静寂美を表現した盆栽の共演。加賀の冬の風情を満喫。',
  '["exhibition"]',
  'paid',
  '兼六園入園料（大人320円）',
  '金沢冬景色盆栽保存会'
);

-- ==================== 関西地方 ====================

-- イベント11: 京都清水寺年末除夜盆栽鑑賞会
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '京都清水寺年末除夜盆栽鑑賞会',
  'kyoto-kiyomizu-nenmatsu-joya-2025-12',
  '2025-12-31',
  '2025-12-31',
  '京都府',
  '清水寺',
  '京都府京都市東山区清水',
  '除夜の鐘と共に一年を振り返る盆栽鑑賞会。厳選された盆栽を前に、静寂の中で新年への想いを込める特別な体験。',
  '["exhibition","lecture"]',
  'paid',
  '参加費：2500円（甘酒・お守り付き）',
  '京都除夜盆栽鑑賞会'
);

-- イベント12: 大阪USJ冬の盆栽ワンダーランド
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '大阪USJ冬の盆栽ワンダーランド',
  'osaka-usj-fuyu-wonderland-2025-12',
  '2025-12-20',
  '2025-12-25',
  '大阪府',
  'ユニバーサル・スタジオ・ジャパン',
  '大阪府大阪市此花区桜島',
  'テーマパークでの盆栽展示という新しい試み。エンターテイメントと伝統文化の融合で、若い世代にも盆栽の魅力を伝える。',
  '["exhibition","workshop"]',
  'paid',
  'USJ入園料別途必要',
  '関西エンターテイメント盆栽協会'
);

-- イベント13: 神戸ルミナリエ盆栽光の祭典
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '神戸ルミナリエ盆栽光の祭典',
  'hyogo-kobe-luminarie-hikari-2025-12',
  '2025-12-06',
  '2025-12-15',
  '兵庫県',
  '神戸ルミナリエ会場',
  '兵庫県神戸市中央区',
  'ルミナリエの光に包まれた盆栽展示。復興と希望の象徴である光と、生命力あふれる盆栽の組み合わせで感動的な空間を演出。',
  '["exhibition"]',
  'free',
  '入場無料',
  '神戸復興希望盆栽会'
);

-- ==================== 中国・四国地方 ====================

-- イベント14: 岡山後楽園雪見盆栽茶会
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '岡山後楽園雪見盆栽茶会',
  'okayama-korakuen-yukimi-chakai-2025-12',
  '2025-12-22',
  '2025-12-22',
  '岡山県',
  '岡山後楽園',
  '岡山県岡山市北区後楽園',
  '冬至の日に開催する特別茶会。雪化粧した日本三名園で、冬の静寂美を表現した盆栽を愛でながら心温まる茶の湯を楽しむ。',
  '["exhibition","lecture"]',
  'paid',
  '参加費：4500円（茶菓子・抹茶・入園料込み）',
  '岡山後楽園冬至茶道盆栽会'
);

-- イベント15: 広島平和記念公園希望盆栽展
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '広島平和記念公園希望盆栽展',
  'hiroshima-heiwa-kinen-kibou-2025-12',
  '2025-12-08',
  '2025-12-24',
  '広島県',
  '平和記念公園',
  '広島県広島市中区中島町',
  '平和への願いと新年への希望を込めた盆栽展。平和の象徴である鶴と盆栽の組み合わせで、世界平和と個人の幸福を祈念。',
  '["exhibition"]',
  'free',
  '入場無料',
  '広島平和希望盆栽会'
);

-- イベント16: 高松栗林公園年末感謝盆栽展
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '高松栗林公園年末感謝盆栽展',
  'kagawa-ritsurin-nenmatsu-kansha-2025-12',
  '2025-12-26',
  '2025-12-30',
  '香川県',
  '栗林公園',
  '香川県高松市栗林町',
  '一年の感謝を込めた年末特別展示。讃岐の美しい庭園で、松盆栽を中心とした縁起の良い盆栽を展示。来年への願いも込めて。',
  '["exhibition","sale"]',
  'paid',
  '栗林公園入園料（大人410円）',
  '讃岐年末感謝盆栽会'
);

-- ==================== 九州地方 ====================

-- イベント17: 福岡太宰府天満宮合格祈願盆栽展
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '福岡太宰府天満宮合格祈願盆栽展',
  'fukuoka-dazaifu-goukaku-kigan-2025-12',
  '2025-12-25',
  '2025-12-31',
  '福岡県',
  '太宰府天満宮',
  '福岡県太宰府市宰府',
  '受験シーズンを迎える学生への応援企画。学問の神様・菅原道真公にちなんだ梅盆栽を中心に、合格祈願の特別展示。',
  '["exhibition","sale"]',
  'free',
  '入場無料',
  '太宰府合格祈願盆栽講'
);

-- イベント18: 熊本城復興希望盆栽展
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '熊本城復興希望盆栽展',
  'kumamoto-castle-fukkou-kibou-2025-12',
  '2025-12-23',
  '2025-12-25',
  '熊本県',
  '熊本城二の丸広場',
  '熊本県熊本市中央区本丸',
  '復興が進む熊本城で開催する希望の盆栽展。困難を乗り越える力強さを表現した盆栽で、新年への希望と復興への願いを込めて。',
  '["exhibition"]',
  'free',
  '入場無料（熊本城入城は有料）',
  '熊本復興希望盆栽会'
);

-- イベント19: 鹿児島桜島大晦日盆栽祭
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '鹿児島桜島大晦日盆栽祭',
  'kagoshima-sakurajima-oomisoka-matsuri-2025-12',
  '2025-12-31',
  '2025-12-31',
  '鹿児島県',
  '桜島フェリーターミナル',
  '鹿児島県鹿児島市桜島横山町',
  '活火山桜島を背景にした大晦日特別イベント。一年の締めくくりに、力強い生命力を表現した盆栽で新年への活力をチャージ。',
  '["exhibition","workshop"]',
  'free',
  '入場無料',
  '桜島大晦日盆栽祭実行委員会'
);

-- ==================== 特別イベント ====================

-- イベント20: 全国オンライン年末盆栽総決算フォーラム
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '全国オンライン年末盆栽総決算フォーラム',
  'online-nenmatsu-sousansan-forum-2025-12',
  '2025-12-29',
  '2025-12-29',
  '東京都',
  'オンライン開催',
  'Zoom・YouTube Liveによる配信',
  '一年を振り返る盆栽総決算フォーラム。全国の盆栽愛好家が今年の成果を発表し、来年への抱負を語り合う特別企画。',
  '["lecture","exhibition"]',
  'paid',
  '参加費：2500円',
  '日本盆栽年末総決算協会'
);

-- イベント21: 国際クリスマス盆栽コンテスト
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '第1回国際クリスマス盆栽コンテスト',
  'international-christmas-bonsai-contest-2025-12',
  '2025-12-20',
  '2025-12-25',
  '東京都',
  '東京国際フォーラム',
  '東京都千代田区丸の内',
  '世界中からクリスマスをテーマにした盆栽作品を募集。東西文化の融合を表現した新しいスタイルの盆栽コンテスト。',
  '["exhibition","lecture"]',
  'paid',
  '入場料：2000円',
  '国際クリスマス盆栽協会'
);

-- イベント22: 来年の干支盆栽作り体験教室
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '来年の干支「午」盆栽作り体験教室',
  'tokyo-eto-uma-bonsai-taiken-2025-12',
  '2025-12-28',
  '2025-12-30',
  '東京都',
  '大宮盆栽美術館',
  '埼玉県さいたま市北区土呂町',
  '2026年の干支「午」にちなんだ盆栽作り体験。馬のように力強く駆ける一年への願いを込めて、縁起の良い盆栽を作成。',
  '["workshop"]',
  'paid',
  '参加費：3500円（材料費・記念品込み）',
  '大宮盆栽美術館'
);

-- ==========================================================
-- 追加イベント数: 22件
-- 対象地域: 全国（北海道から九州まで）
-- 特色: 年末・クリスマス・正月準備・感謝・希望をテーマ
-- イベントタイプ: exhibition, sale, workshop, lecture
-- ==========================================================