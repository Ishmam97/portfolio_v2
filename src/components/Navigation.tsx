
import React, { useState, useEffect } from 'react';
import { Home, User, FolderOpen, Briefcase } from 'lucide-react';

const Navigation = () => {
  const [activeSection, setActiveSection] = useState('hero');

  const navItems = [
    { id: 'hero', icon: Home, label: 'Home' },
    { id: 'journey', icon: Briefcase, label: 'Journey' },
    { id: 'projects', icon: FolderOpen, label: 'Projects' }
  ];

  useEffect(() => {
    const handleScroll = () => {
      const sections = navItems.map(item => item.id);
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetHeight = element.offsetHeight;
          
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [navItems]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Desktop Navigation (Left Side) */}
      <nav className="fixed left-4 top-1/2 transform -translate-y-1/2 z-40 hidden lg:block">
        <div className="flex flex-col space-y-4 bg-cyber-dark/80 backdrop-blur-sm border border-neon-purple rounded-full p-4">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`p-3 rounded-full transition-all duration-300 group relative ${
                  isActive 
                    ? 'bg-neon-yellow text-cyber-dark shadow-lg' 
                    : 'text-neon-green hover:text-neon-yellow hover:bg-neon-purple/20'
                }`}
                aria-label={item.label}
              >
                <IconComponent size={24} />
                
                {/* Tooltip */}
                <span className="absolute left-full ml-4 px-3 py-2 bg-cyber-dark border border-neon-purple rounded-lg text-neon-green text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
      
      {/* Mobile Navigation (Bottom) */}
      <nav className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40 lg:hidden">
        <div className="flex space-x-4 bg-cyber-dark/90 backdrop-blur-sm border border-neon-purple rounded-full p-3">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`p-3 rounded-full transition-all duration-300 ${
                  isActive 
                    ? 'bg-neon-yellow text-cyber-dark' 
                    : 'text-neon-green hover:text-neon-yellow hover:bg-neon-purple/20'
                }`}
                aria-label={item.label}
              >
                <IconComponent size={20} />
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default Navigation;
