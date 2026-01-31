import { NextRequest, NextResponse } from 'next/server'
import Airtable from 'airtable'
import nodemailer from 'nodemailer'

const AIRTABLE_BASE_ID = 'appxU3n3KqoUr3l9e'
const AIRTABLE_TABLE = '고객접수'

interface ConsultData {
  company: string
  bizno: string
  name: string
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

  const base = new Airtable({ apiKey: token }).base(AIRTABLE_BASE_ID)

  await base(AIRTABLE_TABLE).create({
    '기업명': data.company,
    '사업자번호': data.bizno,
    '대표자명': data.name,
    '연락처': data.phone,
    '이메일': data.email,
    '업종': data.industry || '',
    '설립연도': data.founded || '',
    '통화가능시간': data.consultTime,
    '자금규모': data.amount || '',
    '자금종류': data.fundType,
    '문의사항': data.message || '',
    '접수일시': new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
  })
}

function escapeHtml(str: string) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function buildStaffEmailHtml(data: ConsultData, now: string) {
  const fundTypes = data.fundType || '미선택'
  const row = (icon: string, label: string, value: string, bold = false) =>
    `<tr><td colspan="2" style="height:6px;"></td></tr>
     <tr>
       <td style="padding:12px 16px;background:rgba(255,255,255,0.15);border-radius:8px 0 0 8px;width:35%;white-space:nowrap;font-weight:500;">${icon} ${label}</td>
       <td style="padding:12px 16px;background:rgba(255,255,255,0.1);border-radius:0 8px 8px 0;${bold ? 'font-weight:700;font-size:16px;' : ''}">${value}</td>
     </tr>`

  return `
<div style="font-family:'Pretendard',-apple-system,sans-serif;max-width:600px;margin:0 auto;">
  <div style="background:linear-gradient(135deg,#0f172e 0%,#1a2547 50%,#0f172e 100%);color:#d4af37;padding:30px;border-radius:16px 16px 0 0;">
    <h2 style="margin:0;font-size:22px;font-weight:700;">🔔 JNI 신규 상담 접수</h2>
    <p style="margin:10px 0 0;opacity:0.95;font-size:14px;">💻 홈페이지 무료상담 폼</p>
  </div>

  <div style="background:white;padding:30px;border:1px solid #e5e7eb;border-top:none;">
    <div style="background:linear-gradient(135deg,#0f172e 0%,#1a2547 100%);padding:20px;border-radius:12px;margin-bottom:25px;box-shadow:0 4px 15px rgba(212,175,55,0.25);">
      <h3 style="color:#d4af37;margin:0 0 15px;font-size:18px;font-weight:600;">📞 고객 연락처</h3>
      <table style="width:100%;color:white;font-size:14px;">
        ${row('🏢', '기업명', data.company, true)}
        ${row('📋', '사업자번호', data.bizno)}
        ${row('👤', '대표자명', data.name, true)}
        ${row('📱', '연락처', data.phone, true)}
        ${row('✉️', '이메일', data.email)}
        ${row('⏰', '희망시간', data.consultTime, true)}
      </table>
    </div>

    <div style="background:linear-gradient(135deg,#fefce8 0%,#fef9c3 100%);padding:20px;border-radius:12px;margin-bottom:20px;border-left:4px solid #d4af37;">
      <h3 style="color:#92400e;margin:0 0 15px;font-size:16px;font-weight:600;">💰 자금 정보</h3>
      <table style="width:100%;font-size:13px;">
        <tr><td style="padding:8px 0;color:#92400e;width:35%;">업종</td><td style="color:#374151;font-weight:600;">${data.industry || '-'}</td></tr>
        <tr><td style="padding:8px 0;color:#92400e;">설립연도</td><td style="color:#374151;font-weight:600;">${data.founded || '-'}</td></tr>
        <tr><td style="padding:8px 0;color:#92400e;">필요 자금 규모</td><td style="color:#374151;font-weight:600;">${data.amount || '미선택'}</td></tr>
        <tr><td style="padding:8px 0;color:#92400e;">자금 종류</td><td style="color:#374151;font-weight:600;">${fundTypes}</td></tr>
      </table>
    </div>

    ${data.message ? `
    <div style="background:linear-gradient(135deg,#fefce8,#fef9c3);padding:20px;border-radius:12px;border-left:4px solid #d4af37;margin-bottom:20px;">
      <h3 style="color:#92400e;margin:0 0 10px;font-size:16px;font-weight:600;">📝 문의내용</h3>
      <p style="margin:0;color:#374151;white-space:pre-wrap;">${data.message}</p>
    </div>` : ''}

    <div style="text-align:center;padding:15px;background:#f8fafc;border-radius:8px;">
      <p style="margin:0 0 10px;color:#6b7280;font-size:12px;">빠른 연락을 위해 아래 버튼을 클릭하세요</p>
      <a href="tel:${data.phone.replace(/-/g, '')}" style="display:inline-block;background:linear-gradient(135deg,#d4af37,#c5a028);color:#0f172e;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;">📞 바로 전화하기</a>
    </div>
  </div>

  <div style="text-align:center;padding:20px;background:linear-gradient(135deg,#0f172e 0%,#1a2547 100%);border-radius:0 0 16px 16px;color:white;font-size:12px;">
    <p style="margin:0;font-weight:600;color:#d4af37;">제이앤아이 파트너스 | 1533-9018</p>
    <p style="margin:8px 0 0;opacity:0.7;font-size:11px;">접수 시각: ${now}</p>
    <p style="margin:5px 0 0;opacity:0.6;font-size:11px;">※ 홈페이지에서 자동 발송된 메일입니다.</p>
  </div>
</div>`
}

function buildTelegramMessage(data: ConsultData, now: string) {
  let msg = '🔔 <b>JNI 신규 상담 접수</b>\n\n'

  msg += '👤 <b>고객정보</b>\n'
  msg += '├ 기업명: <b>' + escapeHtml(data.company) + '</b>\n'
  msg += '├ 사업자번호: ' + escapeHtml(data.bizno) + '\n'
  msg += '├ 대표자명: <b>' + escapeHtml(data.name) + '</b>\n'
  msg += '├ 연락처: <code>' + escapeHtml(data.phone) + '</code>\n'
  msg += '├ 이메일: ' + escapeHtml(data.email) + '\n'
  msg += '├ 업종: ' + escapeHtml(data.industry || '-') + '\n'
  msg += '└ 설립연도: ' + escapeHtml(data.founded || '-') + '\n\n'

  msg += '💰 <b>자금정보</b>\n'
  msg += '├ 통화가능: <b>' + escapeHtml(data.consultTime) + '</b>\n'
  msg += '├ 규모: ' + escapeHtml(data.amount || '-') + '\n'
  msg += '└ 종류: ' + escapeHtml(data.fundType || '-') + '\n'

  if (data.message && data.message !== '-') {
    msg += '\n💬 <b>문의</b>\n' + escapeHtml(data.message) + '\n'
  }

  msg += '\n📅 ' + now
  msg += '\n\n📊 <a href="https://airtable.com/appxU3n3KqoUr3l9e/tblB7XXuo5DjfSYO9">Airtable에서 보기</a>'

  return msg
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

  const now = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })

  await transporter.sendMail({
    from: `"제이앤아이 파트너스" <${process.env.GMAIL_USER}>`,
    to: process.env.GMAIL_USER,
    subject: `[상담신청] ${data.company} - ${data.name} 대표`,
    html: buildStaffEmailHtml(data, now),
  })
}

// 텔레그램 알림
async function sendTelegramNotification(data: ConsultData) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!token || !chatId) throw new Error('Telegram not configured')

  const now = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: buildTelegramMessage(data, now),
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    }),
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

    // 병렬 처리: Airtable 저장 + 이메일 발송 + 텔레그램 알림
    const results = await Promise.allSettled([
      saveToAirtable(data),
      sendEmailNotification(data),
      sendTelegramNotification(data),
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
