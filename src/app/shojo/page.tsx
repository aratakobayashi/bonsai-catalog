import type { Metadata } from 'next'
import Link from 'next/link'
import { CONTAINER, PageHeading, SectionTitle } from '@/components/ui/design'
import { BreadcrumbStructuredData } from '@/components/seo/StructuredData'
import { ShojoIcon } from '@/components/shojo/ShojoIcon'
import { SITE_URL } from '@/lib/site'
import { SHOJO } from '@/lib/shojo'
import { RelatedTools } from '@/components/layout/RelatedTools'

export const metadata: Metadata = {
  title: '症状から調べる｜盆栽の葉が黄色い・しおれる・虫がいるときの原因と対処 - 盆栽コレクション',
  description: '盆栽の葉が黄色い、葉先が茶色い、しおれる、葉が落ちる、虫がいる、花が咲かないなど、気になる症状から考えられる原因を多い順に調べられます。季節と置き場所での絞り込み方、それぞれの確かめ方と対処、今すぐやることをまとめました。',
  alternates: { canonical: '/shojo' },
}

export default function ShojoIndexPage() {
  return (
    <>
      <BreadcrumbStructuredData
        breadcrumbs={[
          { name: 'ホーム', url: SITE_URL, position: 1 },
          { name: '症状から調べる', url: `${SITE_URL}/shojo`, position: 2 },
        ]}
      />
      <div className={`${CONTAINER} pb-14 lg:pb-20`}>
        <PageHeading
          title="症状から調べる"
          lead="葉や土に出た症状を選ぶと、考えられる原因を多い順に、確かめ方と対処、今すぐやることと一緒に出します。"
          crumbs={[{ label: 'ホーム', href: '/' }, { label: '症状から調べる' }]}
        />

        <div className="mt-6 border-y border-line bg-white px-4 py-4 lg:mt-10 lg:px-6">
          <p className="text-[13px] font-bold text-ink">迷ったら、まず土を触ります</p>
          <p className="mt-1.5 text-[13px] leading-[1.9] text-ink-soft">
            同じ「元気がない」でも、土が乾いているか湿っているかで、原因と対処はほぼ反対になります。水や肥料を足す前に、土の湿り気と置き場所を確かめてください。
          </p>
        </div>

        <ul className="mt-6 grid grid-cols-[repeat(2,minmax(0,1fr))] gap-2.5 sm:grid-cols-[repeat(3,minmax(0,1fr))] lg:mt-8 lg:grid-cols-[repeat(4,minmax(0,1fr))] lg:gap-4">
          {SHOJO.map(item => (
            <li key={item.slug} className="min-w-0">
              <Link
                href={`/shojo/${item.slug}`}
                className="group flex h-full min-h-[132px] flex-col border border-line bg-white px-3.5 py-4 hover:border-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold lg:px-5 lg:py-5"
              >
                <ShojoIcon name={item.icon} className="h-9 w-9 text-ink-soft group-hover:text-ink" />
                <span className="mt-3 font-mincho text-[15px] font-bold leading-snug text-ink group-hover:text-gold-dark lg:text-[16.5px]">{item.label}</span>
                <span className="mt-1.5 text-[12px] leading-[1.7] text-ink-muted">{item.short}</span>
              </Link>
            </li>
          ))}
        </ul>

        <section className="pt-12 lg:pt-16">
          <SectionTitle>あわせて見たいページ</SectionTitle>
          <ul className="mt-4 grid gap-2 text-[14px] sm:grid-cols-[repeat(2,minmax(0,1fr))]">
            {[
              { href: '/hajimete', label: 'はじめての1か月ガイド', note: '届いた日から1か月の世話を、チェックしながら進める' },
              { href: '/guides/article-14', label: '盆栽が枯れる原因', note: 'よくある10の失敗と、葉や土に出るサイン' },
              { href: '/guides/bonsai-revival-dying-rescue-methods', label: '盆栽が枯れそうなときの対処', note: '生きているかの確かめ方と、原因別の応急処置' },
              { href: '/guides/bonsai-watering-master-guide-2025', label: '盆栽の水やり', note: '乾いたかの見分け方と、季節ごとの目安' },
            ].map(link => (
              <li key={link.href}>
                <Link href={link.href} className="flex min-h-[52px] flex-col justify-center border border-line bg-white px-4 py-2.5 hover:border-ink">
                  <span className="font-bold text-ink">{link.label}</span>
                  <span className="text-[12px] text-ink-muted">{link.note}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
        <RelatedTools hrefs={['/teire', '/note', '/soroeru']} />
      </div>
    </>
  )
}
