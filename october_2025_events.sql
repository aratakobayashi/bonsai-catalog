-- 2025年10月盆栽イベント追加（動作確認済み形式）

-- イベント1: 笠間盆栽展
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '笠間盆栽展',
  'ibaraki-kasama-bonsai-2025-10',
  '2025-10-03',
  '2025-10-05',
  '茨城県',
  '笠間公民館',
  '茨城県笠間市石井',
  '一般社団法人日本盆栽協会笠間支部主催の秋の盆栽展示会。9時～16時（最終日は15時まで）開催。',
  '["exhibition"]',
  'free',
  '入場無料',
  '一般社団法人日本盆栽協会笠間支部'
);

-- イベント2: 盆栽の横浜逸品会即売会
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '盆栽の横浜逸品会 即売会',
  'kanagawa-yokohama-ippinkai-2025-10',
  '2025-10-04',
  '2025-10-05',
  '神奈川県',
  'ザ・ガーデン本店ヨネヤマプランテイション特設会場',
  '神奈川県横浜市港北区新羽町',
  '9時30分～18時（最終日は17時まで）開催の盆栽即売会。質の高い盆栽を販売。',
  '["sale"]',
  'paid',
  '有料（詳細は要確認）',
  '盆栽の横浜逸品会'
);

-- イベント3: 湘南はまゆう小品盆栽会
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '湘南はまゆう小品盆栽会',
  'kanagawa-shonan-hamayuu-2025-10',
  '2025-10-11',
  '2025-10-12',
  '神奈川県',
  'チェルSeaみうら（旧南下浦市民センター）',
  '神奈川県三浦市（三浦海岸駅徒歩3分）',
  '小品盆栽の展示会。10時～16時（最終日は15時まで）開催。即売もあり。',
  '["exhibition","sale"]',
  'free',
  '入場無料',
  '湘南はまゆう小品盆栽会'
);

-- イベント4: 草趣会
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '草趣会 秋季展',
  'kanagawa-soshushu-2025-10',
  '2025-10-20',
  '2025-10-24',
  '神奈川県',
  '相模原市総合学習センター アートギャラリー',
  '神奈川県相模原市中央区中央',
  '9時30分～16時開催の盆栽・山野草展示会。1階・2階のアートギャラリーで開催。',
  '["exhibition"]',
  'free',
  '入場無料',
  '草趣会'
);

-- イベント5: 伊勢原市民文化祭 盆栽展
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '伊勢原市民文化祭 盆栽展',
  'kanagawa-isehara-bunka-2025-10',
  '2025-10-24',
  '2025-10-26',
  '神奈川県',
  '伊勢原市中央公民館 1階展示ホール',
  '神奈川県伊勢原市東大竹',
  '市民文化祭の一環として開催される盆栽展。9時～17時（最終日は16時まで）。25日13時より「松柏類の針金かけ」講習会も実施。',
  '["exhibition","lecture"]',
  'free',
  '入場無料',
  '伊勢原盆栽会'
);

-- イベント6: 茅ヶ崎盆栽会
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '茅ヶ崎盆栽会 秋季展',
  'kanagawa-chigasaki-2025-10',
  '2025-10-24',
  '2025-10-26',
  '神奈川県',
  '茅ヶ崎市文化会館 展示室',
  '神奈川県茅ヶ崎市',
  '9時～17時（初日は13時より、最終日は15時まで）開催の地域盆栽展示会。',
  '["exhibition"]',
  'free',
  '入場無料',
  '茅ヶ崎盆栽会'
);

-- イベント7: 鶴見区民文化祭 盆栽展
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '鶴見区民文化祭 盆栽展',
  'kanagawa-tsurumi-bunka-2025-10',
  '2025-10-24',
  '2025-10-26',
  '神奈川県',
  '鶴見区民文化センター・サルビアホール 3階ギャラリー',
  '神奈川県横浜市鶴見区',
  '区民文化祭の一環として開催される盆栽展。9時～17時（最終日は16時まで）開催。',
  '["exhibition"]',
  'free',
  '入場無料',
  '鶴見区盆栽愛好会'
);

-- イベント8: 小田原盆栽愛好会
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '小田原盆栽愛好会 秋季展',
  'kanagawa-odawara-2025-10',
  '2025-10-30',
  '2025-11-03',
  '神奈川県',
  '小田原フラワーガーデン',
  '神奈川県小田原市久野',
  '9時～16時（初日は12時より、最終日は15時まで）開催。入場無料で即売もあり。自然豊かなフラワーガーデンでの展示。',
  '["exhibition","sale"]',
  'free',
  '入場無料',
  '小田原盆栽愛好会'
);

-- イベント9: 近江湖鉢会（近畿）
INSERT INTO events (
  title, slug, start_date, end_date, prefecture,
  venue_name, address, description, types,
  price_type, price_note, organizer_name
) VALUES (
  '近江湖鉢会 秋季展',
  'shiga-omi-kobachi-2025-10',
  '2025-10-16',
  '2025-10-19',
  '滋賀県',
  '草津市立水生植物公園みずの森 ロータス館',
  '滋賀県草津市下物',
  '盆栽約30作品を展示する湖畔の美しい植物公園での展示会。9時～16時開催。',
  '["exhibition"]',
  'free',
  '入場無料',
  '近江湖鉢会'
);