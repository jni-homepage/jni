import { NextRequest, NextResponse } from 'next/server'

const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN
const AIRTABLE_BASE_ID = process.env.BOARD_BASE_ID || process.env.AIRTABLE_BASE_ID || 'appxU3n3KqoUr3l9e'
const BOARD_TABLE_ID = process.env.BOARD_TABLE_ID || 'tblBoardPosts'

// 필드 ID 매핑 (Airtable 인코딩 이슈 방지)
const FIELD_IDS: Record<string, string> = {
  제목: 'fld1pvHES6Ijc5L1x',
  요약: 'fldNWFzgwO82fAIWO',
  내용: 'fld8IWVV4c40a5PiU',
  카테고리: 'fldTl58EFbV9fAI3w',
  금액: 'fldSZfYhSN8CahoPP',
  작성일: 'fldZsdv5pqaffB7AO',
  공개여부: 'fldMOzaCsreYRhJ4W',
  썸네일: 'fldCfKYb0RWvXY2Yy',
}

const CATEGORY_NAMES: Record<string, string> = {
  selYQbeJVz5c0jupt: '성공사례',
  sel4cr925qqRTafi0: '정책자금',
  selqeqERmlFRqbflF: '인증지원',
}

interface AirtableField {
  id?: string
  name?: string
}

function getFieldById(fields: Record<string, unknown>, koreanName: string): unknown {
  const fieldId = FIELD_IDS[koreanName]
  if (!fieldId) return undefined
  const value = fields[fieldId]
  if (koreanName === '카테고리' && value && typeof value === 'object') {
    const v = value as AirtableField
    return CATEGORY_NAMES[v.id || ''] || v.name || v.id
  }
  return value
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  try {
    if (id) {
      const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${BOARD_TABLE_ID}/${id}?returnFieldsByFieldId=true`
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` },
        next: { revalidate: 60 },
      })
      if (!response.ok) {
        if (response.status === 404) return NextResponse.json({ success: false, error: '게시글을 찾을 수 없습니다' }, { status: 404 })
        throw new Error(`Airtable Error: ${response.status}`)
      }
      const record = await response.json()
      const f = record.fields
      return NextResponse.json({
        success: true,
        post: {
          id: record.id,
          제목: getFieldById(f, '제목') || '',
          요약: getFieldById(f, '요약') || '',
          내용: getFieldById(f, '내용') || '',
          카테고리: getFieldById(f, '카테고리') || '',
          금액: getFieldById(f, '금액') || '',
          작성일: getFieldById(f, '작성일') || record.createdTime,
          공개여부: getFieldById(f, '공개여부') !== false,
          썸네일: getFieldById(f, '썸네일') || '',
        },
      })
    }

    // 목록 조회
    const params = new URLSearchParams({ maxRecords: '100', returnFieldsByFieldId: 'true' })
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${BOARD_TABLE_ID}?${params}`
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` },
      next: { revalidate: 60 },
    })
    if (!response.ok) throw new Error(`Airtable Error: ${response.status}`)
    const data = await response.json()

    const posts = data.records.map((record: { id: string; fields: Record<string, unknown>; createdTime: string }) => {
      const f = record.fields
      return {
        id: record.id,
        제목: getFieldById(f, '제목') || '',
        요약: getFieldById(f, '요약') || '',
        카테고리: getFieldById(f, '카테고리') || '',
        금액: getFieldById(f, '금액') || '',
        작성일: getFieldById(f, '작성일') || record.createdTime,
        공개여부: getFieldById(f, '공개여부') !== false,
        썸네일: getFieldById(f, '썸네일') || '',
      }
    })

    return NextResponse.json({ success: true, posts })
  } catch (error) {
    console.error('Board API Error:', error)
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 })
  }
}
