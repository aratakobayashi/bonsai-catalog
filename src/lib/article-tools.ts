// 記事から、内容に合う「選ぶ・育てる」の道具（症状・図鑑・今月の手入れ・贈り物ナビなど）への案内を決める
import { SHOJO } from '@/lib/shojo'
import { ZUKAN_ENTRIES } from '@/lib/zukan'
import { getCareGroup, groupOf } from '@/lib/care-calendar'

export interface ArticleToolLink {
  href: string
  // 本文中のカードの小見出し（道具の名前）
  label: string
  title: string
  note: string
  // 本文の途中にカードとして出してよい、話題がはっきり合う案内か
  strong: boolean
}

// 記事 slug → その記事を参考に挙げている項目（先に挙げているものほど近い）
// maxRank：参考記事の何番目までを「その話題の記事」とみなすか（後ろのほうは補足の記事なので外す）
function reverseIndex<T extends { slug: string; articles: string[] }>(items: T[], maxRank: number): Map<string, T[]> {
  const map = new Map<string, { item: T; rank: number }[]>()
  for (const item of items) {
    item.articles.slice(0, maxRank + 1).forEach((slug, rank) => {
      map.set(slug, [...(map.get(slug) ?? []), { item, rank }])
    })
  }
  return new Map([...map].map(([slug, list]) => [slug, list.sort((a, b) => a.rank - b.rank).map(x => x.item)]))
}
const SHOJO_BY_ARTICLE = reverseIndex(SHOJO, 2)
const ZUKAN_BY_ARTICLE = reverseIndex(ZUKAN_ENTRIES, 1)

const has = (re: RegExp, text: string) => re.test(text)

export function articleToolLinks({ slug, title, speciesSlug, month }: { slug: string; title: string; speciesSlug: string | null; month: number }): ArticleToolLink[] {
  const links: ArticleToolLink[] = []
  const push = (link: ArticleToolLink) => {
    const base = link.href.split(/[?#]/)[0].split('/')[1]
    if (!links.some(l => l.href.split(/[?#]/)[0].split('/')[1] === base)) links.push(link)
  }
  const group = groupOf(speciesSlug)
  const calendar = has(/[0-9０-９一二三四五六七八九十]+月|月別|カレンダー|年間|季節ごと|季節の手入れ|四季/, title)
  const teireLink = () => {
    if (!(has(/[0-9０-９一二三四五六七八九十]+月|季節|冬|夏|春|秋|梅雨|カレンダー|年間|剪定|芽摘み|針金|肥料|水やり/, title) || group)) return
    const careGroup = group ? getCareGroup(group) : null
    push({
      href: `/teire/${month}${careGroup ? `#group-${careGroup.key}` : ''}`,
      label: '今月の手入れ',
      title: careGroup ? `${month}月の${careGroup.label}の手入れ` : `${month}月の盆栽の手入れ`,
      note: '水やりの目安・置き場所・肥料と、今月の作業',
      strong: calendar,
    })
  }
  if (calendar) teireLink()

  // 症状：この記事を参考にしている症状のページ（なければ話題から一覧へ）
  const shojo = SHOJO_BY_ARTICLE.get(slug)
  if (shojo?.length) {
    const s = shojo[0]
    push({ href: `/shojo/${s.slug}`, label: '症状から調べる', title: s.title, note: '考えられる原因と、今すぐやること・様子を見ること', strong: true })
  } else if (has(/枯れ|黄色|病気|害虫|虫|弱っ|根腐れ|しおれ|復活|トラブル|失敗/, title)) {
    push({ href: '/shojo', label: '症状から調べる', title: '盆栽の調子が悪いときは、症状から原因を調べる', note: '葉が黄色い・しおれる・虫がついたなど12の症状', strong: true })
  }

  // 贈り物
  if (has(/贈|ギフト|プレゼント|敬老|父の日|母の日|お祝い|祝い|お歳暮|開店|還暦|長寿(?!梅)/, title)) {
    push({ href: '/okurimono', label: '贈り物ナビ', title: '誰に・どんな場面で・予算から、贈る盆栽を3鉢に絞る', note: '敬老の日・誕生日・開店祝いなど10の場面', strong: true })
  }

  // 名前・樹形：この記事を参考にしている図鑑の項目（多くの項目で挙げている用語の記事は一覧へ）
  const zukan = ZUKAN_BY_ARTICLE.get(slug)
  if (zukan?.length && zukan.length <= 3) {
    const z = zukan[0]
    push({ href: `/zukan/${z.slug}`, label: '名前・樹形図鑑', title: `「${z.name}」とは`, note: z.summary, strong: true })
  } else if (zukan?.length || has(/樹形|品種|種類|名前|用語|英語/, title)) {
    push({ href: '/zukan', label: '名前・樹形図鑑', title: '懸崖・文人木・出猩々など、盆栽の名前と樹形の意味', note: '図と、その樹形の掲載商品', strong: true })
  }

  // はじめて
  if (has(/初心者|はじめて|初めて|始め|入門|届いた|購入|通販|買い方|選び方/, title)) {
    push({ href: '/hajimete', label: 'はじめての1か月', title: '盆栽が届いた日から1か月の世話を、チェックしながら進める', note: '置き場所・水やり・植え替えを急がないことなど', strong: true })
  }

  // 季節・月の作業（月・年間の作業の記事でなければ、ここで）
  if (!calendar) teireLink()

  // 鉢・土・道具
  if (has(/植え替え|用土|土|鉢|道具|はさみ|鋏|針金/, title)) {
    push({ href: '/soroeru', label: '鉢・土・道具をそろえる', title: '樹の大きさに合う鉢の号数・土の配合・道具の目安', note: '掲載中の商品もまとめて表示', strong: false })
  }

  // 自分で組み合わせる
  if (has(/鉢|苔|化粧砂|寄せ植え|ミニ盆栽|インテリア|飾り/, title)) {
    push({ href: '/kumiawase', label: '組み合わせで選ぶ', title: '樹・鉢・仕上げを選んで、植え付け済みの一鉢を探す', note: '完成の絵を見ながら選べます', strong: false })
  }

  // 育てている樹の記録
  if (group && speciesSlug) {
    push({ href: `/note?add=${speciesSlug}`, label: 'わたしの盆栽ノート', title: '育てている樹を登録して、今月やることを確かめる', note: '記録はこのブラウザの中だけに保存されます', strong: false })
  }

  // 足りないときは、はじめての方向けの2つで埋める
  push({ href: '/hajimete', label: 'はじめての1か月', title: '盆栽が届いた日から1か月の世話を、チェックしながら進める', note: '置き場所・水やり・植え替えを急がないことなど', strong: false })
  push({ href: `/teire/${month}`, label: '今月の手入れ', title: `${month}月の盆栽の手入れ`, note: '水やりの目安・置き場所・肥料と、今月の作業', strong: false })
  return links.slice(0, 3)
}

const escapeHtml = (s: string) => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] as string)

// 本文の2つ目の大見出しの前に、案内のカードを1つ入れる（大見出しが2つ未満の記事には入れない）
export function insertToolCard(html: string, link: ArticleToolLink | undefined): string {
  if (!link?.strong) return html
  const positions = [...html.matchAll(/<h2[\s>]/g)].map(m => m.index ?? -1).filter(i => i >= 0)
  if (positions.length < 3) return html
  const card = `<a class="article-card article-card-text article-card-tool" href="${escapeHtml(link.href)}"><span class="article-card-body"><span class="article-card-label">${escapeHtml(link.label)}</span><span class="article-card-title">${escapeHtml(link.title)}</span><span class="article-card-more">${escapeHtml(link.note)}&nbsp;›</span></span></a>`
  const at = positions[1]
  return html.slice(0, at) + card + html.slice(at)
}
