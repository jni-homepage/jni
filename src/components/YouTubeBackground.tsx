'use client'

interface YouTubeBackgroundProps {
  videoId: string
}

export default function YouTubeBackground({ videoId }: YouTubeBackgroundProps) {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&controls=0&showinfo=0&rel=0&playlist=${videoId}&playsinline=1&modestbranding=1&disablekb=1&iv_load_policy=3`}
        title="Background video"
        allow="autoplay; encrypted-media"
        allowFullScreen={false}
        className="absolute top-1/2 left-1/2 w-[180%] md:w-[120%] aspect-video -translate-x-1/2 -translate-y-1/2 border-0"
      />
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-dark-navy/75" />
    </div>
  )
}
