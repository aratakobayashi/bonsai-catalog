import type { Metadata } from 'next'
import { CARE_GROUPS, speciesInGroup, speciesLabel } from '@/lib/care-calendar'
import { SITE_URL } from '@/lib/site'
import { speciesGuideMap } from '@/lib/teire-server'
import { BreadcrumbStructuredData } from '@/components/seo/StructuredData'
import { CONTAINER, PageHeading } from '@/components/ui/design'
import { NoteApp, type SpeciesOptionGroup } from '@/components/note/NoteApp'

export const metadata: Metadata = {
  title: 'わたしの盆栽ノート｜育てている樹の今月やることが分かる - 盆栽コレクション',
  description: '育てている盆栽の樹種と呼び名、迎えた日、最後に植え替えた年を登録すると、その樹の今月の水やり・置き場所・肥料と作業、植え替えの時期の目安を表示します。記録はこのブラウザの中だけに保存され、会員登録やログインはいりません。',
  alternates: { canonical: '/note' },
}

export default function NotePage() {
  // 樹種の選択肢（手入れのグループごと）と、樹種ごとの育て方の記事はサーバーで用意して渡す
  const speciesGroups: SpeciesOptionGroup[] = CARE_GROUPS.map(group => ({
    label: group.label,
    options: speciesInGroup(group.key).map(key => ({ key, label: speciesLabel(key) })),
  }))
  const guides = speciesGuideMap()

  return (
    <div className={`${CONTAINER} pb-12 lg:pb-20`}>
      <BreadcrumbStructuredData
        breadcrumbs={[
          { name: 'ホーム', url: SITE_URL, position: 1 },
          { name: 'わたしの盆栽ノート', url: `${SITE_URL}/note`, position: 2 },
        ]}
      />
      <PageHeading
        title="わたしの盆栽ノート"
        lead="育てている盆栽を登録しておくと、その樹の今月やることと、植え替えの時期の目安をまとめて表示します。"
        crumbs={[{ label: 'ホーム', href: '/' }, { label: 'わたしの盆栽ノート' }]}
      />
      <NoteApp speciesGroups={speciesGroups} guides={guides} />
    </div>
  )
}
