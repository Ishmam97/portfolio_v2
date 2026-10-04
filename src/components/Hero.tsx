import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
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
      <div className={`section-container relative w-full ${showChatbot ? 'max-w-[92rem] min-h-[760px] md:min-h-[700px]' : 'max-w-6xl min-h-[820px] md:min-h-[760px]'}`}>
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
        <div className={`relative z-10 flex flex-col lg:flex-row items-center justify-between gap-2 ${showChatbot ? 'lg:gap-6' : 'lg:gap-12'} min-h-[720px] md:min-h-[640px]`}>
          {/* Profile Image + CTA - hidden while chatting (avatar moves into the chat) */}
          {!showChatbot && (
          <div className="flex-shrink-0 order-1 lg:order-2 flex flex-col items-center justify-center self-center">
            <div className="relative mb-3 sm:mb-6">
              <motion.img
                layoutId="twin-photo"
                src="/assets/IMG_5747.jpeg"
                alt="Ishmam A. Solaiman" 
                className="rounded-full object-cover border-4 border-neon-purple shadow-lg hover:shadow-neon-green/50 transition-all duration-300 w-60 h-60 sm:w-72 sm:h-72 lg:w-80 lg:h-80"
              />
              {shattering && (
                <div className="pointer-events-none absolute inset-x-0 -top-12 z-10 flex justify-center">
                  <motion.span layoutId="twin-brain" className="block">
                    <motion.span
                      className="block"
                      initial={{ y: 70, scale: 0.15, opacity: 0, filter: 'blur(6px)' }}
                      animate={{ y: 0, scale: 1, opacity: 1, filter: 'blur(0px)' }}
                      transition={{ type: 'spring', stiffness: 90, damping: 14, delay: 0.7 }}
                    >
                      <motion.span
                        className="block"
                        animate={{ scale: [1, 1.12, 1] }}
                        transition={{ duration: 0.9, repeat: Infinity, delay: 1.6 }}
                      >
                        <Brain className="h-16 w-16 text-neon-green drop-shadow-[0_0_14px_rgba(0,255,156,0.95)]" />
                      </motion.span>
                    </motion.span>
                  </motion.span>
                </div>
              )}
            </div>
            
            <Button
              type="button"
              onClick={handleChatbotToggle}
              className={`bg-neon-purple hover:bg-neon-purple/80 text-cyber-dark font-semibold px-6 py-3 rounded-lg transition-all duration-700 ${shattering ? '!bg-transparent !shadow-none' : ''} hover:scale-105 shadow-lg hover:shadow-neon-purple/50 flex items-center gap-2`}
              tabIndex={0}
            >
              <span className={`animate-pulse transition-opacity duration-500 ${shattering ? 'opacity-0' : ''}`}>🧠</span>
              <Shatter text="Talk to my AI-powered digital twin" active={shattering} />
            </Button>
          </div>
          )}

          {/* Text/Chat Section - Always second on mobile, first on desktop */}
          {!showChatbot ? (
          <div
            className="flex-1 text-center lg:text-left order-2 lg:order-1 flex flex-col items-center lg:items-start justify-center px-4 lg:px-0"
            style={{
              minHeight: 512,
              maxHeight: 'none',
              overflow: "visible",
              width: '100%'
            }}
          >
            <p className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 transition-colors duration-500 ${shattering ? 'border-transparent bg-transparent' : 'border-neon-yellow/60 bg-neon-yellow/20'} text-xs sm:text-sm font-semibold text-neon-yellow mb-5 animate-fade-in-up`}>
              <span className="h-2 w-2 rounded-full bg-neon-yellow animate-pulse" />
              <Shatter text="Agentic SWE • AI Product Builder" active={shattering} />
            </p>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 lg:mb-6 animate-fade-in-up leading-tight">
              <Shatter className="text-neon-yellow" text="Ishmam A. Solaiman" active={shattering} />
            </h1>

            <div style={{ width: '100%', height: '100%' }}>
                <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl mb-6 lg:mb-8 h-10 sm:h-12 flex items-center justify-center lg:justify-start">
                  <Shatter className="text-neon-green font-semibold" text={displayText} active={shattering} />
                  <span className="animate-pulse text-neon-yellow ml-1">|</span>
                </div>

                <p className="text-neon-pink text-base sm:text-lg md:text-xl mb-6 lg:mb-8 max-w-2xl animate-fade-in-up delay-300">
                  <Shatter
                    text="I build high-performance AI applications from prototype to production, combining strong product intuition with rigorous software engineering."
                    active={shattering}
                  />
                </p>

                <div className="space-y-4 lg:space-y-5 animate-fade-in-up delay-500">
                  {specialties.map((specialty, index) => (
                    <div key={index} className={`flex items-start lg:items-center justify-center lg:justify-start text-neon-pink text-sm sm:text-base lg:text-lg rounded-lg border p-3 transition-colors duration-500 ${shattering ? 'border-transparent bg-transparent' : 'bg-cyber-dark/70 border-neon-purple/40'}`}>
                      <specialty.icon className="h-5 w-5 text-neon-green mr-3 lg:mr-4 flex-shrink-0 mt-0.5 lg:mt-0" />
                      <Shatter className="text-left" text={specialty.text} active={shattering} />
                    </div>
                  ))}
                </div>

                <div className="mt-7 flex flex-col sm:flex-row items-center gap-3 lg:gap-4">
                  <a href="#projects" className="w-full sm:w-auto">
                    <Button className={`w-full sm:w-auto bg-neon-green text-cyber-dark hover:bg-neon-green/85 font-semibold px-6 py-3 transition-colors duration-500 ${shattering ? '!bg-transparent !text-neon-green' : ''}`}>
                      <Shatter text="View Projects" active={shattering} />
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </a>
                  <a href="#contact" className="w-full sm:w-auto">
                    <Button
                      variant="outline"
                      className={`w-full sm:w-auto border-neon-purple text-neon-purple hover:bg-neon-purple hover:text-cyber-dark font-semibold px-6 py-3 transition-colors duration-500 ${shattering ? '!border-transparent' : ''}`}
                    >
                      <Shatter text="Let's Build Together" active={shattering} />
                    </Button>
                  </a>
                </div>
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
