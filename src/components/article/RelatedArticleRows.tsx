import Link from 'next/link'
import Image from 'next/image'
import { Placeholder } from '@/components/ui/design'
import { canOptimizeImage } from '@/lib/article-overrides'
import type { Article } from '@/types'

// 関連記事（小さな画像つきの行。PC は2列）
export function RelatedArticleRows({ articles }: { articles: Article[] }) {
  if (articles.length === 0) return null
  return (
    <section aria-labelledby="related-articles" className="mt-14 lg:mt-16">
      <h2 id="related-articles" className="text-[15px] font-bold text-ink">関連する記事</h2>
      <ul className="mt-3 border-t border-line lg:grid lg:grid-cols-2 lg:gap-x-8">
        {articles.map(article => (
          <li key={article.id} className="border-b border-line">
            <Link href={`/guides/${article.slug}`} className="group flex min-h-[72px] items-center gap-3.5 py-3.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold">
              <div className="relative h-14 w-20 flex-none overflow-hidden bg-paper-deep">
                {article.featuredImage ? (
                  <Image
                    src={article.featuredImage.url}
                    alt=""
                    fill
                    sizes="80px"
                    className="object-cover"
                    unoptimized={!canOptimizeImage(article.featuredImage.url)}
                  />
                ) : (
                  <Placeholder className="h-full w-full" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-[14px] font-medium leading-[1.6] text-ink group-hover:text-gold-dark">{article.title}</p>
                {article.readingTime ? <p className="mt-0.5 text-[11.5px] text-ink-muted">{article.readingTime}分</p> : null}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
