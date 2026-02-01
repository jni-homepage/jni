import type { Metadata } from 'next'
import './globals.css'
import { baseMetadata, OG_IMAGE } from '@/lib/seo/metadata'

export const metadata: Metadata = {
  ...baseMetadata,
  title: '제이앤아이 파트너스 | 정책자금 경영컨설팅',
  description:
    '제이앤아이 파트너스는 정책자금 전문 경영컨설팅 기업입니다. 체계적인 진단으로 정책자금 심사 통과율을 높여드립니다.',
  keywords:
    '정책자금, 경영컨설팅, 자금상담, 창업자금, 운전자금, 시설자금, 제이앤아이 파트너스',
  openGraph: {
    title: '제이앤아이 파트너스 | 정책자금 경영컨설팅',
    description: '체계적인 경영 자문, 정책자금 전문 컨설팅',
    url: 'https://jnipartners.co.kr',
    siteName: '제이앤아이 파트너스',
    locale: 'ko_KR',
    type: 'website',
    images: [OG_IMAGE],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
