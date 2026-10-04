import React, { useEffect, useRef, useState } from 'react';
import { ChevronRight, MapPin, Sparkles } from 'lucide-react';

import { experienceData } from '@/data/experience';

const Journey = () => {
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = parseInt(entry.target.getAttribute('data-index') || '0', 10);
          if (entry.isIntersecting) {
            setVisibleItems((prev) => new Set([...prev, index]));
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -80px 0px' }
    );

    itemRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section id="journey" className="relative py-24 px-0 md:px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-14 text-center">
          <p className="mx-auto mb-4 flex w-fit items-center gap-2 rounded-full border border-neon-yellow/70 bg-cyber-darker/85 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-neon-yellow shadow-[0_0_12px_rgba(223,255,61,0.25)]">
            <Sparkles size={12} />
            Experience
          </p>
          <h2 className="inline-block rounded-lg bg-cyber-dark/65 px-2.5 py-1.5 text-4xl md:text-5xl font-bold text-neon-yellow">Career Journey</h2>
          <p className="mx-auto mt-5 max-w-3xl rounded-xl bg-cyber-dark/90 px-4 py-3 text-base md:text-lg text-neon-green">
            A progression from software engineering fundamentals to AI-native product leadership and
            agentic system design.
          </p>
        </div>

        <div className="relative">
          <div className="pointer-events-none absolute bottom-0 left-4 top-0 z-20 w-px bg-gradient-to-b from-neon-purple via-neon-green/80 to-neon-purple/30 md:left-6" />
          <div className="space-y-8">
            {experienceData.map((item, index) => (
              <div
                key={`${item.title}-${item.startDate}`}
                ref={(el) => {
                  itemRefs.current[index] = el;
                }}
                data-index={index}
                className={`relative z-10 rounded-2xl border border-neon-purple/45 bg-cyber-darker/90 p-5 pl-10 transition-all duration-700 md:p-6 md:pl-12 ${
                  visibleItems.has(index) ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                }`}
                style={{ transitionDelay: `${index * 70}ms` }}
              >
                <div className="timeline-node absolute left-[13px] top-10 h-3 w-3 rounded-full border border-neon-green bg-neon-purple md:left-[21px]" />
              <article className="relative pr-24">
                <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.11em] text-neon-purple">
                  <span className="rounded-full border border-neon-purple/55 bg-neon-purple/10 px-2.5 py-1">
                    {item.startDate}
                  </span>
                  <span className="text-neon-green/70">to</span>
                  <span className="rounded-full border border-neon-green/55 bg-neon-green/10 px-2.5 py-1 text-neon-green">
                    {item.endDate}
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-neon-yellow">{item.title}</h3>
                <div className="mt-2 mb-4 flex flex-wrap items-center gap-2 text-sm text-neon-green">
                  <MapPin size={16} />
                  <span>{item.company}</span>
                  {item.location && <span className="text-neon-green/75">· {item.location}</span>}
                </div>

                <ul className="space-y-2.5">
                  {item.bullets.map((bullet, bulletIndex) => (
                    <li
                      key={`${item.title}-bullet-${bulletIndex}`}
                      className="flex items-start text-sm leading-relaxed text-gray-200"
                    >
                      <ChevronRight size={16} className="mr-2 mt-0.5 shrink-0 text-neon-purple" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>

                <div
                  className={`absolute top-4 right-4 grid h-20 w-20 place-items-center overflow-hidden rounded-md border p-2 ${
                    item.company.includes('Gainwell')
                      ? 'border-white/20 bg-black'
                      : 'border-white/70 bg-white'
                  }`}
                >
                  <img src={item.logo} alt={`${item.company} logo`} className="h-14 w-14 object-contain" />
                </div>
              </article>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Journey;
