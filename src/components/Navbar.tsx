
import React from 'react';
import { Github, Linkedin, Instagram, Mail } from 'lucide-react';

const Navbar = () => {
  const socialLinks = [
    {
      icon: Github,
      href: "https://github.com/ishmam97",
      label: "GitHub"
    },
    {
      icon: Linkedin,
      href: "https://www.linkedin.com/in/ishmam-solaiman-212b32186/",
      label: "LinkedIn"
    },
    {
      icon: Instagram,
      href: "https://instagram.com/ishmam97/",
      label: "Instagram"
    },
    {
      icon: Mail,
      href: "mailto:ishmam.a.solaiman@gmail.com",
      label: "Email"
    },
    {
      icon: BookOpen,
      href: "/blog",
      label: "Blog"
    }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-cyber-dark border-b-2 border-neon-pink p-3 sm:p-4 backdrop-blur-sm">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <a 
          href="#hero" 
          className={`
            group
            font-creattion
            font-bold
            transition-all
            duration-300
            focus:outline-none
          `}
          style={{
            fontSize: 'calc(2rem + 6pt)', // base 2rem (32px), + 8px ≈ +6pt
          }}
        >
          <span
            className={`
              text-neon-yellow
              neon-glow
              transition-all
              duration-300
              group-hover:text-neon-yellow
              group-hover:navbar-flicker
            `}
            style={{
              display: 'inline-block',
            }}
          >
            Ishmam
          </span>
          <span
            className={`
              hidden sm:inline text-neon-green neon-glow transition-all duration-300 group-hover:text-neon-yellow group-hover:navbar-flicker
            `}
            style={{
              marginLeft: '0.5ch',
            }}
          >
            A. Solaiman
          </span>
        </a>

        {/* Social Icons */}
        <div className="flex space-x-2 sm:space-x-4">
          {socialLinks.map((link, index) => {
            const IconComponent = link.icon;
            return (
              <a
                key={index}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-neon-green hover:text-neon-yellow transition-all duration-300 hover:scale-110 neon-glow p-1"
                aria-label={link.label}
              >
                <IconComponent size={20} className="sm:w-6 sm:h-6" />
              </a>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
