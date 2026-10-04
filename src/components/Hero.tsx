import React, { useState, useEffect } from 'react';
import { ArrowRight, Brain, Sparkles, Zap } from 'lucide-react';
import { LayoutGroup, motion, useReducedMotion } from 'framer-motion';
import AdvancedChatbotInterface from './AdvancedChatbotInterface';
import Shatter from './hero/Shatter';

const roles = [
  'Founding CTO',
  'Agentic AI Engineer',
  'Full-Stack SWE',
  'RAG Systems Builder',
];

const Hero = () => {
  const [currentRole, setCurrentRole] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [phase, setPhase] = useState<'idle' | 'transition' | 'chat'>('idle');
  const reduceMotion = useReducedMotion();
  const showChatbot = phase === 'chat';
  const shattering = phase === 'transition';

  useEffect(() => {
    if (phase !== 'idle') return; // Freeze the typing animation once the chatbot sequence starts
    
    let timeout: ReturnType<typeof setTimeout>;
    const currentRoleText = roles[currentRole];
    
    if (isTyping) {
      // Typing animation
      if (displayText.length < currentRoleText.length) {
        timeout = setTimeout(() => {
          setDisplayText(currentRoleText.slice(0, displayText.length + 1));
        }, 75);
      } else {
        // Finished typing, wait then start deleting
        timeout = setTimeout(() => {
          setIsTyping(false);
        }, 2000);
      }
    } else {
      // Deleting animation
      if (displayText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayText(displayText.slice(0, -1));
        }, 40);
      } else {
        // Finished deleting, move to next role
        setCurrentRole((prev) => (prev + 1) % roles.length);
        setIsTyping(true);
      }
    }

    return () => clearTimeout(timeout);
  }, [displayText, isTyping, currentRole, phase]);

  const specialties = [
    {
      icon: Brain,
      text: 'Production-grade RAG and per-domain AI agents with grounded citations',
    },
    {
      icon: Zap,
      text: 'Cross-platform web and mobile products with reliability-first engineering',
    },
    {
      icon: Sparkles,
      text: 'Model evaluation and orchestration across OpenAI, Gemini, and open-source LLMs',
    },
  ];

  // idle -> transition (text shatters, terminal frame boots, brain emerges) -> chat (frame morphs into the chat)
  useEffect(() => {
    if (phase !== 'transition') return;
    const t = setTimeout(() => setPhase('chat'), 2300);
    return () => clearTimeout(t);
  }, [phase]);

  const handleChatbotToggle = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (phase === 'transition') return;
    setPhase(reduceMotion ? 'chat' : 'transition');
  };

  const handleChatbotClose = () => setPhase('idle');

  return (
    <section
      id="hero"
      className={`flex items-center justify-center ${showChatbot ? 'px-0' : 'px-0 md:px-4'} py-8 md:py-12 relative min-h-[1080px] md:min-h-[980px] lg:min-h-[92vh]`}
      style={{ scrollMarginTop: "80px" }} // for in-page anchor navigation safety
    >
      <LayoutGroup>
      <div className={`section-container relative w-full lg:w-[85vw] lg:max-w-none lg:h-[85vh] ${showChatbot ? 'max-w-[92rem] min-h-[760px] md:min-h-[700px]' : 'max-w-6xl min-h-[820px] md:min-h-[760px]'}`}>
        {shattering && (
          <motion.div
            layoutId="twin-window"
            className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-md border border-neon-green/45 shadow-[0_0_45px_rgba(0,255,156,0.14)]"
            initial={{ opacity: 0, backgroundColor: 'rgba(7,9,15,0)' }}
            animate={{ opacity: 1, backgroundColor: 'rgba(7,9,15,0.6)' }}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            <div className="absolute inset-0 opacity-[0.08] [background:repeating-linear-gradient(0deg,rgba(0,255,156,0.18)_0_1px,transparent_1px_3px)]" />
            <motion.div
              className="absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-neon-green/15 to-transparent"
              initial={{ top: '-15%' }}
              animate={{ top: '110%' }}
              transition={{ duration: 1.4, delay: 0.3, ease: 'easeInOut' }}
            />
            <motion.div
              className="flex items-center gap-2 border-b border-neon-green/30 px-4 py-2 font-mono text-xs text-neon-green/80"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <span className="h-2 w-2 rounded-full bg-neon-pink/80" />
              <span className="h-2 w-2 rounded-full bg-neon-yellow/80" />
              <span className="h-2 w-2 rounded-full bg-neon-green/80" />
              <span className="ml-2">terminal://ishmam_digital_twin</span>
              <motion.span
                className="ml-auto"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              >
                booting…
              </motion.span>
            </motion.div>
          </motion.div>
        )}
        <div className={`relative z-10 flex flex-col lg:flex-row items-center justify-center gap-2 ${showChatbot ? 'lg:gap-6' : 'lg:gap-[clamp(2rem,5vw,8rem)]'} min-h-[720px] md:min-h-[640px] lg:h-full lg:min-h-0`}>
          {/* Photo + brain + primary CTA - hidden while chatting (avatar moves into the chat) */}
          {!showChatbot && (
          <div className="flex-shrink-0 order-1 lg:order-2 flex flex-col items-center justify-center self-center gap-5 w-full lg:w-auto">
            <div className="relative mt-10">
              {/* rotating neon ring + breathing glow */}
              <div className={`pointer-events-none absolute -inset-4 transition-opacity duration-500 ${shattering ? 'opacity-0' : 'opacity-100'}`}>
                <div className="absolute inset-0 rounded-full bg-neon-green/20 blur-2xl animate-pulse" />
                <div
                  className="absolute inset-0 rounded-full animate-spin [animation-duration:14s] [background:conic-gradient(from_0deg,#00ff9c,transparent_30%,#b45cff_55%,transparent_80%,#00ff9c)] [mask:radial-gradient(farthest-side,transparent_calc(100%-3px),#000_calc(100%-2px))]"
                />
              </div>
              <motion.img
                layoutId="twin-photo"
                src="/assets/IMG_5747.jpeg"
                alt="Ishmam A. Solaiman"
                className="relative rounded-full object-cover border-4 border-[#07090f] shadow-lg w-56 h-56 sm:w-64 sm:h-64 lg:h-[clamp(16rem,20vw,28rem)] lg:w-[clamp(16rem,20vw,28rem)]"
              />
              {/* the brain "implanted" on the head; lifts off when the chat opens */}
              <div className="pointer-events-none absolute inset-x-0 -top-11 z-10 flex justify-center">
                <motion.span layoutId="twin-brain" className="block">
                  <motion.span
                    className="block"
                    animate={shattering ? { y: -14, scale: 1.35 } : { y: [0, -6, 0], scale: 1 }}
                    transition={
                      shattering
                        ? { type: 'spring', stiffness: 90, damping: 12 }
                        : { duration: 3, repeat: Infinity, ease: 'easeInOut' }
                    }
                  >
                    <Brain className="h-14 w-14 text-neon-green drop-shadow-[0_0_14px_rgba(0,255,156,0.95)]" />
                  </motion.span>
                </motion.span>
              </div>
            </div>

            <p className="font-mono text-xs lg:text-[clamp(0.75rem,0.9vw,1.05rem)] text-neon-green/80 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-neon-green animate-pulse" />
              <Shatter text="digital_twin: online" active={shattering} />
            </p>

            <div className="w-full max-w-sm lg:max-w-[clamp(20rem,24vw,36rem)]">
              <motion.button
                type="button"
                onClick={handleChatbotToggle}
                className={`group relative w-full overflow-hidden rounded-md border-2 px-6 py-4 font-mono text-base sm:text-lg lg:text-[clamp(1rem,1.15vw,1.6rem)] lg:whitespace-nowrap font-bold transition-colors duration-500 ${
                  shattering
                    ? 'border-transparent bg-transparent text-neon-green'
                    : 'border-neon-green bg-neon-green text-cyber-dark hover:bg-neon-yellow hover:border-neon-yellow'
                }`}
                animate={
                  shattering
                    ? { boxShadow: '0 0 0px rgba(0,255,156,0)' }
                    : { boxShadow: ['0 0 18px rgba(0,255,156,0.45)', '0 0 42px rgba(0,255,156,0.85)', '0 0 18px rgba(0,255,156,0.45)'] }
                }
                transition={shattering ? { duration: 0.4 } : { duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                whileHover={shattering ? undefined : { scale: 1.04 }}
                whileTap={shattering ? undefined : { scale: 0.98 }}
              >
                {!shattering && (
                  <motion.span
                    aria-hidden
                    className="pointer-events-none absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                    initial={{ left: '-40%' }}
                    animate={{ left: '140%' }}
                    transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 1.4, ease: 'easeInOut' }}
                  />
                )}
                <span className="relative flex items-center justify-center gap-2">
                  <span className={shattering ? 'opacity-0' : ''}>{'>_'}</span>
                  <Shatter text="Talk to my digital twin" active={shattering} />
                </span>
              </motion.button>
              <p className="mt-2 text-center font-mono text-[11px] lg:text-[clamp(0.7rem,0.8vw,0.95rem)] text-neon-green/60">
                <Shatter text="ask about Optimizely, RAG systems, research…" active={shattering} />
              </p>
            </div>
          </div>
          )}

          {/* Text/Chat Section - Always second on mobile, first on desktop */}
          {!showChatbot ? (
          <div
            className="relative flex-1 lg:flex-none lg:min-w-0 lg:max-w-[min(44vw,64rem)] text-center lg:text-left order-2 lg:order-1 flex flex-col items-center lg:items-start justify-center px-4 lg:px-0 w-full"
            style={{ minHeight: 512 }}
          >
            <div className="pointer-events-none absolute -inset-4 opacity-[0.06] [background:repeating-linear-gradient(0deg,rgba(0,255,156,0.5)_0_1px,transparent_1px_3px)]" />

            <p className="relative mb-3 font-mono text-sm lg:text-[clamp(0.85rem,1vw,1.2rem)] text-neon-green/70 animate-fade-in-up">
              <Shatter text="$ whoami" active={shattering} />
            </p>

            <h1 className="relative mb-4 lg:mb-5 text-4xl sm:text-5xl lg:text-[clamp(2.6rem,4vw,5.5rem)] lg:whitespace-nowrap font-bold leading-tight animate-fade-in-up [text-shadow:0_0_24px_rgba(255,230,0,0.35)]">
              <Shatter className="text-neon-yellow" text="Ishmam A. Solaiman" active={shattering} />
            </h1>

            <div className="relative mb-6 flex min-h-10 items-center justify-center font-mono text-lg sm:text-xl lg:text-[clamp(1.3rem,2vw,2.6rem)] lg:justify-start">
              <Shatter className="text-neon-green/60 mr-3" text="> role:" active={shattering} />
              <Shatter className="text-neon-green font-semibold" text={displayText} active={shattering} />
              <span className="ml-1 animate-pulse text-neon-yellow">▌</span>
            </div>

            <p className="relative mb-7 max-w-[34em] text-base sm:text-lg lg:text-[clamp(1.05rem,1.3vw,1.7rem)] text-gray-300 animate-fade-in-up delay-300">
              <Shatter
                text="I build high-performance AI applications from prototype to production, combining strong product intuition with rigorous software engineering."
                active={shattering}
              />
            </p>

            <ul className="relative space-y-3 text-left animate-fade-in-up delay-500">
              {specialties.map((specialty, index) => (
                <li
                  key={index}
                  className="flex gap-3 border-l-2 border-neon-green/40 pl-3 font-mono text-sm sm:text-base lg:text-[clamp(0.95rem,1.1vw,1.45rem)] text-neon-green/90"
                >
                  <span className="text-neon-yellow">✓</span>
                  <Shatter text={specialty.text} active={shattering} />
                </li>
              ))}
            </ul>

            <div className="relative mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-mono text-sm lg:text-[clamp(0.9rem,1vw,1.3rem)] lg:justify-start">
              <a href="#projects" className="group inline-flex items-center gap-1 text-neon-green/80 underline-offset-4 hover:text-neon-yellow hover:underline">
                <Shatter text="view_projects" active={shattering} />
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
              <a href="#contact" className="group inline-flex items-center gap-1 text-neon-green/80 underline-offset-4 hover:text-neon-yellow hover:underline">
                <Shatter text="let's_build_together" active={shattering} />
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
            </div>
          </div>
            ) : (
              <div className="flex-1 order-2 lg:order-1 w-full h-full flex flex-col justify-center items-center min-h-[512px] px-0">
                <AdvancedChatbotInterface onClose={handleChatbotClose} />
              </div>
            )}
          </div>
        </div>
      </LayoutGroup>
      </section>
    );
  };
  
  export default Hero;
