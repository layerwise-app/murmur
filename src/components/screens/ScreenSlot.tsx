import { useEffect, useRef } from 'react';
import type * as React from 'react';
import type { ScreenMedia } from '~/content/home';
import { images } from '~/content/images';

/**
 * Shows a drawn product screen, or the owner's own image or video in its
 * place. Set the screen's entry in src/content/home.ts to swap it.
 */
export function ScreenSlot({
  media,
  children,
  sizes = '(min-width: 1024px) 400px, 90vw',
  className = 'size-full'
}: {
  media: ScreenMedia;
  children: React.ReactNode;
  sizes?: string;
  className?: string;
}) {
  if (!media) return <>{children}</>;

  if ('video' in media) {
    const poster = media.poster ? images[media.poster] : undefined;
    return <SlotVideo src={media.video} poster={poster?.src} label={media.alt} className={className} />;
  }

  const image = images[media.image];
  if (!image) {
    if (import.meta.env.DEV) console.warn(`[ScreenSlot] No image named "${media.image}". Run pnpm add-images.`);
    return <>{children}</>;
  }
  return (
    <img
      src={image.src}
      srcSet={image.srcSet}
      sizes={sizes}
      width={image.width}
      height={image.height}
      alt={media.alt}
      loading='lazy'
      decoding='async'
      className={`${className} object-cover`}
      style={{
        backgroundImage: `url(${image.blurDataURL})`,
        backgroundSize: 'cover'
      }}
    />
  );
}

function SlotVideo({
  src,
  poster,
  label,
  className
}: {
  src: string;
  poster?: string;
  label: string;
  className: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  // Muted, looping, and only playing while on screen (never with reduced motion).
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) void video.play().catch(() => {});
      else video.pause();
    });
    observer.observe(video);
    return () => observer.disconnect();
  }, []);
  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload='metadata'
      aria-label={label}
      className={`${className} object-cover`}
    />
  );
}
