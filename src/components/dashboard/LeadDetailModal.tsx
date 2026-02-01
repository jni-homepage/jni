'use client'

import { useState } from 'react'

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

const STATUS_OPTIONS = ['신규', '대기', '상담중', '진행중', '완료']

const STATUS_COLORS: Record<string, string> = {
  신규: 'bg-blue-100 text-blue-700',
  대기: 'bg-yellow-100 text-yellow-700',
  상담중: 'bg-purple-100 text-purple-700',
  진행중: 'bg-orange-100 text-orange-700',
  완료: 'bg-green-100 text-green-700',
}

interface LeadDetailModalProps {
  lead: Lead
  onClose: () => void
  onUpdate: () => void
}

export default function LeadDetailModal({ lead, onClose, onUpdate }: LeadDetailModalProps) {
  const [status, setStatus] = useState(lead.상태)
  const [memo, setMemo] = useState(lead.메모)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: lead.id, status, memo }),
      })
      const data = await res.json()
      if (data.success) {
        onUpdate()
        onClose()
      }
    } catch (error) {
      console.error('Update failed:', error)
    } finally {
      setSaving(false)
    }
  }

  const fields = [
    { label: '기업명', value: lead.기업명 },
    { label: '사업자번호', value: lead.사업자번호 },
    { label: '대표자명', value: lead.대표자명 },
    { label: '연락처', value: lead.연락처, isPhone: true },
    { label: '이메일', value: lead.이메일 },
    { label: '업종', value: lead.업종 },
    { label: '설립연도', value: lead.설립연도 },
    { label: '통화가능시간', value: lead.통화가능시간 },
    { label: '자금규모', value: lead.자금규모 },
    { label: '자금종류', value: lead.자금종류 },
    { label: '접수일시', value: lead.접수일시 },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 rounded-t-2xl flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{lead.기업명 || '(기업명 없음)'}</h2>
            <p className="text-sm text-gray-500">{lead.대표자명} &middot; {lead.접수일시}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100" aria-label="닫기">
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* 상태 변경 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">상태</label>
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setStatus(opt)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    status === opt
                      ? STATUS_COLORS[opt] + ' border-current'
                      : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* 상세 정보 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields.map((field) => (
              <div key={field.label}>
                <p className="text-xs text-gray-400 mb-1">{field.label}</p>
                {field.isPhone && field.value ? (
                  <a
                    href={`tel:${field.value}`}
                    className="text-sm font-medium text-blue-600 hover:underline"
                  >
                    {field.value}
                  </a>
                ) : (
                  <p className="text-sm font-medium text-gray-900">
                    {field.value || '-'}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* 문의사항 */}
          {lead.문의사항 && (
            <div>
              <p className="text-xs text-gray-400 mb-1">문의사항</p>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 whitespace-pre-wrap">
                {lead.문의사항}
              </p>
            </div>
          )}

          {/* 메모 */}
          <div>
            <label htmlFor="memo" className="block text-sm font-medium text-gray-700 mb-2">
              관리자 메모
            </label>
            <textarea
              id="memo"
              rows={3}
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 resize-none"
              placeholder="메모를 입력하세요..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 rounded-b-2xl flex items-center justify-between">
          {lead.연락처 && (
            <a
              href={`tel:${lead.연락처}`}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-50 text-green-700 text-sm font-medium hover:bg-green-100 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              전화하기
            </a>
          )}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-100 transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 rounded-lg bg-navy text-white text-sm font-medium hover:bg-navy-light transition-colors disabled:opacity-50"
            >
              {saving ? '저장 중...' : '저장'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
