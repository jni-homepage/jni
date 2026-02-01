import { NextRequest, NextResponse } from 'next/server'
import Airtable from 'airtable'

const AIRTABLE_BASE_ID = 'appxU3n3KqoUr3l9e'
const ANALYTICS_TABLE_ID = 'tblsjO3L2mUsbkMNc'

function getBase() {
  const token = process.env.AIRTABLE_TOKEN
  if (!token) throw new Error('AIRTABLE_TOKEN not configured')
  return new Airtable({ apiKey: token }).base(AIRTABLE_BASE_ID)
}

function getKSTDate(daysAgo: number = 0): string {
  const now = new Date()
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000)
  kst.setDate(kst.getDate() - daysAgo)
  return kst.toISOString().split('T')[0]
}

interface AnalyticsRecord {
  id: string
  날짜: string
  방문자수: number
  페이지뷰: number
  평균체류시간: number
  이탈률: number
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30', 10)

    const base = getBase()
    const records: AnalyticsRecord[] = []
    const startDate = getKSTDate(days)

    await new Promise<void>((resolve, reject) => {
      base(ANALYTICS_TABLE_ID)
        .select({
          filterByFormula: `{날짜} >= '${startDate}'`,
          sort: [{ field: '날짜', direction: 'desc' }],
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any)
        .eachPage(
          (pageRecords, fetchNextPage) => {
            pageRecords.forEach((record) => {
              records.push({
                id: record.id,
                날짜: (record.get('날짜') as string) || '',
                방문자수: (record.get('방문자수') as number) || 0,
                페이지뷰: (record.get('페이지뷰') as number) || 0,
                평균체류시간: (record.get('평균체류시간') as number) || 0,
                이탈률: (record.get('이탈률') as number) || 0,
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

    // 요약 통계
    const totalVisitors = records.reduce((sum, r) => sum + r.방문자수, 0)
    const totalPageviews = records.reduce((sum, r) => sum + r.페이지뷰, 0)
    const avgDuration =
      records.length > 0
        ? Math.round(records.reduce((sum, r) => sum + r.평균체류시간, 0) / records.length)
        : 0
    const avgBounceRate =
      records.length > 0
        ? Math.round((records.reduce((sum, r) => sum + r.이탈률, 0) / records.length) * 100) / 100
        : 0

    return NextResponse.json({
      success: true,
      data: records,
      summary: {
        총방문자: totalVisitors,
        총페이지뷰: totalPageviews,
        평균체류: avgDuration,
        평균이탈률: avgBounceRate,
      },
    })
  } catch (error) {
    console.error('[JNI] Analytics API error:', error)
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    )
  }
}
