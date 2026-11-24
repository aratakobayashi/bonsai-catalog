import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE_URL } from '@/lib/site'
import { heroPhoto } from '@/lib/hero-photo'
import { getGardenList } from '@/lib/gardens-list'
import { buildTaikenPlaces } from '@/lib/taiken'
import { gardenShop } from '@/lib/garden-shops'
import { BONSAI_SHOPS } from '@/lib/bonsai-shops'
import { BreadcrumbStructuredData } from '@/components/seo/StructuredData'
import { CONTAINER, PageHeading, SectionTitle } from '@/components/ui/design'

// 盆栽園・盆栽店の方へ（掲載パートナーの募集。無料）
// 第1段階：無料で掲載内容を充実させてもらい、園ごとの送客の数（園のページの閲覧・公式サイトや通販への移動）をためる
const PATH = '/gardens/owners'

export const metadata: Metadata = {
  alternates: { canonical: PATH },
  title: '盆栽園・盆栽店の方へ｜無料の掲載パートナー募集・掲載情報の追加と修正 - 盆栽コレクション',
  description: '盆栽コレクションは、全国の盆栽園・盆栽店を無料で紹介しています。体験・教室の料金や日程、通販サイト、写真などを園の方に確かめていただく「掲載パートナー」を募集しています。掲載料・手数料はかかりません。',
}

const BENEFITS = [
  { no: '01', title: '「園の方に確認済み」の表示', body: '園のページに、掲載内容を園の方に確かめていただいた年月を表示します。公開情報だけでまとめた園よりも、見る人が安心して訪ねられます。' },
  { no: '02', title: '体験・教室を詳しく紹介', body: '料金・所要時間・日程・持ち帰りの有無・予約の方法を、「盆栽体験・盆栽教室を探す」のページと園のページに載せます。地域や内容（1回の体験・苔玉づくりなど）から探す人に届きます。' },
  { no: '03', title: '通販の案内', body: '自社の通販サイトやBASE・楽天市場などの店を、園のページと「盆栽園・専門店から直接買う」のページでご案内します。' },
  { no: '04', title: '写真と紹介文', body: 'ご提供いただいた園や盆栽の写真、園の方の言葉による紹介文を載せられます。写真のクレジットや使ってよい範囲は、ご希望に合わせます。' },
  { no: '05', title: '見られた回数のお知らせ', body: 'ご希望の園には、園のページが見られた回数と、そこから公式サイト・通販サイト・電話・地図へ進んだ回数を、3か月ごとにメールでお知らせします。' },
]

const STEPS = [
  { title: 'お申し込み', body: '下のボタンからお問い合わせのページを開き、園の名前と、確かめたい・追加したい内容を書いて送ってください。分かる項目だけで構いません。' },
  { title: '掲載内容の確認', body: 'いまの掲載内容をメールでお送りします。違うところ、足したいところをお返事ください。' },
  { title: '反映', body: '数日から1週間ほどでページに反映し、「園の方に確認済み」の表示を付けます。内容が変わったときは、いつでもご連絡ください。' },
]

const RULES = [
  '掲載料・手数料はいただきません。掲載パートナーになっても、ならなくても、費用はかかりません。',
  '一覧の並び順や表示の大きさは、掲載パートナーかどうかで変えません。料金・営業時間などの情報の正確さを、すべての園で同じように保ちます。',
  '紹介文や評価を、お金と引き換えに書き換えることはしません。',
  '当サイトは、楽天市場・Amazonなどの商品リンクの広告収入で運営しています。商品リンクには広告が含まれます。',
  '将来、有料の掲載を始める場合は、広告であることを「PR」と明記し、無料の掲載内容は減らしません。始める前に、掲載パートナーの園にお知らせします。',
]

const FAQ = [
  { q: '本当に無料ですか？', a: '無料です。掲載料・登録料・手数料はかかりません。当サイトは商品リンクの広告収入で運営しています。' },
  { q: 'まだ掲載されていない園でも申し込めますか？', a: '申し込めます。園の名前・所在地・営業時間などをお送りください。実在と所在地を確かめたうえで掲載します。' },
  { q: 'ホームページや通販サイトがなくても大丈夫ですか？', a: '大丈夫です。営業時間・見学の可否・体験の内容などをメールでお知らせいただければ、園のページにまとめます。' },
  { q: 'どのくらいの手間がかかりますか？', a: '最初に掲載内容を確かめていただく1回のやりとりが中心です。その後は、料金や日程が変わったときにご連絡いただくだけです。' },
  { q: '掲載をやめたいときは？', a: 'ご連絡いただければ、掲載パートナーの表示や、園のページそのものを取り下げます。' },
]

export default async function GardenOwnersPage() {
  const gardens = await getGardenList()
  const prefectures = new Set(gardens.map(g => g.prefecture).filter(Boolean)).size
  const taikenCount = buildTaikenPlaces(gardens).length
  const shopCount = gardens.filter(g => gardenShop(g.id)).length + BONSAI_SHOPS.filter(s => s.kind === 'garden').length
  const stats = [
    { value: gardens.length.toLocaleString(), unit: '園', label: '掲載している盆栽園' },
    { value: String(prefectures), unit: '都道府県', label: '掲載している地域' },
    { value: String(taikenCount), unit: '園', label: '体験・教室を紹介' },
    { value: String(shopCount), unit: '園', label: '通販を紹介' },
  ]

  return (
    <div className={`${CONTAINER} pb-16 lg:pb-24`}>
      <BreadcrumbStructuredData
        breadcrumbs={[
          { name: 'ホーム', url: SITE_URL, position: 1 },
          { name: '盆栽園', url: `${SITE_URL}/gardens`, position: 2 },
          { name: '盆栽園・盆栽店の方へ', url: `${SITE_URL}${PATH}`, position: 3 },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: FAQ.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
          }),
        }}
      />
      <PageHeading
        eyebrow="盆栽園・盆栽店の方へ"
        photo={heroPhoto('/images/articles/photos/article-12-1.jpg', '盆栽園の棚に並ぶ盆栽')}
        title="園の魅力を、盆栽を探す人に届けませんか"
        lead="盆栽コレクションは、全国の盆栽園を無料で紹介しています。掲載内容を園の方に確かめていただく「掲載パートナー」を募集しています。掲載料・手数料はかかりません。"
        crumbs={[{ label: 'ホーム', href: '/' }, { label: '盆栽園', href: '/gardens' }, { label: '盆栽園・盆栽店の方へ' }]}
      />

      {/* いまの掲載の規模 */}
      <section aria-labelledby="scale" className="mt-8 lg:mt-10">
        <h2 id="scale" className="sr-only">いまの掲載の規模</h2>
        <ul className="grid grid-cols-2 border-l border-t border-line bg-white lg:grid-cols-4">
          {stats.map(s => (
            <li key={s.label} className="border-b border-r border-line px-4 py-4 lg:px-6 lg:py-5">
              <p className="font-mincho text-ink"><span className="text-[28px] font-bold lg:text-[34px]">{s.value}</span><span className="ml-1 text-[13px]">{s.unit}</span></p>
              <p className="mt-0.5 text-[12.5px] text-ink-muted">{s.label}</p>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-[13px]">
          <Link href="/gardens" className="inline-flex min-h-11 items-center text-ink underline decoration-line underline-offset-4 hover:text-gold-dark">盆栽園の一覧 ›</Link>
          <Link href="/taiken" className="inline-flex min-h-11 items-center text-ink underline decoration-line underline-offset-4 hover:text-gold-dark">盆栽体験・盆栽教室を探す ›</Link>
          <Link href="/gardens/shops" className="inline-flex min-h-11 items-center text-ink underline decoration-line underline-offset-4 hover:text-gold-dark">盆栽園・専門店から直接買う ›</Link>
        </div>
      </section>

      {/* 掲載パートナーでできること */}
      <section aria-labelledby="benefits" className="mt-14 lg:mt-20">
        <SectionTitle><span id="benefits">掲載パートナーになると</span></SectionTitle>
        <p className="mt-3 max-w-[760px] text-[14px] leading-[1.85] text-ink-soft">いまの掲載は、公式サイトなどの公開情報をもとにまとめています。園の方に確かめていただくと、次のことができるようになります。すべて無料です。</p>
        <ol className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-3 md:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map(b => (
            <li key={b.no} className="border border-line bg-white p-5">
              <p className="font-mincho text-[13px] tracking-[0.15em] text-gold-dark">{b.no}</p>
              <p className="mt-1 font-mincho text-[17px] font-bold text-ink">{b.title}</p>
              <p className="mt-2 text-[13.5px] leading-[1.85] text-ink-soft">{b.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* 申し込みの流れ */}
      <section aria-labelledby="steps" className="mt-14 lg:mt-20">
        <SectionTitle><span id="steps">申し込みの流れ</span></SectionTitle>
        <ol className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-3 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s.title} className="border-t-2 border-ink bg-paper-deep px-5 py-5">
              <p className="text-[12px] tracking-[0.15em] text-ink-muted">STEP {i + 1}</p>
              <p className="mt-1 font-mincho text-[17px] font-bold text-ink">{s.title}</p>
              <p className="mt-2 text-[13.5px] leading-[1.85] text-ink-soft">{s.body}</p>
            </li>
          ))}
        </ol>
        <div className="mt-7 flex flex-col items-start gap-2">
          <Link href="/contact?type=garden" className="inline-flex min-h-[52px] items-center bg-ink px-6 text-[15px] font-bold text-white hover:bg-ink/85">掲載パートナーに申し込む（無料） ›</Link>
          <p className="text-[12.5px] text-ink-muted">情報の追加・修正だけのご連絡や、掲載の取りやめも、同じページから受け付けています。</p>
        </div>
      </section>

      {/* 掲載の決まり */}
      <section aria-labelledby="rules" className="mt-14 lg:mt-20">
        <SectionTitle><span id="rules">掲載の決まり</span></SectionTitle>
        <p className="mt-3 max-w-[760px] text-[14px] leading-[1.85] text-ink-soft">盆栽を探す人に信頼される場所であるために、次のことを守ります。</p>
        <ul className="mt-4 max-w-[860px] border-t border-line">
          {RULES.map(r => (
            <li key={r} className="flex gap-3 border-b border-line py-3.5 text-[14px] leading-[1.85] text-ink-soft">
              <span aria-hidden="true" className="mt-[0.7em] h-1.5 w-1.5 shrink-0 bg-gold-dark" />
              <span>{r}</span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="faq" className="mt-14 lg:mt-20">
        <SectionTitle><span id="faq">よくある質問</span></SectionTitle>
        <dl className="mt-4 max-w-[860px] border-t border-line">
          {FAQ.map(f => (
            <div key={f.q} className="border-b border-line py-4">
              <dt className="font-mincho text-[16px] font-bold text-ink">{f.q}</dt>
              <dd className="mt-1.5 text-[14.5px] leading-[1.9] text-ink-soft">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="apply" className="mt-14 border border-line bg-paper-deep px-5 py-7 lg:mt-20 lg:px-10 lg:py-9">
        <h2 id="apply" className="font-mincho text-[20px] font-bold text-ink lg:text-[23px]">まずは、いまの掲載内容を確かめてみませんか</h2>
        <p className="mt-2 max-w-[760px] text-[14px] leading-[1.85] text-ink-soft">園の名前を書いて送っていただくだけで始められます。返信まで数日いただく場合があります。</p>
        <Link href="/contact?type=garden" className="mt-4 inline-flex min-h-[52px] items-center bg-ink px-6 text-[15px] font-bold text-white hover:bg-ink/85">掲載パートナーに申し込む（無料） ›</Link>
        <p className="mt-4 text-[12.5px] leading-[1.8] text-ink-muted">
          運営者については<Link href="/about" className="border-b border-ink-muted text-ink hover:text-gold-dark">盆栽コレクションについて</Link>をご覧ください。
        </p>
      </section>
    </div>
  )
}
