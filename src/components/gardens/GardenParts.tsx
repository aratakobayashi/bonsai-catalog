// 盆栽園の一覧・詳細で共通して使う小さな部品と関数
import { getRegionFromPrefecture } from '@/lib/utils'
import type { Garden } from '@/types'

// 「埼玉県」→「埼玉」（北海道はそのまま）
export function shortPrefecture(prefecture?: string | null): string {
  if (!prefecture) return ''
  return prefecture === '北海道' ? prefecture : prefecture.replace(/[都府県]$/, '')
}

export function gardenRegion(garden: Pick<Garden, 'prefecture'>): string {
  return getRegionFromPrefecture(garden.prefecture || '')
}

// 都道府県の並び（北から南。JISの都道府県コード順）
export const PREFECTURE_ORDER = [
  '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県', '静岡県', '愛知県',
  '三重県', '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県',
  '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県',
  '福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県',
]

export function prefectureRank(prefecture?: string | null): number {
  const i = prefecture ? PREFECTURE_ORDER.indexOf(prefecture) : -1
  return i === -1 ? PREFECTURE_ORDER.length : i
}

// 地方の並び（北から南。都道府県の並びから作る）
export const REGION_ORDER: string[] = PREFECTURE_ORDER.map(p => getRegionFromPrefecture(p)).filter((r, i, all) => r !== '未分類' && all.indexOf(r) === i)

// 都道府県（北から南）→ 市区町村 → 園名の順に並べる
export function compareGardens(a: Pick<Garden, 'prefecture' | 'city' | 'name'>, b: Pick<Garden, 'prefecture' | 'city' | 'name'>): number {
  return prefectureRank(a.prefecture) - prefectureRank(b.prefecture)
    || (a.city || '').localeCompare(b.city || '', 'ja')
    || a.name.localeCompare(b.name, 'ja')
}

// 「埼玉県さいたま市」
export function gardenArea(garden: Pick<Garden, 'prefecture' | 'city'>): string {
  return `${garden.prefecture || ''}${garden.city || ''}`
}

// 所在地と組合員であることだけを書いた、どの園にも共通する定型文か
// （例：「北上市成田にある盆栽園。日本盆栽協同組合の個人会員。」「さいたま市北区盆栽町（大宮盆栽村）の盆栽園。盆栽を鑑賞・購入できる。」）
// 一覧ではこの定型文を出さない（詳細ページでは事実として出す）
export function isGenericGardenDescription(description?: string | null): boolean {
  const text = (description || '').replace(/\s+/g, '').replace(/で、/g, '。')
  if (!text) return true
  const sentences = text.split('。').filter(Boolean)
  return sentences.every(s =>
    /^[^。、]*(にある|の)[^。、]{0,8}盆栽(園|店)(（[^）]*）)?(です)?$/.test(s) ||
    /(組合|協会)[^。]*の(組合員|個人会員|会員)(です)?$/.test(s) ||
    /^盆栽を鑑賞・購入できる$/.test(s)
  )
}

// 一覧に出す説明（定型文は出さない）
export function gardenSummary(garden: Pick<Garden, 'description'>): string | null {
  return isGenericGardenDescription(garden.description) ? null : garden.description.replace(/\s*\n\s*/g, '')
}

// データがある「できること・連絡手段」だけを短いラベルで返す
export function gardenFacts(garden: Pick<Garden, 'experience_programs' | 'online_sales' | 'website_url' | 'phone'>): string[] {
  const items: string[] = []
  if (garden.experience_programs) items.push('体験・教室')
  if (garden.online_sales) items.push('オンライン購入')
  if (garden.website_url) items.push('公式サイト')
  if (garden.phone) items.push('電話')
  return items
}

// 小さな四角いラベルで並べる（データがあるものだけ）
export function FactChips({ items, className = '' }: { items: string[]; className?: string }) {
  if (items.length === 0) return null
  return (
    <ul className={`flex flex-wrap gap-1.5 ${className}`} aria-label="できること・連絡手段">
      {items.map(item => (
        <li key={item} className="border border-line bg-white px-1.5 py-px text-[11px] leading-[18px] text-ink-soft">
          {item}
        </li>
      ))}
    </ul>
  )
}

export function hasCoords<T extends Pick<Garden, 'latitude' | 'longitude'>>(g: T): g is T & { latitude: number; longitude: number } {
  return typeof g.latitude === 'number' && typeof g.longitude === 'number'
}

// 2点間の距離（km）
export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const rad = Math.PI / 180
  const dLat = (b.lat - a.lat) * rad
  const dLng = (b.lng - a.lng) * rad
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2
  return 6371 * 2 * Math.asin(Math.sqrt(h))
}

// 「約3.2km」「約45km」
export function formatKm(km: number): string {
  return `約${km < 10 ? km.toFixed(1) : Math.round(km)}km`
}

// Googleマップで開くリンク（座標があれば座標、なければ名称＋住所で検索）
export function mapAppUrl(garden: Pick<Garden, 'name' | 'address' | 'latitude' | 'longitude'>): string {
  const query = garden.latitude != null && garden.longitude != null
    ? `${garden.latitude},${garden.longitude}`
    : `${garden.name} ${garden.address}`
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}

// 電話番号のリンク（数字と + だけにする）
export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, '')}`
}
