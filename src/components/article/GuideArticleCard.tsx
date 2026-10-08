import Link from 'next/link'
import Image from 'next/image'
import { Placeholder } from '@/components/ui/design'
import { formatDate } from '@/lib/date-utils'
import type { Article } from '@/types'

// 記事カード（PCは画像が上のカード、SPは左に小さな画像の行）
export function GuideArticleCard({ article, showDateOnMobile = false }: { article: Article; showDateOnMobile?: boolean }) {
  return (
    <Link
      href={`/guides/${article.slug}`}
      className="group flex gap-3 p-3 lg:flex-col lg:gap-0 lg:overflow-hidden lg:rounded-xl lg:border lg:border-line lg:bg-white lg:p-0 lg:transition-shadow lg:hover:shadow-md"
    >
      <div className="relative h-[64px] w-[86px] flex-none overflow-hidden rounded-md lg:h-[170px] lg:w-full lg:rounded-none">
        {article.featuredImage ? (
          <Image
            src={article.featuredImage.url}
            alt={article.featuredImage.alt || article.title}
            fill
            sizes="(max-width: 1024px) 86px, 400px"
            className="object-cover transition-transform duration-300 lg:group-hover:scale-105"
          />
        ) : (
          <Placeholder className="h-full w-full" />
        )}
      </div>
      <div className="min-w-0 flex-1 lg:p-4">
        <span className="text-[11px] text-gold-dark lg:inline-block lg:rounded lg:bg-[#fdf8f0] lg:px-2 lg:py-0.5 lg:text-[11.5px]">
          {article.category.name}
        </span>
        <h2 className="mt-0.5 line-clamp-2 font-mincho text-[14.5px] font-bold leading-snug text-ink group-hover:text-navy lg:mt-2 lg:text-base lg:leading-relaxed">
          {article.title}
        </h2>
        <p className="mt-1 text-[11px] text-ink-muted lg:mt-2 lg:text-xs">
          <span className={showDateOnMobile ? '' : 'hidden lg:inline'}>
            {formatDate(article.publishedAt)}
            {article.readingTime ? '・' : ''}
          </span>
          {article.readingTime ? `${article.readingTime}分で読めます` : ''}
        </p>
      </div>
    </Link>
  )
}
