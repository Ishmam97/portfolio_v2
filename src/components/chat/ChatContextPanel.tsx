import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, ExternalLink, Github, GraduationCap, Briefcase, FolderGit2, MapPin } from 'lucide-react';
import { projectsData, type Project } from '@/data/projects';
import { experienceData, type ExperienceItem } from '@/data/experience';

export type ChatCardRef = { type: 'project' | 'experience'; id: string };

const PANEL_WIDTH = 392;

const projectById = new Map(projectsData.map((p) => [p.id, p]));
const experienceById = new Map(experienceData.map((e) => [e.id, e]));

const useIsDesktop = () => {
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches
  );
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const onChange = () => setIsDesktop(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return isDesktop;
};

const isEducation = (item: ExperienceItem) => /^(Master|Bachelor)/.test(item.title);

const SweepLine = () => (
  <motion.span
    aria-hidden
    className="pointer-events-none absolute left-0 top-0 h-px w-1/3 bg-gradient-to-r from-transparent via-neon-green to-transparent"
    initial={{ x: '-120%' }}
    animate={{ x: '420%' }}
    transition={{ duration: 1.1, ease: 'easeInOut', delay: 0.15 }}
  />
);

const ProjectCard = ({ project }: { project: Project }) => (
  <>
    <div className="relative h-28 overflow-hidden">
      <motion.img
        src={project.imageUrl}
        alt={project.title}
        className="h-full w-full object-cover"
        initial={{ scale: 1.2 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#07090f] via-[#07090f]/30 to-transparent" />
      <span className="absolute left-2.5 top-2.5 rounded-sm border border-neon-green/50 bg-[#07090f]/80 px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-neon-green">
        {project.category}
      </span>
    </div>
    <div className="space-y-2.5 p-3.5">
      <h4 className="text-base font-bold leading-tight text-neon-yellow">{project.title}</h4>
      <p className="line-clamp-3 text-xs leading-relaxed text-gray-300">{project.description}</p>
      <div className="flex flex-wrap gap-1">
        {project.technologies.slice(0, 5).map((tech, i) => (
          <motion.span
            key={tech}
            className="rounded-sm border border-neon-green/30 bg-neon-green/10 px-1.5 py-0.5 text-[10px] text-neon-green"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.05 }}
          >
            {tech}
          </motion.span>
        ))}
        {project.technologies.length > 5 && (
          <span className="rounded-sm border border-neon-green/30 px-1.5 py-0.5 text-[10px] text-neon-green/70">
            +{project.technologies.length - 5}
          </span>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2 pt-0.5 text-[11px]">
        {project.live && project.liveUrl && (
          <a
            href={project.liveUrl}
            target={project.liveUrl.startsWith('/') ? undefined : '_blank'}
            rel={project.liveUrl.startsWith('/') ? undefined : 'noopener noreferrer'}
            className="inline-flex items-center gap-1 rounded-sm bg-neon-yellow px-2 py-1 font-semibold text-cyber-dark transition-colors hover:bg-neon-green"
          >
            <ExternalLink size={12} />
            {project.liveLabel || 'Live'}
          </a>
        )}
        {project.githubUrl && (
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-sm border border-neon-green/60 px-2 py-1 font-semibold text-neon-green transition-colors hover:bg-neon-green hover:text-cyber-dark"
          >
            <Github size={12} />
            Code
          </a>
        )}
        <a
          href="#projects"
          className="ml-auto inline-flex items-center gap-0.5 text-neon-green/70 transition-colors hover:text-neon-yellow"
        >
          all projects <ArrowUpRight size={12} />
        </a>
      </div>
    </div>
  </>
);

const ExperienceCard = ({ item }: { item: ExperienceItem }) => {
  const Icon = isEducation(item) ? GraduationCap : Briefcase;
  return (
    <div className="space-y-3 p-3.5">
      <div className="flex items-start gap-3">
        <motion.div
          className={`grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-sm border p-1.5 ${
            item.company.includes('Gainwell') ? 'border-white/20 bg-black' : 'border-white/70 bg-white'
          }`}
          initial={{ rotate: -12, scale: 0.6, opacity: 0 }}
          animate={{ rotate: 0, scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }}
        >
          <img src={item.logo} alt={`${item.company} logo`} className="h-full w-full object-contain" />
        </motion.div>
        <div className="min-w-0">
          <h4 className="text-sm font-bold leading-tight text-neon-yellow">{item.title}</h4>
          <p className="mt-1 flex flex-wrap items-center gap-1 text-xs text-neon-green">
            <Icon size={12} />
            {item.company}
            {item.location && (
              <span className="inline-flex items-center gap-0.5 text-neon-green/70">
                <MapPin size={10} />
                {item.location}
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.1em]">
        <span className="rounded-sm border border-neon-purple/50 bg-neon-purple/10 px-1.5 py-0.5 text-neon-purple">
          {item.startDate}
        </span>
        <motion.span
          className="h-px flex-1 origin-left bg-gradient-to-r from-neon-purple to-neon-green"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.7, delay: 0.25, ease: 'easeOut' }}
        />
        <span className="rounded-sm border border-neon-green/50 bg-neon-green/10 px-1.5 py-0.5 text-neon-green">
          {item.endDate}
        </span>
      </div>

      <ul className="space-y-1.5">
        {item.bullets.slice(0, 3).map((bullet, i) => (
          <motion.li
            key={i}
            className="flex gap-1.5 text-xs leading-relaxed text-gray-300"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
          >
            <span className="mt-0.5 text-neon-purple">›</span>
            <span className="line-clamp-3">{bullet}</span>
          </motion.li>
        ))}
      </ul>

      <a
        href="#journey"
        className="inline-flex items-center gap-0.5 text-[11px] text-neon-green/70 transition-colors hover:text-neon-yellow"
      >
        full timeline <ArrowUpRight size={12} />
      </a>
    </div>
  );
};

const ContextCard = ({ card, index, reduceMotion }: { card: ChatCardRef; index: number; reduceMotion: boolean }) => {
  const project = card.type === 'project' ? projectById.get(card.id) : undefined;
  const experience = card.type === 'experience' ? experienceById.get(card.id) : undefined;
  if (!project && !experience) return null;

  const Label = card.type === 'project' ? FolderGit2 : Briefcase;

  return (
    <motion.article
      layout={!reduceMotion}
      className="relative overflow-hidden rounded-md border border-neon-green/40 bg-[#0a0e17] shadow-[0_0_28px_rgba(0,255,156,0.12)]"
      style={{ transformPerspective: 900 }}
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 36, scale: 0.94, rotateX: -10 }}
      animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1, rotateX: 0 }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -40, scale: 0.96 }}
      transition={
        reduceMotion
          ? { duration: 0.15 }
          : { type: 'spring', stiffness: 220, damping: 22, delay: index * 0.14 }
      }
      whileHover={reduceMotion ? undefined : { y: -3, boxShadow: '0 0 36px rgba(0,255,156,0.28)' }}
    >
      {!reduceMotion && <SweepLine />}
      <div className="flex items-center gap-1.5 border-b border-neon-green/20 bg-neon-green/5 px-3 py-1.5 text-[10px] uppercase tracking-[0.16em] text-neon-green/80">
        <Label size={11} />
        <span>
          {card.type}://{card.id}
        </span>
        <span className="ml-auto h-1.5 w-1.5 animate-pulse rounded-full bg-neon-green" />
      </div>
      {project ? <ProjectCard project={project} /> : <ExperienceCard item={experience!} />}
    </motion.article>
  );
};

interface ChatContextPanelProps {
  cards: ChatCardRef[];
}

/** Side (desktop) / top (mobile) panel that opens with the cards for the topic being discussed. */
const ChatContextPanel: React.FC<ChatContextPanelProps> = ({ cards }) => {
  const isDesktop = useIsDesktop();
  const reduceMotion = useReducedMotion() ?? false;
  const hasCards = cards.length > 0;

  const closedState = isDesktop ? { width: 0, opacity: 0 } : { height: 0, opacity: 0 };
  const openState = isDesktop ? { width: PANEL_WIDTH, opacity: 1 } : { height: 'auto', opacity: 1 };

  return (
    <AnimatePresence initial={false}>
      {hasCards && (
        <motion.aside
          key="context-panel"
          className="relative z-10 min-h-0 shrink-0 overflow-hidden lg:order-2"
          initial={closedState}
          animate={openState}
          exit={closedState}
          transition={reduceMotion ? { duration: 0.15 } : { type: 'spring', stiffness: 170, damping: 24 }}
          aria-label="Related portfolio items"
        >
          <div
            className="flex h-full max-h-56 flex-col gap-3 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-neon-green/60 scrollbar-track-cyber-dark lg:max-h-none lg:pl-1"
            style={isDesktop ? { width: PANEL_WIDTH } : undefined}
          >
            <motion.p
              className="text-[10px] uppercase tracking-[0.2em] text-neon-green/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {'>'} related_context
            </motion.p>
            <AnimatePresence>
              {cards.map((card, i) => (
                <ContextCard
                  key={`${card.type}:${card.id}`}
                  card={card}
                  index={i}
                  reduceMotion={reduceMotion}
                />
              ))}
            </AnimatePresence>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};

export default ChatContextPanel;
