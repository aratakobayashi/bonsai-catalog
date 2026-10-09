import { Metadata } from 'next'
import { AMAZON_ENABLED, SHOP_NAMES_AND } from '@/lib/affiliate'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { CONTAINER, PageHeading } from '@/components/ui/design'
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
  { num: '一', title: '探す', body: `樹種・予算・サイズから、${SHOP_NAMES_AND}の商品をまとめて探せます。` },
  { num: '二', title: '比べる', body: '価格・レビュー・サイズを同じ形式で並べて比べられます。' },
  { num: '三', title: 'ショップで買う', body: '購入は各ショップのページで行います。当サイトでは販売していません。' },
]

const linkClass = 'border-b border-ink text-ink hover:border-gold-dark hover:text-gold-dark'

// 確認日（YYYY-MM-DD）を「2026年10月8日」の形にする
function formatDate(value: string | null): string | null {
  const m = value?.match(/^(\d{4})-(\d{2})-(\d{2})/)
  return m ? `${m[1]}年${Number(m[2])}月${Number(m[3])}日` : null
}

// 左に項目名、右に説明を置く表（SPでは縦積み）。線だけで区切る
function InfoTable({ rows }: { rows: { label: string; body: ReactNode }[] }) {
  return (
    <dl className="mt-3 border-t border-line lg:mt-4">
      {rows.map(row => (
        <div key={row.label} className="border-b border-paper-deep py-3.5 lg:grid lg:grid-cols-[140px_1fr] lg:gap-3.5 lg:py-3">
          <dt className="text-[13px] font-bold text-ink lg:text-[14px] lg:font-normal lg:leading-[1.7] lg:text-ink-muted">{row.label}</dt>
          <dd className="mt-1 text-[12.5px] leading-[1.85] text-ink-soft lg:mt-0 lg:text-[14px] lg:leading-[1.7] lg:text-ink">{row.body}</dd>
        </div>
      ))}
    </dl>
  )
}

export default function AboutPage() {
  const gardenVerified = formatDate(GARDEN_VERIFIED_AT)
  const eventVerified = formatDate(EVENT_VERIFIED_AT)

  return (
    <div className={`${CONTAINER} pb-12`}>
      <div className="mx-auto max-w-[664px]">
        <PageHeading
          title="このサイトについて"
          crumbs={[{ label: 'ホーム', href: '/' }, { label: 'このサイトについて' }]}
          lead={
            <span className="block text-[14px] leading-[2] text-ink-soft lg:text-[16px]">
              盆栽コレクションは、{SHOP_NAMES_AND}で販売されている盆栽・鉢・土・道具を横断して探せる比較・検索サイトです。育て方の記事や、全国の盆栽園・イベントの情報もまとめています。
            </span>
          }
        />

        {/* 使い方の3ステップ（PCは横並び、SPは線で区切った縦並び） */}
        <ol className="mt-7 lg:mt-14 lg:grid lg:grid-cols-3 lg:gap-8">
          {STEPS.map(step => (
            <li key={step.title} className="grid grid-cols-[32px_1fr] gap-2.5 border-t border-line py-3.5 lg:block lg:border-sumi lg:pb-0 lg:pt-4">
              <span className="font-mincho text-lg font-bold text-gold-dark lg:block lg:text-[22px]" aria-hidden="true">{step.num}</span>
              <div className="min-w-0">
                <h2 className="font-mincho text-[15.5px] font-bold tracking-[0.04em] text-ink lg:mt-1.5 lg:text-[17px]">{step.title}</h2>
                <p className="mt-0.5 text-[12.5px] leading-[1.8] text-ink-soft lg:mt-1.5 lg:text-[13px] lg:leading-[1.85]">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>

        <section className="mt-9 lg:mt-[72px]">
          <h2 className="font-mincho text-lg font-bold tracking-[0.06em] text-ink lg:text-[22px]">表示について</h2>
          <InfoTable
            rows={[
              {
                label: '広告について',
                body: `本サイトはプロモーション（広告）を含みます。商品リンクから購入された場合、当サイトに紹介料が支払われることがあります。${AMAZON_ENABLED ? 'Amazonのアソシエイトとして、盆栽コレクションは適格販売により収入を得ています。' : ''}紹介料によって購入価格が変わることはありません。`,
              },
              {
                label: '価格について',
                body: '掲載している価格・送料・在庫は取得時点の情報です。最新の情報は各ショップの商品ページでご確認ください。',
              },
              {
                label: '表示の「—」',
                body: '商品名や説明文から読み取れなかった項目（樹高・サイズなど）は「—」と表示しています。',
              },
              {
                label: '商品情報の取得元',
                body: (
                  <>
                    楽天市場の商品は、楽天ウェブサービスの商品検索APIから自動で取得し、価格・レビューを定期的に更新しています。しばらく見つからなくなった商品は販売終了とみなして表示を止めます。{AMAZON_ENABLED && 'Amazonの商品は運営者が選んで掲載しているもので、価格は掲載・更新した時点の情報です。'}
                  </>
                ),
              },
              {
                label: '商品情報について',
                body: (
                  <>
                    楽天市場の商品情報は{' '}
                    <a href="https://webservice.rakuten.co.jp/" target="_blank" rel="noopener noreferrer" className={linkClass}>
                      Supported by Rakuten Developers
                    </a>
                    。
                  </>
                ),
              },
            ]}
          />
        </section>

        <section className="mt-9 lg:mt-[72px]">
          <h2 className="font-mincho text-lg font-bold tracking-[0.06em] text-ink lg:text-[22px]">盆栽園・イベント情報について</h2>
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
                    <Link href="/contact" className={`mx-0.5 ${linkClass}`}>お問い合わせ</Link>
                    からお知らせください。
                  </>
                ),
              },
            ]}
          />
        </section>

        <section className="mt-9 lg:mt-[72px]">
          <h2 className="font-mincho text-lg font-bold tracking-[0.06em] text-ink lg:text-[22px]">運営者情報</h2>
          <InfoTable
            rows={[
              { label: 'サイト名', body: '盆栽コレクション' },
              { label: '運営者', body: '盆栽コレクション 編集部' },
              { label: 'URL', body: 'https://www.bonsai-collection.com' },
              { label: '運営開始', body: '2024年9月' },
              { label: '主なコンテンツ', body: '盆栽育て方ガイド・樹種別解説・盆栽園情報・イベントカレンダー' },
              { label: '対象読者', body: '盆栽初心者〜上級者、盆栽に興味のある方全般' },
              {
                label: 'お問い合わせ',
                body: (
                  <>
                    <Link href="/contact" className={linkClass}>お問い合わせフォーム</Link>
                    よりご連絡ください。
                  </>
                ),
              },
            ]}
          />
        </section>

        <div className="mt-10 flex flex-wrap gap-3 lg:mt-12">
          <Link href="/faq" className="inline-flex h-[50px] items-center justify-center bg-sumi px-7 text-sm tracking-[0.08em] text-paper hover:bg-sumi-light hover:text-paper">
            よくある質問
          </Link>
          <Link href="/contact" className="inline-flex h-[50px] items-center justify-center border border-sumi px-6 text-sm tracking-[0.06em] text-ink hover:border-gold-dark hover:text-gold-dark">
            お問い合わせ
          </Link>
        </div>
      </div>
    </div>
  )
}
