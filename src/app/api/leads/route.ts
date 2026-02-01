import { NextRequest, NextResponse } from 'next/server'
import Airtable from 'airtable'

const AIRTABLE_BASE_ID = 'appxU3n3KqoUr3l9e'
const AIRTABLE_TABLE = '고객접수'

function getBase() {
  const token = process.env.AIRTABLE_TOKEN
  if (!token) throw new Error('AIRTABLE_TOKEN not configured')
  return new Airtable({ apiKey: token }).base(AIRTABLE_BASE_ID)
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const base = getBase()
    const records: Record<string, unknown>[] = []

    await new Promise<void>((resolve, reject) => {
      const queryOptions: Record<string, unknown> = {
        maxRecords: 200,
        sort: [{ field: '접수일시', direction: 'desc' }],
      }

      if (status && status !== '전체') {
        queryOptions.filterByFormula = `{상태} = '${status}'`
      }

      base(AIRTABLE_TABLE)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .select(queryOptions as any)
        .eachPage(
          (pageRecords, fetchNextPage) => {
            pageRecords.forEach((record) => {
              records.push({
                id: record.id,
                기업명: record.get('기업명') || '',
                사업자번호: record.get('사업자번호') || '',
                대표자명: record.get('대표자명') || '',
                연락처: record.get('연락처') || '',
                이메일: record.get('이메일') || '',
                업종: record.get('업종') || '',
                설립연도: record.get('설립연도') || '',
                통화가능시간: record.get('통화가능시간') || '',
                자금규모: record.get('자금규모') || '',
                자금종류: record.get('자금종류') || '',
                문의사항: record.get('문의사항') || '',
                접수일시: record.get('접수일시') || '',
                상태: record.get('상태') || '신규',
                메모: record.get('메모') || '',
              })
            })
            fetchNextPage()
          },
          (err) => {
            if (err) reject(err)
            else resolve()
          }
        )
    })

    // 통계 계산
    const stats = {
      total: records.length,
      신규: records.filter((r) => r.상태 === '신규').length,
      대기: records.filter((r) => r.상태 === '대기').length,
      상담중: records.filter((r) => r.상태 === '상담중').length,
      진행중: records.filter((r) => r.상태 === '진행중').length,
      완료: records.filter((r) => r.상태 === '완료').length,
      블랙리스트: records.filter((r) => r.상태 === '블랙리스트').length,
    }

    return NextResponse.json({ success: true, leads: records, stats })
  } catch (error) {
    console.error('[JNI] Leads API error:', error)
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, status: newStatus, memo } = await request.json()

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID가 필요합니다.' },
        { status: 400 }
      )
    }

    const base = getBase()
    const updateFields: Record<string, string> = {}

    if (newStatus) updateFields['상태'] = newStatus
    if (memo !== undefined) updateFields['메모'] = memo

    await base(AIRTABLE_TABLE).update(id, updateFields)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[JNI] Leads PATCH error:', error)
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID가 필요합니다.' },
        { status: 400 }
      )
    }

    const base = getBase()
    await base(AIRTABLE_TABLE).destroy(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[JNI] Leads DELETE error:', error)
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    )
  }
}
