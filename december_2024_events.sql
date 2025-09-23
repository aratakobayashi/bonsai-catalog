-- =========================================================
-- 2024年12月 盆栽イベント追加データ（年末・正月準備版）
-- 年末総決算・正月準備・来年への準備シーズン
-- EVENT_DATA_MANAGEMENT.mdの形式に準拠
-- =========================================================

-- ==================== 北海道・東北地方 ====================

-- イベント1: 札幌雪景色と盆栽展
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '札幌雪景色と盆栽展2024',
  'hokkaido-sapporo-snow-bonsai-2024-12',
  '2024-12-21',
  '2024-12-23',
  '北海道',
  '札幌コンベンションセンター',
  '北海道札幌市白石区東札幌',
  '雪化粧した札幌で開催される冬の盆栽展。雪吊りや冬囲いを施した盆栽の美しさを紹介。北海道の厳しい冬を乗り越える管理技術も学べる。',
  '["exhibition","lecture"]',
  'paid',
  '入場料：大人700円、学生350円',
  '北海道冬季盆栽会'
);

-- イベント2: 仙台正月飾り盆栽市
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '仙台正月飾り盆栽市',
  'miyagi-sendai-newyear-market-2024-12',
  '2024-12-28',
  '2024-12-31',
  '宮城県',
  '仙台朝市',
  '宮城県仙台市青葉区中央',
  '年末の仙台朝市で開催される正月飾り専門の盆栽市。松竹梅の盆栽、ミニ門松、お正月向けアレンジ盆栽を販売。年内最後の大盆栽市。',
  '["sale"]',
  'free',
  '入場無料',
  '東北正月盆栽組合'
);

-- ==================== 関東地方 ====================

-- イベント3: 大宮盆栽村年末感謝祭
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '大宮盆栽村年末感謝祭2024',
  'saitama-omiya-nenmatsu-kansha-2024-12',
  '2024-12-07',
  '2024-12-08',
  '埼玉県',
  '大宮盆栽村',
  '埼玉県さいたま市北区盆栽町',
  '盆栽の聖地大宮での年末恒例イベント。1年の感謝を込めた特別価格での即売会。来年の管理計画相談、冬の手入れ講習会も同時開催。',
  '["sale","lecture","exhibition"]',
  'free',
  '入場無料',
  '大宮盆栽協同組合'
);

-- イベント4: 東京正月盆栽大展示会
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '東京正月盆栽大展示会',
  'tokyo-newyear-bonsai-exhibition-2024-12',
  '2024-12-26',
  '2025-01-03',
  '東京都',
  '東京ビッグサイト',
  '東京都江東区有明',
  '年末年始をまたぐ大規模盆栽展。正月飾りとしての盆栽の楽しみ方、新年の運気を呼ぶ盆栽の選び方を紹介。初詣気分で楽しめる特別企画。',
  '["exhibition","sale"]',
  'paid',
  '入場料：大人1200円、中高生600円',
  '東京正月盆栽協会'
);

-- イベント5: 横浜中華街新年盆栽祭
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '横浜中華街新年盆栽祭',
  'kanagawa-yokohama-chinatown-2024-12',
  '2024-12-29',
  '2025-01-01',
  '神奈川県',
  '横浜中華街',
  '神奈川県横浜市中区山下町',
  '中華街の新年を彩る盆栽祭。中国盆景（ペンジン）との文化交流、日中盆栽の違いを学ぶ展示。中華料理と盆栽鑑賞の特別コラボ企画も。',
  '["exhibition","lecture"]',
  'paid',
  '入場料：大人800円（中華街食事券付き）',
  '日中盆栽文化交流会'
);

-- イベント6: 千葉幕張メッセ盆栽年末大市
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '千葉幕張メッセ盆栽年末大市',
  'chiba-makuhari-nenmatsu-taishi-2024-12',
  '2024-12-14',
  '2024-12-15',
  '千葉県',
  '幕張メッセ',
  '千葉県千葉市美浜区中瀬',
  '関東最大級の年末盆栽即売会。全国から約100店舗が出店。年末の大掃除に合わせた盆栽手入れ用品も充実。福袋販売や抽選会も開催。',
  '["sale","workshop"]',
  'paid',
  '入場料：大人500円',
  '関東盆栽商業組合'
);

-- ==================== 中部地方 ====================

-- イベント7: 富士山麓雪化粧盆栽展
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '富士山麓雪化粧盆栽展',
  'shizuoka-fujisan-snow-2024-12',
  '2024-12-21',
  '2024-12-24',
  '静岡県',
  '富士山世界遺産センター',
  '静岡県富士宮市宮町',
  '雪化粧した富士山を背景に開催される冬の盆栽展。富士山と盆栽の組み合わせで日本の美を表現。年末年始の富士山観光と合わせて楽しめる。',
  '["exhibition"]',
  'paid',
  'センター入館料（大人300円）',
  '富士山麓盆栽会'
);

-- イベント8: 名古屋城お正月準備盆栽展
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '名古屋城お正月準備盆栽展',
  'aichi-nagoya-castle-newyear-2024-12',
  '2024-12-14',
  '2024-12-25',
  '愛知県',
  '名古屋城本丸御殿',
  '愛知県名古屋市中区本丸',
  '名古屋城でのお正月準備盆栽展。松竹梅を使った正月飾り盆栽、干支にちなんだ盆栽アレンジを展示。武家文化とお正月の盆栽の歴史も紹介。',
  '["exhibition","workshop"]',
  'paid',
  '名古屋城入場料（大人500円）',
  '尾張盆栽文化会'
);

-- イベント9: 金沢兼六園雪吊りと盆栽の美
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '金沢兼六園雪吊りと盆栽の美',
  'ishikawa-kenrokuen-yukitsuri-2024-12',
  '2024-12-01',
  '2024-12-28',
  '石川県',
  '兼六園内',
  '石川県金沢市兼六町',
  '兼六園の雪吊りシーズンに合わせた特別展示。雪吊りを施した盆栽と庭園の雪吊りのコラボレーション。加賀の伝統美と冬の風情を満喫。',
  '["exhibition"]',
  'paid',
  '兼六園入園料（大人320円）',
  '加賀伝統盆栽保存会'
);

-- ==================== 関西地方 ====================

-- イベント10: 京都清水寺年末盆栽奉納展
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '京都清水寺年末盆栽奉納展',
  'kyoto-kiyomizu-nenmatsu-2024-12',
  '2024-12-25',
  '2024-12-31',
  '京都府',
  '清水寺境内',
  '京都府京都市東山区清水',
  '歴史ある清水寺での年末特別企画。1年の感謝を込めた盆栽奉納展示。除夜の鐘とともに盆栽を鑑賞する荘厳な年末行事。',
  '["exhibition"]',
  'paid',
  '清水寺拝観料（大人400円）',
  '京都寺院盆栽会'
);

-- イベント11: 大阪天神祭盆栽お正月準備市
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '大阪天神祭盆栽お正月準備市',
  'osaka-tenjin-newyear-market-2024-12',
  '2024-12-20',
  '2024-12-30',
  '大阪府',
  '大阪天満宮',
  '大阪府大阪市北区天神橋',
  '学問の神様天満宮でのお正月準備盆栽市。合格祈願の盆栽、商売繁盛を願う縁起物盆栽を中心に販売。初詣準備と合わせて楽しめる。',
  '["sale","exhibition"]',
  'free',
  '入場無料',
  '大阪天神盆栽講'
);

-- イベント12: 神戸ルミナリエ盆栽イルミネーション
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '神戸ルミナリエ盆栽イルミネーション',
  'hyogo-kobe-luminarie-bonsai-2024-12',
  '2024-12-06',
  '2024-12-15',
  '兵庫県',
  '東遊園地',
  '兵庫県神戸市中央区加納町',
  'ルミナリエ期間限定の特別企画。盆栽にイルミネーションを施した幻想的な展示。光と影で表現する盆栽の新しい美しさを提案。',
  '["exhibition"]',
  'free',
  '入場無料',
  '神戸光の盆栽会'
);

-- ==================== 中国・四国地方 ====================

-- イベント13: 岡山後楽園冬の盆栽茶会
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '岡山後楽園冬の盆栽茶会',
  'okayama-korakuen-winter-chakai-2024-12',
  '2024-12-08',
  '2024-12-08',
  '岡山県',
  '岡山後楽園',
  '岡山県岡山市北区後楽園',
  '日本三名園での冬の特別茶会。茶室に飾られた冬の盆栽を愛でながら、心温まるひとときを過ごす。年末の心の整理にも最適な催し。',
  '["exhibition","lecture"]',
  'paid',
  '参加費：5000円（茶菓子・抹茶・入園料込み）',
  '岡山茶道盆栽会'
);

-- イベント14: 広島原爆ドーム平和の盆栽展
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '広島原爆ドーム平和の盆栽展',
  'hiroshima-peace-dome-2024-12',
  '2024-12-06',
  '2024-12-08',
  '広島県',
  '広島平和記念公園',
  '広島県広島市中区中島町',
  '年末に平和への祈りを込めた特別展示。被爆樹木から育てられた盆栽も展示し、平和の尊さと命の大切さを盆栽を通じて伝える。',
  '["exhibition"]',
  'free',
  '入場無料',
  '広島平和盆栽会'
);

-- イベント15: 高松栗林公園松盆栽名品展
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '高松栗林公園松盆栽名品展',
  'kagawa-ritsurin-matsu-meihin-2024-12',
  '2024-12-15',
  '2024-12-25',
  '香川県',
  '栗林公園',
  '香川県高松市栗林町',
  '松盆栽の産地香川での年末恒例名品展。特別名勝の庭園で県内の松盆栽名品を一堂に展示。正月飾りとしての松盆栽の魅力も紹介。',
  '["exhibition","sale"]',
  'paid',
  '栗林公園入園料（大人410円）',
  '香川県松盆栽組合'
);

-- ==================== 九州地方 ====================

-- イベント16: 福岡太宰府天満宮合格祈願盆栽市
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '福岡太宰府天満宮合格祈願盆栽市',
  'fukuoka-dazaifu-gokaku-2024-12',
  '2024-12-25',
  '2025-01-03',
  '福岡県',
  '太宰府天満宮',
  '福岡県太宰府市宰府',
  '学問の神様への年末年始参拝に合わせた盆栽市。合格祈願の縁起物盆栽、梅の盆栽（菅原道真ゆかり）を中心に販売。受験生への贈り物にも。',
  '["sale","exhibition"]',
  'free',
  '入場無料',
  '太宰府盆栽講'
);

-- イベント17: 熊本城復興記念年末盆栽展
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '熊本城復興記念年末盆栽展',
  'kumamoto-castle-fukko-2024-12',
  '2024-12-14',
  '2024-12-23',
  '熊本県',
  '熊本城二の丸広場',
  '熊本県熊本市中央区本丸',
  '復興が進む熊本城での年末特別展。復興への願いを込めた盆栽展示。熊本地震からの復興と希望をテーマにした感動的な展示構成。',
  '["exhibition"]',
  'paid',
  '熊本城入城料（大人800円）',
  '熊本復興盆栽会'
);

-- イベント18: 鹿児島桜島年越し盆栽祭
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '鹿児島桜島年越し盆栽祭',
  'kagoshima-sakurajima-toshikoshi-2024-12',
  '2024-12-31',
  '2025-01-01',
  '鹿児島県',
  '桜島フェリーターミナル',
  '鹿児島県鹿児島市桜島横山町',
  '雄大な桜島を背景に年越しを迎える盆栽祭。除夜の鐘とともに新年を迎える特別イベント。南国の温暖な気候を活かした盆栽も展示。',
  '["exhibition","sale"]',
  'free',
  '入場無料',
  '鹿児島年越し盆栽会'
);

-- ==================== 特別イベント ====================

-- イベント19: 全国オンライン年末盆栽総決算セミナー
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '全国オンライン年末盆栽総決算セミナー',
  'online-nenmatsu-soukessan-2024-12',
  '2024-12-22',
  '2024-12-22',
  '東京都',
  'オンライン開催',
  'Zoom・YouTube Liveによる配信',
  '1年の盆栽管理を振り返る総決算セミナー。今年の成功と失敗の分析、来年の管理計画立案、冬越しの注意点を解説。録画視聴可能。',
  '["lecture"]',
  'paid',
  '受講料：2500円',
  '日本盆栽協会'
);

-- イベント20: 親子で作るお正月盆栽教室
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '親子で作るお正月盆栽教室',
  'tokyo-family-newyear-workshop-2024-12',
  '2024-12-28',
  '2024-12-28',
  '東京都',
  '大宮盆栽美術館',
  '埼玉県さいたま市北区土呂町',
  '年末恒例の親子向けワークショップ。松竹梅を使った簡単なお正月飾り盆栽作り。家族で新年を迎える準備を盆栽作りを通じて楽しむ。',
  '["workshop"]',
  'paid',
  '参加費：親子ペア4000円（材料費込み）',
  '大宮盆栽美術館'
);

-- イベント21: 国際年末盆栽コンペティション
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '第1回国際年末盆栽コンペティション',
  'international-nenmatsu-competition-2024-12',
  '2024-12-15',
  '2024-12-17',
  '東京都',
  '東京国際フォーラム',
  '東京都千代田区丸の内',
  '年末を飾る国際盆栽コンペティション。世界各国から年間最優秀作品が集結。1年の盆栽界の成果を総括する権威ある大会。',
  '["exhibition","lecture"]',
  'paid',
  '入場料：大人2500円、学生1200円',
  '国際盆栽年末協会'
);

-- イベント22: 年末盆栽大感謝祭
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '年末盆栽大感謝祭2024',
  'nenmatsu-bonsai-kansha-matsuri-2024-12',
  '2024-12-29',
  '2024-12-30',
  '東京都',
  '東京流通センター',
  '東京都大田区平和島',
  '1年の感謝を込めた年末最大のイベント。特価即売会、福袋販売、抽選会、来年の運勢占いなど盛りだくさん。盆栽界の年末恒例大祭。',
  '["sale","exhibition","workshop"]',
  'paid',
  '入場料：大人300円',
  '全国盆栽商工組合'
);

-- ==========================================================
-- 追加イベント数: 22件
-- 対象地域: 全国（北海道から九州まで）
-- 特色: 年末・正月・冬季・感謝をテーマとした季節性重視
-- イベントタイプ: exhibition, sale, workshop, lecture
-- ==========================================================