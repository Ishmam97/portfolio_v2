
import React, { useEffect, useRef, useState } from 'react';
import { ExternalLink, Github } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { 
  SiReact, 
  SiNextdotjs, 
  SiHtml5, 
  SiCss3, 
  SiJavascript, 
  SiBootstrap,
  SiNodedotjs,
  SiMongodb,
  SiExpress,
  SiFirebase,
  SiGooglecloud,
  SiKotlin,
  SiAndroidstudio,
  SiGoogle,
  SiPython,
  SiStreamlit,
  SiLangchain,
  SiOpenai,
  SiSupabase,
  SiDocker
} from 'react-icons/si';

const projectsData = [
  {
    title: "Interviewer AI",
    description: "A mock technical interview platform using Retrieval-Augmented Generation. Upload your resume and job description to simulate personalized interview sessions.",
    imageUrl: "/assets/interviewer.png",
    technologies: ["Python", "Streamlit", "LangGraph", "LangSmith", "FAISS", "Docker", "Supabase", "OpenAI"],
    live: true,
    liveUrl: "https://interviewerai-ishmamdemo.streamlit.app/",
    githubUrl: "https://github.com/Ishmam97/Interviewer_AI",
    category: "AI Application"
  },
  {
    title: "UALR Graduate School Chatbot",
    description: "An AI-powered chatbot for the UALR Graduate Admissions Office, enabling prospective students to query program info and admissions details via natural language.",
    imageUrl: "/assets/ualr_chatbot.png",
    technologies: ["Python", "Streamlit", "LangChain", "FAISS", "RAG", "Docker", "Gemini", "Supabase", "LangSmith"],
    live: true,
    liveUrl: "https://ualrchatbot.streamlit.app/",
    githubUrl: "https://github.com/Ishmam97/ualr_chatbot",
    category: "AI Application"
  },
  {
    title: "Cosmos",
    description: "Cosmos research lab Website.",
    imageUrl: "/assets/cosmos.png",
    technologies: ["React", "Next.js", "HTML", "CSS", "JavaScript", "Bootstrap"],
    live: true,
    liveUrl: "https://cosmos.ualr.edu/",
    category: "Web Development"
  },
  {
    title: "UBlog",
    description: "A social media website I built for my undergraduate web development course.",
    imageUrl: "/assets/0a645fba-1880-452c-83b3-67b366b74464.gif",
    technologies: ["React", "Node.js", "MongoDB", "Express"],
    live: false,
    githubUrl: "https://github.com/Ishmam97/uBlog",
    category: "Full Stack"
  },
  {
    title: "Disinfectors Inc. Website",
    description: "A website I built for my failed disinfections service business that never took off.",
    imageUrl: "/assets/disinfectors.gif",
    technologies: ["HTML", "CSS", "JavaScript", "Bootstrap", "Firebase", "GCP"],
    live: false,
    githubUrl: "https://github.com/Ishmam97/Service_website",
    category: "Web Development"
  },
  {
    title: "Feedme",
    description: "A mobile food ordering and delivery app built using Kotlin and Android Studio.",
    imageUrl: "/assets/feedme.gif",
    technologies: ["Kotlin", "Android Studio"],
    live: false,
    githubUrl: "https://github.com/Ishmam97/FeedMee",
    category: "Mobile Development"
  }
];


// Technology icons mapping with React Icons and Tooltips
const technologyIcons = {
  "React": <Tooltip><TooltipTrigger><SiReact color="#61DAFB" size={20} /></TooltipTrigger><TooltipContent><p>React</p></TooltipContent></Tooltip>,
  "Next.js": <Tooltip><TooltipTrigger><SiNextdotjs color="white" size={20} /></TooltipTrigger><TooltipContent><p>Next.js</p></TooltipContent></Tooltip>,
  "HTML": <Tooltip><TooltipTrigger><SiHtml5 color="#E34F26" size={20} /></TooltipTrigger><TooltipContent><p>HTML5</p></TooltipContent></Tooltip>,
  "CSS": <Tooltip><TooltipTrigger><SiCss3 color="#1572B6" size={20} /></TooltipTrigger><TooltipContent><p>CSS3</p></TooltipContent></Tooltip>,
  "JavaScript": <Tooltip><TooltipTrigger><SiJavascript color="#F7DF1E" size={20} /></TooltipTrigger><TooltipContent><p>JavaScript</p></TooltipContent></Tooltip>,
  "Bootstrap": <Tooltip><TooltipTrigger><SiBootstrap color="#7952B3" size={20} /></TooltipTrigger><TooltipContent><p>Bootstrap</p></TooltipContent></Tooltip>,
  "Node.js": <Tooltip><TooltipTrigger><SiNodedotjs color="#339933" size={20} /></TooltipTrigger><TooltipContent><p>Node.js</p></TooltipContent></Tooltip>,
  "MongoDB": <Tooltip><TooltipTrigger><SiMongodb color="#47A248" size={20} /></TooltipTrigger><TooltipContent><p>MongoDB</p></TooltipContent></Tooltip>,
  "Express": <Tooltip><TooltipTrigger><SiExpress color="#339933" size={20} /></TooltipTrigger><TooltipContent><p>Express</p></TooltipContent></Tooltip>,
  "Firebase": <Tooltip><TooltipTrigger><SiFirebase color="#FFCA28" size={20} /></TooltipTrigger><TooltipContent><p>Firebase</p></TooltipContent></Tooltip>,
  "GCP": <Tooltip><TooltipTrigger><SiGooglecloud color="#4285F4" size={20} /></TooltipTrigger><TooltipContent><p>Google Cloud Platform</p></TooltipContent></Tooltip>,
  "Kotlin": <Tooltip><TooltipTrigger><SiKotlin color="#0095D5" size={20} /></TooltipTrigger><TooltipContent><p>Kotlin</p></TooltipContent></Tooltip>,
  "Android Studio": <Tooltip><TooltipTrigger><SiAndroidstudio color="#3DDC84" size={20} /></TooltipTrigger><TooltipContent><p>Android Studio</p></TooltipContent></Tooltip>,
  "Python": <Tooltip><TooltipTrigger><SiPython color="#3776AB" size={20} /></TooltipTrigger><TooltipContent><p>Python</p></TooltipContent></Tooltip>,
  "Streamlit": <Tooltip><TooltipTrigger><SiStreamlit color="#FF4E30" size={20} /></TooltipTrigger><TooltipContent><p>Streamlit</p></TooltipContent></Tooltip>,
  "LangChain": <Tooltip><TooltipTrigger><SiLangchain color="#4B9CD3" size={20} /></TooltipTrigger><TooltipContent><p>LangChain</p></TooltipContent></Tooltip>,
  "OpenAI": <Tooltip><TooltipTrigger><SiOpenai color="#412991" size={20} /></TooltipTrigger><TooltipContent><p>OpenAI</p></TooltipContent></Tooltip>,
  "Supabase": <Tooltip><TooltipTrigger><SiSupabase color="#3ECF8E" size={20} /></TooltipTrigger><TooltipContent><p>Supabase</p></TooltipContent></Tooltip>,
  "Docker": <Tooltip><TooltipTrigger><SiDocker color="#2496ED" size={20} /></TooltipTrigger><TooltipContent><p>Docker</p></TooltipContent></Tooltip>,
  "Gemini": <Tooltip><TooltipTrigger><SiGoogle color="#4285F4" size={20} /></TooltipTrigger><TooltipContent><p>Gemini (Google)</p></TooltipContent></Tooltip>,
  "FAISS": <Tooltip><TooltipTrigger><span className="text-lg">🧠</span></TooltipTrigger><TooltipContent><p>FAISS</p></TooltipContent></Tooltip>,
  "LangGraph": <Tooltip><TooltipTrigger><span className="text-lg">🔗</span></TooltipTrigger><TooltipContent><p>LangGraph</p></TooltipContent></Tooltip>,
  "LangSmith": <Tooltip><TooltipTrigger><span className="text-lg">🛠️</span></TooltipTrigger><TooltipContent><p>LangSmith</p></TooltipContent></Tooltip>
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
                } flex flex-col md:flex-row items-center gap-8 transition-all duration-700 w-[95%] md:w-full mx-auto ${
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
                  
                  {/* Technologies with React Icons */}
                  <div className="flex flex-wrap gap-3">
                    {project.technologies.map((tech, techIndex) => (
                      <div key={techIndex} className="flex items-center gap-2 px-3 py-2 bg-neon-purple/20 text-neon-purple border border-neon-purple rounded-full text-sm font-medium hover:bg-neon-purple/30 transition-colors">
                        {technologyIcons[tech] || <span className="text-lg">🔧</span>}
                        <span>{tech}</span>
                      </div>
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
