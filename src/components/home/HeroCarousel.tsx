'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useState } from 'react'

export interface HeroSlide {
  id: number
  image: string
  title: string
  subtitle: string
  description: string
  cta: string
  link: string
}

// 1枚目はサーバー側で描画され、LCP 対象として優先読み込みされる。
// 自動切り替えは LCP（表示速度の指標）を遅らせるため行わず、矢印・ドットで切り替える
export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [currentSlide, setCurrentSlide] = useState(0)

  const nextSlide = useCallback(() => {
    setCurrentSlide(prev => (prev + 1) % slides.length)
  }, [slides.length])

  const prevSlide = useCallback(() => {
    setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length)
  }, [slides.length])

  return (
    <section className="relative overflow-hidden">
      <div className="relative h-[40vh] md:h-[45vh]">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
            aria-hidden={index !== currentSlide}
          >
            <div className="relative w-full h-full">
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                sizes="100vw"
                priority={index === 0}
                quality={60}
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/30 to-transparent"></div>

              <div className="absolute inset-0 flex items-center">
                <div className="container mx-auto px-4">
                  <div className="max-w-2xl">
                    <div className="text-white space-y-6">
                      <div>
                        <p className="text-sm md:text-base font-light tracking-widest text-white/80 mb-2">
                          {slide.subtitle}
                        </p>
                        <p className="text-4xl md:text-6xl lg:text-7xl font-light tracking-tight leading-tight mb-4">
                          {slide.title}
                        </p>
                        <div className="h-px bg-gradient-to-r from-white/60 to-transparent w-32 mb-6"></div>
                      </div>
                      <p className="text-lg md:text-xl font-light leading-relaxed text-white/90 max-w-xl">
                        {slide.description}
                      </p>
                      <div className="pt-4">
                        <Link
                          href={slide.link}
                          tabIndex={index === currentSlide ? 0 : -1}
                          className="inline-flex items-center gap-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-medium px-8 py-4 rounded-full transition-all duration-300 hover:scale-105 border border-white/20 hover:border-white/40"
                        >
                          {slide.cta}
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={prevSlide}
          aria-label="前のスライド"
          className="absolute left-6 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300 hover:scale-110"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={nextSlide}
          aria-label="次のスライド"
          className="absolute right-6 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300 hover:scale-110"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
          <div className="flex space-x-3">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                onClick={() => setCurrentSlide(index)}
                aria-label={`スライド${index + 1}`}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
