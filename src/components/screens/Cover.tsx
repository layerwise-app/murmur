import type { ItemKind } from '~/content/listening';

/** Drawn cover art for each kind of saved item. */
export function Cover({ kind, className = '' }: { kind: ItemKind; className?: string }) {
  return (
    <svg viewBox='0 0 160 160' className={className} aria-hidden='true' focusable='false'>
      {kind === 'essay' ? <EssayArt /> : null}
      {kind === 'newsletter' ? <NewsletterArt /> : null}
      {kind === 'pdf' ? <ReportArt /> : null}
      {kind === 'email' ? <ThreadArt /> : null}
    </svg>
  );
}

function EssayArt() {
  return (
    <>
      <rect width='160' height='160' fill='#f6dcc0' />
      <circle cx='118' cy='42' r='18' fill='#fbe9d3' />
      <rect x='0' y='118' width='160' height='42' fill='#e7c3a2' />
      <rect x='0' y='116' width='160' height='3' fill='#c98b6e' opacity='0.5' />
      {[
        [24, 86, 22, '#a9bd94'],
        [62, 80, 27, '#8faa83'],
        [102, 88, 21, '#b6c6a1'],
        [138, 82, 24, '#9cb38b']
      ].map(([x, y, r, fill]) => (
        <g key={x as number}>
          <rect x={(x as number) - 2} y={y as number} width='4' height='34' rx='2' fill='#8d6150' />
          <circle cx={x as number} cy={y as number} r={r as number} fill={fill as string} />
          <circle cx={(x as number) - 6} cy={(y as number) - 7} r={(r as number) * 0.45} fill='#fff' opacity='0.18' />
        </g>
      ))}
      <path d='M0 140h160' stroke='#fbe9d3' strokeWidth='3' strokeDasharray='12 10' />
    </>
  );
}

function NewsletterArt() {
  return (
    <>
      <rect width='160' height='160' fill='#fbe0c4' />
      <circle cx='80' cy='104' r='46' fill='#f3a265' />
      <circle cx='80' cy='104' r='30' fill='#f7b985' />
      <rect x='0' y='104' width='160' height='56' fill='#f0cfae' />
      {[114, 126, 138, 150].map((y, i) => (
        <rect key={y} x={22 + i * 6} y={y} width={116 - i * 12} height='4' rx='2' fill='#d98a6a' opacity={0.55 - i * 0.1} />
      ))}
      <text x='80' y='40' textAnchor='middle' fontFamily='Georgia, serif' fontSize='15' fill='#7a3f2e' letterSpacing='3'>
        SMALL HOURS
      </text>
      <rect x='60' y='48' width='40' height='2' rx='1' fill='#7a3f2e' opacity='0.4' />
    </>
  );
}

function ReportArt() {
  const dots = [];
  for (let row = 0; row < 7; row++) {
    for (let col = 0; col < 7; col++) {
      const seed = (row * 7 + col) * 37 % 11;
      dots.push(
        <circle
          key={`${row}-${col}`}
          cx={26 + col * 18}
          cy={24 + row * 15}
          r={seed > 6 ? 6.5 : seed > 3 ? 4 : 2}
          fill={seed > 6 ? '#7f9a72' : seed > 3 ? '#a9bd94' : '#c9d3b6'}
        />
      );
    }
  }
  return (
    <>
      <rect width='160' height='160' fill='#eef0dc' />
      {dots}
      <rect x='18' y='128' width='124' height='18' rx='9' fill='#fff' opacity='0.7' />
      <rect x='26' y='134' width='62' height='6' rx='3' fill='#647f5c' />
      <rect x='92' y='134' width='18' height='6' rx='3' fill='#f1c39a' />
    </>
  );
}

function ThreadArt() {
  return (
    <>
      <rect width='160' height='160' fill='#f6d3c6' />
      <rect x='22' y='30' width='96' height='42' rx='14' fill='#fbe6dc' />
      <rect x='42' y='62' width='96' height='42' rx='14' fill='#e7a597' />
      <rect x='22' y='94' width='96' height='42' rx='14' fill='#fbe6dc' />
      {[44, 108].map((y) => (
        <g key={y}>
          <rect x='34' y={y} width='56' height='5' rx='2.5' fill='#c9675d' opacity='0.5' />
          <rect x='34' y={y + 10} width='36' height='5' rx='2.5' fill='#c9675d' opacity='0.3' />
        </g>
      ))}
      <rect x='54' y='76' width='56' height='5' rx='2.5' fill='#fff' opacity='0.75' />
      <rect x='54' y='86' width='40' height='5' rx='2.5' fill='#fff' opacity='0.55' />
      <path d='M132 128c0-12 6-20 14-24-2 10-6 18-14 24zM132 128c-2-10-8-16-16-18 2 9 8 15 16 18z' fill='#8faa83' />
    </>
  );
}
