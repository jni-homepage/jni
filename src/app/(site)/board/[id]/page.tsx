import type { Metadata } from 'next'
import PostDetailClient from './PostDetailClient'
import JsonLd from '@/components/JsonLd'
import { articleSchema, breadcrumbSchema } from '@/lib/seo/schemas'

interface Props {
  params: Promise<{ id: string }>
}

async function getPost(id: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://jnipartners.co.kr'
    const res = await fetch(`${baseUrl}/api/board?id=${id}`, { next: { revalidate: 60 } })
    const data = await res.json()
    if (data.success && data.post) return data.post
  } catch {
    // fallback
  }
  return null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const post = await getPost(id)

  if (post) {
    return {
      title: `${post.제목} | 제이앤아이 파트너스`,
      description: post.요약 || '제이앤아이 파트너스 - 정책자금 전문 경영컨설팅',
      openGraph: {
        title: post.제목,
        description: post.요약 || '',
        type: 'article',
        url: `https://jnipartners.co.kr/board/${id}`,
        siteName: '제이앤아이 파트너스',
        locale: 'ko_KR',
        ...(post.썸네일 ? { images: [{ url: post.썸네일 }] } : {}),
      },
      twitter: {
        card: 'summary_large_image',
        title: post.제목,
        description: post.요약 || '',
        ...(post.썸네일 ? { images: [post.썸네일] } : {}),
      },
      alternates: { canonical: `https://jnipartners.co.kr/board/${id}` },
    }
  }

  return {
    title: '게시글 | 제이앤아이 파트너스',
    description: '제이앤아이 파트너스 - 정책자금 전문 경영컨설팅',
  }
}

export default async function BoardPostPage({ params }: Props) {
  const { id } = await params
  const post = await getPost(id)

  return (
    <>
      {post && (
        <JsonLd
          data={[
            articleSchema({
              title: post.제목,
              description: post.요약 || '',
              url: `https://jnipartners.co.kr/board/${id}`,
              datePublished: post.작성일 || new Date().toISOString(),
              image: post.썸네일 || undefined,
            }),
            breadcrumbSchema([
              { name: '홈', url: 'https://jnipartners.co.kr' },
              { name: '게시판', url: 'https://jnipartners.co.kr' },
              { name: post.제목, url: `https://jnipartners.co.kr/board/${id}` },
            ]),
          ]}
        />
      )}
      <PostDetailClient postId={id} />
    </>
  )
}
