export type ExperienceItem = {
  id: string;
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate: string;
  logo: string;
  bullets: string[];
};

export const experienceData: ExperienceItem[] = [
  {
    id: 'researchbuddy',
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
    id: 'ualr-ai',
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
    id: 'atu-instructor',
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
    id: 'gainwell',
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
    id: 'cosmos-ra',
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
    id: 'ms-ualr',
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
    id: 'optimizely',
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
    id: 'bs-brac',
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
