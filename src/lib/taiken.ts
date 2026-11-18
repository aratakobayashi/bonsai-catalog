// 「盆栽体験・盆栽教室を探す」（/taiken）。体験・教室のある盆栽園（gardens.experience_programs）を地域と内容で探す
// 内容の分類は、園の紹介文（公式サイトなどで確認した内容をまとめたもの）の言葉にもとづく。料金・日程は園ごとに違うため載せない
import type { GardenListItem } from '@/app/gardens/GardensPageClient'

export interface TaikenRegion {
  key: string
  label: string
  // 検索で探されやすい地名（見出しの補足）
  hint: string
  prefectures: string[]
}

export const TAIKEN_REGIONS: TaikenRegion[] = [
  { key: 'kanto', label: '東京・関東', hint: '東京・埼玉（大宮）・神奈川（鎌倉）など', prefectures: ['東京都', '埼玉県', '神奈川県', '千葉県', '茨城県', '栃木県', '群馬県'] },
  { key: 'kinki', label: '京都・大阪・関西', hint: '京都・大阪・兵庫・滋賀・和歌山・三重', prefectures: ['京都府', '大阪府', '兵庫県', '滋賀県', '奈良県', '和歌山県', '三重県'] },
  { key: 'chubu', label: '名古屋・中部', hint: '愛知・静岡・岐阜・長野・山梨・北陸・新潟', prefectures: ['愛知県', '静岡県', '岐阜県', '長野県', '山梨県', '新潟県', '富山県', '石川県', '福井県'] },
  { key: 'chugoku-shikoku', label: '中国・四国', hint: '高松（鬼無・国分寺）・広島・岡山・愛媛・徳島', prefectures: ['鳥取県', '島根県', '岡山県', '広島県', '山口県', '徳島県', '香川県', '愛媛県', '高知県'] },
  { key: 'kyushu', label: '福岡・九州', hint: '福岡・長崎・熊本・鹿児島', prefectures: ['福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'] },
  { key: 'tohoku', label: '北海道・東北', hint: '札幌・山形・福島', prefectures: ['北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県'] },
]

export type TaikenKind = 'oneday' | 'class' | 'kokedama' | 'reserve' | 'english'

export const TAIKEN_KINDS: { key: TaikenKind; label: string; short: string; note: string; test: RegExp }[] = [
  { key: 'oneday', label: '1回で参加できる体験', short: '1回の体験', note: 'ミニ盆栽づくり・ワークショップ・個人講習など', test: /体験|ワークショップ|(?:盆栽|苔玉)(?:づくり|作り)|レッスン|個人講習|マンツーマン/ },
  { key: 'class', label: '続けて通う教室', short: '教室', note: '月1回・毎週などの盆栽教室や講座', test: /教室|講座|研修|講習|シリーズ/ },
  { key: 'kokedama', label: '苔玉づくり', short: '苔玉', note: '親子でも参加しやすい', test: /苔玉/ },
  { key: 'reserve', label: '予約制', short: '予約制', note: '日時を相談して申し込む', test: /予約/ },
  { key: 'english', label: '英語で受けられる', short: '英語OK', note: '海外からの来客と一緒に', test: /英語/ },
]

export interface TaikenPlace {
  id: string
  name: string
  prefecture: string
  city: string
  summary: string
  website?: string
  kinds: TaikenKind[]
  // 大宮盆栽村の園（大宮盆栽村のガイドへの案内を出す）
  omiya: boolean
}

export function taikenKinds(text: string): TaikenKind[] {
  return TAIKEN_KINDS.filter(k => k.test.test(text)).map(k => k.key)
}

export function buildTaikenPlaces(gardens: GardenListItem[]): TaikenPlace[] {
  return gardens
    .filter(g => g.experience_programs)
    .map(g => ({
      id: g.id,
      name: g.name,
      prefecture: g.prefecture ?? '',
      city: g.city ?? '',
      summary: g.summary ?? '',
      website: g.website_url || undefined,
      kinds: taikenKinds(`${g.name} ${g.summary ?? ''}`),
      omiya: (g.city ?? '').includes('さいたま市') && /盆栽村|盆栽美術館|清香園|藤樹園|松雪園|九霞園|芙蓉園|蔓青園/.test(`${g.name}${g.summary ?? ''}`),
    }))
}

export const regionOf = (prefecture: string) => TAIKEN_REGIONS.find(r => r.prefectures.includes(prefecture))
