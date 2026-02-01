import type { Metadata } from 'next'
import PostDetailClient from './PostDetailClient'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://jnipartners.co.kr'
    const res = await fetch(`${baseUrl}/api/board?id=${id}`, { next: { revalidate: 60 } })
    const data = await res.json()
    if (data.success && data.post) {
      return {
        title: `${data.post.제목} | 제이앤아이 파트너스`,
        description: data.post.요약 || '제이앤아이 파트너스 - 정책자금 전문 경영컨설팅',
        openGraph: {
          title: data.post.제목,
          description: data.post.요약 || '',
          type: 'article',
          ...(data.post.썸네일 ? { images: [{ url: data.post.썸네일 }] } : {}),
        },
      }
    }
  } catch {
    // fallback
  }
  return {
    title: '게시글 | 제이앤아이 파트너스',
    description: '제이앤아이 파트너스 - 정책자금 전문 경영컨설팅',
  }
}

export default async function BoardPostPage({ params }: Props) {
  const { id } = await params
  return <PostDetailClient postId={id} />
}
