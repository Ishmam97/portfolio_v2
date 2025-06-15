
import React, { useEffect, useRef, useState } from 'react';
import { ExternalLink, Github } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

const projectsData = [
  {
    title: "Cosmos",
    description: "Cosmos research lab Website.",
    imageUrl: "/lovable-uploads/cosmos.png",
    technologies: ["React", "Next.js", "HTML", "CSS", "JavaScript", "Bootstrap"],
    live: true,
    liveUrl: "https://cosmos.ualr.edu/",
    category: "Web Development"
  },
  {
    title: "UBlog",
    description: "A social media website I built for my undergraduate web development course.",
    imageUrl: "/lovable-uploads/0a645fba-1880-452c-83b3-67b366b74464.gif",
    technologies: ["React", "Node.js", "MongoDB", "Express"],
    live: false,
    githubUrl: "https://github.com/Ishmam97/uBlog",
    category: "Full Stack"
  },
  {
    title: "Disinfectors Inc. Website",
    description: "A website I built for my failed disinfections service business that never took off.",
    imageUrl: "/lovable-uploads/disinfectors.gif",
    technologies: ["HTML", "CSS", "JavaScript", "Bootstrap", "Firebase", "GCP"],
    live: false,
    githubUrl: "https://github.com/Ishmam97/Service_website",
    category: "Web Development"
  },
  {
    title: "Feedme",
    description: "Food ordering and delivery app for android built using Kotlin and android studio.",
    imageUrl: "/lovable-uploads/feedme.gif",
    technologies: ["Kotlin", "Android Studio"],
    live: false,
    githubUrl: "https://github.com/Ishmam97/FeedMee",
    category: "Mobile Development"
  },
];

// Technology icons mapping
const technologyIcons = {
  "React": "⚛️",
  "Next.js": "▲",
  "HTML": "🌐",
  "CSS": "🎨",
  "JavaScript": "💛",
  "Bootstrap": "🅱️",
  "Node.js": "💚",
  "MongoDB": "🍃",
  "Express": "🚂",
  "Firebase": "🔥",
  "GCP": "☁️"
};

const Projects = () => {
  const [visibleProjects, setVisibleProjects] = useState(new Set());
  const projectRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt((entry.target as HTMLElement).dataset.index || '0');
            setVisibleProjects(prev => new Set([...prev, index]));
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    projectRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <TooltipProvider>
      <section id="projects" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-neon-yellow mb-16 animate-fade-in-up">
            My Projects
          </h2>
          
          <div className="grid gap-8 md:gap-12">
            {projectsData.map((project, index) => (
              <div 
                key={index}
                ref={(el) => (projectRefs.current[index] = el)}
                data-index={index}
                className={`section-container group ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                } flex flex-col md:flex-row items-center gap-8 transition-all duration-700 ${
                  visibleProjects.has(index) 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-10'
                }`}
              >
                {/* Project Image */}
                <div className="w-full md:w-1/2">
                  <div className="relative overflow-hidden rounded-lg border-2 border-neon-purple">
                    <img 
                      src={project.imageUrl} 
                      alt={project.title}
                      className="w-full h-64 md:h-80 object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-neon-green/10 to-neon-purple/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </div>
                
                {/* Project Info */}
                <div className="w-full md:w-1/2 space-y-6">
                  <div>
                    <span className="text-neon-purple text-sm font-semibold tracking-wide uppercase">
                      {project.category}
                    </span>
                    <h3 className="text-3xl font-bold text-neon-yellow mb-4">
                      {project.title}
                    </h3>
                    <p className="text-neon-green text-lg leading-relaxed">
                      {project.description}
                    </p>
                  </div>
                  
                  {/* Technologies with Icons */}
                  <div className="flex flex-wrap gap-3">
                    {project.technologies.map((tech, techIndex) => (
                      <Tooltip key={techIndex}>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-2 px-3 py-2 bg-neon-purple/20 text-neon-purple border border-neon-purple rounded-full text-sm font-medium hover:bg-neon-purple/30 transition-colors cursor-pointer">
                            <span className="text-lg">{technologyIcons[tech] || "🔧"}</span>
                            <span>{tech}</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{tech}</p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-4">
                    {project.live && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-6 py-3 bg-neon-yellow text-cyber-dark font-semibold rounded-full hover:bg-neon-green transition-all duration-300 hover:scale-105"
                      >
                        <ExternalLink size={20} className="mr-2" />
                        View Live
                      </a>
                    )}
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-6 py-3 border-2 border-neon-green text-neon-green font-semibold rounded-full hover:bg-neon-green hover:text-cyber-dark transition-all duration-300 hover:scale-105"
                      >
                        <Github size={20} className="mr-2" />
                        View Code
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </TooltipProvider>
  );
};

export default Projects;
