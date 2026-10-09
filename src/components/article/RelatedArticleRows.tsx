import Link from 'next/link'
import Image from 'next/image'
import { Placeholder } from '@/components/ui/design'
import { canOptimizeImage } from '@/lib/article-overrides'

export interface ArticleCardItem {
  href: string
  title: string
  image?: string | null
  readingTime?: number | null
}

// 記事のカード（サムネイルを大きく見せて、ほかの記事へ進みやすくする）。SP・PC とも2列
export function ArticleCardGrid({ items }: { items: ArticleCardItem[] }) {
  return (
    <ul className="grid grid-cols-2 gap-x-3 gap-y-6 lg:gap-x-6 lg:gap-y-8">
      {items.map(item => (
        <li key={item.href} className="min-w-0">
          <Link href={item.href} className="group block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold">
            <div className="relative aspect-[40/21] overflow-hidden bg-paper-deep">
              {item.image ? (
                <Image
                  src={item.image}
                  alt=""
                  fill
                  sizes="(max-width: 1023px) 46vw, 310px"
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  unoptimized={!canOptimizeImage(item.image)}
                />
              ) : (
                <Placeholder className="h-full w-full" />
              )}
            </div>
            <p className="mt-2.5 line-clamp-3 text-[13.5px] font-medium leading-[1.65] text-ink group-hover:text-gold-dark lg:text-[14.5px]">{item.title}</p>
            {item.readingTime && item.readingTime <= 60 ? <p className="mt-1 text-[11.5px] text-ink-muted">約{item.readingTime}分</p> : null}
          </Link>
        </li>
      ))}
    </ul>
  )
}

// 記事の下の「ほかの記事も読む」
export function RelatedArticleRows({ items }: { items: ArticleCardItem[] }) {
  if (items.length === 0) return null
  return (
    <section aria-labelledby="related-articles" className="mt-14 border-t border-ink pt-8 lg:mt-16 lg:pt-10">
      <h2 id="related-articles" className="font-mincho text-[21px] font-bold tracking-[0.06em] text-ink lg:text-2xl">ほかの記事も読む</h2>
      <div className="mt-6">
        <ArticleCardGrid items={items} />
      </div>
      <Link href="/guides" className="mt-8 inline-flex min-h-11 items-center border-b border-ink text-[13.5px] text-ink hover:text-gold-dark">
        育て方の記事をすべて見る ›
      </Link>
    </section>
  )
}
