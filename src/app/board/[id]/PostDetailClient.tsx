'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface BoardPost {
  id: string
  제목: string
  요약: string
  내용: string
  카테고리: string
  금액: string
  작성일: string
  공개여부: boolean
  썸네일: string
}

interface RelatedPost {
  id: string
  제목: string
  요약: string
  카테고리: string
  금액: string
  작성일: string
  썸네일: string
}

function formatDate(dateStr: string) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

function categoryClass(cat: string) {
  switch (cat) {
    case '성공사례': return 'jni-cat-success'
    case '정책자금': return 'jni-cat-fund'
    case '인증지원': return 'jni-cat-cert'
    default: return 'jni-cat-fund'
  }
}

export default function PostDetailClient({ postId }: { postId: string }) {
  const [post, setPost] = useState<BoardPost | null>(null)
  const [related, setRelated] = useState<RelatedPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const [postRes, listRes] = await Promise.all([
          fetch(`/api/board?id=${postId}`),
          fetch('/api/board'),
        ])
        const postData = await postRes.json()
        const listData = await listRes.json()

        if (!postData.success || !postData.post) {
          setError('게시글을 찾을 수 없습니다.')
          return
        }
        setPost(postData.post)

        if (listData.success && listData.posts) {
          const others = listData.posts
            .filter((p: RelatedPost) => p.id !== postId)
            .sort((a: RelatedPost, b: RelatedPost) => new Date(b.작성일).getTime() - new Date(a.작성일).getTime())
            .slice(0, 3)
          setRelated(others)
        }
      } catch {
        setError('게시글을 불러오는 중 오류가 발생했습니다.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [postId])

  function handleCopyLink() {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleShare() {
    if (navigator.share && post) {
      navigator.share({ title: post.제목, url: window.location.href })
    } else {
      handleCopyLink()
    }
  }

  // 로딩
  if (loading) {
    return (
      <div className="jni-post-section">
        <div className="jni-post-layout" style={{ justifyItems: 'center', padding: '80px 20px' }}>
          <div className="w-10 h-10 border-[3px] border-gold/30 border-t-gold rounded-full animate-spin" />
          <p className="text-body/50 text-sm mt-4">게시글을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  // 에러
  if (error || !post) {
    return (
      <div className="jni-post-section">
        <div className="jni-post-layout" style={{ textAlign: 'center', padding: '80px 20px' }}>
          <div className="text-5xl mb-4 opacity-30">📋</div>
          <h2 className="text-xl font-bold text-light mb-3">{error || '게시글을 찾을 수 없습니다'}</h2>
          <Link href="/#board" className="inline-flex items-center gap-2 px-6 py-3 gold-gradient-bg rounded-full text-navy font-bold text-sm hover:opacity-90 transition-opacity">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
            목록으로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="jni-post-section">
        <div className="jni-post-layout">
          {/* 메인 컨텐츠 */}
          <div className="jni-post-main">
            {/* 브레드크럼 */}
            <nav className="jni-post-breadcrumb">
              <Link href="/">홈</Link>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
              <Link href="/#board">게시판</Link>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
              <span className="current">{post.카테고리 || '게시글'}</span>
            </nav>

            {/* 게시글 카드 */}
            <div className="jni-post-card">
              {/* 헤더 */}
              <div className="jni-post-header">
                <span className={`jni-post-category ${categoryClass(post.카테고리)}`}>
                  {post.카테고리 || '성공사례'}
                </span>
                <h1 className="jni-post-title">{post.제목}</h1>
                {post.요약 && <p className="jni-post-subtitle">{post.요약}</p>}
                <div className="jni-post-meta">
                  <div className="jni-post-meta-item">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                    <span>{formatDate(post.작성일)}</span>
                  </div>
                  {post.금액 && (
                    <div className="jni-post-meta-item">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                      <span className="font-bold text-gold">{post.금액}</span>
                    </div>
                  )}
                  <div className="jni-post-meta-item">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                    <span>제이앤아이 파트너스</span>
                  </div>
                </div>
              </div>

              {/* 썸네일 */}
              {post.썸네일 && (
                <div className="jni-post-thumbnail-wrap">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={post.썸네일} alt={post.제목} className="jni-post-thumbnail" />
                </div>
              )}

              {/* 본문 */}
              <div className="jni-post-content">
                {post.내용 ? (
                  <div className="jni-post-body" dangerouslySetInnerHTML={{ __html: post.내용 }} />
                ) : (
                  <div className="jni-post-body">
                    <p className="text-body/50">본문 내용이 없습니다.</p>
                  </div>
                )}
              </div>

              {/* CTA 섹션 */}
              <div className="jni-post-cta-section">
                <div className="jni-post-cta-badge">정책자금 경영컨설팅</div>
                <h3 className="jni-post-cta-title">정책자금 무료 상담</h3>
                <p className="jni-post-cta-desc">
                  전문 컨설턴트가 기업 맞춤형 자금 솔루션을 제안해 드립니다.
                  <br className="hidden md:inline" />
                  지금 바로 상담 신청하세요.
                </p>
                <Link href="/#consult-form" className="jni-post-cta-btn">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  무료 상담 신청
                </Link>
              </div>
            </div>

            {/* 관련 게시글 */}
            {related.length > 0 && (
              <div className="jni-post-related">
                <h3 className="jni-post-related-title">관련 게시글</h3>
                <div className="jni-post-related-grid">
                  {related.map(r => (
                    <Link key={r.id} href={`/board/${r.id}`} className="jni-post-related-card group">
                      <div className="jni-post-related-thumb">
                        {r.썸네일 ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={r.썸네일} alt={r.제목} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-navy to-[rgba(212,175,55,0.15)]">
                            <span className="text-gold/40 text-2xl font-black tracking-widest">JNI</span>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold text-white mb-2 ${
                          r.카테고리 === '성공사례' ? 'bg-emerald-600' : r.카테고리 === '인증지원' ? 'bg-amber-600' : 'bg-gradient-to-r from-gold-dark to-gold'
                        }`}>{r.카테고리}</span>
                        <h4 className="text-[14px] font-bold text-light leading-snug line-clamp-2 group-hover:text-gold transition-colors">{r.제목}</h4>
                        <p className="text-[12px] text-body/50 mt-2">{formatDate(r.작성일)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 사이드바 (데스크톱) */}
          <aside className="jni-post-sidebar">
            <div className="jni-post-sidebar-sticky">
              {/* 공유 */}
              <div className="jni-post-sidebar-card">
                <h4 className="jni-post-sidebar-title">공유하기</h4>
                <div className="flex flex-col gap-2">
                  <button onClick={handleCopyLink} className="jni-post-share-btn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                    {copied ? '복사됨!' : '링크 복사'}
                  </button>
                  <button onClick={handleShare} className="jni-post-share-btn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/></svg>
                    공유하기
                  </button>
                </div>
              </div>

              {/* 게시글 정보 */}
              <div className="jni-post-sidebar-card">
                <h4 className="jni-post-sidebar-title">게시글 정보</h4>
                <div className="flex flex-col gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-body/50">카테고리</span>
                    <span className="text-gold font-semibold">{post.카테고리}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-body/50">작성일</span>
                    <span className="text-light">{formatDate(post.작성일)}</span>
                  </div>
                  {post.금액 && (
                    <div className="flex justify-between">
                      <span className="text-body/50">지원 금액</span>
                      <span className="text-gold font-bold">{post.금액}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 목록 돌아가기 */}
              <Link href="/#board" className="jni-post-back-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
                목록으로 돌아가기
              </Link>
            </div>
          </aside>
        </div>
      </div>

      {/* 모바일 하단 바 */}
      <div className="jni-post-mobile-bar">
        <Link href="/#board" className="jni-post-mobile-back">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
          목록
        </Link>
        <button onClick={handleShare} className="jni-post-mobile-share">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/></svg>
          {copied ? '복사됨!' : '공유'}
        </button>
      </div>

      {/* 토스트 알림 */}
      {copied && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-gold text-navy font-bold text-sm rounded-full shadow-lg animate-fade-up">
          링크가 복사되었습니다
        </div>
      )}

      <style jsx>{`
        /* Post Section */
        .jni-post-section {
          background: linear-gradient(180deg, #0a1420 0%, #0f172e 50%, #0a1420 100%);
          min-height: calc(100vh - 200px);
          padding: 40px 0 80px;
        }

        /* 2컬럼 레이아웃 */
        .jni-post-layout {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
          display: grid;
          grid-template-columns: 1fr;
          gap: 40px;
        }
        @media (min-width: 1024px) {
          .jni-post-layout {
            grid-template-columns: 1fr 300px;
          }
        }

        .jni-post-main { min-width: 0; }

        /* 브레드크럼 */
        .jni-post-breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 24px;
          font-size: 14px;
          color: rgba(232, 212, 168, 0.5);
        }
        .jni-post-breadcrumb a {
          color: rgba(232, 212, 168, 0.5);
          text-decoration: none;
          transition: color 0.3s;
        }
        .jni-post-breadcrumb a:hover { color: #d4af37; }
        .jni-post-breadcrumb .current {
          color: #faf8f3;
          font-weight: 500;
        }

        /* 게시글 카드 */
        .jni-post-card {
          background: rgba(20, 35, 65, 0.6);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(212, 175, 55, 0.12);
          border-radius: 20px;
          overflow: hidden;
        }

        /* 헤더 */
        .jni-post-header {
          padding: 40px 40px 30px;
          border-bottom: 1px solid rgba(212, 175, 55, 0.12);
        }
        @media (max-width: 768px) {
          .jni-post-header { padding: 24px 20px 20px; }
        }

        /* 카테고리 */
        .jni-post-category {
          display: inline-block;
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
          color: #fff;
          margin-bottom: 16px;
        }
        .jni-cat-success { background: linear-gradient(135deg, #059669 0%, #10B981 100%); }
        .jni-cat-fund { background: linear-gradient(135deg, #8b6f3f 0%, #d4af37 100%); }
        .jni-cat-cert { background: linear-gradient(135deg, #D97706 0%, #F59E0B 100%); }

        /* 제목 */
        .jni-post-title {
          font-size: 26px;
          font-weight: 700;
          color: #faf8f3;
          line-height: 1.4;
          margin-bottom: 12px;
          word-break: keep-all;
        }
        @media (min-width: 768px) {
          .jni-post-title { font-size: 32px; }
        }

        .jni-post-subtitle {
          font-size: 15px;
          color: rgba(232, 212, 168, 0.7);
          line-height: 1.6;
          margin-bottom: 20px;
        }
        @media (min-width: 768px) {
          .jni-post-subtitle { font-size: 16px; }
        }

        /* 메타 */
        .jni-post-meta {
          display: flex;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
          font-size: 14px;
          color: rgba(232, 212, 168, 0.5);
          padding-top: 20px;
          border-top: 1px solid rgba(212, 175, 55, 0.12);
        }
        .jni-post-meta-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .jni-post-meta-item svg { stroke: rgba(212, 175, 55, 0.5); }

        /* 썸네일 */
        .jni-post-thumbnail-wrap {
          width: 100%;
          border-bottom: 1px solid rgba(212, 175, 55, 0.12);
        }
        .jni-post-thumbnail {
          width: 100%;
          max-height: 500px;
          object-fit: cover;
          display: block;
        }

        /* 본문 */
        .jni-post-content { padding: 40px; }
        @media (max-width: 768px) {
          .jni-post-content { padding: 24px 20px; }
        }

        .jni-post-body {
          font-size: 16px;
          line-height: 1.9;
          color: #ffffff;
        }
        .jni-post-body p { margin-bottom: 16px; }

        .jni-post-body h1, .jni-post-body h2, .jni-post-body h3 {
          color: #faf8f3;
          font-weight: 700;
          margin: 32px 0 16px;
        }
        .jni-post-body h1 { font-size: 24px; }
        .jni-post-body h2 {
          font-size: 20px;
          padding-bottom: 8px;
          border-bottom: 2px solid rgba(212, 175, 55, 0.2);
        }
        .jni-post-body h3 { font-size: 18px; }

        .jni-post-body strong { color: #d4af37; font-weight: 600; }

        .jni-post-body ul, .jni-post-body ol {
          margin: 16px 0;
          padding-left: 24px;
        }
        .jni-post-body li { margin-bottom: 8px; line-height: 1.7; }

        .jni-post-body blockquote {
          margin: 24px 0;
          padding: 20px 25px;
          background: rgba(212, 175, 55, 0.08);
          border-left: 4px solid #d4af37;
          border-radius: 0 8px 8px 0;
          font-style: italic;
          color: rgba(232, 212, 168, 0.7);
        }

        .jni-post-body table {
          width: 100%;
          border-collapse: collapse;
          margin: 16px 0;
          font-size: 14px;
        }
        .jni-post-body th, .jni-post-body td {
          padding: 12px 8px;
          text-align: center;
          vertical-align: top;
          border: 1px solid rgba(212, 175, 55, 0.15);
        }
        .jni-post-body th {
          background: rgba(212, 175, 55, 0.1);
          font-weight: 600;
          color: #d4af37;
        }

        .jni-post-body a {
          color: #d4af37;
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        .jni-post-body a:hover { color: #e8c689; }

        .jni-post-body img {
          max-width: 100%;
          border-radius: 12px;
          margin: 16px 0;
        }

        /* 하이라이트 박스 */
        .jni-post-body .highlight {
          background: linear-gradient(135deg, rgba(212,175,55,0.1) 0%, rgba(139,111,63,0.15) 100%);
          padding: 24px;
          border-radius: 12px;
          margin-bottom: 24px;
          border: 1px solid rgba(212,175,55,0.2);
        }

        /* 모바일 테이블 */
        @media (max-width: 480px) {
          .jni-post-body table {
            display: block;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            font-size: 12px;
          }
          .jni-post-body th, .jni-post-body td {
            min-width: 80px;
            padding: 8px 6px;
            word-break: keep-all;
          }
        }

        /* CTA 섹션 */
        .jni-post-cta-section {
          margin: 40px;
          padding: 40px;
          background: rgba(20, 35, 65, 0.8);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(212, 175, 55, 0.2);
          border-radius: 20px;
          text-align: center;
        }
        @media (max-width: 768px) {
          .jni-post-cta-section { margin: 24px 20px; padding: 30px 20px; }
        }

        .jni-post-cta-badge {
          display: inline-block;
          background: linear-gradient(135deg, #8b6f3f, #d4af37);
          color: #fff;
          padding: 6px 18px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 20px;
        }

        .jni-post-cta-title {
          font-size: 24px;
          font-weight: 700;
          color: #faf8f3;
          margin: 0 0 12px;
        }
        @media (max-width: 768px) {
          .jni-post-cta-title { font-size: 20px; }
        }

        .jni-post-cta-desc {
          font-size: 15px;
          color: rgba(232, 212, 168, 0.7);
          line-height: 1.7;
          margin: 0 0 28px;
        }

        .jni-post-cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 36px;
          background: rgba(212, 175, 55, 0.08);
          border: 2px solid rgba(212, 175, 55, 0.3);
          border-radius: 30px;
          color: #d4af37;
          font-size: 16px;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.3s;
        }
        .jni-post-cta-btn:hover {
          background: rgba(212, 175, 55, 0.15);
          border-color: rgba(212, 175, 55, 0.6);
          transform: translateY(-2px);
        }

        /* 관련 게시글 */
        .jni-post-related {
          margin-top: 48px;
        }
        .jni-post-related-title {
          font-size: 20px;
          font-weight: 700;
          color: #faf8f3;
          margin-bottom: 20px;
        }
        .jni-post-related-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }
        @media (min-width: 640px) {
          .jni-post-related-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (min-width: 1024px) {
          .jni-post-related-grid { grid-template-columns: repeat(3, 1fr); }
        }

        .jni-post-related-card {
          background: rgba(20, 35, 65, 0.6);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(212, 175, 55, 0.12);
          border-radius: 16px;
          overflow: hidden;
          text-decoration: none;
          transition: all 0.3s;
        }
        .jni-post-related-card:hover {
          transform: translateY(-4px);
          border-color: rgba(212, 175, 55, 0.4);
          box-shadow: 0 10px 40px rgba(212, 175, 55, 0.15);
        }

        .jni-post-related-thumb {
          width: 100%;
          height: 120px;
          overflow: hidden;
        }

        /* 사이드바 */
        .jni-post-sidebar {
          display: none;
        }
        @media (min-width: 1024px) {
          .jni-post-sidebar { display: block; }
        }

        .jni-post-sidebar-sticky {
          position: sticky;
          top: 100px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .jni-post-sidebar-card {
          background: rgba(20, 35, 65, 0.6);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(212, 175, 55, 0.12);
          border-radius: 16px;
          padding: 24px;
        }

        .jni-post-sidebar-title {
          font-size: 14px;
          font-weight: 700;
          color: #faf8f3;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid rgba(212, 175, 55, 0.12);
        }

        .jni-post-share-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 10px;
          background: rgba(212, 175, 55, 0.08);
          border: 1px solid rgba(212, 175, 55, 0.2);
          border-radius: 10px;
          color: rgba(232, 212, 168, 0.7);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s;
        }
        .jni-post-share-btn:hover {
          background: rgba(212, 175, 55, 0.15);
          border-color: rgba(212, 175, 55, 0.4);
          color: #d4af37;
        }

        .jni-post-back-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #8b6f3f, #d4af37);
          border-radius: 12px;
          color: #0f172e;
          font-size: 14px;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.3s;
        }
        .jni-post-back-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(212, 175, 55, 0.3);
        }

        /* 모바일 하단 바 */
        .jni-post-mobile-bar {
          display: flex;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 40;
          background: rgba(10, 20, 32, 0.95);
          backdrop-filter: blur(10px);
          border-top: 1px solid rgba(212, 175, 55, 0.2);
          padding: 12px 20px;
          gap: 12px;
        }
        @media (min-width: 1024px) {
          .jni-post-mobile-bar { display: none; }
        }

        .jni-post-mobile-back {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 12px;
          background: linear-gradient(135deg, #8b6f3f, #d4af37);
          border-radius: 10px;
          color: #0f172e;
          font-size: 14px;
          font-weight: 700;
          text-decoration: none;
        }

        .jni-post-mobile-share {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 12px 20px;
          background: rgba(212, 175, 55, 0.1);
          border: 1px solid rgba(212, 175, 55, 0.3);
          border-radius: 10px;
          color: #d4af37;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }
      `}</style>
    </>
  )
}
