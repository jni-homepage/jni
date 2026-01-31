import type { Metadata } from 'next'
import ProcessClient from './ProcessClient'
import JsonLd from '@/components/JsonLd'
import { pageMetadata } from '@/lib/seo/metadata'
import { faqSchema, breadcrumbSchema } from '@/lib/seo/schemas'

export const metadata: Metadata = pageMetadata.process

export default function ProcessPage() {
  return (
    <>
      <JsonLd
        data={[
          faqSchema(),
          breadcrumbSchema([
            { name: '홈', url: 'https://jnipartners.co.kr' },
            { name: '진행과정', url: 'https://jnipartners.co.kr/process' },
          ]),
        ]}
      />
      <ProcessClient />
    </>
  )
}
