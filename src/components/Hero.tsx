
import React, { useState, useEffect } from 'react';

const Hero = () => {
  const [currentRole, setCurrentRole] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  
  const roles = [
    "Software Engineer",
    "Tech Enthusiast", 
    "Problem Solver",
    "Data Scientist"
  ];

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const currentRoleText = roles[currentRole];
    
    if (isTyping) {
      // Typing animation
      if (displayText.length < currentRoleText.length) {
        timeout = setTimeout(() => {
          setDisplayText(currentRoleText.slice(0, displayText.length + 1));
        }, 75); // Typing speed increased (was 100ms, now 75ms)
      } else {
        // Finished typing, wait then start deleting
        timeout = setTimeout(() => {
          setIsTyping(false);
        }, 2000); // Wait 2 seconds before deleting
      }
    } else {
      // Deleting animation
      if (displayText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayText(displayText.slice(0, -1));
        }, 40); // Deleting speed increased (was 50ms, now 40ms)
      } else {
        // Finished deleting, move to next role
        setCurrentRole((prev) => (prev + 1) % roles.length);
        setIsTyping(true);
      }
    }

    return () => clearTimeout(timeout);
  }, [displayText, isTyping, currentRole, roles]);

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

  return (
    <section id="hero" className="min-h-screen flex items-center justify-center pt-24 pb-16 px-12">
      <div className="section-container w-full max-w-6xl">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          
          {/* Profile Image */}
          <div className="flex-shrink-0 order-1 lg:order-2 flex items-center justify-center">
            <div className="relative">
              <img 
                src="/lovable-uploads/37f3133f-ab50-4576-940c-83312c5bcf0b.png" 
                alt="Ishmam A. Solaiman" 
                className="w-80 h-80 rounded-full object-cover border-4 border-neon-purple shadow-lg hover:shadow-neon-green/50 transition-all duration-300"
              />
            </div>
          </div>

          {/* Text Content */}
          <div className="flex-1 text-center lg:text-left order-2 lg:order-1">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 animate-fade-in-up">
              <span className="text-neon-yellow">Hi i am Ishmam.</span>
            </h1>
            
            <div className="text-2xl md:text-3xl lg:text-4xl mb-10 h-12 flex items-center justify-center lg:justify-start">
              <span className="text-neon-green font-semibold">
                {displayText}
              </span>
              <span className="animate-pulse text-neon-yellow ml-1">|</span>
            </div>

            <p className="text-neon-pink text-lg md:text-xl mb-10 max-w-2xl animate-fade-in-up delay-300">
              Passionate self taught Web Application Developer, Data Scientist, Ai Application Engineer focusing on topics such as:
            </p>

            <div className="space-y-6 animate-fade-in-up delay-500">
              {specialties.map((specialty, index) => (
                <div key={index} className="flex items-center justify-center lg:justify-start text-neon-pink text-lg">
                  <span className="text-2xl mr-4">{specialty.emoji}</span>
                  <span>{specialty.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
