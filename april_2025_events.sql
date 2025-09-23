-- =========================================================
-- 2025年4月 盆栽イベント追加データ（春の最盛期版）
-- 植え替え・新緑・桜シーズンの特別イベント
-- EVENT_DATA_MANAGEMENT.mdの形式に準拠
-- =========================================================

-- ==================== 北海道・東北地方 ====================

-- イベント1: 札幌春の盆栽フェア
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '札幌春の盆栽フェア2025',
  'hokkaido-sapporo-spring-fair-2025-04',
  '2025-04-19',
  '2025-04-21',
  '北海道',
  'アクセスサッポロ',
  '北海道札幌市白石区流通センター',
  '北海道の遅い春を祝う盆栽フェア。植え替えデモンストレーション、新緑の美しい作品展示、春の管理セミナーを開催。',
  '["exhibition","workshop","sale"]',
  'paid',
  '入場料：大人800円、学生400円',
  '北海道盆栽愛好会'
);

-- イベント2: 青森桜と盆栽まつり
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '青森桜と盆栽まつり',
  'aomori-sakura-bonsai-matsuri-2025-04',
  '2025-04-26',
  '2025-04-29',
  '青森県',
  '弘前公園',
  '青森県弘前市下白銀町',
  '桜の名所弘前公園で開催される春の特別企画。桜盆栽の展示と弘前の桜とのコラボレーション。桜の植え替え実演も。',
  '["exhibition","workshop"]',
  'paid',
  '弘前公園入園料（大人320円）',
  '青森県盆栽協会'
);

-- イベント3: 仙台新緑盆栽展
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '仙台新緑盆栽展',
  'miyagi-sendai-shinryoku-2025-04',
  '2025-04-12',
  '2025-04-14',
  '宮城県',
  '仙台市民文化センター',
  '宮城県仙台市青葉区春日町',
  '東北の春を代表する新緑盆栽展。もみじ、けやきなど新緑の美しい作品約120点を展示。春の植え替え相談コーナーも設置。',
  '["exhibition","lecture"]',
  'paid',
  '入場料：大人600円、高校生以下無料',
  '仙台盆栽会'
);

-- ==================== 関東地方 ====================

-- イベント4: 大宮盆栽春まつり
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '大宮盆栽春まつり2025',
  'saitama-omiya-haru-matsuri-2025-04',
  '2025-04-05',
  '2025-04-06',
  '埼玉県',
  '大宮盆栽村',
  '埼玉県さいたま市北区盆栽町',
  '盆栽の聖地大宮での春の一大イベント。村内全体で展示・即売会を開催。春の植え替え講習会、盆栽教室も同時開催。',
  '["exhibition","sale","workshop","lecture"]',
  'free',
  '入場無料（一部有料プログラムあり）',
  '大宮盆栽協同組合'
);

-- イベント5: 東京桜盆栽大展示会
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '東京桜盆栽大展示会',
  'tokyo-sakura-bonsai-exhibition-2025-04',
  '2025-04-03',
  '2025-04-10',
  '東京都',
  '上野恩賜公園',
  '東京都台東区上野公園',
  '桜の名所上野公園で開催される桜盆栽の特別展示会。満開の桜をバックに約100点の桜盆栽を展示。夜桜ライトアップも実施。',
  '["exhibition"]',
  'free',
  '入場無料',
  '東京桜盆栽愛好会'
);

-- イベント6: 横浜春の植え替えフェスティバル
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '横浜春の植え替えフェスティバル',
  'kanagawa-yokohama-uekae-festival-2025-04',
  '2025-04-19',
  '2025-04-20',
  '神奈川県',
  '横浜赤レンガ倉庫',
  '神奈川県横浜市中区新港',
  '春の植え替えシーズンに特化したイベント。植え替え用土・鉢の即売会、プロによる植え替え実演、初心者向け講習会を開催。',
  '["sale","workshop","lecture"]',
  'paid',
  '入場料：大人500円',
  '神奈川県盆栽連合会'
);

-- イベント7: 千葉新緑と花の盆栽展
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '千葉新緑と花の盆栽展',
  'chiba-shinryoku-hana-2025-04',
  '2025-04-26',
  '2025-04-29',
  '千葉県',
  '千葉ポートパーク',
  '千葉県千葉市中央区中央港',
  '春の花物盆栽と新緑を楽しむ展示会。つつじ、藤、桜など春の花物盆栽を中心に展示。海をバックにした野外展示も魅力。',
  '["exhibition","sale"]',
  'paid',
  '入場料：大人400円、小中学生200円',
  '千葉盆栽会'
);

-- ==================== 中部地方 ====================

-- イベント8: 富士山麓春の盆栽市
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '富士山麓春の盆栽市',
  'shizuoka-fujisan-spring-market-2025-04',
  '2025-04-12',
  '2025-04-13',
  '静岡県',
  '富士市民文化会館',
  '静岡県富士市蓼原町',
  '富士山を望む会場での春の盆栽市。地元富士山の溶岩を使った盆栽鉢の販売も。春の山野草と盆栽のコラボレーション展示。',
  '["sale","exhibition"]',
  'free',
  '入場無料',
  '富士盆栽会'
);

-- イベント9: 名古屋城春爛漫盆栽展
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '名古屋城春爛漫盆栽展',
  'aichi-nagoya-castle-spring-2025-04',
  '2025-04-05',
  '2025-04-13',
  '愛知県',
  '名古屋城本丸御殿',
  '愛知県名古屋市中区本丸',
  '名古屋城の桜と共に楽しむ春の盆栽展。城内の桜の開花に合わせて開催。桜盆栽、花物盆栽を中心とした約150点を展示。',
  '["exhibition"]',
  'paid',
  '名古屋城入場料（大人500円）',
  '愛知県盆栽協会'
);

-- イベント10: 金沢兼六園春の盆栽展
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '金沢兼六園春の盆栽展',
  'ishikawa-kenrokuen-spring-2025-04',
  '2025-04-10',
  '2025-04-15',
  '石川県',
  '兼六園内',
  '石川県金沢市兼六町',
  '日本三名園兼六園での特別展示。園内の桜と盆栽のコラボレーション。加賀の伝統的な盆栽文化と現代作品の融合を展示。',
  '["exhibition"]',
  'paid',
  '兼六園入園料（大人320円）',
  '石川県盆栽協会'
);

-- ==================== 関西地方 ====================

-- イベント11: 京都桜と盆栽の競演
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '京都桜と盆栽の競演',
  'kyoto-sakura-bonsai-kyoen-2025-04',
  '2025-04-05',
  '2025-04-14',
  '京都府',
  '京都府立植物園',
  '京都府京都市左京区下鴨半木町',
  '京都の桜の名所で開催される春の特別企画。園内の満開の桜と桜盆栽の美の競演。夜間ライトアップ期間中は特別展示も実施。',
  '["exhibition"]',
  'paid',
  '植物園入園料（大人200円）',
  '京都盆栽協会'
);

-- イベント12: 大阪造幣局桜の通り抜け盆栽展
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '大阪造幣局桜の通り抜け盆栽展',
  'osaka-zoheikyoku-sakura-bonsai-2025-04',
  '2025-04-11',
  '2025-04-17',
  '大阪府',
  '造幣局構内',
  '大阪府大阪市北区天満',
  '桜の通り抜けと同時開催の特別盆栽展。八重桜の美しい時期に合わせて桜盆栽の名品を展示。造幣局の歴史ある建物との調和も見どころ。',
  '["exhibition"]',
  'free',
  '入場無料',
  '大阪桜盆栽会'
);

-- イベント13: 神戸布引ハーブ園春の盆栽フェア
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '神戸布引ハーブ園春の盆栽フェア',
  'hyogo-kobe-nunobiki-herb-2025-04',
  '2025-04-26',
  '2025-05-06',
  '兵庫県',
  '神戸布引ハーブ園',
  '兵庫県神戸市中央区北野町',
  'ハーブ園の新緑と盆栽のコラボレーション。ハーブと盆栽の寄せ植え体験、香りを楽しむ盆栽の紹介など、ユニークな企画満載。',
  '["exhibition","workshop"]',
  'paid',
  'ハーブ園入園料（大人1500円）',
  '神戸盆栽ハーブ愛好会'
);

-- ==================== 中国・四国地方 ====================

-- イベント14: 岡山後楽園花見盆栽展
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '岡山後楽園花見盆栽展',
  'okayama-korakuen-hanami-2025-04',
  '2025-04-05',
  '2025-04-13',
  '岡山県',
  '岡山後楽園',
  '岡山県岡山市北区後楽園',
  '日本三名園での花見盆栽展。園内の桜開花に合わせて春の花物盆栽を中心に展示。後楽園の美しい景観と盆栽の調和を楽しめる。',
  '["exhibition"]',
  'paid',
  '後楽園入園料（大人410円）',
  '岡山県盆栽協会'
);

-- イベント15: 広島平和公園春の盆栽展
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '広島平和公園春の盆栽展',
  'hiroshima-peace-park-spring-2025-04',
  '2025-04-06',
  '2025-04-08',
  '広島県',
  '広島平和記念公園',
  '広島県広島市中区中島町',
  '平和への願いを込めた春の盆栽展。桜の季節に合わせて平和をテーマにした展示構成。国際交流の一環として海外作品も展示。',
  '["exhibition"]',
  'free',
  '入場無料',
  '広島平和盆栽会'
);

-- イベント16: 高松栗林公園春の庭園盆栽展
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '高松栗林公園春の庭園盆栽展',
  'kagawa-ritsurin-spring-garden-2025-04',
  '2025-04-20',
  '2025-04-27',
  '香川県',
  '栗林公園',
  '香川県高松市栗林町',
  '特別名勝栗林公園での春の庭園盆栽展。園内の美しい庭園と盆栽の組み合わせで、庭園美学の極致を表現。松盆栽の展示も充実。',
  '["exhibition"]',
  'paid',
  '栗林公園入園料（大人410円）',
  '香川県庭園盆栽会'
);

-- ==================== 九州地方 ====================

-- イベント17: 福岡舞鶴公園桜盆栽祭
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '福岡舞鶴公園桜盆栽祭',
  'fukuoka-maizuru-sakura-matsuri-2025-04',
  '2025-04-01',
  '2025-04-10',
  '福岡県',
  '舞鶴公園',
  '福岡県福岡市中央区城内',
  '福岡城跡の桜の名所で開催される桜盆栽祭。九州の桜盆栽愛好家による名品約200点を展示。夜桜見物と盆栽鑑賞の両方を楽しめる。',
  '["exhibition","sale"]',
  'free',
  '入場無料',
  '福岡桜盆栽愛好会'
);

-- イベント18: 熊本水前寺成趣園春の盆栽展
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '熊本水前寺成趣園春の盆栽展',
  'kumamoto-suizenji-spring-2025-04',
  '2025-04-15',
  '2025-04-21',
  '熊本県',
  '水前寺成趣園',
  '熊本県熊本市中央区水前寺公園',
  '桃山式回遊庭園での春の盆栽展。庭園の美しい緑と盆栽の調和。熊本の復興を象徴する希望の盆栽展として開催。',
  '["exhibition"]',
  'paid',
  '成趣園入園料（大人400円）',
  '熊本庭園盆栽会'
);

-- イベント19: 鹿児島桜島と春の盆栽展
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '鹿児島桜島と春の盆栽展',
  'kagoshima-sakurajima-spring-2025-04',
  '2025-04-26',
  '2025-04-29',
  '鹿児島県',
  '桜島フェリーターミナル',
  '鹿児島県鹿児島市桜島横山町',
  '雄大な桜島を背景にした春の盆栽展。南国の春を代表する樹種と、桜島の火山灰を使った特製用土の紹介も。',
  '["exhibition","sale"]',
  'free',
  '入場無料',
  '鹿児島南国盆栽会'
);

-- ==================== 特別イベント ====================

-- イベント20: 全国盆栽植え替えオンライン講座
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '全国盆栽植え替えオンライン講座「春の植え替え完全マスター」',
  'online-uekae-master-course-2025-04',
  '2025-04-13',
  '2025-04-13',
  '東京都',
  'オンライン開催',
  'Zoom・YouTube Liveによる配信',
  '春の植え替えシーズンに特化したオンライン講座。土の選び方、根の処理方法、植え替え後の管理まで完全解説。録画視聴可能。',
  '["lecture","workshop"]',
  'paid',
  '受講料：4000円（教材費込み）',
  '日本盆栽協会'
);

-- イベント21: 親子で楽しむ春の盆栽教室
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '親子で楽しむ春の盆栽教室',
  'tokyo-family-spring-workshop-2025-04',
  '2025-04-29',
  '2025-04-29',
  '東京都',
  '大宮盆栽美術館',
  '埼玉県さいたま市北区土呂町',
  'ゴールデンウィーク特別企画。親子で小さな春の盆栽を作る体験教室。桜や新緑の若木を使った簡単な盆栽作りを楽しめる。',
  '["workshop"]',
  'paid',
  '参加費：親子ペア3000円（材料費込み）',
  '大宮盆栽美術館'
);

-- イベント22: 国際桜盆栽コンペティション
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '第1回国際桜盆栽コンペティション',
  'international-sakura-bonsai-competition-2025-04',
  '2025-04-18',
  '2025-04-20',
  '東京都',
  '東京国際フォーラム',
  '東京都千代田区丸の内',
  '世界初の桜盆栽専門国際コンペティション。国内外から選りすぐりの桜盆栽作品が集結。審査・表彰式・国際交流イベントも開催。',
  '["exhibition","lecture"]',
  'paid',
  '入場料：大人2000円、学生1000円',
  '国際盆栽桜協会'
);

-- ==========================================================
-- 追加イベント数: 22件
-- 対象地域: 全国（北海道から九州まで）
-- 特色: 春・桜・植え替え・新緑をテーマとした季節性重視
-- イベントタイプ: exhibition, sale, workshop, lecture
-- ==========================================================