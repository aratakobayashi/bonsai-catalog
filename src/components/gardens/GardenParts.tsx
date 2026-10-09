// 盆栽園の一覧・詳細で共通して使う小さな部品
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

// 都道府県（北から南）→ 市区町村 → 園名の順に並べる
export function compareGardens(a: Pick<Garden, 'prefecture' | 'city' | 'name'>, b: Pick<Garden, 'prefecture' | 'city' | 'name'>): number {
  const rank = (p?: string | null) => {
    const i = p ? PREFECTURE_ORDER.indexOf(p) : -1
    return i === -1 ? PREFECTURE_ORDER.length : i
  }
  return rank(a.prefecture) - rank(b.prefecture)
    || (a.city || '').localeCompare(b.city || '', 'ja')
    || a.name.localeCompare(b.name, 'ja')
}

// 「埼玉県さいたま市」
export function gardenArea(garden: Pick<Garden, 'prefecture' | 'city'>): string {
  return `${garden.prefecture || ''}${garden.city || ''}`
}

// 都道府県名を縦書きにした白い札（写真の代わり）
export function PrefPlate({ garden, size = 'md' }: { garden: Pick<Garden, 'prefecture'>; size?: 'sm' | 'md' }) {
  const box = size === 'sm' ? 'h-11 w-11 text-sm' : 'h-[52px] w-[52px] text-[15px] lg:h-[72px] lg:w-[72px] lg:text-[19px]'
  return (
    <div
      className={`flex flex-shrink-0 items-center justify-center border border-line bg-white font-mincho font-bold leading-none tracking-[0.06em] text-ink ${box}`}
      style={{ writingMode: 'vertical-rl' }}
      aria-hidden="true"
    >
      {shortPrefecture(garden.prefecture)}
    </div>
  )
}

// カードに出す「できること」などの短い情報（データがあるものだけ）
export function gardenHighlights(garden: Garden, max = 3): string[] {
  const items: string[] = []
  if (garden.experience_programs) items.push('体験・教室あり')
  if (garden.online_sales) items.push('オンライン購入可')
  if (garden.business_hours) items.push(garden.business_hours.split(/\r?\n/)[0])
  if (garden.phone && items.length < max) items.push('電話対応')
  return items.slice(0, max)
}

// 金茶の小さな文字で並べる（色付きの丸やラベルは使わない）
export function HighlightDots({ items }: { items: string[] }) {
  if (items.length === 0) return null
  return (
    <ul className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11.5px] text-gold-dark">
      {items.map(item => (
        <li key={item} className="line-clamp-1">{item}</li>
      ))}
    </ul>
  )
}

// Googleマップで開くリンク（座標があれば座標、なければ名称＋住所で検索）
export function mapAppUrl(garden: Pick<Garden, 'name' | 'address' | 'latitude' | 'longitude'>): string {
  const query = garden.latitude != null && garden.longitude != null
    ? `${garden.latitude},${garden.longitude}`
    : `${garden.name} ${garden.address}`
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}
