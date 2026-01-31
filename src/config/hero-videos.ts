/**
 * 페이지별 YouTube 배경영상 ID 매핑
 * 서브 페이지 구현 시 해당 videoId를 YouTubeBackground 컴포넌트에 전달
 */
export const HERO_VIDEOS = {
  main: 'HGrAntOmJtk',
  about: 'W56I-a4V3cw',        // 회사소개
  process: 'saT5iG12H1w',      // 진행과정
  funding: 'LlYM9MvGds8',      // 자금상담
  professional: 'iqmBZURAsjE',  // 전문서비스
  marketing: 'aSJfdEQfI5c',    // 온라인마케팅
} as const

export type HeroVideoPage = keyof typeof HERO_VIDEOS
