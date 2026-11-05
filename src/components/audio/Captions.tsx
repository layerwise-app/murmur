import type { Sentence } from '~/content/listening';
import { sentenceText } from '~/content/listening';

/**
 * Sentences that light up one by one as they are read. `active` is the
 * index being spoken (-1 when nothing is), `color` the reading voice's colour.
 */
export function Captions({
  sentences,
  active,
  color,
  className = ''
}: {
  sentences: Sentence[];
  active: number;
  color: string;
  className?: string;
}) {
  return (
    <p className={className} style={{ ['--hl' as string]: color }}>
      {sentences.map((sentence, index) => {
        const state = index === active ? 'now' : index < active ? 'read' : 'ahead';
        return (
          <span key={index}>
            <span
              aria-current={state === 'now' ? 'true' : undefined}
              className={`rounded-[0.3em] box-decoration-clone px-[0.08em] transition-[color,background-color] duration-500 ease-out ${
                state === 'now'
                  ? 'bg-[color-mix(in_srgb,var(--hl)_30%,transparent)] text-ink'
                  : state === 'read'
                    ? 'text-ink'
                    : 'text-ink-soft'
              }`}
            >
              {sentenceText(sentence)}
            </span>{' '}
          </span>
        );
      })}
    </p>
  );
}
