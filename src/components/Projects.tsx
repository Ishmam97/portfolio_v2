import React, { useEffect, useRef, useState } from 'react';
import { ExternalLink, Github, Sparkles } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import {
  SiAndroidstudio,
  SiBootstrap,
  SiCss3,
  SiDocker,
  SiExpress,
  SiFirebase,
  SiGoogle,
  SiGooglecloud,
  SiHtml5,
  SiJavascript,
  SiKotlin,
  SiLangchain,
  SiMongodb,
  SiNodedotjs,
  SiNextdotjs,
  SiOpenai,
  SiPython,
  SiReact,
  SiStreamlit,
  SiSupabase,
} from 'react-icons/si';

type Project = {
  title: string;
  description: string;
  imageUrl: string;
  technologies: string[];
  live: boolean;
  liveUrl?: string;
  liveLabel?: string;
  githubUrl?: string;
  category: string;
  featured?: boolean;
};

const projectsData: Project[] = [
  {
    title: 'Agentic Scaffold (Forge)',
    description:
      'A Claude Code-native scaffold for full-lifecycle software engineering with specialist agents, typed artifacts, parallel reviews, and a memory loop that compounds.',
    imageUrl: '/assets/preview_img.png',
    technologies: ['Claude Code', 'Multi-Agent', 'TypeScript', 'Prompt Engineering', 'Workflow Design'],
    live: true,
    liveUrl: '/forge',
    liveLabel: 'View Forge',
    githubUrl: 'https://github.com/Ishmam97/Forge',
    category: 'AI Engineering',
    featured: true,
  },
  {
    title: 'Interviewer AI',
    description:
      'A mock technical interview platform using Retrieval-Augmented Generation. Upload your resume and job description to simulate personalized interview sessions.',
    imageUrl: '/assets/interviewer.png',
    technologies: ['Python', 'Streamlit', 'LangGraph', 'LangSmith', 'FAISS', 'Docker', 'Supabase', 'OpenAI'],
    live: false,
    liveUrl: 'https://interviewerai-ishmamdemo.streamlit.app/',
    githubUrl: 'https://github.com/Ishmam97/Interviewer_AI',
    category: 'AI Application',
  },
  {
    title: 'UALR Graduate School Chatbot',
    description:
      'An AI-powered chatbot for UALR Graduate Admissions. Login: test@test.com / test1234 (Gemini API key required).',
    imageUrl: '/assets/ualr_chatbot.png',
    technologies: ['Python', 'React', 'LangChain', 'FAISS', 'RAG', 'Docker', 'Gemini', 'Supabase', 'LangSmith'],
    live: true,
    liveUrl: 'https://ishmam97.github.io/grad-guide-chat/',
    githubUrl: 'https://github.com/Ishmam97/ualr_chatbot',
    category: 'AI Application',
  },
  {
    title: 'Cosmos',
    description: 'Cosmos research lab website.',
    imageUrl: '/assets/cosmos.png',
    technologies: ['React', 'Next.js', 'HTML', 'CSS', 'JavaScript', 'Bootstrap'],
    live: true,
    liveUrl: 'https://cosmos.ualr.edu/',
    category: 'Web Development',
  },
  {
    title: 'UBlog',
    description: 'A social media website built for an undergraduate web development course.',
    imageUrl: '/assets/0a645fba-1880-452c-83b3-67b366b74464.gif',
    technologies: ['React', 'Node.js', 'MongoDB', 'Express'],
    live: false,
    githubUrl: 'https://github.com/Ishmam97/uBlog',
    category: 'Full Stack',
  },
  {
    title: 'Disinfectors Inc. Website',
    description: 'A service business website built with a lightweight frontend stack.',
    imageUrl: '/assets/disinfectors.gif',
    technologies: ['HTML', 'CSS', 'JavaScript', 'Bootstrap', 'Firebase', 'GCP'],
    live: false,
    githubUrl: 'https://github.com/Ishmam97/Service_website',
    category: 'Web Development',
  },
  {
    title: 'Feedme',
    description: 'A mobile food ordering and delivery app built using Kotlin and Android Studio.',
    imageUrl: '/assets/feedme.gif',
    technologies: ['Kotlin', 'Android Studio'],
    live: false,
    githubUrl: 'https://github.com/Ishmam97/FeedMee',
    category: 'Mobile Development',
  },
];

const technologyIcons: Record<string, React.ReactNode> = {
  React: <Tooltip><TooltipTrigger><SiReact color="#61DAFB" size={16} /></TooltipTrigger><TooltipContent><p>React</p></TooltipContent></Tooltip>,
  'Next.js': <Tooltip><TooltipTrigger><SiNextdotjs color="white" size={16} /></TooltipTrigger><TooltipContent><p>Next.js</p></TooltipContent></Tooltip>,
  HTML: <Tooltip><TooltipTrigger><SiHtml5 color="#E34F26" size={16} /></TooltipTrigger><TooltipContent><p>HTML5</p></TooltipContent></Tooltip>,
  CSS: <Tooltip><TooltipTrigger><SiCss3 color="#1572B6" size={16} /></TooltipTrigger><TooltipContent><p>CSS3</p></TooltipContent></Tooltip>,
  JavaScript: <Tooltip><TooltipTrigger><SiJavascript color="#F7DF1E" size={16} /></TooltipTrigger><TooltipContent><p>JavaScript</p></TooltipContent></Tooltip>,
  Bootstrap: <Tooltip><TooltipTrigger><SiBootstrap color="#7952B3" size={16} /></TooltipTrigger><TooltipContent><p>Bootstrap</p></TooltipContent></Tooltip>,
  'Node.js': <Tooltip><TooltipTrigger><SiNodedotjs color="#339933" size={16} /></TooltipTrigger><TooltipContent><p>Node.js</p></TooltipContent></Tooltip>,
  MongoDB: <Tooltip><TooltipTrigger><SiMongodb color="#47A248" size={16} /></TooltipTrigger><TooltipContent><p>MongoDB</p></TooltipContent></Tooltip>,
  Express: <Tooltip><TooltipTrigger><SiExpress color="#339933" size={16} /></TooltipTrigger><TooltipContent><p>Express</p></TooltipContent></Tooltip>,
  Firebase: <Tooltip><TooltipTrigger><SiFirebase color="#FFCA28" size={16} /></TooltipTrigger><TooltipContent><p>Firebase</p></TooltipContent></Tooltip>,
  GCP: <Tooltip><TooltipTrigger><SiGooglecloud color="#4285F4" size={16} /></TooltipTrigger><TooltipContent><p>Google Cloud Platform</p></TooltipContent></Tooltip>,
  Kotlin: <Tooltip><TooltipTrigger><SiKotlin color="#0095D5" size={16} /></TooltipTrigger><TooltipContent><p>Kotlin</p></TooltipContent></Tooltip>,
  'Android Studio': <Tooltip><TooltipTrigger><SiAndroidstudio color="#3DDC84" size={16} /></TooltipTrigger><TooltipContent><p>Android Studio</p></TooltipContent></Tooltip>,
  Python: <Tooltip><TooltipTrigger><SiPython color="#3776AB" size={16} /></TooltipTrigger><TooltipContent><p>Python</p></TooltipContent></Tooltip>,
  Streamlit: <Tooltip><TooltipTrigger><SiStreamlit color="#FF4E30" size={16} /></TooltipTrigger><TooltipContent><p>Streamlit</p></TooltipContent></Tooltip>,
  LangChain: <Tooltip><TooltipTrigger><SiLangchain color="#4B9CD3" size={16} /></TooltipTrigger><TooltipContent><p>LangChain</p></TooltipContent></Tooltip>,
  OpenAI: <Tooltip><TooltipTrigger><SiOpenai color="#412991" size={16} /></TooltipTrigger><TooltipContent><p>OpenAI</p></TooltipContent></Tooltip>,
  Supabase: <Tooltip><TooltipTrigger><SiSupabase color="#3ECF8E" size={16} /></TooltipTrigger><TooltipContent><p>Supabase</p></TooltipContent></Tooltip>,
  Docker: <Tooltip><TooltipTrigger><SiDocker color="#2496ED" size={16} /></TooltipTrigger><TooltipContent><p>Docker</p></TooltipContent></Tooltip>,
  Gemini: <Tooltip><TooltipTrigger><SiGoogle color="#4285F4" size={16} /></TooltipTrigger><TooltipContent><p>Gemini (Google)</p></TooltipContent></Tooltip>,
  FAISS: <Tooltip><TooltipTrigger><span className="text-sm">🧠</span></TooltipTrigger><TooltipContent><p>FAISS</p></TooltipContent></Tooltip>,
  LangGraph: <Tooltip><TooltipTrigger><span className="text-sm">🔗</span></TooltipTrigger><TooltipContent><p>LangGraph</p></TooltipContent></Tooltip>,
  LangSmith: <Tooltip><TooltipTrigger><span className="text-sm">🛠️</span></TooltipTrigger><TooltipContent><p>LangSmith</p></TooltipContent></Tooltip>,
};

const ProjectActions = ({ project }: { project: Project }) => (
  <div className="flex flex-wrap gap-3">
    {project.live && project.liveUrl && (
      <a
        href={project.liveUrl}
        target={project.liveUrl.startsWith('/') ? undefined : '_blank'}
        rel={project.liveUrl.startsWith('/') ? undefined : 'noopener noreferrer'}
        className="inline-flex items-center rounded-full bg-neon-yellow px-4 py-2 text-sm font-semibold text-cyber-dark transition-all duration-300 hover:scale-[1.02] hover:bg-neon-green"
      >
        <ExternalLink size={16} className="mr-2" />
        {project.liveLabel || 'View Live'}
      </a>
    )}
    {project.githubUrl && (
      <a
        href={project.githubUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center rounded-full border border-neon-green/80 px-4 py-2 text-sm font-semibold text-neon-green transition-all duration-300 hover:scale-[1.02] hover:bg-neon-green hover:text-cyber-dark"
      >
        <Github size={16} className="mr-2" />
        View Code
      </a>
    )}
  </div>
);

const Projects = () => {
  const [visibleProjects, setVisibleProjects] = useState<Set<number>>(new Set());
  const projectRefs = useRef<(HTMLArticleElement | null)[]>([]);
  const featuredProject = projectsData.find((project) => project.featured);
  const regularProjects = projectsData.filter((project) => !project.featured);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const index = parseInt((entry.target as HTMLElement).dataset.index || '0', 10);
          setVisibleProjects((prev) => new Set([...prev, index]));
        });
      },
      { threshold: 0.15, rootMargin: '20px' }
    );

    projectRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <TooltipProvider>
      <section id="projects" className="relative py-24 px-0 md:px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <p className="inline-flex items-center gap-2 rounded-full border border-neon-purple/60 bg-neon-purple/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-neon-purple">
              <Sparkles size={12} />
              Portfolio
            </p>
            <h2 className="mt-5 text-4xl md:text-5xl font-bold text-neon-yellow">Selected Projects</h2>
            <p className="mx-auto mt-5 max-w-3xl text-base md:text-lg text-neon-green/85">
              Production work across AI systems, full-stack products, and mobile applications.
            </p>
          </div>

          {featuredProject && (
            <article className="group mb-10 overflow-hidden rounded-2xl border border-neon-purple/60 bg-cyber-darker/75 shadow-[0_18px_50px_rgba(0,0,0,0.45)]">
              <div className="grid gap-0 lg:grid-cols-[1.2fr_1fr]">
                <div className="relative">
                  <img
                    src={featuredProject.imageUrl}
                    alt={featuredProject.title}
                    className="h-64 w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] md:h-80 lg:h-full"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-cyber-dark/60 via-transparent to-transparent" />
                </div>
                <div className="space-y-5 p-6 md:p-8">
                  <span className="inline-flex rounded-full border border-neon-green/60 bg-neon-green/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-neon-green">
                    Featured Project
                  </span>
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-neon-purple">
                      {featuredProject.category}
                    </p>
                    <h3 className="text-3xl font-bold text-neon-yellow">{featuredProject.title}</h3>
                    <p className="mt-3 text-base leading-relaxed text-gray-200">{featuredProject.description}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {featuredProject.technologies.map((tech) => (
                      <span
                        key={`${featuredProject.title}-${tech}`}
                        className="inline-flex items-center gap-2 rounded-full border border-neon-purple/60 bg-neon-purple/10 px-3 py-1.5 text-xs font-medium text-neon-purple"
                      >
                        {technologyIcons[tech] || <span className="text-sm">🔧</span>}
                        {tech}
                      </span>
                    ))}
                  </div>
                  <ProjectActions project={featuredProject} />
                </div>
              </div>
            </article>
          )}

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {regularProjects.map((project, index) => (
              <article
                key={project.title}
                ref={(el) => {
                  projectRefs.current[index] = el;
                }}
                data-index={index}
                className={`group flex h-full flex-col overflow-hidden rounded-2xl border border-neon-purple/50 bg-cyber-darker/75 transition-all duration-500 hover:border-neon-green/70 hover:shadow-[0_16px_34px_rgba(0,255,156,0.08)] ${
                  visibleProjects.has(index) ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                }`}
                style={{ transitionDelay: `${index * 70}ms` }}
              >
                <div className="relative overflow-hidden">
                  <img
                    src={project.imageUrl}
                    alt={project.title}
                    className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-cyber-dark/75 via-cyber-dark/10 to-transparent" />
                  <span className="absolute left-3 top-3 rounded-full border border-neon-purple/70 bg-cyber-dark/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-neon-purple">
                    {project.category}
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-xl font-bold text-neon-yellow">{project.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-200">{project.description}</p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {project.technologies.slice(0, 4).map((tech) => (
                      <span
                        key={`${project.title}-${tech}`}
                        className="inline-flex items-center gap-1.5 rounded-full border border-neon-green/40 bg-neon-green/10 px-2.5 py-1 text-[11px] text-neon-green"
                      >
                        {technologyIcons[tech] || <span className="text-[10px]">🔧</span>}
                        {tech}
                      </span>
                    ))}
                    {project.technologies.length > 4 && (
                      <span className="inline-flex items-center rounded-full border border-neon-green/40 bg-neon-green/10 px-2.5 py-1 text-[11px] text-neon-green">
                        +{project.technologies.length - 4}
                      </span>
                    )}
                  </div>

                  <div className="mt-5">
                    <ProjectActions project={project} />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </TooltipProvider>
  );
};

export default Projects;
