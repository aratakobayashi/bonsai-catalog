'use client'

// 「わたしの盆栽ノート」本体。記録は localStorage だけに置き、サーバーには送らない
import Link from 'next/link'
import { useState, type FormEvent } from 'react'
import { careForSpecies, getCareGroup, getMonthCare, groupOf, repotWindow, speciesLabel } from '@/lib/care-calendar'
import { NOTE_MAX, NOTE_MEMO_MAX, NOTE_NAME_MAX, useNoteTrees, type NoteTree, type NoteTreeInput } from '@/lib/note-storage'
import { CareIcon } from '@/components/catalog/CareIcon'
import { BasicsList, TaskRow } from '@/components/teire/TeireParts'

export interface SpeciesOptionGroup {
  label: string
  options: { key: string; label: string }[]
}

interface GuideLink {
  slug: string
  title: string
}

interface NoteAppProps {
  speciesGroups: SpeciesOptionGroup[]
  guides: Record<string, GuideLink>
}

const inputClass = 'block min-h-11 w-full border border-line bg-white px-3 py-2 text-[15px] text-ink focus:border-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-gold'
const primaryButton = 'inline-flex h-12 items-center justify-center bg-sumi px-6 text-sm font-bold tracking-[0.04em] text-white hover:bg-sumi-light'
const secondaryButton = 'inline-flex h-11 items-center justify-center border border-line bg-white px-4 text-[13px] text-ink hover:border-ink'

function jstToday(): { year: number; month: number; date: string } {
  const now = new Date(Date.now() + 9 * 3600 * 1000)
  const date = now.toISOString().slice(0, 10)
  return { year: now.getUTCFullYear(), month: now.getUTCMonth() + 1, date }
}

// 「2024-04-01」→ 迎えてからの年・月
function elapsedLabel(acquiredAt: string, today: string): string | null {
  if (!acquiredAt) return null
  const [y1, m1, d1] = acquiredAt.split('-').map(Number)
  const [y2, m2, d2] = today.split('-').map(Number)
  let months = (y2 - y1) * 12 + (m2 - m1) - (d2 < d1 ? 1 : 0)
  if (months < 0) return null
  if (months === 0) return '迎えて1か月未満'
  const years = Math.floor(months / 12)
  months %= 12
  return `迎えて${years > 0 ? `${years}年` : ''}${months > 0 ? `${months}か月` : ''}`
}

function formatDate(value: string): string {
  const [y, m, d] = value.split('-').map(Number)
  return `${y}年${m}月${d}日`
}

function daysSince(value: string, today: string): number {
  return Math.floor((Date.parse(today) - Date.parse(value)) / 86400000)
}

// 次に来る適期の月（今月を含む）
function nextWindowMonth(months: number[], current: number): number | null {
  for (let i = 0; i < 12; i++) {
    const m = ((current - 1 + i) % 12) + 1
    if (months.includes(m)) return m
  }
  return null
}

interface Reminder {
  tone: 'strong' | 'normal' | 'quiet'
  text: string
}

function remindersFor(tree: NoteTree, today: ReturnType<typeof jstToday>): Reminder[] {
  const list: Reminder[] = []
  const win = repotWindow(tree.speciesKey)
  if (win) {
    if (tree.lastRepotYear === null) {
      list.push({ tone: 'quiet', text: `最後に植え替えた年を入れると、植え替えの時期をお知らせします。${speciesLabel(tree.speciesKey)}の植え替えの適期は${win.label}、間隔は${win.interval}が目安です。` })
    } else {
      const years = today.year - tree.lastRepotYear
      if (years >= win.everyYears) {
        const next = nextWindowMonth(win.months, today.month)
        if (next === today.month) {
          list.push({ tone: 'strong', text: `前回の植え替えから${years}年たっています。今月は植え替えの適期（${win.label}）です。水がしみ込みにくい、鉢底から根が出ているなら植え替えます。` })
        } else {
          list.push({ tone: 'normal', text: `前回の植え替えから${years}年たっています。次の適期は${next ?? ''}月ごろ（${win.label}）です。今から用土と鉢を用意しておくと慌てません。` })
        }
      } else {
        list.push({ tone: 'quiet', text: `前回の植え替えは${tree.lastRepotYear}年です。植え替えの間隔は${win.interval}が目安です。` })
      }
    }
  }
  if (tree.acquiredAt) {
    const days = daysSince(tree.acquiredAt, today.date)
    if (days >= 0 && days <= 30) {
      list.push({ tone: 'normal', text: '迎えたばかりの樹は、売り場とは日当たりや風の条件が変わります。植え替えや強い剪定は次の適期まで待ち、まずは水やりと置き場所に慣らします。' })
    }
  }
  return list
}

const EMPTY_INPUT: NoteTreeInput = { speciesKey: '', name: '', acquiredAt: '', lastRepotYear: null, memo: '' }

function TreeForm({
  speciesGroups,
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  speciesGroups: SpeciesOptionGroup[]
  initial: NoteTreeInput
  submitLabel: string
  onSubmit: (input: NoteTreeInput) => void
  onCancel?: () => void
}) {
  const [values, setValues] = useState<NoteTreeInput>(initial)
  const [error, setError] = useState('')
  const today = jstToday()
  const years = Array.from({ length: 31 }, (_, i) => today.year - i)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!values.speciesKey) {
      setError('樹種を選んでください')
      return
    }
    onSubmit({ ...values, name: values.name.trim().slice(0, NOTE_NAME_MAX), memo: values.memo.trim().slice(0, NOTE_MEMO_MAX) })
  }

  return (
    <form onSubmit={handleSubmit} className="border border-line bg-white px-4 py-5 lg:px-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="block min-w-0">
          <span className="text-[13px] font-bold text-ink">樹種<span className="ml-1 text-[11px] font-normal text-ink-muted">必須</span></span>
          <select
            value={values.speciesKey}
            onChange={e => {
              setValues({ ...values, speciesKey: e.target.value })
              setError('')
            }}
            className={`${inputClass} mt-1.5`}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? 'note-species-error' : undefined}
          >
            <option value="">選んでください</option>
            {speciesGroups.map(group => (
              <optgroup key={group.label} label={group.label}>
                {group.options.map(option => (
                  <option key={option.key} value={option.key}>{option.label}</option>
                ))}
              </optgroup>
            ))}
          </select>
          {error && <span id="note-species-error" className="mt-1 block text-xs font-bold text-[#9b1c1c]">{error}</span>}
        </label>
        <label className="block min-w-0">
          <span className="text-[13px] font-bold text-ink">呼び名<span className="ml-1 text-[11px] font-normal text-ink-muted">任意・{NOTE_NAME_MAX}字まで</span></span>
          <input
            type="text"
            value={values.name}
            maxLength={NOTE_NAME_MAX}
            placeholder="例：玄関の黒松"
            onChange={e => setValues({ ...values, name: e.target.value })}
            className={`${inputClass} mt-1.5`}
          />
        </label>
        <label className="block min-w-0">
          <span className="text-[13px] font-bold text-ink">迎えた日<span className="ml-1 text-[11px] font-normal text-ink-muted">任意</span></span>
          <input
            type="date"
            value={values.acquiredAt}
            max={today.date}
            onChange={e => setValues({ ...values, acquiredAt: e.target.value })}
            className={`${inputClass} mt-1.5`}
          />
        </label>
        <label className="block min-w-0">
          <span className="text-[13px] font-bold text-ink">最後に植え替えた年<span className="ml-1 text-[11px] font-normal text-ink-muted">任意</span></span>
          <select
            value={values.lastRepotYear ?? ''}
            onChange={e => setValues({ ...values, lastRepotYear: e.target.value ? Number(e.target.value) : null })}
            className={`${inputClass} mt-1.5`}
          >
            <option value="">分からない・まだ</option>
            {years.map(y => (
              <option key={y} value={y}>{y}年</option>
            ))}
          </select>
        </label>
        <label className="block min-w-0 md:col-span-2">
          <span className="text-[13px] font-bold text-ink">メモ<span className="ml-1 text-[11px] font-normal text-ink-muted">任意・{NOTE_MEMO_MAX}字まで</span></span>
          <textarea
            value={values.memo}
            maxLength={NOTE_MEMO_MAX}
            rows={3}
            placeholder="例：2月に針金をかけた。用土は赤玉土7：桐生砂3"
            onChange={e => setValues({ ...values, memo: e.target.value })}
            className={`${inputClass} mt-1.5`}
          />
        </label>
      </div>
      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <button type="submit" className={primaryButton}>{submitLabel}</button>
        {onCancel && (
          <button type="button" onClick={onCancel} className={`${secondaryButton} h-12`}>
            やめる
          </button>
        )}
      </div>
    </form>
  )
}

function TreeCard({
  tree,
  guide,
  today,
  onEdit,
  onDelete,
}: {
  tree: NoteTree
  guide?: GuideLink
  today: ReturnType<typeof jstToday>
  onEdit: () => void
  onDelete: () => void
}) {
  const care = careForSpecies(today.month, tree.speciesKey)
  // その樹種の作業のあとに、どの樹にも共通することを続ける
  const tasks = care ? [...care.tasks, ...getMonthCare(today.month).common] : []
  const groupKey = groupOf(tree.speciesKey)
  const group = groupKey ? getCareGroup(groupKey) : null
  const label = speciesLabel(tree.speciesKey)
  const elapsed = elapsedLabel(tree.acquiredAt, today.date)
  const reminders = remindersFor(tree, today)

  return (
    <article className="min-w-0 border border-line bg-white">
      <header className="flex items-start gap-3 border-b border-line px-4 py-3.5 lg:px-5">
        <span className="flex h-10 w-10 flex-none items-center justify-center bg-paper-deep text-ink">
          <CareIcon name={group?.icon ?? 'care'} className="h-[22px] w-[22px]" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="break-words font-mincho text-[18px] font-bold tracking-[0.04em] text-ink">{tree.name || label}</h3>
          <p className="mt-0.5 text-[12px] leading-relaxed text-ink-muted">
            {label}
            {group && <>（{group.label}）</>}
            {tree.acquiredAt && <> ・ {formatDate(tree.acquiredAt)}に迎えた{elapsed ? `（${elapsed}）` : ''}</>}
            {tree.lastRepotYear !== null && <> ・ 植え替え {tree.lastRepotYear}年</>}
          </p>
        </div>
      </header>

      <div className="px-4 pb-3 pt-3 lg:px-5">
        {reminders.length > 0 && (
          <ul className="mb-4 space-y-2">
            {reminders.map(r => (
              <li
                key={r.text}
                className={`border-l-2 pl-3 text-[13px] leading-[1.8] ${
                  r.tone === 'strong' ? 'border-gold-dark font-bold text-ink' : r.tone === 'normal' ? 'border-gold text-ink-soft' : 'border-line text-ink-muted'
                }`}
              >
                {r.text}
              </li>
            ))}
          </ul>
        )}

        <h4 className="text-[12px] font-bold tracking-[0.08em] text-ink-muted">今週やること（{today.month}月の手入れから）</h4>
        {care ? (
          <>
            <div className="mt-2">
              <BasicsList care={care} />
            </div>
            {tasks.length > 0 && (
              <ul className="divide-y divide-line">
                {tasks.map((task, i) => (
                  <TaskRow key={`${i}-${task.title}`} task={task} showTarget={false} />
                ))}
              </ul>
            )}
          </>
        ) : (
          <p className="mt-2 text-[13px] text-ink-soft">この樹種の手入れはまだ用意できていません。</p>
        )}

        {tree.memo && (
          <div className="mt-3 bg-paper px-3 py-2.5">
            <p className="text-[11px] font-bold tracking-[0.08em] text-ink-muted">メモ</p>
            <p className="mt-1 whitespace-pre-wrap break-words text-[13px] leading-[1.8] text-ink-soft">{tree.memo}</p>
          </div>
        )}
      </div>

      <footer className="border-t border-line px-4 py-2 lg:px-5">
        <ul className="flex flex-col">
          {guide && (
            <li>
              <Link href={`/guides/${guide.slug}`} className="flex min-h-11 items-center text-[13px] text-ink hover:text-gold-dark">
                {guide.title} ›
              </Link>
            </li>
          )}
          <li>
            <Link href={`/teire/${today.month}`} className="flex min-h-11 items-center text-[13px] text-ink hover:text-gold-dark">
              {today.month}月の手入れをすべて見る ›
            </Link>
          </li>
        </ul>
        <div className="flex gap-2 pb-2 pt-1">
          <button type="button" onClick={onEdit} className={secondaryButton}>編集する</button>
          <button type="button" onClick={onDelete} className={`${secondaryButton} text-[#9b1c1c]`}>削除する</button>
        </div>
      </footer>
    </article>
  )
}

export function NoteApp({ speciesGroups, guides }: NoteAppProps) {
  const { trees, add, update, remove, storageFailed, full } = useNoteTrees()
  // 'new'：追加のフォーム、id：その樹の編集
  const [editing, setEditing] = useState<string | null>(null)

  if (trees === null) {
    return <div className="mt-8 h-40 border border-line bg-white" aria-busy="true" aria-label="読み込み中" />
  }

  const today = jstToday()
  const editingTree = editing && editing !== 'new' ? trees.find(t => t.id === editing) ?? null : null

  const privacy = (
    <p className="mt-6 flex gap-2 text-[12px] leading-[1.8] text-ink-muted">
      <span className="mt-0.5"><CareIcon name="indoor" className="h-4 w-4" /></span>
      <span>
        記録はこのブラウザの中だけに保存され、サーバーには送られません。別の端末やブラウザからは見られず、ブラウザのデータを消すと記録も消えます。
        {storageFailed && <strong className="block text-ink">このブラウザでは保存できないため、ページを閉じると記録が消えます。</strong>}
      </span>
    </p>
  )

  return (
    <div className="mt-8 lg:mt-10">
      {trees.length === 0 && editing !== 'new' && (
        <section className="border border-line bg-white px-4 py-6 lg:px-8 lg:py-8">
          <h2 className="font-mincho text-[19px] font-bold tracking-[0.06em] text-ink">まだ盆栽が登録されていません</h2>
          <p className="mt-3 text-sm leading-[1.9] text-ink-soft">樹種を選んで登録すると、このページを開くたびに、次のことを樹ごとに表示します。</p>
          <ul className="mt-3 space-y-2 text-sm leading-[1.8] text-ink-soft">
            <li className="flex gap-2"><span className="mt-0.5 text-gold-dark"><CareIcon name="water" /></span>今月の水やりの回数の目安・置き場所・肥料</li>
            <li className="flex gap-2"><span className="mt-0.5 text-gold-dark"><CareIcon name="care" /></span>剪定・芽摘み・針金かけなど、今月の作業</li>
            <li className="flex gap-2"><span className="mt-0.5 text-gold-dark"><CareIcon name="season" /></span>前回から2〜3年たったときの、植え替えの時期の案内</li>
          </ul>
          <button type="button" onClick={() => setEditing('new')} className={`${primaryButton} mt-6 w-full sm:w-auto`}>
            最初の1鉢を登録する
          </button>
        </section>
      )}

      {editing === 'new' && (
        <section aria-label="盆栽を登録する">
          <h2 className="mb-3 font-mincho text-[19px] font-bold tracking-[0.06em] text-ink">盆栽を登録する</h2>
          <TreeForm
            speciesGroups={speciesGroups}
            initial={EMPTY_INPUT}
            submitLabel="登録する"
            onSubmit={input => {
              add(input)
              setEditing(null)
            }}
            onCancel={() => setEditing(null)}
          />
        </section>
      )}

      {trees.length > 0 && (
        <section aria-labelledby="note-trees" className={editing === 'new' ? 'mt-10' : ''}>
          <div className="flex flex-wrap items-center gap-3">
            <h2 id="note-trees" className="font-mincho text-xl font-bold tracking-[0.06em] text-ink lg:text-[24px]">
              育てている盆栽<span className="ml-2 text-[14px] font-normal text-ink-muted">{trees.length}鉢</span>
            </h2>
            {editing !== 'new' && (
              <button type="button" onClick={() => setEditing('new')} disabled={full} className={`${secondaryButton} ml-auto disabled:opacity-50`}>
                ＋ 盆栽を追加する
              </button>
            )}
          </div>
          {full && <p className="mt-2 text-[12px] text-ink-muted">登録できるのは{NOTE_MAX}鉢までです。</p>}
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-6">
            {trees.map(tree =>
              editingTree && editingTree.id === tree.id ? (
                <div key={tree.id} className="min-w-0">
                  <TreeForm
                    speciesGroups={speciesGroups}
                    initial={{ speciesKey: tree.speciesKey, name: tree.name, acquiredAt: tree.acquiredAt, lastRepotYear: tree.lastRepotYear, memo: tree.memo }}
                    submitLabel="保存する"
                    onSubmit={input => {
                      update(tree.id, input)
                      setEditing(null)
                    }}
                    onCancel={() => setEditing(null)}
                  />
                </div>
              ) : (
                <TreeCard
                  key={tree.id}
                  tree={tree}
                  guide={guides[tree.speciesKey]}
                  today={today}
                  onEdit={() => setEditing(tree.id)}
                  onDelete={() => {
                    if (window.confirm(`「${tree.name || speciesLabel(tree.speciesKey)}」を削除しますか？`)) remove(tree.id)
                  }}
                />
              ),
            )}
          </div>
          <p className="mt-4 text-[12px] leading-relaxed text-ink-muted">手入れの時期は関東の平地の目安です。寒い地域は春の作業を遅らせ、冬の準備を早めます。水やりは回数より、土が乾いたかを見て決めます。</p>
        </section>
      )}

      {privacy}
    </div>
  )
}
