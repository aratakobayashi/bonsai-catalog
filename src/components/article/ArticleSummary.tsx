// 「この記事で分かること」（記事の front matter の summary から）
export function ArticleSummary({ items }: { items: string[] }) {
  if (items.length === 0) return null
  return (
    <section aria-labelledby="article-summary" className="mt-8 border border-line bg-white px-5 py-5 lg:mt-10 lg:px-7 lg:py-6">
      <h2 id="article-summary" className="text-[13px] font-bold tracking-[0.1em] text-ink">この記事で分かること</h2>
      <ul className="mt-3 space-y-2.5">
        {items.map(item => (
          <li key={item} className="flex gap-3 text-[15px] leading-[1.75] text-ink-soft lg:text-base">
            <span aria-hidden="true" className="mt-[0.7em] h-[5px] w-[5px] flex-none bg-gold" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
