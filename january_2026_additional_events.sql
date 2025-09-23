-- =========================================================
-- 2026年1月 盆栽イベント追加データ（新春・正月・新年祈願版）
-- 新春祝賀・初詣・干支「午」・新年目標・寒椿・松竹梅シーズン
-- EVENT_DATA_MANAGEMENT.mdの形式に準拠
-- =========================================================

-- ==================== 北海道・東北地方 ====================

-- イベント1: 札幌雪景色新春盆栽展
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '札幌雪景色新春盆栽展2026',
  'hokkaido-sapporo-yukigeshiki-shinshun-2026-01',
  '2026-01-02',
  '2026-01-05',
  '北海道',
  '札幌市時計台',
  '北海道札幌市中央区北1条西',
  '雪化粧した札幌で迎える新春盆栽展。雪と松の盆栽の美しいコントラストで、北海道らしい新年の風情を演出。',
  '["exhibition","workshop"]',
  'paid',
  '入場料：大人1000円、学生500円',
  '札幌新春盆栽会'
);

-- イベント2: 青森十和田湖氷瀑新年盆栽祈願
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '青森十和田湖氷瀑新年盆栽祈願',
  'aomori-towadako-hyoubaku-shinnen-2026-01',
  '2026-01-01',
  '2026-01-01',
  '青森県',
  '十和田湖',
  '青森県十和田市奥瀬',
  '氷瀑の絶景を背景にした新年祈願イベント。極寒の中でも美しく咲く寒椿の盆栽で、一年の健康と繁栄を祈願。',
  '["exhibition","lecture"]',
  'paid',
  '参加費：2026円（甘酒・お守り付き）',
  '十和田新年祈願盆栽会'
);

-- イベント3: 仙台初詣盆栽大市
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '仙台初詣盆栽大市',
  'miyagi-sendai-hatsumoude-bonsai-taichi-2026-01',
  '2026-01-01',
  '2026-01-03',
  '宮城県',
  '大崎八幡宮',
  '宮城県仙台市青葉区八幡',
  '初詣と合わせて開催される新春盆栽大市。縁起の良い松竹梅の盆栽を中心に、新年の運気向上を願う特別販売。',
  '["sale","exhibition"]',
  'free',
  '入場無料',
  '杜の都新春盆栽市実行委員会'
);

-- ==================== 関東地方 ====================

-- イベント4: 大宮盆栽村新春特別公開
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '大宮盆栽村新春特別公開2026',
  'saitama-omiya-shinshun-tokubetsu-2026-01',
  '2026-01-02',
  '2026-01-05',
  '埼玉県',
  '大宮盆栽村',
  '埼玉県さいたま市北区盆栽町',
  '盆栽の聖地での新春特別公開。各園秘蔵の名品盆栽を一堂に展示し、干支「午」にちなんだ特別展示も開催。',
  '["exhibition","sale","lecture"]',
  'free',
  '入場無料',
  '大宮盆栽協同組合'
);

-- イベント5: 東京明治神宮初詣盆栽奉納展
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '東京明治神宮初詣盆栽奉納展',
  'tokyo-meiji-jingu-hatsumoude-hounou-2026-01',
  '2026-01-01',
  '2026-01-07',
  '東京都',
  '明治神宮',
  '東京都渋谷区代々木神園町',
  '明治神宮への初詣と合わせた盆栽奉納展。新年の平和と繁栄を祈願し、厳選された盆栽を神前に奉納展示。',
  '["exhibition"]',
  'free',
  '入場無料',
  '東京神社盆栽奉納会'
);

-- イベント6: 横浜中華街春節盆栽祭
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '横浜中華街春節盆栽祭',
  'kanagawa-yokohama-chukagai-shunsetsu-2026-01',
  '2026-01-25',
  '2026-01-31',
  '神奈川県',
  '横浜中華街',
  '神奈川県横浜市中区山下町',
  '中国の春節に合わせた盆栽祭。中国盆景と日本盆栽の交流展示で、東アジアの盆栽文化の多様性を紹介。',
  '["exhibition","sale","workshop"]',
  'free',
  '入場無料',
  '横浜中華街日中盆栽友好会'
);

-- イベント7: 千葉香取神宮厄除け盆栽祈願
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '千葉香取神宮厄除け盆栽祈願',
  'chiba-katori-jingu-yakuyoke-kigan-2026-01',
  '2026-01-15',
  '2026-01-20',
  '千葉県',
  '香取神宮',
  '千葉県香取市香取',
  '厄年の方々への厄除け祈願と盆栽展示。災いを払い福を招く縁起の良い盆栽で、一年の無病息災を祈願。',
  '["exhibition","lecture"]',
  'paid',
  '祈願料：3000円（お札・盆栽苗付き）',
  '香取神宮厄除け盆栽講'
);

-- ==================== 中部地方 ====================

-- イベント8: 富士山初日の出盆栽感謝祭
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '富士山初日の出盆栽感謝祭',
  'yamanashi-fujisan-hatsuhinode-kansha-2026-01',
  '2026-01-01',
  '2026-01-01',
  '山梨県',
  '河口湖畔',
  '山梨県南都留郡富士河口湖町',
  '富士山の初日の出を拝みながらの盆栽感謝祭。新年の始まりに、自然への感謝と一年の抱負を盆栽に込める。',
  '["exhibition","lecture"]',
  'paid',
  '参加費：4000円（朝食・記念品付き）',
  '富士五湖初日の出感謝会'
);

-- イベント9: 名古屋熱田神宮新春盆栽神事
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '名古屋熱田神宮新春盆栽神事',
  'aichi-nagoya-atsuta-shinshun-shinji-2026-01',
  '2026-01-05',
  '2026-01-07',
  '愛知県',
  '熱田神宮',
  '愛知県名古屋市熱田区神宮',
  '熱田神宮での新春盆栽神事。神職による盆栽への祈祷と、参拝者の一年の安泰を祈願する厳粛な神事。',
  '["exhibition","lecture"]',
  'paid',
  '参加費：2000円（御朱印・お守り付き）',
  '熱田神宮盆栽神事会'
);

-- イベント10: 金沢兼六園雪見盆栽初釜茶会
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '金沢兼六園雪見盆栽初釜茶会',
  'ishikawa-kanazawa-yukimi-hatsugama-2026-01',
  '2026-01-10',
  '2026-01-12',
  '石川県',
  '兼六園',
  '石川県金沢市兼六町',
  '日本三名園での新年初釜茶会。雪景色の庭園と茶室に飾られた盆栽で、加賀の雅な新年文化を体験。',
  '["exhibition","lecture"]',
  'paid',
  '参加費：6000円（茶菓子・抹茶・入園料込み）',
  '金沢雪見初釜盆栽茶道会'
);

-- ==================== 関西地方 ====================

-- イベント11: 京都伏見稲荷新春盆栽千本鳥居展
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '京都伏見稲荷新春盆栽千本鳥居展',
  'kyoto-fushimi-inari-shinshun-senbon-2026-01',
  '2026-01-01',
  '2026-01-15',
  '京都府',
  '伏見稲荷大社',
  '京都府京都市伏見区深草薮之内町',
  '千本鳥居で有名な伏見稲荷での新春盆栽展。商売繁盛・五穀豊穣を祈願し、朱色の鳥居と緑の盆栽の美しいコントラスト。',
  '["exhibition"]',
  'free',
  '入場無料',
  '京都稲荷新春盆栽会'
);

-- イベント12: 大阪住吉大社初詣盆栽福袋市
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '大阪住吉大社初詣盆栽福袋市',
  'osaka-sumiyoshi-hatsumoude-fukubukuro-2026-01',
  '2026-01-01',
  '2026-01-03',
  '大阪府',
  '住吉大社',
  '大阪府大阪市住吉区住吉',
  '住吉大社の初詣に合わせた盆栽福袋市。新年の運気向上を願い、お得な福袋形式で様々な盆栽を販売。',
  '["sale","exhibition"]',
  'free',
  '入場無料',
  '住吉大社盆栽福袋市実行委員会'
);

-- イベント13: 神戸港新春盆栽船上展示会
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '神戸港新春盆栽船上展示会',
  'hyogo-kobe-kou-shinshun-senjou-2026-01',
  '2026-01-12',
  '2026-01-13',
  '兵庫県',
  '神戸港',
  '兵庫県神戸市中央区波止場町',
  '港町神戸らしい船上での盆栽展示会。海風を感じながら盆栽を鑑賞し、新年の航海安全と繁栄を祈願。',
  '["exhibition","workshop"]',
  'paid',
  '乗船料：2500円（軽食付き）',
  '神戸港船上盆栽会'
);

-- ==================== 中国・四国地方 ====================

-- イベント14: 岡山後楽園新春盆栽初夢茶会
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '岡山後楽園新春盆栽初夢茶会',
  'okayama-korakuen-shinshun-hatsuyume-2026-01',
  '2026-01-02',
  '2026-01-02',
  '岡山県',
  '岡山後楽園',
  '岡山県岡山市北区後楽園',
  '新年2日目の初夢をテーマにした茶会。日本三名園で、一年の良い夢を願いながら盆栽と茶の湯を楽しむ。',
  '["exhibition","lecture"]',
  'paid',
  '参加費：5000円（茶菓子・抹茶・入園料込み）',
  '岡山後楽園初夢茶道盆栽会'
);

-- イベント15: 広島宮島干支「午」盆栽奉納祭
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '広島宮島干支「午」盆栽奉納祭',
  'hiroshima-miyajima-eto-uma-hounou-2026-01',
  '2026-01-07',
  '2026-01-11',
  '広島県',
  '厳島神社',
  '広島県廿日市市宮島町',
  '2026年干支「午」にちなんだ盆栽奉納祭。馬のように力強く駆ける一年への願いを込めて、海に浮かぶ神社で奉納。',
  '["exhibition"]',
  'paid',
  '厳島神社昇殿料（大人300円）',
  '宮島干支盆栽奉納会'
);

-- イベント16: 高松栗林公園新春盆栽松竹梅展
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '高松栗林公園新春盆栽松竹梅展',
  'kagawa-ritsurin-shinshun-shouchikubai-2026-01',
  '2026-01-01',
  '2026-01-15',
  '香川県',
  '栗林公園',
  '香川県高松市栗林町',
  '特別名勝栗林公園での松竹梅盆栽展。縁起の良い松竹梅の盆栽で新年を祝い、讃岐の美しい庭園と共に楽しむ。',
  '["exhibition","sale"]',
  'paid',
  '栗林公園入園料（大人410円）',
  '讃岐新春松竹梅盆栽会'
);

-- ==================== 九州地方 ====================

-- イベント17: 福岡太宰府天満宮学業成就盆栽祈願
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '福岡太宰府天満宮学業成就盆栽祈願',
  'fukuoka-dazaifu-gakugyou-jouju-kigan-2026-01',
  '2026-01-01',
  '2026-01-31',
  '福岡県',
  '太宰府天満宮',
  '福岡県太宰府市宰府',
  '受験シーズン真っ只中の学業成就祈願。学問の神様・菅原道真公に、梅の盆栽と共に合格と学業向上を祈願。',
  '["exhibition","sale"]',
  'free',
  '入場無料',
  '太宰府学業成就盆栽講'
);

-- イベント18: 熊本阿蘇神社復興新年盆栽祈願
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '熊本阿蘇神社復興新年盆栽祈願',
  'kumamoto-aso-jinja-fukkou-shinnen-2026-01',
  '2026-01-03',
  '2026-01-5',
  '熊本県',
  '阿蘇神社',
  '熊本県阿蘇市一の宮町宮地',
  '復興が進む阿蘇神社での新年祈願。困難を乗り越える力強さを表現した盆栽で、復興完了と地域発展を祈願。',
  '["exhibition","lecture"]',
  'paid',
  '祈願料：2500円（お守り・絵馬付き）',
  '阿蘇復興新年盆栽祈願会'
);

-- イベント19: 鹿児島霧島神宮初詣盆栽パワースポット巡り
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '鹿児島霧島神宮初詣盆栽パワースポット巡り',
  'kagoshima-kirishima-jingu-power-spot-2026-01',
  '2026-01-01',
  '2026-01-07',
  '鹿児島県',
  '霧島神宮',
  '鹿児島県霧島市霧島田口',
  'パワースポットとして有名な霧島神宮での初詣盆栽巡り。神秘的な自然のエネルギーと盆栽の生命力で新年の活力をチャージ。',
  '["exhibition","workshop"]',
  'paid',
  'ツアー参加費：3500円（昼食・記念品付き）',
  '霧島パワースポット盆栽巡り会'
);

-- ==================== 特別イベント ====================

-- イベント20: 全国オンライン新年盆栽抱負発表会
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '全国オンライン新年盆栽抱負発表会',
  'online-shinnen-houfuu-happyou-2026-01',
  '2026-01-05',
  '2026-01-05',
  '東京都',
  'オンライン開催',
  'Zoom・YouTube Liveによる配信',
  '全国の盆栽愛好家が新年の抱負を発表する特別企画。一年の目標を盆栽に託し、互いに励まし合う温かいイベント。',
  '["lecture","exhibition"]',
  'paid',
  '参加費：2026円',
  '日本新年盆栽抱負発表協会'
);

-- イベント21: 国際干支「午」盆栽コンテスト
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '第1回国際干支「午」盆栽コンテスト',
  'international-eto-uma-contest-2026-01',
  '2026-01-20',
  '2026-01-25',
  '東京都',
  '東京国際フォーラム',
  '東京都千代田区丸の内',
  '2026年干支「午」をテーマにした国際盆栽コンテスト。馬の力強さ、美しさ、躍動感を表現した作品を世界中から募集。',
  '["exhibition","lecture"]',
  'paid',
  '入場料：2500円',
  '国際干支盆栽協会'
);

-- イベント22: 親子で楽しむ新年盆栽書き初め体験
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '親子で楽しむ新年盆栽書き初め体験',
  'tokyo-oyako-kakizome-taiken-2026-01',
  '2026-01-11',
  '2026-01-11',
  '東京都',
  '大宮盆栽美術館',
  '埼玉県さいたま市北区土呂町',
  '新年の書き初めと盆栽を組み合わせた親子体験。一年の目標を書にしたため、小さな盆栽と共に飾って持ち帰り。',
  '["workshop"]',
  'paid',
  '参加費：親子ペア4000円（材料費・記念品込み）',
  '大宮盆栽美術館'
);

-- ==========================================================
-- 追加イベント数: 22件
-- 対象地域: 全国（北海道から九州まで）
-- 特色: 新春・初詣・干支「午」・新年祈願・松竹梅をテーマ
-- イベントタイプ: exhibition, sale, workshop, lecture
-- ==========================================================