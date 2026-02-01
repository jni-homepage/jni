'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import StatCard from '@/components/dashboard/StatCard'

interface Lead {
  id: string
  기업명: string
  대표자명: string
  연락처: string
  자금종류: string
  접수일시: string
  상태: string
}

interface Post {
  id: string
  제목: string
  카테고리: string
  작성일: string
  공개여부: boolean
}

interface Stats {
  total: number
  신규: number
  대기: number
  상담중: number
  진행중: number
  완료: number
}

export default function DashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [stats, setStats] = useState<Stats>({ total: 0, 신규: 0, 대기: 0, 상담중: 0, 진행중: 0, 완료: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [leadsRes, boardRes] = await Promise.all([
          fetch('/api/leads'),
          fetch('/api/board'),
        ])
        const leadsData = await leadsRes.json()
        const boardData = await boardRes.json()

        if (leadsData.success) {
          setLeads(leadsData.leads.slice(0, 5))
          setStats(leadsData.stats)
        }
        if (boardData.success) {
          setPosts(boardData.posts.slice(0, 5))
        }
      } catch (error) {
        console.error('Dashboard fetch error:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const STATUS_COLORS: Record<string, string> = {
    신규: 'bg-blue-100 text-blue-700',
    대기: 'bg-yellow-100 text-yellow-700',
    상담중: 'bg-purple-100 text-purple-700',
    진행중: 'bg-orange-100 text-orange-700',
    완료: 'bg-green-100 text-green-700',
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-gray-200 animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-80 rounded-2xl bg-gray-200 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="전체 접수"
          value={stats.total}
          color="blue"
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
        />
        <StatCard
          label="대기 중"
          value={stats.신규 + stats.대기}
          color="yellow"
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard
          label="완료"
          value={stats.완료}
          color="green"
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard
          label="게시글"
          value={posts.length > 0 ? posts.length : 0}
          color="purple"
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>}
        />
      </div>

      {/* 최근 접수 + 최근 게시글 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 최근 접수 */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">최근 접수</h2>
            <Link href="/dashboard/leads" className="text-sm text-blue-600 hover:underline">
              전체보기
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {leads.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-400 text-sm">
                접수 내역이 없습니다
              </div>
            ) : (
              leads.map((lead) => (
                <div key={lead.id} className="px-6 py-3 flex items-center justify-between hover:bg-gray-50">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{lead.기업명 || lead.대표자명}</p>
                    <p className="text-xs text-gray-400">{lead.자금종류} &middot; {lead.접수일시}</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap ${STATUS_COLORS[lead.상태] || 'bg-gray-100 text-gray-600'}`}>
                    {lead.상태}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 최근 게시글 */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">최근 게시글</h2>
            <Link href="/dashboard/board" className="text-sm text-blue-600 hover:underline">
              전체보기
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {posts.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-400 text-sm">
                게시글이 없습니다
              </div>
            ) : (
              posts.map((post) => (
                <div key={post.id} className="px-6 py-3 flex items-center justify-between hover:bg-gray-50">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{post.제목}</p>
                    <p className="text-xs text-gray-400">{post.카테고리} &middot; {post.작성일}</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${post.공개여부 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {post.공개여부 ? '공개' : '비공개'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
