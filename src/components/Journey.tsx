import React, { useEffect, useRef, useState } from 'react';
import { ChevronRight, MapPin, Sparkles } from 'lucide-react';

type ExperienceItem = {
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate: string;
  logo: string;
  bullets: string[];
};

const experienceData: ExperienceItem[] = [
  {
    title: 'Founding CTO & Lead Software Engineer',
    company: 'ResearchBuddy AI (Startup)',
    location: 'Remote',
    startDate: '2025 Feb',
    endDate: 'Present',
    logo: '/assets/rbai.png',
    bullets: [
      'Lead a team of 5 engineers building a cross-platform research collaboration product (React Native web + Android) serving 2,000+ active users at 100% uptime and sub-50ms data-load latency.',
      "Designed per-lab researcher-agent chatbots with context engineering tailored to each lab's documents, objectives, and research direction; owned prompt design and auditing across deployments.",
      'Built a custom RAG pipeline with citation grounding, sharply reducing hallucinated and unsupported claims.',
      'Engineered a batch paper-summarization processor for high-throughput inference over large research corpora.',
      'Evaluated and integrated Gemini, OpenAI, and open-source DeepSeek/Qwen models based on cost, latency, accuracy, and language support; used Pinecone as vector store.',
      'Deployed on GCP/Firebase with Firebase Analytics and Crashlytics; implemented GitHub Actions CI/CD with automated tests and Maestro Android E2E testing.',
      'Expanded product capabilities with agent-based deep-search, topic brainstorming, and research summarization workflows.',
    ],
  },
  {
    title: 'AI Solutions Engineer (Graduate Assistant)',
    company: 'University of Arkansas at Little Rock',
    location: 'Little Rock, AR',
    startDate: '2025 May',
    endDate: 'Present',
    logo: '/assets/ualr.svg',
    bullets: [
      'Led end-to-end development of the UALR Graduate School RAG chatbot using Python, FastAPI, React, LangGraph/LangChain, Pinecone, and Gemini.',
      'Improved answer quality with multi-query retrieval and reranking, and added analytics dashboards for quality tracing and hallucination monitoring.',
      'Achieved approximately 40% throughput gain through retrieval and system optimization.',
      'Containerized services with Docker and Kubernetes for scalable deployment.',
      'Organized the Coding for Wellness AI hackathon and delivered a practical AI tooling workshop to about 40 students.',
      'Built ingestion and observability workflows to keep academic data fresh and chatbot behavior measurable.',
    ],
  },
  {
    title: 'Instructor',
    company: 'Arkansas Tech University',
    startDate: '2024 Sep',
    endDate: '2025 Apr',
    logo: '/assets/ATU_LOGO__OUTLINE_GR-YW_VERT.svg',
    bullets: [
      'Delivered lectures and labs in web and mobile development for 30 students with a MERN-stack focus.',
      'Taught advanced Python using Flask and Django for practical application development.',
      'Designed and organized a Student Computer Club Hackathon with multi-team participation.',
      'Embedded Agile and Git practices to align coursework with real software engineering workflows.',
    ],
  },
  {
    title: 'Software Engineering Intern',
    company: 'Gainwell Technologies',
    startDate: '2023 Apr',
    endDate: '2023 Aug',
    logo: '/assets/gw.svg',
    bullets: [
      'Implemented Redis-based API caching and key management, reducing costs by roughly 30%.',
      'Developed Gabby AI with PyTorch and LangChain to automate symptom-aware patient triage routing.',
    ],
  },
  {
    title: 'Research Assistant (Machine Learning)',
    company: 'COSMOS',
    startDate: '2022 Sep',
    endDate: '2024 May',
    logo: '/assets/ualr.svg',
    bullets: [
      'Built a YouTube content discovery bot using BERT and Gemini for transcript narrative extraction.',
      'Implemented topic and anomaly modeling for inorganic engagement detection and moderation signals.',
      'Scaled AI moderation services with Kubernetes and improved operational efficiency through automation.',
    ],
  },
  {
    title: 'Master of Science in Computer Science',
    company: 'University of Arkansas at Little Rock',
    startDate: '2022 Aug',
    endDate: '2024 May',
    logo: '/assets/ualr.svg',
    bullets: [
      'Focused on advanced software engineering, information visualization, algorithms, and AI.',
      'Published work at ASONAM and ICWSM/CySoc on multi-agent and inorganic engagement analysis.',
    ],
  },
  {
    title: 'Full Stack Software Engineer I',
    company: 'Optimizely',
    startDate: '2021 Jan',
    endDate: '2022 Jul',
    logo: '/assets/optimizely.png',
    bullets: [
      'Reduced weekly bug volume by around 50% through stronger testing and code-review rigor.',
      'Led GPT-3 Smart Content feature delivery, reaching approximately 600 daily active users over six months.',
      'Improved workflow efficiency by around 40% through caching and data-path optimizations.',
      'Increased frontend/backend coverage to about 90% with unit, integration, and E2E tests.',
    ],
  },
  {
    title: 'Bachelor of Science in Computer Science',
    company: 'Brac University',
    startDate: '2016 Sep',
    endDate: '2021 Apr',
    logo: '/assets/brac.png',
    bullets: [
      'Studied algorithms, software engineering, systems, AI/NLP, and applied mathematics.',
      'Published work on COVID-19 X-ray classification using ensemble methods.',
    ],
  },
];

const Journey = () => {
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = parseInt(entry.target.getAttribute('data-index') || '0', 10);
          if (entry.isIntersecting) {
            setVisibleItems((prev) => new Set([...prev, index]));
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -80px 0px' }
    );

    itemRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section id="journey" className="relative py-24 px-0 md:px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-14 text-center">
          <p className="mx-auto mb-4 flex w-fit items-center gap-2 rounded-full border border-neon-yellow/70 bg-cyber-darker/85 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-neon-yellow shadow-[0_0_12px_rgba(223,255,61,0.25)]">
            <Sparkles size={12} />
            Experience
          </p>
          <h2 className="inline-block rounded-lg bg-cyber-dark/65 px-2.5 py-1.5 text-4xl md:text-5xl font-bold text-neon-yellow">Career Journey</h2>
          <p className="mx-auto mt-5 max-w-3xl rounded-xl bg-cyber-dark/90 px-4 py-3 text-base md:text-lg text-neon-green">
            A progression from software engineering fundamentals to AI-native product leadership and
            agentic system design.
          </p>
        </div>

        <div className="relative">
          <div className="pointer-events-none absolute bottom-0 left-4 top-0 z-20 w-px bg-gradient-to-b from-neon-purple via-neon-green/80 to-neon-purple/30 md:left-6" />
          <div className="space-y-8">
            {experienceData.map((item, index) => (
              <div
                key={`${item.title}-${item.startDate}`}
                ref={(el) => {
                  itemRefs.current[index] = el;
                }}
                data-index={index}
                className={`relative z-10 rounded-2xl border border-neon-purple/45 bg-cyber-darker/90 p-5 pl-10 transition-all duration-700 md:p-6 md:pl-12 ${
                  visibleItems.has(index) ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                }`}
                style={{ transitionDelay: `${index * 70}ms` }}
              >
                <div className="timeline-node absolute left-[13px] top-10 h-3 w-3 rounded-full border border-neon-green bg-neon-purple md:left-[21px]" />
              <article className="relative pr-24">
                <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.11em] text-neon-purple">
                  <span className="rounded-full border border-neon-purple/55 bg-neon-purple/10 px-2.5 py-1">
                    {item.startDate}
                  </span>
                  <span className="text-neon-green/70">to</span>
                  <span className="rounded-full border border-neon-green/55 bg-neon-green/10 px-2.5 py-1 text-neon-green">
                    {item.endDate}
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-neon-yellow">{item.title}</h3>
                <div className="mt-2 mb-4 flex flex-wrap items-center gap-2 text-sm text-neon-green">
                  <MapPin size={16} />
                  <span>{item.company}</span>
                  {item.location && <span className="text-neon-green/75">· {item.location}</span>}
                </div>

                <ul className="space-y-2.5">
                  {item.bullets.map((bullet, bulletIndex) => (
                    <li
                      key={`${item.title}-bullet-${bulletIndex}`}
                      className="flex items-start text-sm leading-relaxed text-gray-200"
                    >
                      <ChevronRight size={16} className="mr-2 mt-0.5 shrink-0 text-neon-purple" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>

                <div
                  className={`absolute top-4 right-4 grid h-20 w-20 place-items-center overflow-hidden rounded-md border p-2 ${
                    item.company.includes('Gainwell')
                      ? 'border-white/20 bg-black'
                      : 'border-white/70 bg-white'
                  }`}
                >
                  <img src={item.logo} alt={`${item.company} logo`} className="h-14 w-14 object-contain" />
                </div>
              </article>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Journey;
