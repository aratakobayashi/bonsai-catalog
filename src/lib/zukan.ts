// 盆栽の名前・樹形図鑑（/zukan）のデータ
// 樹形と、商品名によく出てくる品種名・呼び名を、一般的に知られている範囲でまとめる。
// 時期・用土・置き場所は src/content/articles の記事と食い違わないように書く
import type { CatalogProduct } from '@/lib/catalog-model'
import { normalizeText } from '@/lib/search-normalize'

export type ZukanKind = 'jukei' | 'meisho'

export interface ZukanSpecies {
  label: string
  // 楽天の商品カテゴリ（/products/category/<slug>）。ないときはリンクしない
  category?: string
}

export interface ZukanEntry {
  slug: string
  kind: ZukanKind
  name: string
  reading: string
  // 品種・名前の分類（一覧で並べる見出し）
  group?: string
  // 一言の説明
  summary: string
  // 見分け方（2〜3点）
  points: string[]
  species: ZukanSpecies[]
  // 育てるときの注意
  care: string[]
  // 関連記事（src/content/articles の slug）
  articles: string[]
  // 商品名（販売ページの元の名前）に含まれていれば、この項目の商品として出す言葉
  terms: string[]
  // 商品名から先に取り除く言葉（「軽石付き」が「石付き」に当たるのを防ぐなど）
  excludes?: string[]
  // 商品一覧の検索語（/products?q=）
  query: string
}

export const ZUKAN_GROUPS = ['もみじ', '松柏類', '桜', '梅・長寿梅', 'さつき', 'いろいろな樹に付く名前'] as const

// 樹形は鉢植えの苗（ポット苗）には当てはめない（「寄せ植えにも」のような用途の言葉で当たるため）
const JUKEI_EXCLUDES = ['ポット苗', 'ポット']

export const ZUKAN_ENTRIES: ZukanEntry[] = [
  // ---- 樹形 ----
  {
    slug: 'chokkan',
    kind: 'jukei',
    name: '直幹',
    reading: 'ちょっかん',
    summary: '幹が根元から頂上までまっすぐに立つ樹形です。根元から上へ少しずつ細くなり、どっしりと落ち着いた姿になります。',
    points: [
      '幹がほぼまっすぐ上へ伸び、頂上が根元の真上にある',
      '根元が太く、上へ行くほど少しずつ細くなる',
      '枝は下ほど長く上ほど短く、輪郭が三角形に近い',
    ],
    species: [{ label: '黒松', category: 'kuromatsu' }, { label: '五葉松', category: 'goyomatsu' }, { label: '杉' }, { label: '蝦夷松' }],
    care: [
      '頂上の芽が強く伸びやすい形です。上の枝ほどこまめに芽を摘み、下の枝が弱らないようにします。',
      'まっすぐな幹が見どころなので、植え替えのときは幹が傾かないよう、植える角度を確かめてから土を入れます。',
    ],
    articles: ['bonsai-english-terminology-guide', 'article-42', 'article-7'],
    terms: ['直幹'],
    query: '直幹',
  },
  {
    slug: 'moyogi',
    kind: 'jukei',
    name: '模様木',
    reading: 'もようぎ',
    summary: '幹が左右や前後にゆるやかに曲がりながら立ち上がる樹形です。盆栽でいちばん多く見かける形です。',
    points: [
      '幹が左右に曲がりながら上へ伸びる',
      '曲がっていても、頂上は根元のほぼ真上にくる',
      '枝は幹の曲がりの外側から出ていることが多い',
    ],
    species: [
      { label: '五葉松', category: 'goyomatsu' },
      { label: '黒松', category: 'kuromatsu' },
      { label: '真柏', category: 'shimpaku' },
      { label: 'もみじ', category: 'momiji' },
      { label: '梅', category: 'ume' },
    ],
    care: [
      '幹や枝の曲がりは針金かけで付けることが多く、樹種ごとに向いた時期があります（真柏は10〜11月と2〜3月）。',
      '太ってきた幹に針金が食い込むと跡が残ります。かけたままにせず、ときどき様子を見て外します。',
    ],
    articles: ['article-7', 'article-20', 'bonsai-english-terminology-guide'],
    terms: ['模様木', '曲付', '曲幹', '曲がり', '曲山'],
    query: '模様木',
  },
  {
    slug: 'shakan',
    kind: 'jukei',
    name: '斜幹',
    reading: 'しゃかん',
    summary: '幹が根元から一方へ斜めに傾いて立つ樹形です。斜面や風の中で育った樹の姿を表します。',
    points: [
      '幹全体が左右どちらかへ傾いている',
      '頂上が根元の真上から外れ、傾いた側にある',
      '傾きと反対側の根が強く張り、樹を支えているように見える',
    ],
    species: [{ label: '黒松', category: 'kuromatsu' }, { label: '五葉松', category: 'goyomatsu' }, { label: '真柏', category: 'shimpaku' }, { label: '梅', category: 'ume' }],
    care: [
      '植え替えのときは、傾きの角度を保ったまま根元をしっかり固定します。ぐらつくと新しい根が伸びにくくなります。',
      '幹の根元を傾きと反対寄りに植えると、枝葉が鉢の上に収まり、全体のつり合いがとりやすくなります。',
    ],
    articles: ['bonsai-english-terminology-guide', 'article-16', 'article-7'],
    terms: ['斜幹'],
    query: '斜幹',
  },
  {
    slug: 'kengai',
    kind: 'jukei',
    name: '懸崖',
    reading: 'けんがい',
    summary: '幹や枝が鉢の縁から下へ垂れ下がり、先が鉢の底より下まで下がる樹形です。崖から垂れ下がって育つ樹の姿を表します。',
    points: [
      '幹の先が鉢の縁を越えて下へ垂れている',
      '垂れた先が鉢の底より下まで下がる',
      '背の高い深い鉢（懸崖鉢）に植えることが多い',
    ],
    species: [{ label: '真柏', category: 'shimpaku' }, { label: '五葉松', category: 'goyomatsu' }, { label: '黒松', category: 'kuromatsu' }, { label: 'さつき', category: 'satsuki' }],
    care: [
      '下へ垂れた枝先は勢いが弱りやすく、上の枝ばかりが強くなりがちです。上の芽をこまめに摘み、垂れた先にも日が当たるように置きます。',
      '鉢の底より下まで枝が下がるので、高さのある台や棚の端に置き、垂れた部分が棚や地面に触れないようにします。',
      '深い鉢は底のほうが乾きにくいことがあります。表面だけでなく、鉢を持ったときの重さでも乾き具合を確かめます。',
    ],
    articles: ['bonsai-english-terminology-guide', 'article-44', 'article-6'],
    terms: ['懸崖'],
    excludes: ['半懸崖', '懸崖鉢'],
    query: '懸崖',
  },
  {
    slug: 'han-kengai',
    kind: 'jukei',
    name: '半懸崖',
    reading: 'はんけんがい',
    summary: '幹が横から斜め下へ流れ、先が鉢の縁の高さあたりまで下がる樹形です。懸崖ほど深くは垂れません。',
    points: [
      '幹が立ち上がったあと、横から斜め下へ流れる',
      '先は鉢の縁の高さあたりで止まり、鉢の底より下までは下がらない',
      '懸崖よりは浅い、やや深めの鉢に植えることが多い',
    ],
    species: [{ label: '真柏', category: 'shimpaku' }, { label: '五葉松', category: 'goyomatsu' }, { label: '黒松', category: 'kuromatsu' }, { label: 'さつき', category: 'satsuki' }],
    care: [
      '流れた先の枝が弱りやすいのは懸崖と同じです。上の枝が混んできたら芽を摘み、先の枝まで光が届くようにします。',
      '棚の端に置くと流れが見やすくなります。片側に重さがかかるので、強い風で鉢が倒れない場所を選びます。',
    ],
    articles: ['bonsai-english-terminology-guide', 'article-44', 'article-7'],
    terms: ['半懸崖'],
    query: '半懸崖',
  },
  {
    slug: 'fukinagashi',
    kind: 'jukei',
    name: '吹き流し',
    reading: 'ふきながし',
    summary: '幹も枝も同じ方向へなびく樹形です。海辺や山の上で、強い風を受け続けた樹の姿を表します。',
    points: [
      '枝がすべて片側へ流れている',
      '風上にあたる側には枝がほとんどない',
      '幹も風下の側へ傾いていることが多い',
    ],
    species: [{ label: '黒松', category: 'kuromatsu' }, { label: '真柏', category: 'shimpaku' }, { label: '五葉松', category: 'goyomatsu' }],
    care: [
      '枝の流れは針金かけで作ります。流れに逆らう向きに伸びる芽は、早めに取って形を保ちます。',
      '枝葉が片側に集まり、鉢が倒れやすい形です。風の強い日は棚の内側へ移します。',
    ],
    articles: ['bonsai-english-terminology-guide', 'article-7', 'article-10'],
    terms: ['吹き流し', '吹流し'],
    query: '吹き流し',
  },
  {
    slug: 'bunjingi',
    kind: 'jukei',
    name: '文人木',
    reading: 'ぶんじんぎ',
    summary: '細く長い幹に、少ない枝と葉を上のほうだけに残した軽やかな樹形です。文人画に描かれる樹の姿にちなむ呼び名です。',
    points: [
      '幹が細く、高さに対して枝が少ない',
      '葉は幹の上のほうに少しだけある',
      '小さめの丸い鉢や浅い鉢に植えることが多い',
    ],
    species: [{ label: '赤松', category: 'akamatsu' }, { label: '黒松', category: 'kuromatsu' }, { label: '真柏', category: 'shimpaku' }],
    care: [
      '枝が少ないので、1本枯らすだけで姿が大きく変わります。残す枝を大切にし、むやみに切らないようにします。',
      '肥料が多いと幹が太り、細さが失われます。控えめに与えます。',
      '小さな鉢は乾きやすいので、夏は水切れに気をつけます。',
    ],
    articles: ['bonsai-english-terminology-guide', 'red-pine-guide', 'article-44'],
    terms: ['文人'],
    query: '文人',
  },
  {
    slug: 'sokan',
    kind: 'jukei',
    name: '双幹',
    reading: 'そうかん',
    summary: '1つの根元から2本の幹が立つ樹形です。太く高い幹（主幹）と、細く低い幹（副幹）を組み合わせて見せます。',
    points: [
      '根元で2本に分かれている（幹の途中で枝分かれしたものとは違う）',
      '2本の幹の太さと高さに差がある',
      '2本の枝葉が重ならず、全体で1本の樹のようにまとまって見える',
    ],
    species: [{ label: '五葉松', category: 'goyomatsu' }, { label: '黒松', category: 'kuromatsu' }, { label: 'もみじ', category: 'momiji' }, { label: '桜', category: 'sakura' }],
    care: [
      '副幹の勢いが強くなると、主幹との差がなくなります。副幹の芽を早めに摘んで、高さと太さの差を保ちます。',
      '2本の間に枝が混みやすいので、内側へ向かう枝は早めに整理して日と風を通します。',
    ],
    articles: ['bonsai-english-terminology-guide', 'article-7', 'bonsai-pruning-master-guide-2025'],
    terms: ['双幹', '二本立ち', '2本立ち'],
    query: '双幹',
  },
  {
    slug: 'kabudachi',
    kind: 'jukei',
    name: '株立ち',
    reading: 'かぶだち',
    summary: '1つの根元から3本以上の幹が立つ樹形です。株元から何本も幹が立つ、山の雑木の姿を表します。',
    points: [
      '根元が1つにまとまり、そこから3本以上の幹が立つ',
      '幹ごとに太さや高さが違う',
      '幹の数は3本・5本など奇数にすることが多い',
    ],
    species: [{ label: 'もみじ', category: 'momiji' }, { label: '欅', category: 'keyaki' }, { label: '長寿梅', category: 'ume' }],
    care: [
      '根元から出る新しい芽（ひこばえ）をすべて伸ばすと幹が増えすぎます。残す幹を決め、いらない芽は元から切ります。',
      '幹どうしが混み合うと内側の枝が枯れやすくなります。内向きの枝を整理して風を通します。',
    ],
    articles: ['bonsai-english-terminology-guide', 'article-1', 'article-3'],
    terms: ['株立', '三幹', '五幹'],
    query: '株立ち',
  },
  {
    slug: 'yoseue',
    kind: 'jukei',
    name: '寄せ植え',
    reading: 'よせうえ',
    summary: '何本もの樹を1つの鉢に植えて、林や森の景色をつくる樹形です。',
    points: [
      '1つの鉢に、別々の根をもつ樹が何本も植わっている',
      '高い樹と低い樹、太い樹と細い樹を組み合わせて奥行きを出している',
      '浅く横に広い鉢に植えることが多い',
    ],
    species: [{ label: '欅', category: 'keyaki' }, { label: 'もみじ', category: 'momiji' }, { label: '五葉松', category: 'goyomatsu' }, { label: '黒松', category: 'kuromatsu' }],
    care: [
      '浅い鉢に多くの根が入るので、乾きやすく根も詰まりやすくなります。夏の水切れと、植え替えの時期に気をつけます。',
      '同じ樹種でまとめたものは管理がそろいます。違う樹種を合わせたものは、日当たりや水の好みが近いかを確かめて置き場所を決めます。',
    ],
    articles: ['bonsai-english-terminology-guide', 'elm-guide', 'bonsai-root-bound-prevention-solutions'],
    terms: ['寄せ植', '寄植'],
    query: '寄せ植え',
  },
  {
    slug: 'neagari',
    kind: 'jukei',
    name: '根上がり',
    reading: 'ねあがり',
    summary: '根が土の上に高く持ち上がり、幹を支える脚のように見える樹形です。雨や波で土が流され、根が現れた樹の姿を表します。',
    points: [
      '幹の下に、土から浮いた太い根が何本も見える',
      '根と根の間にすき間があり、その上に幹が立っている',
      '根の張り方そのものが見どころになっている',
    ],
    species: [{ label: '黒松', category: 'kuromatsu' }, { label: '五葉松', category: 'goyomatsu' }, { label: 'もみじ', category: 'momiji' }],
    care: [
      '土の上に出た根は乾きやすく、暑さや寒さの影響も受けやすくなります。夏の水切れと冬の凍結に気をつけます。',
      '植え替えのときは、出ている根を土に埋め戻さないよう、植える高さを前と同じにします。',
    ],
    articles: ['article-16', 'article-10', 'bonsai-winter-care-failure-prevention'],
    terms: ['根上', '根あがり'],
    query: '根上がり',
  },
  {
    slug: 'ishitsuki',
    kind: 'jukei',
    name: '石付き',
    reading: 'いしつき',
    summary: '石の上や石のくぼみに樹を植え、岩場に生える樹の景色をつくる樹形です。根を石に沿わせて鉢の土まで下ろすものと、石のくぼみに土を入れて植えるものがあります。',
    points: [
      '樹と一緒に石が植わっている',
      '根が石の肌に沿って下へ伸びている、または石のくぼみに根元がある',
      '浅い鉢や水盤に置かれることが多い',
    ],
    species: [{ label: '真柏', category: 'shimpaku' }, { label: '五葉松', category: 'goyomatsu' }, { label: 'もみじ', category: 'momiji' }],
    care: [
      '石の上は土が少なく、とても乾きやすい場所です。ふつうの鉢植えより水やりの回数が増えることがあります。',
      '根が石から浮いたり乾いたりすると樹が弱ります。根の上に苔を張ると、乾きをやわらげられます。',
    ],
    articles: ['chinese-penjing-vs-japanese-bonsai', 'bonsai-english-terminology-guide', 'bonsai-watering-master-guide-2025'],
    terms: ['石付'],
    excludes: ['軽石付', '敷石付', '石付・草玉'],
    query: '石付き',
  },
  {
    slug: 'hokidachi',
    kind: 'jukei',
    name: '箒立ち',
    reading: 'ほうきだち',
    summary: 'まっすぐな幹の上で枝が細かく分かれて扇のように広がり、逆さにした箒のような丸い樹冠になる樹形です。欅に多い形です。',
    points: [
      '幹がまっすぐ立ち、ある高さから枝が四方へ分かれる',
      '枝が2本ずつに分かれ、先へ行くほど細くなる',
      '葉を落とした冬に、細かい枝の広がりがよく見える',
    ],
    species: [{ label: '欅', category: 'keyaki' }],
    care: [
      '1か所から3本以上の枝が出ると、その部分だけこぶのように太ります。早めに2本に減らします。',
      '日陰に置くと枝が長く伸びて箒の形が崩れます。春から秋は日当たりと風通しのよい屋外に置きます。',
    ],
    articles: ['keyaki-guide', 'elm-guide', 'bonsai-english-terminology-guide'],
    terms: ['箒', 'ほうき立', 'ほうき作'],
    query: '箒',
  },

  // ---- 品種・名前：もみじ ----
  {
    slug: 'deshojo',
    kind: 'meisho',
    group: 'もみじ',
    name: '出猩々',
    reading: 'でしょうじょう',
    summary: '春の芽出しが鮮やかな赤になるもみじの品種です。夏は緑の葉になり、秋に再び赤から橙に色づきます。',
    points: [
      '春に開く葉が明るい赤色',
      '夏には緑の葉に変わる（初夏まで赤紫色が続く野村もみじとの違い）',
      '秋は赤から橙に色づく',
    ],
    species: [{ label: 'もみじ', category: 'momiji' }],
    care: [
      '葉は強い日差しで傷みやすいので、夏は午後の日差しを避けた場所に置きます。',
      '水を好む樹です。土の表面が乾いたら、鉢底から流れ出るまで与えます。',
    ],
    articles: ['autumn-maple-bonsai-guide', 'article-1', 'maple-varieties-guide'],
    terms: ['出猩々', '出猩猩', 'でしょうじょう'],
    query: '出猩々',
  },
  {
    slug: 'kiyohime',
    kind: 'meisho',
    group: 'もみじ',
    name: '清姫',
    reading: 'きよひめ',
    summary: '葉が小さく、枝が細かく出るもみじの品種です。小さな鉢でも形がまとまりやすく、秋は黄色から橙に色づきます。',
    points: [
      '葉がとても小さい',
      '枝が細かく分かれ、こんもりとした姿になりやすい',
      '秋の色は、赤よりも黄色から橙が中心',
    ],
    species: [{ label: 'もみじ', category: 'momiji' }],
    care: [
      '細かい枝が密に出るので、内側が混みすぎないよう枝を間引いて風を通します。',
      '小さな鉢で育てることが多く、乾きやすい樹です。夏は水切れに気をつけ、午後の日差しを避けます。',
    ],
    articles: ['autumn-maple-bonsai-guide', 'article-1', 'article-4'],
    terms: ['清姫'],
    query: '清姫',
  },
  {
    slug: 'yamamomiji',
    kind: 'meisho',
    group: 'もみじ',
    name: '山もみじ',
    reading: 'やまもみじ',
    summary: '日本の山に自生するもみじをまとめて呼ぶ名前です。盆栽ではイロハモミジやヤマモミジを種や挿し木から育てたものが多く出回っています。',
    points: [
      '春の新芽はやや赤み、夏は明るい緑、秋に赤や黄色に色づく',
      '葉が小さめで、節の間が詰まりやすい',
      '紅葉の色は樹ごとの違いが大きい',
    ],
    species: [{ label: 'もみじ', category: 'momiji' }],
    care: [
      '肥料を多くすると枝が太り、細かい枝ぶりが崩れます。ゆっくり効く固形の肥料を少なめに置きます。',
      '春と秋は日当たりと風通しのよい屋外に置き、夏は午後の日差しを避けます。',
    ],
    articles: ['maple-varieties-guide', 'article-1', 'autumn-maple-bonsai-guide'],
    terms: ['山もみじ', 'やまもみじ', '山紅葉', '山モミジ'],
    query: '山もみじ',
  },
  {
    slug: 'nomura-momiji',
    kind: 'meisho',
    group: 'もみじ',
    name: '野村もみじ',
    reading: 'のむらもみじ',
    summary: '春に開く葉が濃い赤紫色になるもみじの園芸品種です。夏にかけて赤褐色から緑がかった色に落ち着き、秋に再び赤く色づきます。',
    points: [
      '春から初夏の葉が濃い赤紫色',
      '葉は山もみじより大きめで、節の間が長い',
      '根元に接ぎ木の跡の段差が残っていることがある',
    ],
    species: [{ label: 'もみじ', category: 'momiji' }],
    care: [
      '赤い葉は日差しで傷みやすく、西日に当たると縁から茶色く焼けます。夏は午後の日差しが当たらない場所に置きます。',
      '肥料が効きすぎると葉の赤みがあせます。控えめに与えます。',
    ],
    articles: ['maple-varieties-guide', 'article-1', 'autumn-maple-bonsai-guide'],
    terms: ['野村', 'のむら'],
    query: '野村もみじ',
  },

  // ---- 品種・名前：松柏類 ----
  {
    slug: 'itoigawa-shimpaku',
    kind: 'meisho',
    group: '松柏類',
    name: '糸魚川真柏',
    reading: 'いといがわしんぱく',
    summary: '新潟県の糸魚川周辺に由来する真柏の系統です。葉がきめ細かく締まった緑色になりやすく、盆栽向きとして広く育てられています。',
    points: [
      '鱗のような細かい葉が密に茂る',
      '葉の色が締まった緑になりやすい',
      'ねじれた幹や、白くなった枯れ枝（ジン・シャリ）が見どころ',
    ],
    species: [{ label: '真柏', category: 'shimpaku' }],
    care: [
      '伸びた芽は、はさみを使わず指で摘みます。はさみで切ると切り口が茶色くなりやすいためです。',
      '針金かけは10〜11月と2〜3月が向いています。',
      '長寿梅やボケなどと近くに置くと赤星病が出ることがあるので、離して置きます。',
    ],
    articles: ['article-44', 'article-20', 'bonsai-pest-control-natural-methods'],
    terms: ['糸魚川'],
    query: '糸魚川',
  },
  {
    slug: 'yatsubusa',
    kind: 'meisho',
    group: 'いろいろな樹に付く名前',
    name: '八房',
    reading: 'やつぶさ',
    summary: '芽がたくさん出て、枝葉が細かく詰まる性質を指す言葉です。「八ツ房」「八房性」とも書き、五葉松・黒松・桜・ニレケヤキなど、いろいろな樹の名前に付きます。',
    points: [
      '葉が短く、節の間が詰まっている',
      '1か所から芽がいくつも出る',
      '同じ樹種のふつうの性質のものより、ゆっくり育つ',
    ],
    species: [{ label: '五葉松', category: 'goyomatsu' }, { label: '黒松', category: 'kuromatsu' }, { label: '桜', category: 'sakura' }, { label: 'ニレケヤキ', category: 'keyaki' }],
    care: [
      '芽が多く出るぶん枝が混みやすいので、混み合ったところの芽を間引いて内側に日を入れます。',
      '大きく育つまでに時間がかかります。樹を太らせるより、今の形を保ちながら楽しむのに向いています。',
    ],
    articles: ['article-42', 'article-6', 'bonsai-pruning-master-guide-2025'],
    terms: ['八房', '八ツ房', '八ッ房'],
    query: '八房',
  },
  {
    slug: 'senjumaru',
    kind: 'meisho',
    group: '松柏類',
    name: '千寿丸',
    reading: 'せんじゅまる',
    summary: '葉が短い八房性の黒松として出回る品種名です。売り場では「寿」「寿黒松」と書かれていることもあります。',
    points: [
      'ふつうの黒松より葉が短く、色が濃い',
      '芽が多く、枝葉が密に茂る',
      '葉は黒松と同じ2本1組',
    ],
    species: [{ label: '黒松', category: 'kuromatsu' }],
    care: [
      '黒松と同じく、一年を通して日当たりと風通しのよい屋外で育てます。日が足りないと葉が間延びします。',
      '芽が混みやすいので、春のみどり摘みで芽の数と勢いをそろえます。',
    ],
    articles: ['article-10', 'article-42'],
    terms: ['千寿丸', '寿黒松', '黒松「寿」'],
    query: '千寿丸',
  },
  {
    slug: 'nishikimatsu',
    kind: 'meisho',
    group: '松柏類',
    name: '錦松',
    reading: 'にしきまつ',
    summary: '黒松の変わりもので、幹の樹皮が厚く盛り上がり、ごつごつと割れる性質をもちます。「錦黒松」とも呼ばれます。',
    points: [
      '若い樹のうちから、幹肌がコルクのように厚く荒れる',
      '葉は黒松と同じ2本1組',
      '樹皮の荒れ方そのものが見どころ',
    ],
    species: [{ label: '黒松', category: 'kuromatsu' }],
    care: [
      '厚い樹皮ははがれやすいので、針金かけや植え替えのときに幹を強く握ったりこすったりしないようにします。',
      '置き場所と水やりは黒松と同じです。日当たりのよい屋外で、乾いたらたっぷり与えます。',
    ],
    articles: ['article-10', 'article-42'],
    terms: ['錦松', '錦黒松'],
    query: '錦松',
  },
  {
    slug: 'miyajima-nasu',
    kind: 'meisho',
    group: '松柏類',
    name: '宮島・那須（五葉松）',
    reading: 'みやじま・なす',
    summary: '五葉松の名前の前に付く「宮島」「那須」は、もとになった産地にちなむ系統の呼び名です。宮島は広島県、那須は栃木県の地名です。',
    points: [
      '「宮島五葉松」「那須五葉松」のように、五葉松の前に付く',
      '同じ呼び名でも、葉の長さや色は樹ごとに違う',
      '黒松の台木に接いで増やしたものが多く、根元に接ぎ口が見えることがある',
    ],
    species: [{ label: '五葉松', category: 'goyomatsu' }],
    care: [
      '五葉松は過湿を嫌います。土が乾いてから水を与え、夏は午後の強い日差しを避けます（午前は日なた）。',
      '接ぎ木の樹は、接ぎ口より下の台木から出る芽を早めに取ります。',
    ],
    articles: ['article-6', 'article-42', 'biotechnology-genetic-optimization-guide'],
    terms: ['宮島', '那須'],
    query: '五葉松',
  },

  // ---- 品種・名前：桜 ----
  {
    slug: 'asahiyama',
    kind: 'meisho',
    group: '桜',
    name: '旭山桜',
    reading: 'あさひやまざくら',
    summary: '淡い紅色の八重咲きで、樹が小さいうちから花をつけやすい桜です。樹が大きくなりにくく、小さな鉢に向いています。',
    points: [
      '花が八重咲きで淡い紅色',
      '小さな樹でもつぼみがつく',
      '「一才桜」の名前で並んでいることもある',
    ],
    species: [{ label: '桜', category: 'sakura' }],
    care: [
      '花芽は夏にでき、冬の寒さに当たって春に咲きます。冬も屋外に置きます。',
      '剪定は花が終わった直後に行います。夏より後に切ると、翌年の花芽を落としてしまいます。',
    ],
    articles: ['sakura-general-guide', 'article-39', 'issai-sakura-guide'],
    terms: ['旭山'],
    query: '旭山',
  },
  {
    slug: 'issai-zakura',
    kind: 'meisho',
    group: '桜',
    name: '一才桜',
    reading: 'いっさいざくら',
    summary: '苗木のうちから花をつけやすい桜をまとめて呼ぶ流通名で、品種名ではありません。旭山桜や富士桜（マメザクラ）の仲間がこの名前で並んでいることがあります。',
    points: [
      '小さな鉢でも春に花を咲かせる',
      '八重で淡い紅色なら旭山桜、一重の小さな花が下向きに咲くなら富士桜の仲間であることが多い',
    ],
    species: [{ label: '桜', category: 'sakura' }],
    care: [
      '剪定は花が終わった直後の4月ごろに、伸ばしたい枝を葉芽の少し上で切ります。',
      '来年の花芽は7〜8月にできます。この時期に水を切らすと、翌春の花が減ります。',
    ],
    articles: ['issai-sakura-guide', 'sakura-general-guide', 'article-39'],
    terms: ['一才桜', '1才桜', '一才さくら', '一才ざくら', '一才サクラ'],
    query: '一才桜',
  },
  {
    slug: 'fujizakura',
    kind: 'meisho',
    group: '桜',
    name: '富士桜',
    reading: 'ふじざくら',
    summary: 'マメザクラの別名です。一重の小さな花がうつむき加減に咲き、枝が細かいので小品盆栽に仕立てやすい桜です。',
    points: [
      '花は小ぶりの一重で、下向きに咲く',
      '枝が細かく出る',
      '「富士桜」のあとに、八重咲きや枝垂れなどの品種名が付いていることもある',
    ],
    species: [{ label: '桜', category: 'sakura' }],
    care: [
      '花芽は夏にできます。夏の水切れに気をつけ、剪定は花が終わった直後に済ませます。',
      '冬の寒さに当たることで花が咲くので、冬も屋外で管理します。',
    ],
    articles: ['sakura-general-guide', 'article-39', 'issai-sakura-guide'],
    terms: ['富士桜', 'マメザクラ', '豆桜', 'フジザクラ'],
    query: '富士桜',
  },
  {
    slug: 'shidare',
    kind: 'meisho',
    group: 'いろいろな樹に付く名前',
    name: '枝垂れ',
    reading: 'しだれ',
    summary: '枝が下へ垂れ下がる性質をもつ樹の名前に付く言葉です。盆栽では枝垂れ桜やしだれ梅、しだれもみじなどがあります。',
    points: [
      '枝が幹の上から弧を描いて垂れる',
      '樹の高さは、芯にする枝を立てて作っている',
    ],
    species: [{ label: '桜', category: 'sakura' }, { label: '梅', category: 'ume' }, { label: 'もみじ', category: 'momiji' }],
    care: [
      '垂れる枝は放っておくと高さが出ません。芯にする枝を支柱などで立てて、高さを作ります。',
      '花ものは、花が終わった直後に剪定します。',
    ],
    articles: ['weeping-cherry-bonsai-guide', 'article-43', 'sakura-general-guide'],
    terms: ['枝垂', 'しだれ', 'シダレ'],
    query: 'しだれ',
  },

  // ---- 品種・名前：梅・長寿梅 ----
  {
    slug: 'chojubai',
    kind: 'meisho',
    group: '梅・長寿梅',
    name: '長寿梅',
    reading: 'ちょうじゅばい',
    summary: '名前に梅とつきますが、ボケ（木瓜）の仲間の小型の品種です。春を中心に朱赤色の花を咲かせ、秋にも返り咲きます。',
    points: [
      '葉が小さく、枝が細かく分かれる',
      '花は朱赤色が基本で、白い花の「白長寿梅」もある',
      '幹は年数とともにごつごつとした味わいが出る',
    ],
    species: [{ label: '長寿梅', category: 'ume' }],
    care: [
      '赤星病を防ぐため、真柏などビャクシン類とは離して置きます。',
      '根元から出るひこばえは、早めに元から切ります。',
      '剪定は花後の5〜6月が中心です。冬は軽く整える程度にします。',
    ],
    articles: ['article-3', 'article-43'],
    terms: ['長寿梅'],
    query: '長寿梅',
  },
  {
    slug: 'kobai-hakubai',
    kind: 'meisho',
    group: '梅・長寿梅',
    name: '紅梅・白梅',
    reading: 'こうばい・はくばい',
    summary: '梅を花の色で呼び分けた言葉で、品種名ではありません。紅色から淡い紅色の花を紅梅、白い花を白梅と呼びます。',
    points: [
      '名前は花の色を表す。品種名は別に付いていることが多い',
      '梅は野梅系・緋梅系・豊後系の3つの系統に分けられ、紅色の花が多いのは緋梅系',
      '丸くふくらんだ花芽が多い株ほど、その年の花を楽しめる',
    ],
    species: [{ label: '梅', category: 'ume' }],
    care: [
      '冬の寒さに当たることで花芽がそろいます。冬も屋外に置き、つぼみがふくらんだら寒風の当たらない日なたへ移します。',
      '剪定と植え替えは、花が終わった直後に行います。',
    ],
    articles: ['article-43', 'article-13'],
    terms: ['紅梅', '白梅'],
    query: '梅',
  },
  {
    slug: 'tojibai',
    kind: 'meisho',
    group: '梅・長寿梅',
    name: '冬至梅',
    reading: 'とうじばい',
    summary: '梅のなかでも早く咲く、白い一重の花の品種です。野梅系に入ります。',
    points: [
      '白い一重の花で、梅のなかでは早く咲く',
      '野梅系で、枝が細かく出て香りがよい',
      '「紅冬至」は紅色の花の別の品種',
    ],
    species: [{ label: '梅', category: 'ume' }],
    care: [
      '室内に飾るのは花の時期の数日にとどめ、ふだんは屋外の日なたで育てます。',
      '花が終わったらすぐに剪定します。夏の管理が翌年の花の量を決めるので、夏の水切れに気をつけます。',
    ],
    articles: ['article-43', 'article-13'],
    terms: ['冬至'],
    query: '冬至梅',
  },

  // ---- 品種・名前：さつき ----
  {
    slug: 'satsuki',
    kind: 'meisho',
    group: 'さつき',
    name: 'さつき（皐月）',
    reading: 'さつき',
    summary: '5月下旬から6月に咲くツツジの仲間です。花の色や模様の違う品種がとても多く、1本の樹に色の違う花が咲き分けるものもあります。',
    points: [
      'ツツジより花が遅く、5月下旬〜6月に咲く',
      '葉が小さく、やや硬い',
      '品種ごとに花の色・模様・咲き方が違う',
    ],
    species: [{ label: 'さつき', category: 'satsuki' }],
    care: [
      '酸性の土を好むので、鹿沼土を主体に植えます。',
      '花が終わったらすぐに剪定します。夏には翌年の花芽ができ始めます。',
      '植え替えは3月か花が終わった直後に、2〜3年に1回が目安です。',
    ],
    articles: ['article-49', 'azalea-guide'],
    terms: ['さつき', '皐月'],
    excludes: ['さつき鉢', '皐月鉢'],
    query: 'さつき',
  },
]

export function getZukanEntry(slug: string): ZukanEntry | undefined {
  return ZUKAN_ENTRIES.find(entry => entry.slug === slug)
}

export const JUKEI_ENTRIES = ZUKAN_ENTRIES.filter(entry => entry.kind === 'jukei')
export const MEISHO_ENTRIES = ZUKAN_ENTRIES.filter(entry => entry.kind === 'meisho')

// 樹形のシルエット（public/images/zukan/<slug>.svg）
export function zukanImage(entry: ZukanEntry): string | undefined {
  return entry.kind === 'jukei' ? `/images/zukan/${entry.slug}.svg` : undefined
}

export function zukanProductsHref(entry: ZukanEntry): string {
  return `/products?q=${encodeURIComponent(entry.query)}`
}

// 商品名にこの項目の言葉が入っている盆栽（鉢・道具などは除く）
export function matchZukanProducts(entry: ZukanEntry, products: CatalogProduct[]): CatalogProduct[] {
  const terms = entry.terms.map(normalizeText)
  const excludes = [...(entry.excludes ?? []), ...(entry.kind === 'jukei' ? JUKEI_EXCLUDES : [])].map(normalizeText)
  return products.filter(product => {
    if (product.productType !== 'tree') return false
    let name = normalizeText(product.originalName)
    if (entry.kind === 'jukei' && excludes.some(word => JUKEI_EXCLUDES.map(normalizeText).includes(word) && name.includes(word))) return false
    for (const word of excludes) name = name.split(word).join(' ')
    return terms.some(term => name.includes(term))
  })
}
