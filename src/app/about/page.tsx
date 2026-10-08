import { Metadata } from 'next'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { CONTAINER, Card, PageHeading, SectionTitle } from '@/components/ui/design'
import { GARDEN_VERIFIED_AT } from '@/lib/garden-verification'
import { EVENT_VERIFIED_AT } from '@/lib/event-display'

export const metadata: Metadata = {
  alternates: { canonical: '/about' },
  title: '盆栽コレクションについて | 運営者情報・サイトの目的',
  description: '盆栽コレクションは、盆栽の魅力を多くの方に伝えるために運営する情報サイトです。育て方ガイド・樹種別解説・盆栽園情報を通じて、初心者から愛好家まで盆栽ライフをサポートします。',
  openGraph: {
    title: '盆栽コレクションについて | 運営者情報',
    description: '盆栽コレクションの運営方針・コンテンツポリシー・運営者情報をご紹介します。',
    type: 'website',
  },
}

const STEPS = [
  { title: '探す', body: '樹種・予算・サイズから、楽天市場とAmazonの商品をまとめて探せます。' },
  { title: '比べる', body: '価格・レビュー・サイズを同じ形式で並べて比べられます。' },
  { title: 'ショップで買う', body: '購入は各ショップのページで行います。当サイトでは販売していません。' },
]

// 確認日（YYYY-MM-DD）を「2026年10月8日」の形にする
function formatDate(value: string | null): string | null {
  const m = value?.match(/^(\d{4})-(\d{2})-(\d{2})/)
  return m ? `${m[1]}年${Number(m[2])}月${Number(m[3])}日` : null
}

// 左に項目名、右に説明を置く表（SPでは縦積み）
function InfoTable({ rows }: { rows: { label: string; body: ReactNode }[] }) {
  return (
    <Card className="mt-3 overflow-hidden">
      <dl className="divide-y divide-line">
        {rows.map(row => (
          <div key={row.label} className="px-4 py-4 lg:flex lg:gap-6 lg:px-5">
            <dt className="text-[13px] font-bold text-ink lg:w-36 lg:shrink-0">{row.label}</dt>
            <dd className="mt-1 text-[13.5px] leading-[1.85] text-ink-soft lg:mt-0">{row.body}</dd>
          </div>
        ))}
      </dl>
    </Card>
  )
}

export default function AboutPage() {
  const gardenVerified = formatDate(GARDEN_VERIFIED_AT)
  const eventVerified = formatDate(EVENT_VERIFIED_AT)

  return (
    <div className={`${CONTAINER} pb-12`}>
      <div className="mx-auto max-w-[880px]">
        <PageHeading
          title="このサイトについて"
          crumbs={[{ label: 'ホーム', href: '/' }, { label: 'このサイトについて' }]}
          lead={
            <span className="block text-[14.5px] leading-[1.9] text-ink lg:text-[15px]">
              盆栽コレクションは、楽天市場とAmazonで販売されている盆栽・鉢・土・道具を横断して探せる比較・検索サイトです。育て方の記事や、全国の盆栽園・イベントの情報もまとめています。
            </span>
          }
        />

        {/* 使い方の3ステップ */}
        <ol className="mt-6 grid gap-2.5 lg:mt-8 lg:grid-cols-3 lg:gap-3">
          {STEPS.map((step, i) => (
            <li key={step.title}>
              <Card className="flex h-full gap-4 px-4 py-4 lg:block lg:px-5 lg:py-5">
                <div className="font-mincho text-xl font-bold leading-none text-gold lg:text-2xl">{i + 1}</div>
                <div className="min-w-0 lg:mt-2.5">
                  <h2 className="text-[15px] font-bold text-navy">{step.title}</h2>
                  <p className="mt-1 text-[13px] leading-relaxed text-ink-soft lg:mt-2">{step.body}</p>
                </div>
              </Card>
            </li>
          ))}
        </ol>

        <section className="mt-10 lg:mt-12">
          <SectionTitle>表示について</SectionTitle>
          <InfoTable
            rows={[
              {
                label: '広告について',
                body: '本サイトはプロモーション（広告）を含みます。商品リンクから購入された場合、当サイトに紹介料が支払われることがあります。Amazonのアソシエイトとして、盆栽コレクションは適格販売により収入を得ています。紹介料によって購入価格が変わることはありません。',
              },
              {
                label: '価格について',
                body: '掲載している価格・送料・在庫は取得時点の情報です。最新の情報は各ショップの商品ページでご確認ください。',
              },
              {
                label: '商品情報の取得元',
                body: (
                  <>
                    楽天市場の商品は、楽天ウェブサービスの商品検索APIから自動で取得し、価格・レビューを定期的に更新しています。しばらく見つからなくなった商品は販売終了とみなして表示を止めます。Amazonの商品は運営者が選んで掲載しているもので、価格は掲載・更新した時点の情報です。
                  </>
                ),
              },
              {
                label: '商品情報について',
                body: (
                  <>
                    楽天市場の商品情報は{' '}
                    <a href="https://webservice.rakuten.co.jp/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-gold-dark">
                      Supported by Rakuten Developers
                    </a>
                    。
                  </>
                ),
              },
            ]}
          />
        </section>

        <section className="mt-10 lg:mt-12">
          <SectionTitle>盆栽園・イベント情報について</SectionTitle>
          <InfoTable
            rows={[
              {
                label: '盆栽園',
                body: (
                  <>
                    公式サイトなどの公開情報と照合し、実在を確認できない園・閉園した園・盆栽を扱っていない園は掲載していません。
                    {gardenVerified && <>（最終確認：{gardenVerified}）</>}
                  </>
                ),
              },
              {
                label: 'イベント',
                body: (
                  <>
                    日程・料金は主催者の公式発表と照合しています。今回の日程が発表されていない恒例行事は「日程未定」として、料金が公表されていないものは「公式サイトでご確認ください」として表示します。
                    {eventVerified && <>（最終確認：{eventVerified}）</>}
                  </>
                ),
              },
              {
                label: '情報の修正',
                body: (
                  <>
                    営業時間や日程は変わることがあります。お出かけの前に各公式サイトでご確認ください。掲載内容の誤りは
                    <Link href="/contact" className="mx-0.5 text-navy underline underline-offset-2 hover:text-gold-dark">お問い合わせ</Link>
                    からお知らせください。
                  </>
                ),
              },
            ]}
          />
        </section>

        <section className="mt-10 lg:mt-12">
          <SectionTitle>運営者情報</SectionTitle>
          <InfoTable
            rows={[
              { label: 'サイト名', body: '盆栽コレクション' },
              { label: '運営者', body: '盆栽コレクション 編集部' },
              { label: 'URL', body: 'https://bonsai-collection.com' },
              { label: '運営開始', body: '2024年9月' },
              { label: '主なコンテンツ', body: '盆栽育て方ガイド・樹種別解説・盆栽園情報・イベントカレンダー' },
              { label: '対象読者', body: '盆栽初心者〜上級者、盆栽に興味のある方全般' },
              {
                label: 'お問い合わせ',
                body: (
                  <>
                    <Link href="/contact" className="text-navy underline underline-offset-2 hover:text-gold-dark">お問い合わせフォーム</Link>
                    よりご連絡ください。
                  </>
                ),
              },
            ]}
          />
        </section>

        <div className="mt-6 flex gap-2.5">
          <Link href="/faq" className="inline-flex items-center rounded-lg bg-navy px-5 py-2.5 text-sm font-bold text-white hover:bg-navy-light">
            よくある質問
          </Link>
          <Link href="/contact" className="inline-flex items-center rounded-lg border border-navy bg-white px-5 py-2.5 text-sm font-bold text-navy hover:border-gold hover:text-gold-dark">
            お問い合わせ
          </Link>
        </div>
      </div>
    </div>
  )
}
