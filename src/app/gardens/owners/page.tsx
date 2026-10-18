import { Metadata } from 'next'
import Link from 'next/link'
import { CONTAINER, PageHeading } from '@/components/ui/design'

export const metadata: Metadata = {
  alternates: { canonical: '/gardens/owners' },
  title: '盆栽園・盆栽店の方へ｜掲載情報の追加・修正（無料）',
  description: '盆栽コレクションの盆栽園ページは無料で掲載しています。営業時間・体験教室・通販サイトのURL・写真など、掲載情報の追加や修正はこちらからご連絡ください。',
}

const ITEMS = [
  { title: '基本情報', body: '営業時間・定休日・住所・電話番号・駐車場など。移転や休業のお知らせもお寄せください。' },
  { title: '体験教室・ワークショップ', body: '開催の有無、内容、料金、予約の方法など。' },
  { title: '通販サイト・オンラインショップ', body: 'ご自身のショップ、楽天市場・BASE などのURLを、園のページからご案内します。' },
  { title: '写真', body: '園や盆栽の写真をご提供いただける場合は、掲載の条件とあわせてお知らせください。' },
  { title: '掲載の取りやめ', body: '掲載を望まれない場合も、ご連絡いただければ取り下げます。' },
]

const linkClass = 'border-b border-ink text-ink hover:border-gold-dark hover:text-gold-dark'

export default function GardenOwnersPage() {
  return (
    <div className={`${CONTAINER} pb-16 lg:pb-24`}>
      <PageHeading eyebrow="掲載について" title="盆栽園・盆栽店の方へ" crumbs={[{ label: 'ホーム', href: '/' }, { label: '盆栽園', href: '/gardens' }, { label: '盆栽園・盆栽店の方へ' }]} />

      <div className="mx-auto max-w-[760px]">
        <p className="mt-6 text-[14.5px] leading-[2] text-ink-soft lg:text-[15.5px]">
          盆栽コレクションでは、全国の盆栽園・盆栽店を<strong className="text-ink">無料</strong>でご紹介しています。
          掲載している情報は、公式サイトなど公開されている情報をもとにまとめたものです。
          内容の追加や修正がありましたら、お気軽にご連絡ください。掲載料や手数料はいただいていません。
        </p>

        <h2 className="mt-12 font-mincho text-[19px] font-bold tracking-[0.05em] text-ink lg:text-[22px]">追加・修正できること</h2>
        <dl className="mt-3 border-t border-line">
          {ITEMS.map(item => (
            <div key={item.title} className="border-b border-line py-4 lg:grid lg:grid-cols-[220px_1fr] lg:gap-4">
              <dt className="text-[14px] font-bold text-ink lg:text-[15px]">{item.title}</dt>
              <dd className="mt-1 text-[13.5px] leading-[1.9] text-ink-soft lg:mt-0 lg:text-[14.5px]">{item.body}</dd>
            </div>
          ))}
        </dl>

        <h2 className="mt-12 font-mincho text-[19px] font-bold tracking-[0.05em] text-ink lg:text-[22px]">ご連絡の方法</h2>
        <ol className="mt-3 space-y-2 text-[14px] leading-[1.9] text-ink-soft lg:text-[15px]">
          <li>1. 下のボタンから、お問い合わせのページを開きます（書いていただきたい項目が入った状態で開きます）。</li>
          <li>2. 分かる項目だけご記入のうえ、送信してください。お使いのメールソフトが開きます。</li>
          <li>3. 内容を確認し、数日から1週間ほどで掲載に反映します。確認のため、メールでご連絡することがあります。</li>
        </ol>
        <Link href="/contact?type=garden" className="mt-6 inline-flex min-h-[52px] items-center bg-ink px-6 text-[15px] font-bold text-white hover:bg-ink/85">
          掲載情報の追加・修正を送る ›
        </Link>

        <p className="mt-10 text-[13px] leading-[1.9] text-ink-muted">
          掲載中の盆栽園は<Link href="/gardens" className={linkClass}>盆栽園の一覧</Link>からご覧いただけます。
          運営者については<Link href="/about" className={linkClass}>盆栽コレクションについて</Link>をご覧ください。
        </p>
      </div>
    </div>
  )
}
