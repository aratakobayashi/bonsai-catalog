// 樹種ごとの見頃（月単位の一般的な目安）。トップの樹種一覧・季節の棚・一覧のタブ・カード・商品ページで共通に使う
// 「今が見頃」は、日本時間の今月がこの月に含まれるときだけ表示する。常緑の樹種は見頃の印を出さない
// サーバー・クライアントのどちらからでも使える（外部の依存なし）

export type SeasonValue = 'spring' | 'summer' | 'autumn' | 'winter'

export interface SpeciesPeak {
  // 見頃の月（1〜12）。常緑は空
  months: number[]
  // 表示用（例：「紅葉 10〜11月」「一年中（常緑）」）
  label: string
}

export const EVERGREEN_LABEL = '一年中（常緑）'

// key は species-traits の SPECIES_TRAITS の key（= 樹種カテゴリの slug）
export const SPECIES_PEAKS: Record<string, SpeciesPeak> = {
  gajumaru: { months: [], label: EVERGREEN_LABEL },
  ficus: { months: [], label: EVERGREEN_LABEL },
  goyomatsu: { months: [], label: EVERGREEN_LABEL },
  kuromatsu: { months: [], label: EVERGREEN_LABEL },
  akamatsu: { months: [], label: EVERGREEN_LABEL },
  shimpaku: { months: [], label: EVERGREEN_LABEL },
  toshou: { months: [], label: EVERGREEN_LABEL },
  hinoki: { months: [], label: EVERGREEN_LABEL },
  olive: { months: [], label: EVERGREEN_LABEL },
  chojubai: { months: [3, 4, 5, 10, 11], label: '花 3〜5月・10〜11月' },
  ume: { months: [2, 3], label: '花 2〜3月' },
  sakura: { months: [3, 4], label: '花 3〜4月' },
  satsuki: { months: [5, 6], label: '花 5〜6月' },
  fuji: { months: [4, 5], label: '花 4〜5月' },
  natsutsubaki: { months: [6, 7], label: '花 6〜7月' },
  tsubaki: { months: [12, 1, 2, 3, 4], label: '花 12〜4月（品種による）' },
  sarusuberi: { months: [7, 8, 9], label: '花 7〜9月' },
  kuchinashi: { months: [6, 7], label: '花 6〜7月' },
  bara: { months: [5, 6, 10, 11], label: '花 5〜6月・10〜11月' },
  himeringo: { months: [4, 9, 10, 11], label: '花 4月・実 9〜11月' },
  ringo: { months: [4, 9, 10, 11], label: '花 4月・実 9〜11月' },
  nanten: { months: [11, 12, 1, 2], label: '実 11〜2月' },
  senryo: { months: [12, 1, 2], label: '実 12〜2月' },
  mimono: { months: [9, 10, 11, 12], label: '実 9〜12月（樹種による）' },
  sansho: { months: [4, 5], label: '新芽 4〜5月' },
  momiji: { months: [4, 5, 10, 11], label: '新緑 4〜5月・紅葉 10〜11月' },
  nirekeyaki: { months: [4, 5, 10, 11], label: '新緑 4〜5月・紅葉 10〜11月' },
  keyaki: { months: [4, 5, 10, 11], label: '新緑 4〜5月・紅葉 10〜11月' },
  ichou: { months: [11, 12], label: '黄葉 11〜12月' },
  buna: { months: [4, 5, 10, 11], label: '新緑 4〜5月・紅葉 10〜11月' },
}

type PeakTarget = string | { speciesKey?: string | null } | null | undefined

function keyOf(target: PeakTarget): string | null {
  if (!target) return null
  return typeof target === 'string' ? target : target.speciesKey ?? null
}

export function getPeak(target: PeakTarget): SpeciesPeak | null {
  const key = keyOf(target)
  return key ? SPECIES_PEAKS[key] ?? null : null
}

// 見頃の月（1〜12、昇順ではなく季節の順）。樹種が分からない・常緑のときは空
export function peakMonths(target: PeakTarget): number[] {
  return getPeak(target)?.months ?? []
}

// 見頃の表示（「花 2〜3月」「一年中（常緑）」など）。樹種が分からないときは null
export function peakLabel(target: PeakTarget): string | null {
  return getPeak(target)?.label ?? null
}

export function isEvergreen(target: PeakTarget): boolean {
  const peak = getPeak(target)
  return Boolean(peak && peak.months.length === 0)
}

// 日本時間の月（1〜12）
export function jstMonth(now: Date = new Date()): number {
  return new Date(now.getTime() + 9 * 3600 * 1000).getUTCMonth() + 1
}

// 日本時間の今月が見頃の月に含まれるか（常緑・樹種不明は false）
export function isInSeasonNow(target: PeakTarget, now: Date = new Date()): boolean {
  return peakMonths(target).includes(jstMonth(now))
}

export function seasonOfMonth(month: number): SeasonValue {
  return month >= 3 && month <= 5 ? 'spring' : month >= 6 && month <= 8 ? 'summer' : month >= 9 && month <= 11 ? 'autumn' : 'winter'
}

// 見頃の月から、絞り込み（?season=）に使う季節を求める
export function seasonsOfMonths(months: number[]): SeasonValue[] {
  const order: SeasonValue[] = ['spring', 'summer', 'autumn', 'winter']
  const set = new Set(months.map(seasonOfMonth))
  return order.filter(s => set.has(s))
}

// 日本時間の今の季節
export function currentSeasonJst(now: Date = new Date()): SeasonValue {
  return seasonOfMonth(jstMonth(now))
}
