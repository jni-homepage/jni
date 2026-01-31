'use client'

import { useEffect, useState } from 'react'

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

function categoryColor(cat: string) {
  switch (cat) {
    case '성공사례':
      return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
    case '정책자금':
      return 'bg-gold/20 text-gold border-gold/30'
    case '인증지원':
      return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
    default:
      return 'bg-gold/20 text-gold border-gold/30'
  }
}

export default function BoardSection() {
  const [posts, setPosts] = useState<BoardPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadPosts() {
      try {
        const res = await fetch('/api/board')
        const data = await res.json()
        if (data.success && data.posts) {
          const publicPosts = data.posts
            .filter((p: BoardPost) => p.공개여부 !== false)
            .sort((a: BoardPost, b: BoardPost) => new Date(b.작성일).getTime() - new Date(a.작성일).getTime())
            .slice(0, 5)
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

  return (
    <section
      className="relative w-full py-10 md:py-14 px-4 md:px-8 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #0a1420 0%, #0f172e 50%, #0a1420 100%)' }}
    >
      <div className="relative z-[1] max-w-wide mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-6 md:mb-10">
          <h2 className="text-2xl md:text-[42px] font-black text-light mb-2.5 leading-tight">
            <span className="text-gold">성공사례</span> 게시판
          </h2>
          <p className="text-sm md:text-lg text-body/80">
            제이앤아이 파트너스와 함께한 기업들의 실제 지원 스토리
          </p>
        </div>

        {/* 게시판 리스트 */}
        <div className="flex flex-col gap-3 md:gap-4 max-w-[1000px] mx-auto">
          {loading && (
            <div className="text-center py-12 text-body/60 text-sm">
              게시글을 불러오는 중...
            </div>
          )}

          {!loading && posts.length === 0 && (
            <div className="text-center py-12 text-body/60 text-sm">
              아직 등록된 성공사례가 없습니다.
            </div>
          )}

          {posts.map((post) => (
            <div
              key={post.id}
              className="group grid grid-cols-[1fr] md:grid-cols-[100px_1fr_auto_120px] gap-2 md:gap-5 items-center
                p-4 md:px-7 md:py-5 bg-[rgba(30,60,120,0.12)] backdrop-blur-[10px]
                border border-[rgba(212,175,55,0.15)] rounded-xl md:rounded-2xl
                transition-all duration-300 cursor-pointer
                hover:bg-[rgba(30,60,120,0.2)] hover:border-[rgba(212,175,55,0.4)]
                hover:shadow-[0_0_30px_rgba(212,175,55,0.15)]"
            >
              {/* 썸네일 - 데스크톱 */}
              {post.썸네일 ? (
                <div className="hidden md:block w-[100px] h-[56px] rounded-lg overflow-hidden bg-[rgba(212,175,55,0.1)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={post.썸네일} alt={post.제목} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="hidden md:flex w-[100px] h-[56px] rounded-lg items-center justify-center
                  bg-gradient-to-br from-[rgba(30,60,120,0.3)] to-gold/20 text-gold text-[10px] font-bold">
                  JNI
                </div>
              )}

              {/* 제목 + 요약 + 모바일 메타 */}
              <div className="flex flex-col gap-1 min-w-0">
                <div className="flex items-center gap-2 md:hidden">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${categoryColor(post.카테고리)}`}>
                    {post.카테고리 || '성공사례'}
                  </span>
                  <span className="text-[11px] text-body/50">{formatDate(post.작성일)}</span>
                  {post.금액 && <span className="text-[11px] text-gold font-bold ml-auto">{post.금액}</span>}
                </div>
                <h4 className="text-[15px] md:text-[17px] font-bold text-light truncate group-hover:text-gold transition-colors">
                  {post.제목 || '(제목 없음)'}
                </h4>
                {post.요약 && (
                  <p className="text-[12px] md:text-sm text-body/60 truncate">{post.요약}</p>
                )}
              </div>

              {/* 카테고리 + 날짜 - 데스크톱 */}
              <div className="hidden md:flex items-center gap-3">
                <span className={`text-[12px] font-semibold px-3 py-1 rounded-full border whitespace-nowrap ${categoryColor(post.카테고리)}`}>
                  {post.카테고리 || '성공사례'}
                </span>
                <span className="text-[13px] text-body/50 whitespace-nowrap">{formatDate(post.작성일)}</span>
              </div>

              {/* 금액 - 데스크톱 */}
              <div className="hidden md:block text-right">
                {post.금액 && (
                  <span className="text-lg font-bold text-gold [text-shadow:0_0_10px_rgba(212,175,55,0.5)]">
                    {post.금액}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
