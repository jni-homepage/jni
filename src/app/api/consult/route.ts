import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

interface ConsultData {
  company: string
  bizno: string
  name: string
  position: string
  phone: string
  email: string
  industry: string
  founded: string
  consultTime: string
  amount: string
  fundType: string
  message: string
}

// Airtable 저장
async function saveToAirtable(data: ConsultData) {
  const token = process.env.AIRTABLE_TOKEN
  if (!token) throw new Error('AIRTABLE_TOKEN not configured')

  // Airtable base/table은 추후 설정
  // 현재는 로그만 출력
  console.log('[JNI] Airtable save:', data.company, data.name)
}

// Gmail 알림 발송
async function sendEmailNotification(data: ConsultData) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.GMAIL_USER,
      clientId: process.env.GMAIL_CLIENT_ID,
      clientSecret: process.env.GMAIL_CLIENT_SECRET,
      refreshToken: process.env.GMAIL_REFRESH_TOKEN,
    },
  })

  const fundTypes = data.fundType || '미선택'
  const htmlBody = `
    <div style="font-family:'Pretendard',sans-serif;max-width:600px;margin:0 auto;padding:20px;">
      <div style="background:#0f172e;color:#d4af37;padding:20px;border-radius:12px 12px 0 0;text-align:center;">
        <h1 style="margin:0;font-size:24px;">제이앤아이 파트너스</h1>
        <p style="margin:8px 0 0;color:#e8d4a8;font-size:14px;">새로운 상담 신청이 접수되었습니다</p>
      </div>
      <div style="background:#f8fafc;padding:24px;border:1px solid #e2e8f0;border-radius:0 0 12px 12px;">
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr><td style="padding:8px 0;color:#64748b;width:100px;">기업명</td><td style="padding:8px 0;font-weight:600;">${data.company}</td></tr>
          <tr><td style="padding:8px 0;color:#64748b;">사업자번호</td><td style="padding:8px 0;">${data.bizno}</td></tr>
          <tr><td style="padding:8px 0;color:#64748b;">대표자명</td><td style="padding:8px 0;font-weight:600;">${data.name}</td></tr>
          <tr><td style="padding:8px 0;color:#64748b;">직위</td><td style="padding:8px 0;">${data.position || '-'}</td></tr>
          <tr><td style="padding:8px 0;color:#64748b;">연락처</td><td style="padding:8px 0;font-weight:600;color:#d4af37;">${data.phone}</td></tr>
          <tr><td style="padding:8px 0;color:#64748b;">이메일</td><td style="padding:8px 0;">${data.email}</td></tr>
          <tr><td style="padding:8px 0;color:#64748b;">업종</td><td style="padding:8px 0;">${data.industry || '-'}</td></tr>
          <tr><td style="padding:8px 0;color:#64748b;">설립연도</td><td style="padding:8px 0;">${data.founded || '-'}</td></tr>
          <tr><td style="padding:8px 0;color:#64748b;">통화시간</td><td style="padding:8px 0;">${data.consultTime}</td></tr>
          <tr><td style="padding:8px 0;color:#64748b;">자금규모</td><td style="padding:8px 0;">${data.amount || '-'}</td></tr>
          <tr><td style="padding:8px 0;color:#64748b;">자금종류</td><td style="padding:8px 0;font-weight:600;">${fundTypes}</td></tr>
          <tr><td style="padding:8px 0;color:#64748b;">문의사항</td><td style="padding:8px 0;">${data.message || '-'}</td></tr>
        </table>
        <div style="margin-top:16px;padding:12px;background:#fffbeb;border-radius:8px;border-left:4px solid #d4af37;">
          <p style="margin:0;font-size:13px;color:#92400e;">접수 시각: ${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}</p>
        </div>
      </div>
    </div>
  `

  await transporter.sendMail({
    from: `"제이앤아이 파트너스" <${process.env.GMAIL_USER}>`,
    to: process.env.GMAIL_USER,
    subject: `[상담신청] ${data.company} - ${data.name} 대표`,
    html: htmlBody,
  })
}

export async function POST(request: NextRequest) {
  try {
    const data: ConsultData = await request.json()

    // 필수 필드 검증
    if (!data.company || !data.name || !data.phone || !data.email || !data.consultTime) {
      return NextResponse.json(
        { success: false, error: '필수 항목을 입력해주세요.' },
        { status: 400 }
      )
    }

    // 병렬 처리: Airtable 저장 + 이메일 발송
    const results = await Promise.allSettled([
      saveToAirtable(data),
      sendEmailNotification(data),
    ])

    const errors = results.filter((r) => r.status === 'rejected')
    if (errors.length > 0) {
      console.error('[JNI] Partial failures:', errors)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[JNI] Consult API error:', error)
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
