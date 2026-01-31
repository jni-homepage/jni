'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/', label: '홈' },
  { href: '/company', label: '회사소개' },
  { href: '/process', label: '진행과정' },
  { href: '/fund', label: '자금상담' },
  { href: '/pro', label: '전문서비스' },
  { href: '/mkt', label: '온라인마케팅' },
]

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isMenuOpen])

  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMenuOpen(false)
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [])

  return (
    <>
      {/* 헤더 바 */}
      <div
        className={`fixed top-0 left-0 w-full z-[9999] transition-all duration-300 ${
          isScrolled
            ? 'bg-navy/[0.98] backdrop-blur-[20px] border-b border-gold/50 shadow-[0_0_30px_rgba(212,175,55,0.2)]'
            : 'bg-navy/95 border-b border-gold/30 shadow-[0_2px_10px_rgba(0,0,0,0.3)]'
        }`}
      >
        <header className="max-w-wide mx-auto px-5 md:px-10 flex justify-between items-center h-[70px] md:h-[80px] lg:h-[90px]">
          <Link href="/" className="flex items-center gap-4 z-[10001]">
            {/* 로고 이미지 - 추후 R2에서 서빙 */}
            <span className="text-lg md:text-[22px] lg:text-[24px] font-bold tracking-tight gold-gradient-text whitespace-nowrap">
              제이앤아이 파트너스
            </span>
          </Link>

          {/* 햄버거 버튼 */}
          <button
            className="flex flex-col justify-center items-center gap-[5px] w-11 h-11 bg-transparent border-none cursor-pointer z-[10001]"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? '메뉴 닫기' : '메뉴 열기'}
            aria-expanded={isMenuOpen}
          >
            <span
              className={`block w-6 h-0.5 rounded-sm transition-all duration-400 ${
                isMenuOpen
                  ? 'bg-gold rotate-45 translate-y-[7px]'
                  : 'bg-white'
              }`}
            />
            <span
              className={`block w-6 h-0.5 rounded-sm transition-all duration-400 ${
                isMenuOpen ? 'opacity-0 -translate-x-5' : 'bg-white'
              }`}
            />
            <span
              className={`block w-6 h-0.5 rounded-sm transition-all duration-400 ${
                isMenuOpen
                  ? 'bg-gold -rotate-45 -translate-y-[7px]'
                  : 'bg-white'
              }`}
            />
          </button>
        </header>
      </div>

      {/* 풀스크린 메뉴 */}
      <div
        className={`fixed inset-0 z-[10000] flex items-center justify-center transition-transform duration-700 ${
          isMenuOpen ? 'translate-y-0' : '-translate-y-full'
        }`}
        style={{
          background: 'linear-gradient(135deg, #0f172e 0%, #1a2547 50%, #0f172e 100%)',
          transitionTimingFunction: 'cubic-bezier(0.76, 0, 0.24, 1)',
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) setIsMenuOpen(false)
        }}
      >
        <nav className="w-full max-w-wide mx-auto px-5 md:px-10 py-10">
          <ul className="list-none">
            {NAV_ITEMS.map((item, index) => (
              <li key={item.href} className="overflow-hidden mb-2.5">
                <Link
                  href={item.href}
                  className={`inline-block text-[32px] md:text-[42px] lg:text-[48px] font-bold no-underline py-2 relative transition-all duration-700
                    ${pathname === item.href ? 'text-gold' : 'text-body'}
                    hover:text-gold hover:[text-shadow:0_0_20px_rgba(212,175,55,0.8)]
                    ${isMenuOpen ? 'translate-y-0' : 'translate-y-full'}
                    after:content-[""] after:absolute after:bottom-1 after:left-0 after:w-0 after:h-[3px]
                    after:bg-gradient-to-r after:from-gold-dark after:to-gold
                    after:shadow-[0_0_10px_rgba(212,175,55,0.6)]
                    after:transition-[width] after:duration-300
                    hover:after:w-full
                  `}
                  style={{
                    transitionTimingFunction: 'cubic-bezier(0.76, 0, 0.24, 1)',
                    transitionDelay: isMenuOpen ? `${0.1 + index * 0.05}s` : '0s',
                  }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            {/* 상담신청 CTA */}
            <li className="overflow-hidden mt-5">
              <Link
                href="#consult-form"
                className={`inline-block text-xl md:text-2xl font-bold text-light no-underline
                  px-8 md:px-10 py-3.5 md:py-4 rounded-full
                  gold-gradient-bg gold-glow
                  transition-all duration-300
                  hover:scale-105 hover:shadow-[0_0_50px_rgba(212,175,55,0.8)]
                  ${isMenuOpen ? 'translate-y-0' : 'translate-y-full'}
                `}
                style={{
                  transitionTimingFunction: 'cubic-bezier(0.76, 0, 0.24, 1)',
                  transitionDelay: isMenuOpen ? '0.4s' : '0s',
                }}
                onClick={() => setIsMenuOpen(false)}
              >
                상담신청
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </>
  )
}
