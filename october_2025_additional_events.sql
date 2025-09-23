-- =========================================================
-- 2025年10月 盆栽イベント追加データ（全国版）
-- EVENT_DATA_MANAGEMENT.mdの形式に準拠
-- =========================================================

-- ==================== 北海道・東北地方 ====================

-- イベント1: 札幌秋の盆栽展
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '札幌秋の盆栽展',
  'hokkaido-sapporo-autumn-bonsai-2025-10',
  '2025-10-10',
  '2025-10-12',
  '北海道',
  '札幌市民ホール',
  '北海道札幌市中央区北1条西',
  '北海道最大級の秋の盆栽展。道内の愛好家による約100点の作品を展示。紅葉の美しい作品を中心に、北海道ならではの樹種も紹介。',
  '["exhibition"]',
  'free',
  '入場無料',
  '北海道盆栽会'
);

-- イベント2: 仙台盆栽・水石展
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '第42回仙台盆栽・水石展',
  'miyagi-sendai-bonsai-suiseki-2025-10',
  '2025-10-17',
  '2025-10-19',
  '宮城県',
  '仙台市博物館',
  '宮城県仙台市青葉区川内',
  '東北地方を代表する盆栽と水石の合同展示会。伝統的な松柏類から花物まで約150点を展示。10時～17時開催。',
  '["exhibition"]',
  'paid',
  '入場料：大人500円、学生300円',
  '仙台盆栽水石会'
);

-- ==================== 関東地方（追加分） ====================

-- イベント3: 東京盆栽大市
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '東京盆栽大市2025秋',
  'tokyo-bonsai-daishi-autumn-2025-10',
  '2025-10-25',
  '2025-10-26',
  '東京都',
  '東京流通センター',
  '東京都大田区平和島',
  '年2回開催される関東最大級の盆栽即売会。全国から約50店舗が出店し、初心者向けから高級品まで幅広く販売。同時にワークショップも開催。',
  '["sale","workshop"]',
  'free',
  '入場無料（ワークショップは有料）',
  '東京盆栽組合'
);

-- イベント4: 川口安行植木まつり
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '川口安行植木まつり2025',
  'saitama-kawaguchi-ueki-matsuri-2025-10',
  '2025-10-11',
  '2025-10-13',
  '埼玉県',
  '川口緑化センター樹里安',
  '埼玉県川口市安行領家',
  '植木の街・安行の伝統的な植木まつり。盆栽即売会に加え、盆栽相談コーナー、実演販売など充実したイベント。',
  '["sale","exhibition"]',
  'free',
  '入場無料',
  '川口市・安行植木生産組合'
);

-- ==================== 中部地方 ====================

-- イベント5: 名古屋城秋の盆栽展
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '名古屋城秋の盆栽展',
  'aichi-nagoya-castle-autumn-2025-10',
  '2025-10-18',
  '2025-10-20',
  '愛知県',
  '名古屋城本丸御殿',
  '愛知県名古屋市中区本丸',
  '名古屋城を背景に開催される秋の盆栽展。東海地方の名品約80点を展示。城内の日本庭園とのコラボレーション展示も実施。',
  '["exhibition"]',
  'paid',
  '名古屋城入場料に含む（大人500円）',
  '名古屋盆栽会'
);

-- イベント6: 金沢盆栽秋季展示会
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '金沢盆栽秋季展示会',
  'ishikawa-kanazawa-autumn-2025-10',
  '2025-10-24',
  '2025-10-26',
  '石川県',
  '金沢21世紀美術館',
  '石川県金沢市広坂',
  '伝統と現代が融合する金沢での盆栽展。加賀の伝統的な盆栽文化を紹介しつつ、若手作家の作品も展示。',
  '["exhibition"]',
  'paid',
  '入場料：大人1000円、高校生以下無料',
  '金沢盆栽協会'
);

-- ==================== 関西地方 ====================

-- イベント7: 京都府立植物園盆栽展
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '京都府立植物園秋の盆栽展',
  'kyoto-botanical-garden-autumn-2025-10',
  '2025-10-10',
  '2025-10-14',
  '京都府',
  '京都府立植物園',
  '京都府京都市左京区下鴨半木町',
  '植物園の美しい紅葉を背景に開催される盆栽展。もみじを中心とした秋の風情あふれる作品約100点を展示。',
  '["exhibition"]',
  'paid',
  '植物園入園料（大人200円）',
  '京都盆栽会'
);

-- イベント8: 大阪盆栽フェスティバル
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '大阪盆栽フェスティバル2025',
  'osaka-bonsai-festival-2025-10',
  '2025-10-19',
  '2025-10-20',
  '大阪府',
  'インテックス大阪',
  '大阪府大阪市住之江区南港北',
  '西日本最大級の盆栽イベント。展示会、即売会、ワークショップ、講演会など多彩なプログラム。海外からの出展も。',
  '["exhibition","sale","workshop","lecture"]',
  'paid',
  '入場料：前売1500円、当日2000円',
  '大阪盆栽協会'
);

-- イベント9: 神戸盆栽と庭園の美展
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '神戸盆栽と庭園の美展',
  'hyogo-kobe-garden-beauty-2025-10',
  '2025-10-11',
  '2025-10-13',
  '兵庫県',
  '相楽園',
  '兵庫県神戸市中央区中山手通',
  '日本庭園相楽園での特別展示。庭園の景観と調和した盆栽展示で、空間全体を楽しめる演出。',
  '["exhibition"]',
  'paid',
  '入園料：大人300円、小中学生150円',
  '神戸盆栽愛好会'
);

-- ==================== 中国・四国地方 ====================

-- イベント10: 岡山後楽園盆栽展
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '岡山後楽園秋の盆栽展',
  'okayama-korakuen-autumn-2025-10',
  '2025-10-03',
  '2025-10-05',
  '岡山県',
  '岡山後楽園',
  '岡山県岡山市北区後楽園',
  '日本三名園の一つ後楽園で開催される盆栽展。園内の美しい景観と盆栽のコラボレーション。',
  '["exhibition"]',
  'paid',
  '後楽園入園料（大人410円）',
  '岡山盆栽会'
);

-- イベント11: 広島盆栽秋季大会
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '第38回広島盆栽秋季大会',
  'hiroshima-autumn-taikai-2025-10',
  '2025-10-25',
  '2025-10-27',
  '広島県',
  '広島県立総合体育館',
  '広島県広島市中区基町',
  '中国地方最大の盆栽イベント。展示会、即売会、デモンストレーションなど3日間の充実プログラム。',
  '["exhibition","sale","lecture"]',
  'paid',
  '入場料：大人800円、高校生以下無料',
  '広島県盆栽協会'
);

-- イベント12: 高松盆栽まつり
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '高松盆栽まつり2025',
  'kagawa-takamatsu-matsuri-2025-10',
  '2025-10-18',
  '2025-10-19',
  '香川県',
  '栗林公園',
  '香川県高松市栗林町',
  '特別名勝栗林公園で開催される盆栽まつり。松盆栽の産地として有名な香川の名品を展示即売。',
  '["exhibition","sale"]',
  'paid',
  '栗林公園入園料（大人410円）',
  '香川県松盆栽生産振興協議会'
);

-- ==================== 九州地方 ====================

-- イベント13: 福岡盆栽大観展
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '第50回福岡盆栽大観展',
  'fukuoka-taikan-2025-10',
  '2025-10-10',
  '2025-10-12',
  '福岡県',
  '福岡市美術館',
  '福岡県福岡市中央区大濠公園',
  '九州最大級の盆栽展。50回記念として特別展示も実施。九州各県から選りすぐりの名品約200点を展示。',
  '["exhibition"]',
  'paid',
  '入場料：大人1000円、学生500円',
  '福岡盆栽会'
);

-- イベント14: 熊本城盆栽と菊花展
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '熊本城盆栽と菊花展',
  'kumamoto-castle-bonsai-kiku-2025-10',
  '2025-10-20',
  '2025-10-26',
  '熊本県',
  '熊本城二の丸広場',
  '熊本県熊本市中央区本丸',
  '復興が進む熊本城を会場に、盆栽と菊花の合同展示。熊本の伝統文化を紹介する秋の風物詩。',
  '["exhibition"]',
  'free',
  '入場無料（熊本城入城は有料）',
  '熊本盆栽菊花会'
);

-- イベント15: 鹿児島盆栽秋の市
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '鹿児島盆栽秋の市',
  'kagoshima-autumn-market-2025-10',
  '2025-10-11',
  '2025-10-12',
  '鹿児島県',
  '鹿児島県民交流センター',
  '鹿児島県鹿児島市山下町',
  '南九州の盆栽文化を紹介する秋の即売会。亜熱帯性の珍しい樹種も多数出品。初心者向け講習会も同時開催。',
  '["sale","workshop"]',
  'free',
  '入場無料（講習会は有料）',
  '鹿児島盆栽協会'
);

-- ==================== 特別イベント ====================

-- イベント16: オンライン盆栽講座（10月）
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  'オンライン盆栽講座「秋の管理と紅葉を楽しむ」',
  'online-autumn-care-course-2025-10',
  '2025-10-05',
  '2025-10-05',
  '東京都',
  'オンライン開催',
  'Zoomによるオンライン講座',
  '秋の盆栽管理のポイントと美しい紅葉を楽しむコツを学ぶオンライン講座。全国どこからでも参加可能。録画配信あり。',
  '["lecture","workshop"]',
  'paid',
  '受講料：3000円',
  '日本盆栽協会'
);

-- イベント17: 子ども盆栽体験教室
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '秋休み子ども盆栽体験教室',
  'tokyo-kids-workshop-2025-10',
  '2025-10-14',
  '2025-10-14',
  '東京都',
  '大宮盆栽美術館',
  '埼玉県さいたま市北区土呂町',
  '小学生を対象とした盆栽体験教室。ミニ盆栽作りを通じて日本文化を学ぶ。作った盆栽は持ち帰り可能。',
  '["workshop"]',
  'paid',
  '参加費：1500円（材料費込み）',
  '大宮盆栽美術館'
);

-- ==========================================================
-- 追加イベント数: 17件
-- 対象地域: 全国（北海道から九州まで）
-- イベントタイプ: exhibition, sale, workshop, lecture
-- ==========================================================