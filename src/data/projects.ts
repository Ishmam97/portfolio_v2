export type Project = {
  id: string;
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

export const projectsData: Project[] = [
  {
    id: 'forge',
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
    id: 'interviewer-ai',
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
    id: 'ualr-chatbot',
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
    id: 'cosmos',
    title: 'Cosmos',
    description: 'Cosmos research lab website.',
    imageUrl: '/assets/cosmos.png',
    technologies: ['React', 'Next.js', 'HTML', 'CSS', 'JavaScript', 'Bootstrap'],
    live: true,
    liveUrl: 'https://cosmos.ualr.edu/',
    category: 'Web Development',
  },
  {
    id: 'ublog',
    title: 'UBlog',
    description: 'A social media website built for an undergraduate web development course.',
    imageUrl: '/assets/0a645fba-1880-452c-83b3-67b366b74464.gif',
    technologies: ['React', 'Node.js', 'MongoDB', 'Express'],
    live: false,
    githubUrl: 'https://github.com/Ishmam97/uBlog',
    category: 'Full Stack',
  },
  {
    id: 'disinfectors',
    title: 'Disinfectors Inc. Website',
    description: 'A service business website built with a lightweight frontend stack.',
    imageUrl: '/assets/disinfectors.gif',
    technologies: ['HTML', 'CSS', 'JavaScript', 'Bootstrap', 'Firebase', 'GCP'],
    live: false,
    githubUrl: 'https://github.com/Ishmam97/Service_website',
    category: 'Web Development',
  },
  {
    id: 'feedme',
    title: 'Feedme',
    description: 'A mobile food ordering and delivery app built using Kotlin and Android Studio.',
    imageUrl: '/assets/feedme.gif',
    technologies: ['Kotlin', 'Android Studio'],
    live: false,
    githubUrl: 'https://github.com/Ishmam97/FeedMee',
    category: 'Mobile Development',
  },
];
