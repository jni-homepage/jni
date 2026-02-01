import { NextRequest, NextResponse } from 'next/server'
import { BetaAnalyticsDataClient } from '@google-analytics/data'

const GA4_PROPERTY_ID = process.env.GA4_PROPERTY_ID
const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')

function getClient() {
  if (!GA4_PROPERTY_ID || !GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_PRIVATE_KEY) {
    throw new Error('GA4 환경변수 미설정')
  }
  return new BetaAnalyticsDataClient({
    credentials: {
      client_email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: GOOGLE_PRIVATE_KEY,
    },
  })
}

function calcPercent(count: number, total: number) {
  return total > 0 ? Math.round((count / total) * 1000) / 10 : 0
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function val(row: any, idx: number): number {
  return parseInt(row?.metricValues?.[idx]?.value || '0', 10)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function dim(row: any, idx = 0): string {
  const v = row?.dimensionValues?.[idx]?.value || ''
  return v === '(not set)' ? '기타' : v
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const days = Math.min(parseInt(searchParams.get('days') || '7', 10), 90)

    const client = getClient()
    const property = `properties/${GA4_PROPERTY_ID}`
    const dateRanges = [{ startDate: `${days}daysAgo`, endDate: 'today' }]

    const [summary, daily, sources, referrers, devices, pages, regions] = await Promise.all([
      client.runReport({
        property,
        dateRanges,
        metrics: [
          { name: 'totalUsers' },
          { name: 'screenPageViews' },
          { name: 'averageSessionDuration' },
          { name: 'bounceRate' },
        ],
      }),
      client.runReport({
        property,
        dateRanges,
        dimensions: [{ name: 'date' }],
        metrics: [{ name: 'totalUsers' }],
        orderBys: [{ dimension: { dimensionName: 'date' } }],
      }),
      client.runReport({
        property,
        dateRanges,
        dimensions: [{ name: 'sessionDefaultChannelGroup' }],
        metrics: [{ name: 'sessions' }],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 10,
      }),
      client.runReport({
        property,
        dateRanges,
        dimensions: [{ name: 'sessionSource' }],
        metrics: [{ name: 'sessions' }],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 10,
      }),
      client.runReport({
        property,
        dateRanges,
        dimensions: [{ name: 'deviceCategory' }],
        metrics: [{ name: 'sessions' }],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      }),
      client.runReport({
        property,
        dateRanges,
        dimensions: [{ name: 'pagePath' }],
        metrics: [{ name: 'screenPageViews' }],
        orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
        limit: 10,
      }),
      client.runReport({
        property,
        dateRanges,
        dimensions: [{ name: 'city' }],
        metrics: [{ name: 'sessions' }],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 10,
      }),
    ])

    // Summary
    const sRow = summary[0]?.rows?.[0]
    const visitors = val(sRow, 0)
    const pageviews = val(sRow, 1)
    const avgDurationSec = parseFloat(sRow?.metricValues?.[2]?.value || '0')
    const bounceRateRaw = parseFloat(sRow?.metricValues?.[3]?.value || '0')

    // Daily visitors
    const dailyVisitors = (daily[0]?.rows || []).map((row) => {
      const d = row.dimensionValues?.[0]?.value || ''
      return {
        date: d.length === 8 ? `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}` : d,
        count: val(row, 0),
      }
    })

    // Traffic sources
    const srcRows = sources[0]?.rows || []
    const srcTotal = srcRows.reduce((s, r) => s + val(r, 0), 0)
    const trafficSources = srcRows.map((r) => {
      const count = val(r, 0)
      return { source: dim(r), count, percent: calcPercent(count, srcTotal) }
    })

    // Referrers
    const refRows = referrers[0]?.rows || []
    const referrerList = refRows.map((r) => ({
      url: dim(r),
      count: val(r, 0),
    }))

    // Devices
    const devRows = devices[0]?.rows || []
    const devTotal = devRows.reduce((s, r) => s + val(r, 0), 0)
    const deviceList = devRows.map((r) => {
      const count = val(r, 0)
      const label = dim(r)
      const labelMap: Record<string, string> = { desktop: '데스크톱', mobile: '모바일', tablet: '태블릿' }
      return { type: labelMap[label] || label, count, percent: calcPercent(count, devTotal) }
    })

    // Top pages
    const pageRows = pages[0]?.rows || []
    const topPages = pageRows.map((r) => ({
      path: dim(r),
      views: val(r, 0),
    }))

    // Regions
    const regRows = regions[0]?.rows || []
    const regTotal = regRows.reduce((s, r) => s + val(r, 0), 0)
    const regionList = regRows.map((r) => {
      const count = val(r, 0)
      return { name: dim(r), count, percent: calcPercent(count, regTotal) }
    })

    return NextResponse.json({
      success: true,
      data: {
        visitors,
        pageviews,
        avgDuration: Math.round(avgDurationSec),
        bounceRate: Math.round(bounceRateRaw * 1000) / 10,
        dailyVisitors,
        trafficSources,
        referrers: referrerList,
        devices: deviceList,
        topPages,
        regions: regionList,
      },
    })
  } catch (error) {
    console.error('[JNI] GA4 Analytics API error:', error)
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    )
  }
}
