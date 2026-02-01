'use client'

import { useEffect, useState, useCallback } from 'react'
import LeadDetailModal from '@/components/dashboard/LeadDetailModal'

interface Lead {
  id: string
  기업명: string
  사업자번호: string
  대표자명: string
  연락처: string
  이메일: string
  업종: string
  설립연도: string
  통화가능시간: string
  자금규모: string
  자금종류: string
  문의사항: string
  접수일시: string
  상태: string
  메모: string
}

const STATUS_TABS = ['전체', '신규', '대기', '상담중', '진행중', '완료']

const STATUS_COLORS: Record<string, string> = {
  신규: 'bg-blue-100 text-blue-700',
  대기: 'bg-yellow-100 text-yellow-700',
  상담중: 'bg-purple-100 text-purple-700',
  진행중: 'bg-orange-100 text-orange-700',
  완료: 'bg-green-100 text-green-700',
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [filter, setFilter] = useState('전체')
  const [loading, setLoading] = useState(true)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [stats, setStats] = useState<Record<string, number>>({})
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [editingMemo, setEditingMemo] = useState<{ id: string; value: string } | null>(null)
  const [savingMemo, setSavingMemo] = useState(false)

  const fetchLeads = useCallback(async () => {
    try {
      const res = await fetch('/api/leads')
      const data = await res.json()
      if (data.success) {
        setLeads(data.leads)
        if (data.stats) setStats(data.stats)
      }
    } catch (error) {
      console.error('Leads fetch error:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

  // 퀵 상태 변경
  const handleQuickStatus = async (e: React.MouseEvent, lead: Lead, newStatus: string) => {
    e.stopPropagation()
    if (updatingId) return
    setUpdatingId(lead.id)

    try {
      const res = await fetch('/api/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: lead.id, status: newStatus }),
      })
      const data = await res.json()
      if (data.success) {
        setLeads((prev) =>
          prev.map((l) => (l.id === lead.id ? { ...l, 상태: newStatus } : l))
        )
        // stats 재계산
        setStats((prev) => {
          const updated = { ...prev }
          if (updated[lead.상태] !== undefined) updated[lead.상태]--
          if (updated[newStatus] !== undefined) updated[newStatus]++
          else updated[newStatus] = 1
          return updated
        })
      }
    } catch (error) {
      console.error('Status update error:', error)
    } finally {
      setUpdatingId(null)
    }
  }

  // 인라인 메모 저장
  const handleSaveMemo = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!editingMemo || savingMemo) return
    setSavingMemo(true)

    try {
      const res = await fetch('/api/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingMemo.id, memo: editingMemo.value }),
      })
      const data = await res.json()
      if (data.success) {
        setLeads((prev) =>
          prev.map((l) => (l.id === editingMemo.id ? { ...l, 메모: editingMemo.value } : l))
        )
        setEditingMemo(null)
      }
    } catch (error) {
      console.error('Memo save error:', error)
    } finally {
      setSavingMemo(false)
    }
  }

  // 검색 + 필터 적용
  const filteredLeads = leads.filter((lead) => {
    const matchFilter = filter === '전체' || lead.상태 === filter
    if (!search) return matchFilter
    const q = search.toLowerCase()
    return matchFilter && (
      (lead.기업명 || '').toLowerCase().includes(q) ||
      (lead.대표자명 || '').toLowerCase().includes(q) ||
      (lead.연락처 || '').includes(q)
    )
  })

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">접수 관리</h1>
        <p className="text-sm text-gray-500">총 {stats.total || leads.length}건</p>
      </div>

      {/* 통계 요약 */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {STATUS_TABS.map((tab) => {
          const count = tab === '전체' ? (stats.total || 0) : (stats[tab] || 0)
          const isActive = filter === tab
          return (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-2.5 rounded-xl text-center transition-colors ${
                isActive
                  ? 'bg-navy text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <p className={`text-lg font-bold ${isActive ? 'text-white' : 'text-gray-900'}`}>{count}</p>
              <p className={`text-[11px] ${isActive ? 'text-white/70' : 'text-gray-400'}`}>{tab}</p>
            </button>
          )
        })}
      </div>

      {/* 검색 */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="기업명, 대표자명, 연락처 검색"
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 bg-white"
        />
      </div>

      {/* 리스트 */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">불러오는 중...</div>
        ) : filteredLeads.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            {search ? '검색 결과가 없습니다' : '접수 내역이 없습니다'}
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-3 font-medium text-gray-500">기업명 / 대표자</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">연락처</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">자금종류</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">접수일</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">상태</th>
                    <th className="text-center px-4 py-3 font-medium text-gray-500">퀵액션</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">메모</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50 group">
                      <td
                        className="px-4 py-3 cursor-pointer"
                        onClick={() => setSelectedLead(lead)}
                      >
                        <p className="font-medium text-gray-900">{lead.기업명 || '-'}</p>
                        <p className="text-xs text-gray-400">{lead.대표자명}</p>
                      </td>
                      <td className="px-4 py-3">
                        <a href={`tel:${lead.연락처}`} onClick={(e) => e.stopPropagation()} className="text-blue-600 hover:underline">
                          {lead.연락처}
                        </a>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{lead.자금종류 || '-'}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{lead.접수일시}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[lead.상태] || 'bg-gray-100 text-gray-600'}`}>
                          {lead.상태}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1.5">
                          {updatingId === lead.id ? (
                            <span className="text-xs text-gray-400">변경중...</span>
                          ) : (
                            <>
                              {lead.상태 !== '상담중' && lead.상태 !== '진행중' && lead.상태 !== '완료' && (
                                <button
                                  onClick={(e) => handleQuickStatus(e, lead, '상담중')}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors"
                                  title="상담중으로 변경"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                  </svg>
                                  통화
                                </button>
                              )}
                              {lead.상태 !== '완료' && (
                                <button
                                  onClick={(e) => handleQuickStatus(e, lead, '완료')}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
                                  title="완료로 변경"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  전환
                                </button>
                              )}
                              {(lead.상태 === '상담중' || lead.상태 === '진행중' || lead.상태 === '완료') && (
                                <button
                                  onClick={(e) => handleQuickStatus(e, lead, '신규')}
                                  className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs text-gray-400 hover:bg-gray-100 transition-colors"
                                  title="신규로 되돌리기"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                  </svg>
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 max-w-[200px]">
                        {editingMemo?.id === lead.id ? (
                          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="text"
                              value={editingMemo.value}
                              onChange={(e) => setEditingMemo({ ...editingMemo, value: e.target.value })}
                              className="flex-1 px-2 py-1 text-xs border border-blue-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveMemo(e as unknown as React.MouseEvent)
                                if (e.key === 'Escape') setEditingMemo(null)
                              }}
                            />
                            <button
                              onClick={handleSaveMemo}
                              disabled={savingMemo}
                              className="px-2 py-1 text-xs bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                            >
                              {savingMemo ? '...' : '저장'}
                            </button>
                          </div>
                        ) : (
                          <div
                            onClick={(e) => {
                              e.stopPropagation()
                              setEditingMemo({ id: lead.id, value: lead.메모 || '' })
                            }}
                            className="cursor-text"
                          >
                            {lead.메모 ? (
                              <p className="text-xs text-gray-600 truncate" title={lead.메모}>{lead.메모}</p>
                            ) : (
                              <p className="text-xs text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity">+ 메모</p>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden divide-y divide-gray-100">
              {filteredLeads.map((lead) => (
                <div key={lead.id} className="p-4">
                  {/* 상단: 정보 + 상태 */}
                  <div
                    className="flex items-start justify-between mb-2 cursor-pointer"
                    onClick={() => setSelectedLead(lead)}
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900">{lead.기업명 || lead.대표자명}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {lead.대표자명} &middot;{' '}
                        <a href={`tel:${lead.연락처}`} onClick={(e) => e.stopPropagation()} className="text-blue-500">
                          {lead.연락처}
                        </a>
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{lead.자금종류} &middot; {lead.접수일시}</p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap ${STATUS_COLORS[lead.상태] || 'bg-gray-100 text-gray-600'}`}>
                      {lead.상태}
                    </span>
                  </div>

                  {/* 메모 표시 */}
                  {lead.메모 && (
                    <div
                      className="mb-2.5 p-2.5 bg-blue-50 border border-blue-100 rounded-lg cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation()
                        setEditingMemo({ id: lead.id, value: lead.메모 })
                      }}
                    >
                      <p className="text-[11px] text-blue-500 font-medium mb-0.5">메모</p>
                      <p className="text-xs text-gray-700 whitespace-pre-wrap">{lead.메모}</p>
                    </div>
                  )}

                  {/* 인라인 메모 편집 (모바일) */}
                  {editingMemo?.id === lead.id && (
                    <div className="mb-2.5 flex gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        value={editingMemo.value}
                        onChange={(e) => setEditingMemo({ ...editingMemo, value: e.target.value })}
                        className="flex-1 px-3 py-2 text-sm border border-blue-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400"
                        placeholder="메모 입력..."
                        autoFocus
                      />
                      <button
                        onClick={handleSaveMemo}
                        disabled={savingMemo}
                        className="px-3 py-2 text-xs bg-blue-500 text-white rounded-lg font-medium"
                      >
                        {savingMemo ? '...' : '저장'}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setEditingMemo(null) }}
                        className="px-2 py-2 text-xs text-gray-400 rounded-lg"
                      >
                        취소
                      </button>
                    </div>
                  )}

                  {/* 퀵액션 버튼 */}
                  <div className="flex items-center gap-2">
                    {updatingId === lead.id ? (
                      <span className="text-xs text-gray-400">변경중...</span>
                    ) : (
                      <>
                        {lead.상태 !== '상담중' && lead.상태 !== '진행중' && lead.상태 !== '완료' && (
                          <button
                            onClick={(e) => handleQuickStatus(e, lead, '상담중')}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-purple-50 text-purple-700 active:bg-purple-100"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            통화
                          </button>
                        )}
                        {lead.상태 !== '완료' && (
                          <button
                            onClick={(e) => handleQuickStatus(e, lead, '완료')}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-green-50 text-green-700 active:bg-green-100"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            전환
                          </button>
                        )}
                        {(lead.상태 === '상담중' || lead.상태 === '진행중' || lead.상태 === '완료') && (
                          <button
                            onClick={(e) => handleQuickStatus(e, lead, '신규')}
                            className="flex items-center gap-1 px-2.5 py-2 rounded-lg text-xs text-gray-400 active:bg-gray-100"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                            </svg>
                            되돌리기
                          </button>
                        )}
                        {!lead.메모 && editingMemo?.id !== lead.id && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setEditingMemo({ id: lead.id, value: '' })
                            }}
                            className="flex items-center gap-1 px-2.5 py-2 rounded-lg text-xs text-gray-400 active:bg-gray-100"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            메모
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* 상세 모달 (전체 상태 관리 가능) */}
      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onUpdate={fetchLeads}
        />
      )}
    </div>
  )
}
