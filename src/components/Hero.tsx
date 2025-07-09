import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import AdvancedChatbotInterface from './AdvancedChatbotInterface';

const roles = [
  "Software Engineer",
  "Tech Enthusiast", 
  "Problem Solver",
  "Data Scientist"
];

const Hero = () => {
  const [currentRole, setCurrentRole] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [showChatbot, setShowChatbot] = useState(false);

  useEffect(() => {
    if (showChatbot) return; // Don't run typing animation when chatbot is active
    
    let timeout: NodeJS.Timeout;
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
      emoji: "🤖",
      text: "Applications of LLMS & Multi Agent Architecture"
    },
    {
      emoji: "💻📱",
      text: "Full stack web and mobile application development"
    },
    {
      emoji: "📊🩻",
      text: "Data Science & Natural Language Processing"
    }
  ];

  const handleChatbotToggle = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setShowChatbot((prev) => !prev);
  };

  return (
    <section
      id="hero"
      className={`flex items-center justify-center ${showChatbot ? 'px-0' : 'px-4'} py-8 md:py-12 relative min-h-[900px] lg:min-h-[85vh]`}
      style={{ scrollMarginTop: "80px" }} // for in-page anchor navigation safety
    >
      <div className="section-container w-full max-w-6xl">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
          {/* Profile Image - Always first on mobile, second on desktop */}
          <div className="flex-shrink-0 order-1 lg:order-2 flex flex-col items-center justify-center">
            <div className={`relative mb-6 transition-all duration-300 ${showChatbot ? 'mb-4' : ''}`}>
              <img 
                src="/lovable-uploads/IMG_5747.jpeg"
                alt="Ishmam A. Solaiman" 
                className={`rounded-full object-cover border-4 border-neon-purple shadow-lg hover:shadow-neon-green/50 transition-all duration-300 ${
                  showChatbot 
                    ? 'w-20 h-20 sm:w-24 sm:h-24 lg:w-80 lg:h-80' 
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
              maxHeight: 600,
              overflow: "hidden", // Prevents layout shift when toggling chat
              width: '100%'
            }}
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 lg:mb-8 animate-fade-in-up">
              <span className="text-neon-yellow">Hi i am Ishmam.</span>
            </h1>
            
            <div style={{ width: '100%', height: '100%' }}>

                <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl mb-8 lg:mb-10 h-10 sm:h-12 flex items-center justify-center lg:justify-start">
                  <span className="text-neon-green font-semibold">
                    {displayText}
                  </span>
                  <span className="animate-pulse text-neon-yellow ml-1">|</span>
                </div>

                <p className="text-neon-pink text-base sm:text-lg md:text-xl mb-8 lg:mb-10 max-w-2xl animate-fade-in-up delay-300">
                  Passionate self taught Web Application Developer, Data Scientist, Ai Application Engineer focusing on topics such as:
                </p>

                <div className="space-y-4 lg:space-y-6 animate-fade-in-up delay-500">
                  {specialties.map((specialty, index) => (
                    <div key={index} className="flex items-start lg:items-center justify-center lg:justify-start text-neon-pink text-sm sm:text-base lg:text-lg">
                      <span className="text-xl sm:text-2xl mr-3 lg:mr-4 flex-shrink-0">{specialty.emoji}</span>
                      <span className="text-left">{specialty.text}</span>
                    </div>
                  ))}
                </div>
            </div>
          </div>
            ) : (
              <div className="flex-1 order-2 lg:order-1 w-full h-full flex flex-col justify-center items-center min-h-[512px] max-h-[600px] px-4 lg:px-0">
                <AdvancedChatbotInterface onClose={() => handleChatbotToggle()} />
              </div>
            )}
          </div>
        </div>
      </section>
    );
  };
  
  export default Hero;