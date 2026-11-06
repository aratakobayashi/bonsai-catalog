// 「室内で育てられる？」樹種ごとの早見表（/shitsunai）。内容は記事（article-25・indoor-bonsai-winter-care）の説明にそろえる
// kind：indoor＝室内で通年育てられる、winter＝屋外で育て、寒い地域では冬だけ室内へ、display＝屋外で育て、部屋に飾るのは数日まで

export type IndoorKind = 'indoor' | 'winter' | 'display'

export interface IndoorEntry {
  key: string
  label: string
  // 商品の一覧（/products/category/〇〇）。なければ商品の検索
  category?: string
  kind: IndoorKind
  // 室内に置ける目安（短い言葉）
  stay: string
  winter: string
  light: string
  note?: string
}

export const INDOOR_KINDS: { kind: IndoorKind; label: string; short: string; lead: string }[] = [
  { kind: 'indoor', label: '室内で育てられる', short: '室内OK', lead: '寒さに弱い暖かい地域の樹。明るい窓辺で一年中育てられます。春〜秋は屋外の明るい日陰に出すと、葉が締まり丈夫になります。' },
  { kind: 'winter', label: '冬は室内も', short: '冬は室内も', lead: '屋外で育てる樹ですが、寒さが厳しい地域では、冬だけ暖房の効いていない明るい部屋に取り込みます。' },
  { kind: 'display', label: '屋外で育て、飾るのは数日', short: '飾るのは数日', lead: '日光と季節の寒暖が必要な樹。屋外で育て、部屋に飾るのは2〜3日までにします。冬に暖かい部屋に長く置くと、休んでいる樹が芽を動かしてしまいます。' },
]

const OUT_WINTER = '屋外（凍結・寒風を避けて軒下などへ）'

export const INDOOR_GUIDE: IndoorEntry[] = [
  { key: 'gajumaru', label: 'ガジュマル', category: 'gajumaru', kind: 'indoor', stay: '一年中', winter: '5℃を下回らない明るい室内', light: 'レースカーテン越しの明るい窓辺', note: '夜の窓際は冷えるので、冬は窓から少し離す' },
  { key: 'ficus', label: 'フィカス（ベンジャミンなど）', kind: 'indoor', stay: '一年中', winter: '5℃を下回らない明るい室内', light: 'レースカーテン越しの明るい窓辺', note: '置き場所を急に変えると葉を落としやすい' },
  { key: 'olive', label: 'オリーブ', category: 'olive', kind: 'winter', stay: '数日（寒冷地は冬の間）', winter: '多くの地域は軒下。寒冷地は暖房のない明るい部屋', light: '屋外の日なた', note: '日光が足りないと枝が間のびしやすい' },
  { key: 'goyomatsu', label: '五葉松', category: 'goyomatsu', kind: 'display', stay: '2〜3日まで', winter: OUT_WINTER, light: '屋外の日なた・風通しのよい場所' },
  { key: 'kuromatsu', label: '黒松', category: 'kuromatsu', kind: 'display', stay: '2〜3日まで', winter: OUT_WINTER, light: '屋外の日なた' },
  { key: 'akamatsu', label: '赤松', category: 'akamatsu', kind: 'display', stay: '2〜3日まで', winter: OUT_WINTER, light: '屋外の日なた' },
  { key: 'shimpaku', label: '真柏', category: 'shimpaku', kind: 'display', stay: '2〜3日まで', winter: OUT_WINTER, light: '屋外の日なた・風通しのよい場所', note: '室内に長く置くと、とがった葉（杉葉）が出やすい' },
  { key: 'momiji', label: 'もみじ・楓', category: 'momiji', kind: 'display', stay: '2〜3日まで', winter: OUT_WINTER, light: '屋外。夏は午後の日差しを避ける', note: '紅葉は屋外の寒さに当たって色づく' },
  { key: 'keyaki', label: '欅（けやき）', category: 'keyaki', kind: 'display', stay: '2〜3日まで', winter: OUT_WINTER, light: '屋外の日なた' },
  { key: 'nirekeyaki', label: 'ニレケヤキ', kind: 'display', stay: '2〜3日まで', winter: OUT_WINTER, light: '屋外の日なた' },
  { key: 'sansho', label: '山椒', category: 'sansho', kind: 'display', stay: '2〜3日まで', winter: OUT_WINTER, light: '屋外。夏は半日陰' },
  { key: 'chojubai', label: '長寿梅', category: 'ume', kind: 'display', stay: '花の時期に2〜3日', winter: OUT_WINTER, light: '屋外の日なた' },
  { key: 'ume', label: '梅', category: 'ume', kind: 'display', stay: '花の時期に2〜3日', winter: '屋外（冬の寒さで花芽が育つ）', light: '屋外の日なた' },
  { key: 'sakura', label: '桜', category: 'sakura', kind: 'display', stay: '花の時期に2〜3日', winter: '屋外（冬の寒さで花芽が育つ）', light: '屋外の日なた' },
  { key: 'satsuki', label: 'さつき', category: 'satsuki', kind: 'display', stay: '花の時期に2〜3日', winter: OUT_WINTER, light: '屋外。夏は半日陰' },
  { key: 'tsubaki', label: '椿・寒椿', kind: 'display', stay: '花の時期に2〜3日', winter: OUT_WINTER, light: '屋外の半日陰' },
  { key: 'himeringo', label: '姫りんご', category: 'himeringo', kind: 'display', stay: '実の時期に2〜3日', winter: '屋外（冬の寒さで花芽が育つ）', light: '屋外の日なた' },
  { key: 'nanten', label: '南天', category: 'nanten', kind: 'display', stay: '2〜3日まで', winter: OUT_WINTER, light: '屋外の日なた〜半日陰' },
  { key: 'kokedama', label: '苔玉', category: 'kokedama', kind: 'display', stay: '植えた樹による', winter: '植えた樹の性質に合わせる', light: '明るい場所。苔は乾燥に弱い', note: 'ガジュマルなどの苔玉は室内で育てられる。松・もみじなどの苔玉は屋外で' },
]

export const indoorEntriesOf = (kind: IndoorKind) => INDOOR_GUIDE.filter(e => e.kind === kind)
export const indoorEntryOfCategory = (slug: string) => INDOOR_GUIDE.find(e => e.category === slug)
