export function PlayPauseIcon({
  playing,
  loading = false,
  className = 'size-4'
}: {
  playing: boolean;
  loading?: boolean;
  className?: string;
}) {
  if (loading) {
    return (
      <svg viewBox='0 0 24 24' className={`${className} animate-spin [animation-duration:1.4s]`} aria-hidden='true'>
        <circle cx='12' cy='12' r='8' fill='none' stroke='currentColor' strokeOpacity='0.25' strokeWidth='2.4' />
        <path d='M12 4a8 8 0 0 1 8 8' fill='none' stroke='currentColor' strokeWidth='2.4' strokeLinecap='round' />
      </svg>
    );
  }
  return playing ? (
    <svg viewBox='0 0 24 24' className={className} aria-hidden='true'>
      <rect x='6.5' y='5' width='3.8' height='14' rx='1.4' fill='currentColor' />
      <rect x='13.7' y='5' width='3.8' height='14' rx='1.4' fill='currentColor' />
    </svg>
  ) : (
    <svg viewBox='0 0 24 24' className={className} aria-hidden='true'>
      <path d='M8 5.2v13.6a1 1 0 0 0 1.5.86l11-6.8a1 1 0 0 0 0-1.72l-11-6.8A1 1 0 0 0 8 5.2z' fill='currentColor' />
    </svg>
  );
}
