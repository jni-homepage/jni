/**
 * 페이지별 YouTube 배경영상 ID 매핑
 */
export const HERO_VIDEOS = {
  main: "t-IvBD_ch14",
  about: "IhxQgVi6ovY", // 회사소개 (7초부터)
  process: "x3_UwtYE8dk", // 진행과정
  funding: "nRLWQ0V4aGc", // 자금상담
  professional: "3PWbnUuJpIY", // 전문서비스
  marketing: "BNylTOr-NwI", // 온라인마케팅
} as const;

export type HeroVideoPage = keyof typeof HERO_VIDEOS;
