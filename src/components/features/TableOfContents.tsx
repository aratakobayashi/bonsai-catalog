'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { List } from 'lucide-react'

interface TOCItem {
  level: number
  text: string
  id: string
}

interface TableOfContentsProps {
  items: TOCItem[]
}

export function TableOfContents({ items }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      {
        rootMargin: '-20% 0% -35% 0%',
        threshold: 0
      }
    )

    // 見出し要素を監視
    items.forEach((item) => {
      const element = document.getElementById(item.id)
      if (element) {
        observer.observe(element)
      }
    })

    return () => observer.disconnect()
  }, [items])

  if (items.length === 0) return null

  const scrollToHeading = (id: string) => {
    console.log('目次クリック:', id) // デバッグ用
    const element = document.getElementById(id)
    console.log('見出し要素:', element) // デバッグ用
    if (element) {
      const offsetTop = element.getBoundingClientRect().top + window.pageYOffset - 100
      console.log('スクロール位置:', offsetTop) // デバッグ用
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      })
    } else {
      console.error('見出し要素が見つかりません:', id)
    }
  }

  return (
    <div className="sticky top-8">
      <div className="bg-gradient-to-br from-slate-50 to-blue-50 border border-slate-200 rounded-xl shadow-xl p-6 hover:shadow-2xl transition-shadow duration-300">
        <div className="pb-4 border-b border-slate-200/60">
          <h3 className="text-lg font-semibold bg-gradient-to-r from-slate-700 to-blue-700 bg-clip-text text-transparent flex items-center">
            <List className="h-5 w-5 mr-2 text-slate-600" />
            目次
            <span className="ml-auto text-xs text-slate-500 font-normal bg-slate-100 px-2 py-1 rounded-full">
              {items.length}項目
            </span>
          </h3>
        </div>
        <div className="pt-4">
        <nav>
          <ul className="space-y-1">
            {items.map((item, index) => {
              const isActive = activeId === item.id
              const indentClass = item.level === 2 ? 'ml-3' : item.level === 3 ? 'ml-6' : ''

              return (
                <li key={index}>
                  <button
                    onClick={() => scrollToHeading(item.id)}
                    className={`
                      group block w-full text-left py-3 px-4 rounded-lg transition-all duration-200 text-sm border-l-3
                      ${indentClass}
                      ${item.level === 1 ? 'font-semibold' : ''}
                      ${item.level === 2 ? 'font-medium' : ''}
                      ${item.level === 3 ? 'font-normal' : ''}
                      ${
                        isActive
                          ? 'bg-gradient-to-r from-indigo-100 to-blue-100 text-indigo-900 border-indigo-500 shadow-md scale-[1.02]'
                          : 'text-slate-700 hover:bg-gradient-to-r hover:from-slate-50 hover:to-blue-50 hover:text-slate-900 border-transparent hover:border-slate-300 hover:shadow-sm'
                      }
                    `}
                  >
                    <span className="flex items-center">
                      {item.level > 1 && (
                        <span className="inline-block w-2 h-2 bg-gray-300 rounded-full mr-2 group-hover:bg-blue-400 transition-colors" />
                      )}
                      <span className="truncate">{item.text}</span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* 進捗バー */}
        <div className="mt-6 pt-4 border-t border-slate-200/60">
          <div className="flex items-center text-xs text-slate-600">
            <span className="font-medium">読了進捗</span>
            <div className="flex-1 mx-3 h-2 bg-slate-200 rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-blue-500 to-purple-500 transition-all duration-500 rounded-full shadow-sm"
                style={{ width: `${items.length > 0 ? (items.findIndex(item => item.id === activeId) + 1) / items.length * 100 : 0}%` }}
              />
            </div>
            <span className="bg-slate-100 px-2 py-1 rounded-full font-medium text-slate-700">
              {items.length > 0 ? Math.max(1, items.findIndex(item => item.id === activeId) + 1) : 0}/{items.length}
            </span>
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}