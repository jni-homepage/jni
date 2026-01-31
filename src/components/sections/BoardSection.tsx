'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface BoardPost {
  id: string
  제목: string
  요약: string
  카테고리: string
  금액: string
  작성일: string
  공개여부: boolean
  썸네일: string
}

function formatDate(dateStr: string) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

function categoryStyle(cat: string) {
  switch (cat) {
    case '성공사례':
      return 'bg-gradient-to-r from-emerald-600 to-emerald-500'
    case '정책자금':
      return 'bg-gradient-to-r from-gold-dark to-gold'
    case '인증지원':
      return 'bg-gradient-to-r from-amber-600 to-amber-500'
    default:
      return 'bg-gradient-to-r from-gold-dark to-gold'
  }
}

export default function BoardSection() {
  const [posts, setPosts] = useState<BoardPost[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    async function loadPosts() {
      try {
        const res = await fetch('/api/board')
        const data = await res.json()
        if (data.success && data.posts) {
          const publicPosts = data.posts
            .filter((p: BoardPost) => p.공개여부 !== false)
            .sort((a: BoardPost, b: BoardPost) => new Date(b.작성일).getTime() - new Date(a.작성일).getTime())
          setPosts(publicPosts)
        }
      } catch (e) {
        console.error('게시판 로드 실패:', e)
      } finally {
        setLoading(false)
      }
    }
    loadPosts()
  }, [])

  const categories = ['all', '성공사례', '정책자금', '인증지원']
  const filtered = activeTab === 'all' ? posts : posts.filter(p => p.카테고리 === activeTab)

  return (
    <section
      id="board"
      className="relative w-full py-12 md:py-20 px-5 md:px-8 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #0a1420 0%, #0f172e 50%, #0a1420 100%)' }}
    >
      <div className="relative z-[1] max-w-[1200px] mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-[28px] md:text-[42px] font-black text-light mb-3 leading-tight">
            <span className="gold-gradient-text">성공사례</span> & 소식
          </h2>
          <p className="text-sm md:text-lg text-body/70">
            제이앤아이 파트너스와 함께한 기업들의 실제 지원 스토리
          </p>
        </div>

        {/* 카테고리 탭 */}
        <div className="flex justify-center gap-1.5 md:gap-3 mb-8 md:mb-10">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`px-3 md:px-6 py-1.5 md:py-2.5 rounded-full text-[11px] md:text-sm font-semibold transition-all duration-300 border md:border-2 whitespace-nowrap
                ${activeTab === cat
                  ? 'gold-gradient-bg border-transparent text-[#0f172e]'
                  : 'bg-transparent border-gold/30 text-body/70 hover:border-gold/60 hover:text-gold'
                }`}
            >
              {cat === 'all' ? '전체' : cat}
            </button>
          ))}
        </div>

        {/* 로딩 */}
        {loading && (
          <div className="text-center py-16">
            <div className="w-10 h-10 border-3 border-gold/30 border-t-gold rounded-full animate-spin mx-auto mb-4" />
            <p className="text-body/50 text-sm">게시글을 불러오는 중...</p>
          </div>
        )}

        {/* 빈 상태 */}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4 opacity-30">📋</div>
            <h3 className="text-lg font-semibold text-light mb-2">등록된 게시글이 없습니다</h3>
            <p className="text-body/50 text-sm">곧 새로운 소식을 전해드릴게요!</p>
          </div>
        )}

        {/* 카드 그리드 */}
        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {filtered.slice(0, 9).map(post => (
              <Link
                key={post.id}
                href={`/board/${post.id}`}
                className="group bg-[rgba(20,35,65,0.6)] backdrop-blur-[10px] border border-[rgba(212,175,55,0.12)]
                  rounded-2xl overflow-hidden cursor-pointer
                  transition-all duration-300 block
                  hover:-translate-y-1.5 hover:border-gold/40
                  hover:shadow-[0_10px_40px_rgba(212,175,55,0.15)]"
              >
                {/* 썸네일 */}
                <div className="w-full h-[160px] md:h-[180px] overflow-hidden relative">
                  {post.썸네일 ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={post.썸네일}
                      alt={post.제목}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[rgba(15,23,46,0.8)] to-[rgba(212,175,55,0.15)]">
                      <span className="text-gold/40 text-4xl font-black tracking-widest">JNI</span>
                    </div>
                  )}
                </div>

                {/* 컨텐츠 */}
                <div className="p-5">
                  <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold text-white mb-3 ${categoryStyle(post.카테고리)}`}>
                    {post.카테고리 || '성공사례'}
                  </span>
                  <h3 className="text-[15px] md:text-[16px] font-bold text-light mb-2 leading-snug line-clamp-2 group-hover:text-gold transition-colors">
                    {post.제목 || '(제목 없음)'}
                  </h3>
                  {post.요약 && (
                    <p className="text-[13px] text-body/60 leading-relaxed mb-4 line-clamp-2">
                      {post.요약}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-[12px] text-body/40">
                    <span>{formatDate(post.작성일)}</span>
                    {post.금액 && (
                      <span className="font-bold text-gold text-[13px]">{post.금액}</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
