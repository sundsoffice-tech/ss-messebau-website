import { type ImgHTMLAttributes } from 'react'

const RATIO_MAP: Record<string, string> = {
  hero: 'var(--media-ratio-hero)',
  card: 'var(--media-ratio-card)',
  gallery: 'var(--media-ratio-gallery)',
  reference: 'var(--media-ratio-reference)',
  blog: 'var(--media-ratio-blog)',
  logo: 'var(--media-ratio-logo)',
}

const RADIUS_MAP: Record<string, string> = {
  sm: '0.25rem',
  md: 'var(--card-radius)',
  lg: '0.75rem',
  none: '0',
}

export interface MediaFrameProps {
  src: string
  alt: string
  ratio?: 'hero' | 'card' | 'gallery' | 'reference' | 'blog' | 'logo' | 'custom'
  customRatio?: string
  fit?: 'contain' | 'cover'
  position?: string
  height?: string
  className?: string
  imgClassName?: string
  loading?: 'lazy' | 'eager'
  priority?: boolean
  width?: number
  imgHeight?: number
  showBackground?: boolean
  radius?: 'sm' | 'md' | 'lg' | 'none'
}

export function MediaFrame({
  src,
  alt,
  ratio = 'card',
  customRatio,
  fit = 'contain',
  position = 'center center',
  height,
  className = '',
  imgClassName = '',
  loading = 'lazy',
  priority = false,
  width,
  imgHeight,
  showBackground = true,
  radius = 'md',
}: MediaFrameProps) {
  const aspectRatio = ratio === 'custom' && customRatio
    ? customRatio
    : RATIO_MAP[ratio] || RATIO_MAP.card

  const borderRadius = RADIUS_MAP[radius] || RADIUS_MAP.md

  const containerStyle: React.CSSProperties = {
    aspectRatio,
    borderRadius,
    ...(height ? { height } : {}),
  }

  if (fit === 'contain' && showBackground) {
    containerStyle.backgroundColor = 'var(--media-bg-contain)'
  }

  const imgProps: ImgHTMLAttributes<HTMLImageElement> = {
    src,
    alt,
    loading: priority ? 'eager' : loading,
    decoding: 'async',
    ...(priority ? { fetchPriority: 'high' as const } : {}),
    ...(width ? { width } : {}),
    ...(imgHeight ? { height: imgHeight } : {}),
  }

  return (
    <div
      className={`media-frame overflow-hidden ${className}`}
      style={containerStyle}
    >
      <img
        {...imgProps}
        className={`w-full h-full ${imgClassName}`}
        style={{
          objectFit: fit,
          objectPosition: position,
        }}
      />
    </div>
  )
}
