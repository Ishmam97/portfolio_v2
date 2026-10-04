import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

// Deterministic pseudo-random so each glyph keeps the same flight path across renders.
const rand = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const Glyph = ({ ch, index, active }: { ch: string; index: number; active: boolean }) => {
  const r1 = rand(index + 1);
  const r2 = rand(index + 101);
  const r3 = rand(index + 202);
  return (
    <motion.span
      className="inline-block"
      animate={
        active
          ? {
              x: (r1 - 0.8) * 560,
              y: (r2 - 0.35) * 380 + 90,
              rotate: (r3 - 0.5) * 760,
              scale: 0.2 + r2 * 0.5,
              opacity: 0,
              filter: 'blur(3px)',
            }
          : undefined
      }
      transition={{ duration: 0.8 + r3 * 0.7, delay: index * 0.0035 + r1 * 0.12, ease: [0.2, 0.6, 0.3, 1] }}
    >
      {ch}
    </motion.span>
  );
};

/** Renders text as individual glyphs that scatter away when `active` flips to true. */
const Shatter = ({ text, active, className }: { text: string; active: boolean; className?: string }) => {
  const words = useMemo(() => text.split(' '), [text]);
  let n = 0;
  return (
    <span className={className} aria-label={text}>
      {words.map((word, wi) => (
        <React.Fragment key={wi}>
          <span className="inline-block whitespace-nowrap" aria-hidden>
            {word.split('').map((ch, ci) => (
              <Glyph key={ci} ch={ch} index={n++} active={active} />
            ))}
          </span>
          {wi < words.length - 1 && ' '}
        </React.Fragment>
      ))}
    </span>
  );
};

export default Shatter;
