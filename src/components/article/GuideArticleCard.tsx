import Link from 'next/link'
import Image from 'next/image'
import { Placeholder } from '@/components/ui/design'
import { formatDate } from '@/lib/date-utils'
import type { Article } from '@/types'

// 記事カード（PCは画像が上、SPは左に小さな画像の行。枠や影は付けない）
export function GuideArticleCard({
  article,
  showDateOnMobile = false,
  priority = false,
}: {
  article: Article
  showDateOnMobile?: boolean
  priority?: boolean
}) {
  return (
    <Link
      href={`/guides/${article.slug}`}
      className="group flex gap-3.5 border-b border-line py-4 lg:block lg:border-0 lg:py-0"
    >
      <div className="relative h-[72px] w-24 flex-none overflow-hidden lg:aspect-[3/2] lg:h-auto lg:w-full">
        {article.featuredImage ? (
          <Image
            src={article.featuredImage.url}
            alt={article.featuredImage.alt || article.title}
            fill
            priority={priority}
            sizes="(max-width: 1023px) 96px, 360px"
            className="object-cover"
          />
        ) : (
          <Placeholder className="h-full w-full" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <span className="block text-[10.5px] text-gold-dark lg:mt-3.5 lg:text-[11px]">{article.category.name}</span>
        <h2 className="mt-0.5 line-clamp-3 font-mincho text-sm font-bold leading-[1.55] text-ink group-hover:text-gold-dark lg:mt-1 lg:text-[17px] lg:leading-[1.6]">
          {article.title}
        </h2>
        <p className="mt-1 text-[10.5px] text-ink-muted lg:mt-2 lg:text-[11.5px]">
          <span className={showDateOnMobile ? '' : 'hidden lg:inline'}>
            {formatDate(article.publishedAt)}
            {article.readingTime ? '・' : ''}
          </span>
          {article.readingTime ? `${article.readingTime}分` : ''}
        </p>
      </div>
    </Link>
  )
}
