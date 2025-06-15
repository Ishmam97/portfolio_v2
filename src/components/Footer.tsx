
import React from 'react';
import { Github, Linkedin, Mail, Heart } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      name: 'GitHub',
      url: 'https://github.com/Ishmam97',
      icon: Github
    },
    {
      name: 'LinkedIn',
      url: 'https://linkedin.com/in/ishmam-solaiman',
      icon: Linkedin
    },
    {
      name: 'Email',
      url: 'mailto:ishmam.solaiman@gmail.com',
      icon: Mail
    }
  ];

  return (
    <footer className="bg-cyber-darker border-t-2 border-neon-purple py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-bold text-neon-yellow mb-4">Ishmam A. Solaiman</h3>
            <p className="text-neon-pink">
              Software Engineer & Data Scientist passionate about creating innovative solutions.
            </p>
          </div>

          {/* Quick Links */}
          <div className="text-center">
            <h4 className="text-lg font-semibold text-neon-green mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="#hero" className="text-neon-pink hover:text-neon-yellow transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="#journey" className="text-neon-pink hover:text-neon-yellow transition-colors">
                  Journey
                </a>
              </li>
              <li>
                <a href="#projects" className="text-neon-pink hover:text-neon-yellow transition-colors">
                  Projects
                </a>
              </li>
              <li>
                <a href="#contact" className="text-neon-pink hover:text-neon-yellow transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div className="text-center md:text-right">
            <h4 className="text-lg font-semibold text-neon-green mb-4">Connect</h4>
            <div className="flex justify-center md:justify-end space-x-4">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 border-2 border-neon-purple rounded-full text-neon-purple hover:text-neon-yellow hover:border-neon-yellow transition-all duration-300 hover:scale-110"
                  aria-label={link.name}
                >
                  <link.icon size={20} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-neon-purple pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left">
            <p className="text-neon-pink mb-4 md:mb-0">
              © {currentYear} Ishmam A. Solaiman. All rights reserved.
            </p>
            <p className="text-neon-pink flex items-center justify-center">
              Made with <Heart className="mx-2 w-4 h-4 text-red-500" /> using React & Tailwind CSS
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
