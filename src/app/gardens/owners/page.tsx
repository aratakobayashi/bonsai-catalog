import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { SITE_URL } from '@/lib/site'
import { getGardenList } from '@/lib/gardens-list'
import { buildTaikenPlaces } from '@/lib/taiken'
import { gardenShop } from '@/lib/garden-shops'
import { BONSAI_SHOPS } from '@/lib/bonsai-shops'
import { BreadcrumbStructuredData } from '@/components/seo/StructuredData'

// 盆栽園・盆栽店さま向け 掲載のご案内（/gardens/owners）
// 一般向けのヘッダー・フッターは出さず（ForLocale.tsx の isBizPath）、このページ専用のものを置く。
// 第1段階：掲載は無料。園ごとの送客の数（園のページの表示・公式サイトや通販への移動）をためてから、料金の相談をする
const PATH = '/gardens/owners'
const APPLY = '/contact?type=garden'
const WRAP = 'mx-auto w-full max-w-[1184px] px-4 lg:px-12'

export const metadata: Metadata = {
  alternates: { canonical: PATH },
  title: '盆栽園・盆栽店さま向け 掲載のご案内（掲載無料） - 盆栽コレクション',
  description: '盆栽コレクションは、全国の盆栽園を地域・体験教室・通販から探せるサイトです。盆栽園・盆栽店さまの掲載は無料です。体験・教室の料金や日程、通販サイト、写真と紹介文を掲載でき、園のページの表示回数や公式サイトへの送客数をご報告します。',
}

const FAQ = [
  { q: '本当に無料ですか？', a: '無料です。掲載料・登録料・送客の手数料はいただきません。当サイトは商品リンクの広告収入で運営しています。' },
  { q: 'なぜ無料なのですか？', a: '始めたばかりで、送客の実績をまだお見せできないためです。実績が出てから、改めてご相談します。そのときお断りいただいても、無料の掲載はそのまま続けます。' },
  { q: 'お客様は、どれくらい来ますか？', a: 'いまはお約束できません。そのぶん無料でお願いしています。貴園のページの表示回数と、公式サイト・通販・電話・地図へ進んだ回数は、ご希望に応じてご報告します。' },
  { q: '当サイトが、予約や販売の間に入りますか？', a: '入りません。体験の予約・通販のご注文・お問い合わせは、貴園の公式サイトや電話にそのまま移ります。' },
  { q: 'ホームページや通販サイトがなくても掲載できますか？', a: 'できます。営業時間・見学の可否・体験の内容などをメールでお知らせいただければ、当方でページにまとめます。' },
  { q: 'まだ掲載されていない園でも申し込めますか？', a: '申し込めます。実在と所在地を確かめたうえで掲載します。' },
  { q: '掲載の順番は、どう決まりますか？', a: '地域（北から南）と園名の順です。掲載順・おすすめ・評価を、お金で変える枠は作っていません。将来、有料の掲載を始める場合も「PR」と明記し、無料の掲載内容は減らしません。' },
  { q: '写真は、どのように載りますか？', a: '写真をご提供いただいた場合は、その写真に差し替えて載せます。クレジットの表記や使ってよい範囲は、ご希望に合わせます。いま載っている写真の取り下げも承ります。' },
  { q: '掲載をやめたいときは？', a: 'お問い合わせからご連絡ください。確認でき次第、ページを下げます。' },
]

function SectionHead({ no, label, title, lead }: { no: string; label: string; title: ReactNode; lead?: ReactNode }) {
  return (
    <div className="max-w-[760px]">
      <p className="flex items-center gap-3 text-[12px] tracking-[0.2em] text-gold-dark">
        <span className="h-px w-10 bg-gold-dark" aria-hidden="true" />
        <span className="font-mincho">{no}</span>
        <span>{label}</span>
      </p>
      <h2 className="mt-4 font-mincho text-[26px] font-bold leading-[1.5] tracking-[0.06em] text-ink lg:text-[36px]">{title}</h2>
      {lead && <p className="mt-4 text-[14.5px] leading-[1.95] text-ink-soft lg:text-[15.5px]">{lead}</p>}
    </div>
  )
}

// 画面の見本を入れる枠（ブラウザ風）
function Frame({ path, children, className = '' }: { path: string; children: ReactNode; className?: string }) {
  return (
    <div className={`overflow-hidden rounded-[10px] border border-line bg-white shadow-[0_24px_60px_-28px_rgba(34,32,28,.45)] ${className}`}>
      <div className="flex items-center gap-2 border-b border-line bg-paper-deep px-3 py-2">
        <span className="flex gap-1" aria-hidden="true">{[0, 1, 2].map(i => <span key={i} className="h-2 w-2 rounded-full bg-ink-muted/30" />)}</span>
        <span className="truncate rounded bg-white px-2.5 py-0.5 text-[10.5px] text-ink-muted">bonsai-collection.com{path}</span>
      </div>
      {children}
    </div>
  )
}

function CtaButton({ children = 'まずは相談する（無料）', className = '', dark = true }: { children?: ReactNode; className?: string; dark?: boolean }) {
  return (
    <Link href={APPLY} className={`inline-flex min-h-[56px] items-center gap-3 rounded-full px-8 text-[15px] font-bold tracking-[0.05em] ${dark ? 'bg-ink text-white hover:bg-ink/85' : 'bg-white text-ink hover:bg-white/85'} ${className}`}>
      {children}<span aria-hidden="true">→</span>
    </Link>
  )
}

// 見本：盆栽園のページ
function GardenPageSample() {
  return (
    <Frame path="/gardens/…" className="w-full">
      <div className="relative h-[140px] lg:h-[170px]">
        <Image src="/images/articles/photos/article-12-1.jpg" alt="" fill sizes="(max-width: 1023px) 92vw, 560px" className="object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(34,32,28,.85),rgba(34,32,28,.1))]" />
        <div className="absolute bottom-3 left-4 text-white">
          <p className="text-[10.5px] text-white/75">埼玉県さいたま市</p>
          <p className="font-mincho text-[19px] font-bold">見本盆栽園</p>
        </div>
      </div>
      <div className="space-y-3 p-4 text-[12px]">
        <p className="inline-flex items-center gap-1.5 border border-gold-dark/40 bg-gold/10 px-2 py-0.5 text-[11px] text-gold-dark">✓ 2026年12月に園の方に確認済み</p>
        <dl className="divide-y divide-line border-y border-line">
          {[['営業時間', '9:00〜17:00（木曜定休）'], ['見学', '自由（無料）'], ['体験', '1回の体験 4,400円・約90分・持ち帰りあり'], ['通販', '自社の通販サイト']].map(([k, v]) => (
            <div key={k} className="grid grid-cols-[64px_1fr] gap-2 py-2"><dt className="text-ink-muted">{k}</dt><dd className="text-ink">{v}</dd></div>
          ))}
        </dl>
        <div className="grid grid-cols-2 gap-2">
          <span className="flex h-9 items-center justify-center bg-ink text-[11.5px] font-bold text-white">公式サイト ↗</span>
          <span className="flex h-9 items-center justify-center border border-ink text-[11.5px] font-bold text-ink">通販サイト ↗</span>
        </div>
      </div>
    </Frame>
  )
}

// 見本：体験・教室のページ
function TaikenSample() {
  return (
    <Frame path="/taiken" className="w-full">
      <div className="p-4 lg:p-5">
        <div className="flex flex-wrap gap-1.5 text-[11px]">
          {['関東', '1回の体験', '苔玉づくり', '持ち帰り'].map((t, i) => <span key={t} className={`px-2 py-0.5 ${i < 2 ? 'bg-ink text-white' : 'border border-line text-ink-soft'}`}>{t}</span>)}
        </div>
        <div className="mt-4 border border-line">
          <div className="flex items-baseline justify-between gap-3 border-b border-line px-4 py-3">
            <p className="font-mincho text-[16px] font-bold text-ink">見本盆栽園</p>
            <p className="text-[11px] text-ink-muted">埼玉県さいたま市</p>
          </div>
          <dl className="space-y-1 px-4 py-3 text-[12px]">
            <div className="flex gap-3"><dt className="w-10 text-ink-muted">料金</dt><dd className="font-bold text-ink">4,400円（税込・鉢と材料込み）</dd></div>
            <div className="flex gap-3"><dt className="w-10 text-ink-muted">時間</dt><dd className="text-ink">約90分</dd></div>
            <div className="flex gap-3"><dt className="w-10 text-ink-muted">日程</dt><dd className="text-ink">毎週土・日 10:00 / 14:00</dd></div>
          </dl>
          <div className="flex gap-4 border-t border-line px-4 py-2.5 text-[12px] text-ink underline decoration-line underline-offset-4"><span>予約ページ ↗</span><span>所在地・地図</span></div>
        </div>
      </div>
    </Frame>
  )
}

// 見本：ご報告
function ReportSample() {
  const bars = [38, 44, 41, 52, 60, 57, 66, 71, 64, 78, 83, 90]
  return (
    <Frame path=" ご報告（見本）" className="w-full">
      <div className="p-4 lg:p-6">
        <p className="text-[11px] text-ink-muted">見本盆栽園さま　2026年10月〜12月のご報告</p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {[['園のページの表示', '1,284', '+18%'], ['公式サイト・通販へ', '146', '+24%'], ['電話・地図', '39', '+9%']].map(([k, v, d]) => (
            <div key={k} className="border border-line px-3 py-2.5">
              <p className="text-[10.5px] leading-tight text-ink-muted">{k}</p>
              <p className="mt-1 font-mincho text-[20px] font-bold text-ink lg:text-[24px]">{v}</p>
              <p className="text-[10.5px] text-[#2f7d4f]">前の3か月より {d}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex h-[90px] items-end gap-1.5 border-b border-line" aria-hidden="true">
          {bars.map((h, i) => <span key={i} className="flex-1 bg-gold/70" style={{ height: `${h}%` }} />)}
        </div>
        <p className="mt-2 text-[10.5px] text-ink-muted">週ごとの、園のページの表示回数</p>
        <div className="mt-4 text-[11.5px]">
          <p className="text-ink-muted">どこから見られたか</p>
          {[['盆栽体験・盆栽教室を探す', 41], ['盆栽園の一覧（地域から）', 33], ['検索', 26]].map(([k, v]) => (
            <div key={k as string} className="mt-1.5 grid grid-cols-[1fr_120px] items-center gap-2">
              <span className="truncate text-ink">{k}</span>
              <span className="flex items-center gap-1.5"><span className="h-1.5 bg-ink" style={{ width: `${v}%` }} /><span className="text-ink-muted">{v}%</span></span>
            </div>
          ))}
        </div>
      </div>
    </Frame>
  )
}

export default async function GardenOwnersPage() {
  const gardens = await getGardenList()
  const prefectures = new Set(gardens.map(g => g.prefecture).filter(Boolean)).size
  const taikenCount = buildTaikenPlaces(gardens).length
  const shopCount = gardens.filter(g => gardenShop(g.id)).length + BONSAI_SHOPS.filter(s => s.kind === 'garden').length

  const nav = [['#contents', '掲載内容'], ['#input', '情報の入れ方'], ['#report', '効果'], ['#price', '料金'], ['#faq', 'よくある質問']]

  return (
    <div className="bg-paper text-ink">
      <BreadcrumbStructuredData
        breadcrumbs={[
          { name: 'ホーム', url: SITE_URL, position: 1 },
          { name: '盆栽園', url: `${SITE_URL}/gardens`, position: 2 },
          { name: '盆栽園・盆栽店さま向け 掲載のご案内', url: `${SITE_URL}${PATH}`, position: 3 },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: FAQ.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) }) }}
      />

      {/* 掲載者向けのヘッダー */}
      <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur">
        <div className={`${WRAP} flex h-[60px] items-center gap-4 lg:h-[72px]`}>
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center bg-sumi font-mincho text-[15px] font-bold text-gold">盆</span>
            <span className="font-mincho text-[15px] font-bold tracking-[0.1em] lg:text-[17px]">盆栽コレクション</span>
          </Link>
          <span className="hidden border-l border-line pl-4 text-[12px] tracking-[0.12em] text-ink-soft sm:inline">盆栽園・盆栽店さま向け</span>
          <nav className="ml-auto hidden items-center gap-7 text-[13px] tracking-[0.08em] text-ink-soft lg:flex" aria-label="ページ内の案内">
            {nav.map(([href, label]) => <a key={href} href={href} className="hover:text-ink">{label}</a>)}
          </nav>
          <Link href={APPLY} className="ml-auto inline-flex h-10 items-center rounded-full bg-ink px-4 text-[12.5px] font-bold text-white hover:bg-ink/85 lg:ml-0 lg:h-11 lg:px-6 lg:text-[13.5px]">まずは相談する</Link>
        </div>
      </header>

      {/* ファーストビュー */}
      <section className={`${WRAP} grid items-center gap-10 py-12 lg:grid-cols-[1fr_minmax(0,500px)] lg:gap-14 lg:py-24`}>
        <div>
          <p className="flex items-center gap-3 text-[12px] tracking-[0.2em] text-ink-soft lg:text-[13px]">
            <span className="h-px w-10 bg-ink" aria-hidden="true" />盆栽園・盆栽店さま向け　掲載のご案内
          </p>
          <h1 className="mt-6 font-mincho text-[38px] font-bold leading-[1.45] tracking-[0.1em] lg:text-[60px]">盆栽を<br />探す人に、<br />貴園の魅力を。</h1>
          <p className="mt-6 max-w-[520px] text-[15px] leading-[2] text-ink-soft lg:text-[16px]">盆栽コレクションは、全国の盆栽園を、地域・体験教室・通販から探せるサイトです。<strong className="text-ink">掲載は無料です。</strong></p>
          <p className="mt-5 flex flex-wrap items-baseline gap-x-4 gap-y-1 text-[14px] text-ink-soft">
            <span>全国で<strong className="mx-1 font-mincho text-[26px] text-ink">{gardens.length.toLocaleString()}園</strong>を掲載中</span>
            <Link href="/gardens" className="text-ink underline decoration-ink/40 underline-offset-4 hover:text-gold-dark">実際のサイトを見る ↗</Link>
          </p>
          <div className="mt-8"><CtaButton /></div>
          <p className="mt-3 text-[12.5px] leading-[1.8] text-ink-muted">話を聞くだけでも構いません。掲載のお申し込み・掲載内容の修正も、同じフォームから承ります。</p>
        </div>
        <GardenPageSample />
      </section>

      {/* 数字 */}
      <section aria-label="掲載の規模" className="bg-sumi text-white">
        <ul className={`${WRAP} grid grid-cols-2 gap-y-6 py-9 lg:grid-cols-4 lg:py-12`}>
          {[[gardens.length.toLocaleString(), '園', '掲載している盆栽園'], [String(prefectures), '都道府県', '掲載している地域'], [String(taikenCount), '園', '体験・教室を紹介'], [String(shopCount), '園', '通販を紹介']].map(([v, u, l]) => (
            <li key={l} className="border-l border-white/20 pl-4 lg:pl-6">
              <p className="font-mincho"><span className="text-[32px] font-bold lg:text-[42px]">{v}</span><span className="ml-1 text-[13px] text-white/70">{u}</span></p>
              <p className="mt-1 text-[12.5px] text-white/60">{l}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* 01 掲載内容 */}
      <section id="contents" className={`${WRAP} scroll-mt-20 py-16 lg:py-28`}>
        <SectionHead no="01" label="掲載内容" title={<>貴園のことを、<br className="lg:hidden" />探す人に合わせて。</>} lead="盆栽を探す人は、地域から、体験・教室から、通販から、それぞれの入口で探しています。貴園の情報を、その入口ごとに載せます。" />
        <div className="mt-12 grid items-center gap-8 lg:mt-16 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="text-[12px] tracking-[0.15em] text-gold-dark">体験・教室</p>
            <h3 className="mt-2 font-mincho text-[22px] font-bold leading-[1.6] lg:text-[28px]">料金・時間・日程まで、<br />比べて選べる形で。</h3>
            <p className="mt-4 text-[14.5px] leading-[1.95] text-ink-soft">「盆栽体験・盆栽教室を探す」のページで、地域や内容（1回の体験・苔玉づくり・持ち帰りなど）から探す人に、貴園の体験を紹介します。予約は貴園の予約ページや電話へそのまま移ります。</p>
            <Link href="/taiken" className="mt-4 inline-flex min-h-11 items-center text-[13.5px] text-ink underline decoration-ink/40 underline-offset-4 hover:text-gold-dark">実際のページを見る ↗</Link>
          </div>
          <TaikenSample />
        </div>
        <ul className="mt-14 grid gap-px border border-line bg-line sm:grid-cols-3 lg:mt-20">
          {[
            ['基本情報', '営業時間・定休日・見学の可否・駐車場・アクセス。地図と電話のボタンも付きます。'],
            ['通販', '自社の通販サイト・BASE・楽天市場などの店を、園のページと「盆栽園・専門店から直接買う」のページで案内します。'],
            ['写真と紹介文', 'ご提供の写真と、貴園の言葉による紹介文を載せられます。「園の方に確認済み」の表示も付きます。'],
          ].map(([t, d]) => (
            <li key={t} className="bg-white p-6">
              <p className="font-mincho text-[18px] font-bold">{t}</p>
              <p className="mt-2 text-[13.5px] leading-[1.9] text-ink-soft">{d}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* 02 情報の入れ方 */}
      <section id="input" className="scroll-mt-20 bg-paper-deep py-16 lg:py-28">
        <div className={WRAP}>
          <SectionHead no="02" label="情報の入れ方" title={<>情報は、<br className="lg:hidden" />貴園のやりやすい方法で。</>} />
          <div className="mt-10 border-l-4 border-gold-dark bg-white p-6 lg:mt-14 lg:p-8">
            <p className="text-[12px] tracking-[0.15em] text-gold-dark">はじめての掲載</p>
            <p className="mt-2 font-mincho text-[19px] font-bold lg:text-[22px]">最初の掲載は、こちらで作ります。</p>
            <p className="mt-3 max-w-[820px] text-[14.5px] leading-[1.95] text-ink-soft">公式サイトのURLや、お手元の案内（パンフレット・チラシ・料金表など）をお送りください。当方でページを作り、公開の前に貴園に確かめていただきます。</p>
          </div>
          <ul className="mt-4 grid gap-4 md:grid-cols-3">
            {[
              ['A', '公式サイトから', 'ご許可をいただいて、公式サイトの情報から当方がまとめます。', '貴園の作業なし'],
              ['B', 'メールで', '料金や日程が変わったら、メールで新しい内容をお知らせください。', '数日で反映'],
              ['C', '写真を送る', '園や盆栽の写真をメールでお送りください。使ってよい範囲を伺います。', 'クレジット表記も可'],
            ].map(([k, t, d, tag]) => (
              <li key={k} className="flex flex-col bg-white p-6">
                <p className="font-mincho text-[28px] font-bold text-gold-dark">{k}</p>
                <p className="mt-1 font-mincho text-[18px] font-bold">{t}</p>
                <p className="mt-2 flex-1 text-[13.5px] leading-[1.9] text-ink-soft">{d}</p>
                <p className="mt-4 self-start border border-line px-2.5 py-1 text-[11.5px] text-ink-soft">{tag}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 03 効果 */}
      <section id="report" className={`${WRAP} scroll-mt-20 py-16 lg:py-28`}>
        <SectionHead no="03" label="掲載の効果" title="掲載の効果が、数字でわかる。" lead="ご希望の園には、3か月ごとにメールでご報告します。社内や家族へのご説明にも、そのまま使えます。" />
        <div className="mt-12 grid items-center gap-10 lg:mt-16 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-16">
          <ReportSample />
          <dl className="border-t border-line">
            {[
              ['園のページの表示', 'お客様が貴園のページを見た回数'],
              ['公式サイト・通販へ', '貴園の公式サイト・予約ページ・通販サイトへ移った回数'],
              ['電話・地図', '電話をかける・地図を開くボタンが押された回数'],
              ['入口ごと', '体験・教室のページ、地域の一覧、検索など、どこから見られたか'],
            ].map(([t, d]) => (
              <div key={t} className="border-b border-line py-5">
                <dt className="font-mincho text-[17px] font-bold">{t}</dt>
                <dd className="mt-1 text-[13.5px] leading-[1.8] text-ink-soft">{d}</dd>
              </div>
            ))}
          </dl>
        </div>
        <p className="mt-6 text-[11.5px] text-ink-muted">画面は見本です（実在の盆栽園・数字ではありません）。写真はイメージです。</p>
      </section>

      {/* 04 料金 */}
      <section id="price" className="scroll-mt-20 bg-paper-deep py-16 lg:py-28">
        <div className={WRAP}>
          <SectionHead no="04" label="料金" title="掲載は、無料です。" />
          <div className="mt-10 grid overflow-hidden border border-line bg-white lg:mt-14 lg:grid-cols-[360px_1fr]">
            <div className="flex flex-col justify-center border-b border-line p-8 lg:border-b-0 lg:border-r lg:p-10">
              <p className="text-[13px] text-ink-soft">掲載の料金</p>
              <p className="mt-2 font-mincho leading-none"><span className="text-[28px]">¥</span><span className="text-[72px] font-bold">0</span></p>
              <CtaButton className="mt-7 self-start">まずは相談する</CtaButton>
            </div>
            <dl className="divide-y divide-line">
              {[['掲載料・登録料', '0円'], ['送客・予約・販売の手数料', '0円'], ['掲載できる情報', '基本情報・体験・通販・写真・紹介文'], ['確認済みの表示・効果のご報告', 'すべて含む']].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between gap-4 px-6 py-5 lg:px-10">
                  <dt className="text-[14px] text-ink-soft">{k}</dt>
                  <dd className="text-right font-mincho text-[16px] font-bold lg:text-[18px]">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <p className="mt-5 max-w-[860px] text-[13px] leading-[1.9] text-ink-soft">将来、有料の掲載をご相談することになった場合は、事前にお知らせします。そのときお断りいただいても、無料の掲載はそのまま続けます。有料の掲載には「PR」と明記し、掲載順や情報の正確さをお金で変えることはしません。</p>
        </div>
      </section>

      {/* ご利用の流れ */}
      <section id="flow" className={`${WRAP} scroll-mt-20 py-16 lg:py-28`}>
        <SectionHead no="05" label="ご利用の流れ" title="ご相談から、掲載まで。" />
        <ol className="mt-10 grid gap-4 md:grid-cols-4 lg:mt-14">
          {[
            ['ご相談・お申し込み', 'フォームから、園の名前・ご担当者・連絡先をお送りください。'],
            ['担当からご連絡', 'メールで、掲載の進め方をご相談します。'],
            ['掲載内容の確認', '当方が作った掲載内容を、公開の前に確かめていただきます。'],
            ['公開', '数日〜1週間ほどで公開し、「園の方に確認済み」を表示します。'],
          ].map(([t, d], i) => (
            <li key={t} className="relative border-t-2 border-ink pt-5">
              <p className="flex h-9 w-9 items-center justify-center rounded-full border border-ink font-mincho text-[15px] font-bold">{i + 1}</p>
              <p className="mt-3 font-mincho text-[17px] font-bold">{t}</p>
              <p className="mt-2 text-[13.5px] leading-[1.85] text-ink-soft">{d}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* よくある質問 */}
      <section id="faq" className="scroll-mt-20 bg-paper-deep py-16 lg:py-28">
        <div className={`${WRAP} grid gap-10 lg:grid-cols-[300px_1fr] lg:gap-16`}>
          <SectionHead no="06" label="よくある質問" title="よくある質問" />
          <dl className="border-t border-line">
            {FAQ.map(f => (
              <div key={f.q} className="grid gap-2 border-b border-line py-5 lg:grid-cols-[280px_1fr] lg:gap-8">
                <dt className="font-mincho text-[16px] font-bold leading-[1.7]">{f.q}</dt>
                <dd className="text-[14px] leading-[1.9] text-ink-soft">{f.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* 最後のご案内 */}
      <section className="bg-sumi py-16 text-center text-white lg:py-28">
        <div className={WRAP}>
          <p className="text-[12px] tracking-[0.2em] text-gold">掲載のご相談</p>
          <h2 className="mt-4 font-mincho text-[30px] font-bold leading-[1.5] tracking-[0.08em] lg:text-[44px]">まずは、お気軽に<br />ご相談ください。</h2>
          <p className="mt-4 text-[14px] text-white/70">話を聞くだけでも構いません。</p>
          <CtaButton dark={false} className="mt-8" />
        </div>
      </section>

      {/* 掲載者向けのフッター（スマホの下部タブ分の余白を打ち消す） */}
      <footer className="-mb-16 border-t border-white/10 bg-sumi pb-16 text-white/60 lg:mb-0 lg:pb-0">
        <div className={`${WRAP} flex flex-col gap-4 py-8 text-[12.5px] lg:flex-row lg:items-center lg:justify-between`}>
          <nav className="flex flex-wrap gap-x-6 gap-y-2" aria-label="フッター">
            <Link href="/about" className="hover:text-white">運営者情報</Link>
            <Link href="/terms" className="hover:text-white">利用規約</Link>
            <Link href="/privacy" className="hover:text-white">プライバシーポリシー</Link>
            <Link href={APPLY} className="hover:text-white">お問い合わせ・掲載停止のご依頼</Link>
            <Link href="/" className="hover:text-white">一般向けのサイトへ</Link>
          </nav>
          <p>© 盆栽コレクション</p>
        </div>
      </footer>
    </div>
  )
}
