'use client'

import { useEffect, useState } from 'react'

interface Post {
  id: string
  제목: string
  카테고리: string
  작성일: string
  공개여부: boolean
  요약: string
}

const CATEGORY_TABS = ['전체', '성공사례', '정책자금', '인증지원']

export default function BoardManagePage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [filter, setFilter] = useState('전체')
  const [loading, setLoading] = useState(true)

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/board')
      const data = await res.json()
      if (data.success) {
        setPosts(data.posts)
      }
    } catch (error) {
      console.error('Board fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`"${title}" 게시글을 삭제하시겠습니까?`)) return

    try {
      const res = await fetch(`/api/board?id=${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setPosts((prev) => prev.filter((p) => p.id !== id))
      }
    } catch (error) {
      console.error('Delete error:', error)
    }
  }

  const filteredPosts = filter === '전체' ? posts : posts.filter((p) => p.카테고리 === filter)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">게시판 관리</h1>
        <p className="text-sm text-gray-500">총 {filteredPosts.length}건</p>
      </div>

      {/* 카테고리 필터 */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {CATEGORY_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filter === tab
                ? 'bg-navy text-white'
                : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 게시글 목록 */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">불러오는 중...</div>
        ) : filteredPosts.length === 0 ? (
          <div className="p-8 text-center text-gray-400">게시글이 없습니다</div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-6 py-3 font-medium text-gray-500">제목</th>
                    <th className="text-left px-6 py-3 font-medium text-gray-500">카테고리</th>
                    <th className="text-left px-6 py-3 font-medium text-gray-500">작성일</th>
                    <th className="text-left px-6 py-3 font-medium text-gray-500">공개여부</th>
                    <th className="text-left px-6 py-3 font-medium text-gray-500">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredPosts.map((post) => (
                    <tr key={post.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{post.제목}</p>
                        {post.요약 && (
                          <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{post.요약}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-700">{post.카테고리 || '-'}</td>
                      <td className="px-6 py-4 text-gray-500">{post.작성일}</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${post.공개여부 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {post.공개여부 ? '공개' : '비공개'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleDelete(post.id, post.제목)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          삭제
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-gray-100">
              {filteredPosts.map((post) => (
                <div key={post.id} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 truncate">{post.제목}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{post.카테고리} &middot; {post.작성일}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${post.공개여부 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {post.공개여부 ? '공개' : '비공개'}
                      </span>
                      <button
                        onClick={() => handleDelete(post.id, post.제목)}
                        className="text-red-500 text-xs"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
