import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Brain, Sparkles, Zap } from 'lucide-react';
import AdvancedChatbotInterface from './AdvancedChatbotInterface';

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
  const [showChatbot, setShowChatbot] = useState(false);

  useEffect(() => {
    if (showChatbot) return; // Don't run typing animation when chatbot is active
    
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
  }, [displayText, isTyping, currentRole, showChatbot]);

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

  const handleChatbotToggle = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setShowChatbot((prev) => !prev);
  };

  return (
    <section
      id="hero"
      className={`flex items-center justify-center ${showChatbot ? 'px-0' : 'px-0 md:px-4'} py-8 md:py-12 relative min-h-[1080px] md:min-h-[980px] lg:min-h-[92vh]`}
      style={{ scrollMarginTop: "80px" }} // for in-page anchor navigation safety
    >
      <div className={`section-container w-full ${showChatbot ? 'max-w-[92rem] min-h-[760px] md:min-h-[700px]' : 'max-w-6xl min-h-[820px] md:min-h-[760px]'}`}>
        <div className={`flex flex-col lg:flex-row items-center justify-between gap-2 ${showChatbot ? 'lg:gap-6' : 'lg:gap-12'} min-h-[720px] md:min-h-[640px]`}>
          {/* Profile Image - Always first on mobile, second on desktop */}
          <div className="flex-shrink-0 order-1 lg:order-2 flex flex-col items-center justify-center self-center">
            <div className={`relative mb-3 sm:mb-6 transition-all duration-300 ${showChatbot ? 'mb-4' : ''}`}>
              <img 
                src="/assets/IMG_5747.jpeg"
                alt="Ishmam A. Solaiman" 
                className={`rounded-full object-cover border-4 border-neon-purple shadow-lg hover:shadow-neon-green/50 transition-all duration-300 ${
                  showChatbot 
                    ? 'w-16 h-16 sm:w-20 sm:h-20 lg:w-44 lg:h-44' 
                    : 'w-60 h-60 sm:w-72 sm:h-72 lg:w-80 lg:h-80'
                }`}
              />
            </div>
            
            <Button
              type="button"
              onClick={handleChatbotToggle}
              className={`bg-neon-purple hover:bg-neon-purple/80 text-cyber-dark font-semibold px-6 py-3 rounded-lg transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-neon-purple/50 flex items-center gap-2 ${
                showChatbot ? 'hidden sm:flex' : 'flex'
              }`}
              tabIndex={0}
            >
              <span className="animate-pulse">{showChatbot ? '❌' : '🧠'}</span>
              {showChatbot ? 'Close chatbot' : 'Talk to my AI-powered digital twin'}
            </Button>
          </div>

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
            <p className="inline-flex items-center gap-2 rounded-full border border-neon-yellow/60 bg-neon-yellow/20 px-4 py-1.5 text-xs sm:text-sm font-semibold text-neon-yellow mb-5 animate-fade-in-up">
              <span className="h-2 w-2 rounded-full bg-neon-yellow animate-pulse" />
              Agentic SWE • AI Product Builder
            </p>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 lg:mb-6 animate-fade-in-up leading-tight">
              <span className="text-neon-yellow">Ishmam A. Solaiman</span>
            </h1>

            <div style={{ width: '100%', height: '100%' }}>
                <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl mb-6 lg:mb-8 h-10 sm:h-12 flex items-center justify-center lg:justify-start">
                  <span className="text-neon-green font-semibold">
                    {displayText}
                  </span>
                  <span className="animate-pulse text-neon-yellow ml-1">|</span>
                </div>

                <p className="text-neon-pink text-base sm:text-lg md:text-xl mb-6 lg:mb-8 max-w-2xl animate-fade-in-up delay-300">
                  I build high-performance AI applications from prototype to production, combining strong product intuition with rigorous software engineering.
                </p>

                <div className="space-y-4 lg:space-y-5 animate-fade-in-up delay-500">
                  {specialties.map((specialty, index) => (
                    <div key={index} className="flex items-start lg:items-center justify-center lg:justify-start text-neon-pink text-sm sm:text-base lg:text-lg rounded-lg bg-cyber-dark/70 border border-neon-purple/40 p-3">
                      <specialty.icon className="h-5 w-5 text-neon-green mr-3 lg:mr-4 flex-shrink-0 mt-0.5 lg:mt-0" />
                      <span className="text-left">{specialty.text}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-7 flex flex-col sm:flex-row items-center gap-3 lg:gap-4">
                  <a href="#projects" className="w-full sm:w-auto">
                    <Button className="w-full sm:w-auto bg-neon-green text-cyber-dark hover:bg-neon-green/85 font-semibold px-6 py-3">
                      View Projects
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </a>
                  <a href="#contact" className="w-full sm:w-auto">
                    <Button
                      variant="outline"
                      className="w-full sm:w-auto border-neon-purple text-neon-purple hover:bg-neon-purple hover:text-cyber-dark font-semibold px-6 py-3"
                    >
                      Let&apos;s Build Together
                    </Button>
                  </a>
                </div>
            </div>
          </div>
            ) : (
              <div className="flex-1 order-2 lg:order-1 w-full h-full flex flex-col justify-center items-center min-h-[512px] px-0 lg:px-0 lg:basis-[82%]">
                <AdvancedChatbotInterface onClose={() => handleChatbotToggle()} />
              </div>
            )}
          </div>
        </div>
      </section>
    );
  };
  
  export default Hero;
