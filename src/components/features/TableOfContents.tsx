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
    const element = document.getElementById(id)
    if (element) {
      const offsetTop = element.getBoundingClientRect().top + window.pageYOffset - 100
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      })
    }
  }

  return (
    <Card className="sticky top-8">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          <List className="h-4 w-4 mr-2 text-blue-600" />
          目次
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <nav>
          <ul className="space-y-1">
            {items.map((item, index) => (
              <li key={index}>
                <button
                  onClick={() => scrollToHeading(item.id)}
                  className={`
                    block w-full text-left text-sm py-2 px-3 rounded-md transition-colors
                    ${item.level === 1 ? 'font-semibold' : ''}
                    ${item.level === 2 ? 'ml-4 font-medium' : ''}
                    ${item.level === 3 ? 'ml-8' : ''}
                    ${
                      activeId === item.id
                        ? 'bg-accent-100 text-accent-800 font-medium'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }
                  `}
                >
                  {item.text}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </CardContent>
    </Card>
  )
}