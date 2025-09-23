-- =========================================================
-- 2024年11月 盆栽イベント追加データ（晩秋・紅葉版）
-- 紅葉狩り・晩秋の美・冬支度・感謝シーズン
-- EVENT_DATA_MANAGEMENT.mdの形式に準拠
-- =========================================================

-- ==================== 北海道・東北地方 ====================

-- イベント1: 札幌初雪と盆栽展
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '札幌初雪と盆栽展2024',
  'hokkaido-sapporo-hatsuyuki-2024-11',
  '2024-11-23',
  '2024-11-24',
  '北海道',
  '札幌市民文化センター',
  '北海道札幌市中央区北1条西',
  '北海道の初雪シーズンに合わせた盆栽展。雪に映える針葉樹盆栽と、厳しい冬に向けた管理準備を紹介。雪囲い実演も開催。',
  '["exhibition","workshop"]',
  'paid',
  '入場料：大人600円、学生300円',
  '札幌冬支度盆栽会'
);

-- イベント2: 弘前城菊と紅葉盆栽まつり
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '弘前城菊と紅葉盆栽まつり',
  'aomori-hirosaki-kiku-kouyou-2024-11',
  '2024-11-01',
  '2024-11-10',
  '青森県',
  '弘前公園',
  '青森県弘前市下白銀町',
  '弘前城の紅葉と菊まつりに合わせた盆栽展。もみじ盆栽の美しい紅葉と菊盆栽のコラボレーション。津軽の秋の風情を満喫。',
  '["exhibition"]',
  'paid',
  '弘前公園入園料（大人320円）',
  '津軽盆栽菊花会'
);

-- イベント3: 仙台紅葉盆栽大展示会
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '仙台紅葉盆栽大展示会',
  'miyagi-sendai-kouyou-taiten-2024-11',
  '2024-11-16',
  '2024-11-18',
  '宮城県',
  '仙台国際センター',
  '宮城県仙台市青葉区青葉山',
  '東北地方最大の紅葉盆栽展。もみじ、けやき、ブナなど東北の代表的な紅葉樹の盆栽約200点を展示。紅葉管理セミナーも同時開催。',
  '["exhibition","lecture"]',
  'paid',
  '入場料：大人800円、高校生以下無料',
  '東北紅葉盆栽連合会'
);

-- ==================== 関東地方 ====================

-- イベント4: 大宮盆栽村秋季感謝祭
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '大宮盆栽村秋季感謝祭2024',
  'saitama-omiya-aki-kansha-2024-11',
  '2024-11-02',
  '2024-11-04',
  '埼玉県',
  '大宮盆栽村',
  '埼玉県さいたま市北区盆栽町',
  '盆栽の聖地での秋の大感謝祭。村内全店舗が参加する特別価格即売会。紅葉盛りの盆栽展示と冬支度講習会も開催。3日間の盛大なイベント。',
  '["sale","exhibition","lecture"]',
  'free',
  '入場無料',
  '大宮盆栽協同組合'
);

-- イベント5: 東京神宮外苑銀杏並木盆栽展
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '東京神宮外苑銀杏並木盆栽展',
  'tokyo-jingu-gaien-icho-2024-11',
  '2024-11-15',
  '2024-11-30',
  '東京都',
  '明治神宮外苑',
  '東京都新宿区霞ヶ丘町',
  '有名な銀杏並木の黄葉シーズンに合わせた特別展示。銀杏盆栽を中心とした黄葉の美しさを楽しむ展示会。都心の秋を満喫できる。',
  '["exhibition"]',
  'free',
  '入場無料',
  '東京銀杏盆栽愛好会'
);

-- イベント6: 横浜山下公園紅葉盆栽フェスティバル
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '横浜山下公園紅葉盆栽フェスティバル',
  'kanagawa-yokohama-yamashita-kouyou-2024-11',
  '2024-11-23',
  '2024-11-24',
  '神奈川県',
  '山下公園',
  '神奈川県横浜市中区山下町',
  '海を望む山下公園での紅葉盆栽フェスティバル。港町横浜の秋の風情と盆栽の調和。マリンタワーをバックにした撮影スポットも人気。',
  '["exhibition","sale"]',
  'paid',
  '入場料：大人500円',
  '横浜港湾盆栽会'
);

-- イベント7: 千葉成田山紅葉盆栽奉納展
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '千葉成田山紅葉盆栽奉納展',
  'chiba-naritasan-kouyou-hounou-2024-11',
  '2024-11-16',
  '2024-11-24',
  '千葉県',
  '成田山新勝寺',
  '千葉県成田市成田',
  '成田山の紅葉シーズンに合わせた盆栽奉納展。境内の美しい紅葉と盆栽の調和で、心静かに秋を感じる特別な体験。護摩祈祷との組み合わせも。',
  '["exhibition"]',
  'free',
  '入場無料（護摩祈祷は別料金）',
  '成田山盆栽講'
);

-- ==================== 中部地方 ====================

-- イベント8: 富士山麓河口湖紅葉盆栽展
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '富士山麓河口湖紅葉盆栽展',
  'yamanashi-kawaguchi-kouyou-2024-11',
  '2024-11-01',
  '2024-11-23',
  '山梨県',
  '河口湖畔',
  '山梨県南都留郡富士河口湖町',
  '富士山と河口湖の紅葉をバックにした絶景盆栽展。もみじ回廊の紅葉時期に合わせて開催。富士山の雄大さと盆栽の繊細美の対比が見どころ。',
  '["exhibition"]',
  'paid',
  '入場料：大人700円、中高生350円',
  '富士五湖盆栽会'
);

-- イベント9: 名古屋東山植物園もみじ狩り盆栽展
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '名古屋東山植物園もみじ狩り盆栽展',
  'aichi-higashiyama-momijigari-2024-11',
  '2024-11-16',
  '2024-11-30',
  '愛知県',
  '東山植物園',
  '愛知県名古屋市千種区東山元町',
  '東海地方有数の紅葉スポットでの盆栽展。植物園の約500本のもみじと盆栽のもみじの比較展示。夜間ライトアップ期間中の特別展示も実施。',
  '["exhibition"]',
  'paid',
  '植物園入園料（大人500円）',
  '東海もみじ盆栽会'
);

-- イベント10: 金沢兼六園雪吊り準備盆栽実演会
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '金沢兼六園雪吊り準備盆栽実演会',
  'ishikawa-kenrokuen-yukitsuri-junbi-2024-11',
  '2024-11-01',
  '2024-11-30',
  '石川県',
  '兼六園内',
  '石川県金沢市兼六町',
  '雪吊り作業が始まる兼六園での特別実演会。庭園の雪吊りと盆栽の雪吊りの技術比較。加賀の伝統技術を盆栽で学ぶ貴重な機会。',
  '["workshop","exhibition"]',
  'paid',
  '兼六園入園料（大人320円）+ 実演参加費500円',
  '金沢雪吊り技術保存会'
);

-- ==================== 関西地方 ====================

-- イベント11: 京都嵐山竹林と盆栽の調和展
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '京都嵐山竹林と盆栽の調和展',
  'kyoto-arashiyama-chikurin-2024-11',
  '2024-11-20',
  '2024-11-30',
  '京都府',
  '嵐山竹林の道',
  '京都府京都市右京区嵯峨天龍寺',
  '嵐山の竹林の道での特別展示。竹盆栽と竹林の自然美の対比。晩秋の京都の風情と盆栽の静寂美を同時に楽しめる贅沢な体験。',
  '["exhibition"]',
  'free',
  '入場無料',
  '京都竹盆栽保存会'
);

-- イベント12: 大阪大阪城公園銀杏盆栽祭
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '大阪大阪城公園銀杏盆栽祭',
  'osaka-osakacastle-icho-matsuri-2024-11',
  '2024-11-10',
  '2024-11-20',
  '大阪府',
  '大阪城公園',
  '大阪府大阪市中央区大阪城',
  '大阪城の銀杏並木の黄葉に合わせた盆栽祭。天守閣をバックにした銀杏盆栽の展示。関西の秋を代表する風景と盆栽の美の融合。',
  '["exhibition","sale"]',
  'paid',
  '入場料：大人600円、中高生300円',
  '大阪城銀杏盆栽会'
);

-- イベント13: 神戸六甲山紅葉盆栽展望会
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '神戸六甲山紅葉盆栽展望会',
  'hyogo-rokko-kouyou-tenbou-2024-11',
  '2024-11-02',
  '2024-11-17',
  '兵庫県',
  '六甲山上',
  '兵庫県神戸市灘区六甲山町',
  '六甲山の山頂から関西平野を一望しながらの盆栽展。標高の高い場所での紅葉と盆栽の展示。神戸の夜景と盆栽のライトアップも魅力。',
  '["exhibition"]',
  'paid',
  '六甲山入山料（大人1000円）',
  '六甲山盆栽愛好会'
);

-- ==================== 中国・四国地方 ====================

-- イベント14: 岡山後楽園晩秋盆栽茶会
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '岡山後楽園晩秋盆栽茶会',
  'okayama-korakuen-banshuu-chakai-2024-11',
  '2024-11-23',
  '2024-11-23',
  '岡山県',
  '岡山後楽園',
  '岡山県岡山市北区後楽園',
  '日本三名園での晩秋の特別茶会。園内の紅葉を愛でながら、秋の盆栽とお茶を楽しむ風流な催し。勤労感謝の日の特別企画。',
  '["exhibition","lecture"]',
  'paid',
  '参加費：4500円（茶菓子・抹茶・入園料込み）',
  '岡山後楽園茶道盆栽会'
);

-- イベント15: 広島宮島紅葉盆栽奉納祭
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '広島宮島紅葉盆栽奉納祭',
  'hiroshima-miyajima-kouyou-hounou-2024-11',
  '2024-11-15',
  '2024-11-25',
  '広島県',
  '厳島神社',
  '広島県廿日市市宮島町',
  '世界遺産厳島神社での紅葉盆栽奉納祭。海に浮かぶ鳥居と紅葉の盆栽の神秘的な組み合わせ。潮の満ち引きと共に変わる景色と盆栽美。',
  '["exhibition"]',
  'paid',
  '厳島神社昇殿料（大人300円）',
  '宮島盆栽奉納会'
);

-- イベント16: 高松栗林公園秋の茶室盆栽展
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '高松栗林公園秋の茶室盆栽展',
  'kagawa-ritsurin-aki-chashitsu-2024-11',
  '2024-11-10',
  '2024-11-20',
  '香川県',
  '栗林公園',
  '香川県高松市栗林町',
  '特別名勝栗林公園の茶室での秋の盆栽展。日本庭園の美と茶室に飾られた盆栽の調和。讃岐の秋の風情を茶の心で味わう特別な体験。',
  '["exhibition","lecture"]',
  'paid',
  '栗林公園入園料（大人410円）+ 茶室利用料500円',
  '讃岐茶道盆栽会'
);

-- ==================== 九州地方 ====================

-- イベント17: 福岡太宰府天満宮菊花盆栽展
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '福岡太宰府天満宮菊花盆栽展',
  'fukuoka-dazaifu-kikka-2024-11',
  '2024-11-01',
  '2024-11-25',
  '福岡県',
  '太宰府天満宮',
  '福岡県太宰府市宰府',
  '学問の神様への感謝を込めた菊花盆栽展。菅原道真公ゆかりの菊と梅の盆栽展示。受験シーズンを前にした合格祈願の特別企画も。',
  '["exhibition","sale"]',
  'free',
  '入場無料',
  '太宰府菊花盆栽講'
);

-- イベント18: 熊本水前寺成趣園晩秋盆栽展
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '熊本水前寺成趣園晩秋盆栽展',
  'kumamoto-suizenji-banshuu-2024-11',
  '2024-11-16',
  '2024-11-24',
  '熊本県',
  '水前寺成趣園',
  '熊本県熊本市中央区水前寺公園',
  '桃山式回遊庭園での晩秋盆栽展。池に映る紅葉と盆栽の美しいリフレクション。熊本の復興と感謝をテーマにした心温まる展示。',
  '["exhibition"]',
  'paid',
  '成趣園入園料（大人400円）',
  '熊本晩秋盆栽会'
);

-- イベント19: 鹿児島桜島晩秋盆栽市
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '鹿児島桜島晩秋盆栽市',
  'kagoshima-sakurajima-banshuu-ichi-2024-11',
  '2024-11-23',
  '2024-11-24',
  '鹿児島県',
  '桜島フェリーターミナル',
  '鹿児島県鹿児島市桜島横山町',
  '活火山桜島を背景にした晩秋の盆栽市。南国鹿児島でも味わえる秋の情緒と、火山灰土を使った特製盆栽用土の紹介も。',
  '["sale","exhibition"]',
  'free',
  '入場無料',
  '桜島晩秋盆栽会'
);

-- ==================== 特別イベント ====================

-- イベント20: 全国オンライン紅葉盆栽鑑賞会
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '全国オンライン紅葉盆栽鑑賞会',
  'online-kouyou-kanshou-2024-11',
  '2024-11-17',
  '2024-11-17',
  '東京都',
  'オンライン開催',
  'Zoom・YouTube Liveによる配信',
  '全国の紅葉盆栽をオンラインで鑑賞する特別企画。各地の愛好家が自慢の紅葉盆栽を生配信で紹介。紅葉管理のコツも学べる。',
  '["exhibition","lecture"]',
  'paid',
  '参加費：1500円',
  '日本オンライン盆栽協会'
);

-- イベント21: 勤労感謝の日親子盆栽感謝祭
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '勤労感謝の日親子盆栽感謝祭',
  'tokyo-kinrou-kansha-oyako-2024-11',
  '2024-11-23',
  '2024-11-23',
  '東京都',
  '大宮盆栽美術館',
  '埼玉県さいたま市北区土呂町',
  '勤労感謝の日に家族の絆を深める親子向けイベント。感謝の気持ちを込めた小さな盆栽作り。働く人への感謝と自然への感謝を学ぶ。',
  '["workshop"]',
  'paid',
  '参加費：親子ペア2500円（材料費込み）',
  '大宮盆栽美術館'
);

-- イベント22: 国際晩秋盆栽写真コンテスト
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '第1回国際晩秋盆栽写真コンテスト',
  'international-banshuu-photo-contest-2024-11',
  '2024-11-01',
  '2024-11-30',
  '東京都',
  'オンライン・東京国際フォーラム',
  '東京都千代田区丸の内',
  '世界中から晩秋の盆栽写真を募集するコンテスト。紅葉、実物、冬支度など晩秋テーマの作品を募集。優秀作品の展示会も開催。',
  '["exhibition","lecture"]',
  'free',
  '応募・鑑賞無料',
  '国際盆栽写真協会'
);

-- ==========================================================
-- 追加イベント数: 22件
-- 対象地域: 全国（北海道から九州まで）
-- 特色: 晩秋・紅葉・感謝・冬支度をテーマとした季節性重視
-- イベントタイプ: exhibition, sale, workshop, lecture
-- ==========================================================