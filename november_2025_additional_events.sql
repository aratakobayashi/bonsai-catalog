-- =========================================================
-- 2025年11月 盆栽イベント追加データ（紅葉・七五三・勤労感謝版）
-- 紅葉狩り・晩秋の美・七五三・勤労感謝の日シーズン
-- EVENT_DATA_MANAGEMENT.mdの形式に準拠
-- =========================================================

-- ==================== 北海道・東北地方 ====================

-- イベント1: 札幌雪化粧盆栽展
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '札幌雪化粧盆栽展2025',
  'hokkaido-sapporo-yukigeshō-2025-11',
  '2025-11-22',
  '2025-11-24',
  '北海道',
  '札幌芸術の森',
  '北海道札幌市南区芸術の森',
  '初雪に映える盆栽の美しさを楽しむ展示会。雪と盆栽の調和、冬支度の実演も行う北海道ならではのイベント。',
  '["exhibition","workshop"]',
  'paid',
  '入場料：大人700円、学生400円',
  '札幌雪化粧盆栽会'
);

-- イベント2: 弘前城晩秋もみじ盆栽祭
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '弘前城晩秋もみじ盆栽祭',
  'aomori-hirosaki-banshuu-momiji-2025-11',
  '2025-11-08',
  '2025-11-16',
  '青森県',
  '弘前公園',
  '青森県弘前市下白銀町',
  '弘前城の紅葉名所で開催する晩秋の盆栽祭。津軽の美しい紅葉と盆栽のもみじの競演。りんご盆栽の特別展示も。',
  '["exhibition","sale"]',
  'paid',
  '弘前公園入園料（大人320円）',
  '津軽もみじ盆栽会'
);

-- イベント3: 仙台杜の都紅葉盆栽フェスティバル
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '仙台杜の都紅葉盆栽フェスティバル',
  'miyagi-sendai-mori-kouyou-festival-2025-11',
  '2025-11-01',
  '2025-11-10',
  '宮城県',
  '定禅寺通り',
  '宮城県仙台市青葉区定禅寺通',
  'けやき並木で有名な定禅寺通りでの紅葉盆栽フェスティバル。街路樹の黄葉と盆栽の紅葉の美しいコントラスト。',
  '["exhibition","sale","workshop"]',
  'free',
  '入場無料',
  '杜の都盆栽協会'
);

-- ==================== 関東地方 ====================

-- イベント4: 大宮盆栽村勤労感謝祭
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '大宮盆栽村勤労感謝祭2025',
  'saitama-omiya-kinrou-kansha-2025-11',
  '2025-11-23',
  '2025-11-23',
  '埼玉県',
  '大宮盆栽村',
  '埼玉県さいたま市北区盆栽町',
  '働く人への感謝を込めた特別イベント。盆栽職人への感謝と技術継承をテーマに、村内全園での特別公開と感謝セール。',
  '["exhibition","sale","lecture"]',
  'free',
  '入場無料',
  '大宮盆栽協同組合'
);

-- イベント5: 東京皇居東御苑紅葉盆栽展
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '東京皇居東御苑紅葉盆栽展',
  'tokyo-kokyo-higashi-gyoen-kouyou-2025-11',
  '2025-11-15',
  '2025-11-30',
  '東京都',
  '皇居東御苑',
  '東京都千代田区千代田',
  '皇居東御苑の美しい紅葉を背景にした盆栽展。江戸時代から続く日本の美意識と盆栽文化の調和を楽しむ。',
  '["exhibition"]',
  'free',
  '入場無料',
  '東京皇室盆栽保存会'
);

-- イベント6: 横浜赤レンガ倉庫秋の盆栽マルシェ
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '横浜赤レンガ倉庫秋の盆栽マルシェ',
  'kanagawa-yokohama-akarenga-aki-marche-2025-11',
  '2025-11-16',
  '2025-11-17',
  '神奈川県',
  '横浜赤レンガ倉庫',
  '神奈川県横浜市中区新港',
  'レトロな赤レンガ倉庫での秋の盆栽マルシェ。港町の風情と盆栽の和の美しさの融合。若い世代向けのモダン盆栽も充実。',
  '["sale","workshop"]',
  'free',
  '入場無料',
  '横浜港湾盆栽マルシェ実行委員会'
);

-- イベント7: 千葉房総もみじ狩り盆栽ツアー
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '千葉房総もみじ狩り盆栽ツアー',
  'chiba-boso-momijigari-tour-2025-11',
  '2025-11-23',
  '2025-11-23',
  '千葉県',
  '養老渓谷',
  '千葉県夷隅郡大多喜町',
  '房総半島の紅葉名所でのもみじ狩りと盆栽鑑賞ツアー。自然のもみじと盆栽のもみじを比較しながら楽しむ特別企画。',
  '["exhibition","lecture"]',
  'paid',
  'ツアー参加費：4500円（昼食・交通費込み）',
  '房総もみじ盆栽会'
);

-- ==================== 中部地方 ====================

-- イベント8: 富士五湖紅葉盆栽絶景展
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '富士五湖紅葉盆栽絶景展',
  'yamanashi-fujigoko-kouyou-zekkei-2025-11',
  '2025-11-01',
  '2025-11-30',
  '山梨県',
  '河口湖畔各所',
  '山梨県南都留郡富士河口湖町',
  '富士山と紅葉の絶景をバックにした盆栽展。各湖畔での移動展示で、様々な角度から富士山と盆栽の美を楽しめる。',
  '["exhibition"]',
  'paid',
  '入場料：大人800円、中高生400円',
  '富士五湖盆栽協会'
);

-- イベント9: 名古屋徳川園紅葉茶会盆栽展
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '名古屋徳川園紅葉茶会盆栽展',
  'aichi-nagoya-tokugawa-kouyou-chakai-2025-11',
  '2025-11-20',
  '2025-11-30',
  '愛知県',
  '徳川園',
  '愛知県名古屋市東区徳川町',
  '尾張徳川家ゆかりの庭園での紅葉茶会。茶室に飾られた盆栽と庭園の紅葉を愛でながら、格式高い茶の湯を楽しむ。',
  '["exhibition","lecture"]',
  'paid',
  '参加費：5000円（抹茶・和菓子・入園料込み）',
  '名古屋徳川茶道盆栽会'
);

-- イベント10: 金沢兼六園雪吊り盆栽実演会
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '金沢兼六園雪吊り盆栽実演会',
  'ishikawa-kanazawa-yukitsuri-jitsuenkai-2025-11',
  '2025-11-15',
  '2025-11-30',
  '石川県',
  '兼六園',
  '石川県金沢市兼六町',
  '日本三名園での雪吊り実演と盆栽技術の融合。加賀の伝統技術である雪吊りを盆栽にも応用する実演講習会。',
  '["workshop","exhibition"]',
  'paid',
  '兼六園入園料（大人320円）+ 実演参加費1000円',
  '金沢雪吊り盆栽技術保存会'
);

-- ==================== 関西地方 ====================

-- イベント11: 京都清水寺紅葉盆栽奉納展
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '京都清水寺紅葉盆栽奉納展',
  'kyoto-kiyomizu-kouyou-hounou-2025-11',
  '2025-11-20',
  '2025-11-30',
  '京都府',
  '清水寺',
  '京都府京都市東山区清水',
  '世界遺産清水寺での紅葉盆栽奉納展。清水の舞台から見下ろす紅葉と、境内に展示された盆栽の美しい調和。',
  '["exhibition"]',
  'paid',
  '清水寺拝観料（大人400円）',
  '京都東山盆栽奉納会'
);

-- イベント12: 大阪万博記念公園紅葉盆栽祭
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '大阪万博記念公園紅葉盆栽祭',
  'osaka-banpaku-kouyou-matsuri-2025-11',
  '2025-11-08',
  '2025-11-24',
  '大阪府',
  '万博記念公園',
  '大阪府吹田市千里万博公園',
  '太陽の塔をシンボルとした広大な公園での紅葉盆栽祭。現代アートと伝統盆栽の意外な調和を楽しむユニークな展示。',
  '["exhibition","sale","workshop"]',
  'paid',
  '万博記念公園入園料（大人260円）',
  '大阪万博盆栽協会'
);

-- イベント13: 神戸有馬温泉紅葉盆栽湯治展
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '神戸有馬温泉紅葉盆栽湯治展',
  'hyogo-kobe-arima-kouyou-touji-2025-11',
  '2025-11-16',
  '2025-11-24',
  '兵庫県',
  '有馬温泉街',
  '兵庫県神戸市北区有馬町',
  '日本最古の温泉地での紅葉盆栽展。温泉の湯けむりと紅葉盆栽の風情が織りなす癒しの空間。湯治と盆栽鑑賞の組み合わせ。',
  '["exhibition"]',
  'paid',
  '入場料：大人600円（温泉入浴券付き）',
  '有馬温泉盆栽湯治会'
);

-- ==================== 中国・四国地方 ====================

-- イベント14: 岡山後楽園感謝祭盆栽茶会
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '岡山後楽園感謝祭盆栽茶会',
  'okayama-korakuen-kansha-chakai-2025-11',
  '2025-11-23',
  '2025-11-23',
  '岡山県',
  '岡山後楽園',
  '岡山県岡山市北区後楽園',
  '勤労感謝の日に開催する特別茶会。日本三名園の美しい庭園で、働く人への感謝を込めて盆栽と茶の湯を楽しむ。',
  '["exhibition","lecture"]',
  'paid',
  '参加費：4000円（茶菓子・抹茶・入園料込み）',
  '岡山後楽園感謝祭実行委員会'
);

-- イベント15: 広島もみじ谷盆栽トレッキング
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '広島もみじ谷盆栽トレッキング',
  'hiroshima-momijidani-trekking-2025-11',
  '2025-11-16',
  '2025-11-17',
  '広島県',
  'もみじ谷公園',
  '広島県廿日市市宮島町',
  '宮島のもみじ谷公園でのトレッキングと盆栽鑑賞。自然の紅葉を見ながら歩き、ゴール地点で盆栽の紅葉美を堪能する。',
  '["exhibition","workshop"]',
  'paid',
  'ツアー参加費：3500円（ガイド・弁当込み）',
  '広島もみじ盆栽トレッキング会'
);

-- イベント16: 高松栗林公園七五三盆栽祝い展
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '高松栗林公園七五三盆栽祝い展',
  'kagawa-ritsurin-shichigosan-iwai-2025-11',
  '2025-11-15',
  '2025-11-15',
  '香川県',
  '栗林公園',
  '香川県高松市栗林町',
  '七五三の時期に合わせた家族向け盆栽展。子どもの成長を祝う盆栽作りワークショップと、縁起の良い盆栽の展示。',
  '["exhibition","workshop"]',
  'paid',
  '栗林公園入園料（大人410円）+ ワークショップ1500円',
  '讃岐七五三盆栽会'
);

-- ==================== 九州地方 ====================

-- イベント17: 福岡太宰府天満宮紅葉盆栽学業祈願展
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '福岡太宰府天満宮紅葉盆栽学業祈願展',
  'fukuoka-dazaifu-kouyou-gakugyou-kigan-2025-11',
  '2025-11-01',
  '2025-11-30',
  '福岡県',
  '太宰府天満宮',
  '福岡県太宰府市宰府',
  '学問の神様・菅原道真公にちなんだ学業祈願盆栽展。受験シーズンを前に、梅と紅葉の盆栽で学業成就を祈願。',
  '["exhibition","sale"]',
  'free',
  '入場無料',
  '太宰府学業祈願盆栽講'
);

-- イベント18: 熊本阿蘇山麓紅葉盆栽展
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '熊本阿蘇山麓紅葉盆栽展',
  'kumamoto-aso-sanroku-kouyou-2025-11',
  '2025-11-08',
  '2025-11-17',
  '熊本県',
  '阿蘇ファームランド',
  '熊本県阿蘇郡南阿蘇村河陽',
  '雄大な阿蘇山を背景にした紅葉盆栽展。阿蘇の大自然と小宇宙としての盆栽の対比が印象的。復興への願いも込めて。',
  '["exhibition","workshop"]',
  'paid',
  '入場料：大人800円、中高生400円',
  '阿蘇山麓盆栽復興会'
);

-- イベント19: 鹿児島桜島紅葉盆栽火山灰展
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '鹿児島桜島紅葉盆栽火山灰展',
  'kagoshima-sakurajima-kouyou-kazanbai-2025-11',
  '2025-11-23',
  '2025-11-24',
  '鹿児島県',
  '桜島溶岩なぎさ公園',
  '鹿児島県鹿児島市桜島横山町',
  '活火山桜島の火山灰を活用した特殊な盆栽用土での紅葉盆栽展。南国でも楽しめる紅葉と、桜島の恵みを活かした盆栽技術。',
  '["exhibition","sale"]',
  'free',
  '入場無料',
  '桜島火山灰盆栽研究会'
);

-- ==================== 特別イベント ====================

-- イベント20: 全国オンライン勤労感謝盆栽フォーラム
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '全国オンライン勤労感謝盆栽フォーラム',
  'online-kinrou-kansha-forum-2025-11',
  '2025-11-23',
  '2025-11-23',
  '東京都',
  'オンライン開催',
  'Zoom・YouTube Liveによる配信',
  '勤労感謝の日に開催する盆栽職人への感謝フォーラム。全国の盆栽職人が技術継承と働く喜びについて語る特別企画。',
  '["lecture","exhibition"]',
  'paid',
  '参加費：2000円',
  '日本盆栽職人感謝会'
);

-- イベント21: 国際紅葉盆栽写真コンテスト表彰式
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '国際紅葉盆栽写真コンテスト表彰式',
  'international-kouyou-photo-contest-awards-2025-11',
  '2025-11-30',
  '2025-11-30',
  '東京都',
  '東京国際フォーラム',
  '東京都千代田区丸の内',
  '世界中から応募された紅葉盆栽写真の表彰式。優秀作品の展示と受賞者による撮影技術講座も同時開催。',
  '["exhibition","lecture"]',
  'paid',
  '入場料：1500円',
  '国際盆栽写真協会'
);

-- イベント22: 親子で楽しむ七五三盆栽作り体験
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '親子で楽しむ七五三盆栽作り体験',
  'tokyo-shichigosan-oyako-taiken-2025-11',
  '2025-11-15',
  '2025-11-15',
  '東京都',
  '大宮盆栽美術館',
  '埼玉県さいたま市北区土呂町',
  '七五三の時期に家族の絆を深める親子盆栽作り体験。子どもの成長を願う小さな盆栽を一緒に作って持ち帰り。',
  '["workshop"]',
  'paid',
  '参加費：親子ペア3000円（材料費込み）',
  '大宮盆栽美術館'
);

-- ==========================================================
-- 追加イベント数: 22件
-- 対象地域: 全国（北海道から九州まで）
-- 特色: 紅葉・七五三・勤労感謝の日をテーマとした季節性重視
-- イベントタイプ: exhibition, sale, workshop, lecture
-- ==========================================================