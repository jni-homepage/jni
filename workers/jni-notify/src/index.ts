interface Env {
  NOTIFY_SECRET: string
  TELEGRAM_BOT_TOKEN: string
  TELEGRAM_CHAT_ID: string
  GMAIL_CLIENT_ID: string
  GMAIL_CLIENT_SECRET: string
  GMAIL_REFRESH_TOKEN: string
  GMAIL_USER: string
}

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

// ─── Gmail API (OAuth2 REST) ───

async function refreshAccessToken(env: Env): Promise<string> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: env.GMAIL_CLIENT_ID,
      client_secret: env.GMAIL_CLIENT_SECRET,
      refresh_token: env.GMAIL_REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  })
  const data = (await res.json()) as { access_token?: string; error?: string }
  if (!data.access_token) throw new Error(`Token refresh failed: ${data.error || 'unknown'}`)
  return data.access_token
}

function toBase64Url(input: string): string {
  const bytes = new TextEncoder().encode(input)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function encodeMimeWord(text: string): string {
  return '=?UTF-8?B?' + btoa(String.fromCharCode(...new TextEncoder().encode(text))) + '?='
}

async function sendGmail(env: Env, to: string, subject: string, html: string) {
  const accessToken = await refreshAccessToken(env)

  const raw = [
    `From: "${encodeMimeWord('제이앤아이 파트너스')}" <${env.GMAIL_USER}>`,
    `To: ${to}`,
    `Subject: ${encodeMimeWord(subject)}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    btoa(String.fromCharCode(...new TextEncoder().encode(html))),
  ].join('\r\n')

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw: toBase64Url(raw) }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Gmail send failed: ${res.status} ${err}`)
  }
}

// ─── Telegram ───

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function buildTelegramMessage(data: ConsultData, now: string): string {
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

async function sendTelegram(env: Env, data: ConsultData, now: string) {
  const res = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: env.TELEGRAM_CHAT_ID,
      text: buildTelegramMessage(data, now),
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Telegram send failed: ${res.status} ${err}`)
  }
}

// ─── 고객 확인 이메일 HTML ───

function buildCustomerEmailHtml(data: ConsultData, now: string): string {
  return `
<div style="font-family:'Pretendard',-apple-system,system-ui,sans-serif;max-width:600px;margin:0 auto;background:#fff;">
  <div style="background:linear-gradient(135deg,#0f172e 0%,#1a2547 50%,#0f172e 100%);padding:40px 30px;border-radius:16px 16px 0 0;text-align:center;">
    <img src="https://jnipartners.co.kr/images/logo.png" alt="제이앤아이 파트너스" width="56" height="56" style="display:block;margin:0 auto 14px;border-radius:12px;" />
    <h1 style="color:#d4af37;margin:0;font-size:24px;font-weight:800;">제이앤아이 파트너스</h1>
    <p style="color:rgba(255,255,255,0.8);margin:12px 0 0;font-size:14px;">상담 접수가 완료되었습니다</p>
  </div>

  <div style="padding:35px 30px;border:1px solid #e5e7eb;border-top:none;">
    <p style="font-size:16px;color:#1f2937;line-height:1.7;margin:0 0 20px;">
      <strong>${data.name}</strong> 대표님, 안녕하세요.<br>
      <strong style="color:#d4af37;">제이앤아이 파트너스</strong>에 상담을 접수해 주셔서 감사합니다.
    </p>

    <div style="background:#f8fafc;border-radius:12px;padding:20px;margin-bottom:24px;border-left:4px solid #d4af37;">
      <h3 style="margin:0 0 14px;font-size:15px;color:#374151;">접수 내용 확인</h3>
      <table style="width:100%;font-size:13px;color:#4b5563;">
        <tr><td style="padding:6px 0;width:100px;color:#6b7280;">기업명</td><td style="font-weight:600;">${data.company}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;">자금 종류</td><td style="font-weight:600;">${data.fundType || '-'}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;">자금 규모</td><td style="font-weight:600;">${data.amount || '-'}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;">희망 통화시간</td><td style="font-weight:600;">${data.consultTime}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;">접수 시각</td><td>${now}</td></tr>
      </table>
    </div>

    <div style="background:linear-gradient(135deg,#fefce8,#fef9c3);border-radius:12px;padding:20px;margin-bottom:24px;">
      <p style="margin:0;font-size:14px;color:#92400e;line-height:1.6;">
        <strong>담당 전문가가 빠른 시일 내에 연락드리겠습니다.</strong><br>
        희망하신 통화 가능 시간(<strong>${data.consultTime}</strong>)에 맞춰 연락드릴 예정입니다.
      </p>
    </div>

    <div style="text-align:center;padding:20px 0;">
      <p style="margin:0 0 12px;color:#6b7280;font-size:13px;">급한 문의는 아래로 연락 부탁드립니다</p>
      <a href="tel:15339018" style="display:inline-block;background:linear-gradient(135deg,#d4af37,#c5a028);color:#0f172e;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;">
        📞 1533-9018
      </a>
    </div>
  </div>

  <div style="text-align:center;padding:24px;background:linear-gradient(135deg,#0f172e 0%,#1a2547 100%);border-radius:0 0 16px 16px;">
    <p style="margin:0;font-weight:600;color:#d4af37;font-size:13px;">제이앤아이 파트너스</p>
    <p style="margin:8px 0 0;color:rgba(255,255,255,0.6);font-size:11px;">서울특별시 강남구 | 대표전화 1533-9018</p>
    <p style="margin:6px 0 0;color:rgba(255,255,255,0.4);font-size:10px;">본 메일은 홈페이지 상담 접수 시 자동 발송됩니다.</p>
  </div>
</div>`
}

// ─── 사내 알림 이메일 HTML ───

function buildStaffEmailHtml(data: ConsultData, now: string): string {
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
        <tr><td style="padding:8px 0;color:#92400e;">자금 종류</td><td style="color:#374151;font-weight:600;">${data.fundType || '미선택'}</td></tr>
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
  </div>
</div>`
}

// ─── Worker Entry ───

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Content-Type, X-Notify-Secret',
        },
      })
    }

    if (request.method !== 'POST') {
      return Response.json({ error: 'Method not allowed' }, { status: 405 })
    }

    // 인증 확인
    const secret = request.headers.get('X-Notify-Secret')
    if (!secret || secret !== env.NOTIFY_SECRET) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data: ConsultData = await request.json()
    const now = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })

    const results = await Promise.allSettled([
      // 1. 텔레그램 알림 (사내)
      sendTelegram(env, data, now),
      // 2. 사내 알림 이메일
      sendGmail(env, `${env.GMAIL_USER}, mkt@polarad.co.kr`, `[상담신청] ${data.company} - ${data.name} 대표`, buildStaffEmailHtml(data, now)),
      // 3. 고객 확인 이메일
      sendGmail(env, data.email, `[제이앤아이 파트너스] 상담 접수가 완료되었습니다`, buildCustomerEmailHtml(data, now)),
    ])

    const errors = results
      .map((r, i) => (r.status === 'rejected' ? { index: i, reason: String((r as PromiseRejectedResult).reason) } : null))
      .filter(Boolean)

    return Response.json({
      success: errors.length === 0,
      sent: {
        telegram: results[0].status === 'fulfilled',
        staffEmail: results[1].status === 'fulfilled',
        customerEmail: results[2].status === 'fulfilled',
      },
      errors: errors.length > 0 ? errors : undefined,
    })
  },
}
