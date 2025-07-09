import React, { useState, useEffect, useRef } from 'react';
import { Calendar, MapPin, ChevronRight } from 'lucide-react';

const experienceData = [
	{
		title: 'AI Solutions Architect',
		company: 'University of Arkansas Little Rock',
		startDate: '2025 May',
		endDate: 'Present',
		bullets: [
			'Designed and built a Graduate Assistant chatbot using Retrieval-Augmented Generation (RAG) to deliver context-aware responses over unstructured academic content.',
			'Developed a real-time data ingestion pipeline with Google Drive integration and Pinecone vector store to keep knowledge sources automatically up-to-date.',
			'Implemented advanced RAG techniques—multi-query retrieval, semantic query understanding, and optimized vectorization—for low-memory environments, boosting query throughput by 40%.',
			'Containerized microservices in Docker and orchestrated deployments with Kubernetes, ensuring high availability and easy scaling.',
			'Built a chat feedback tracking and analysis dashboard with React, TypeScript, and Shadcn UI, enabling data-driven improvements from user interactions.',
			'Technologies: Python, FastAPI, Langchain, Ollama, Google Gemini API, FAISS, Pinecone, Supabase, React, TypeScript, Shadcn',
		],
	},
	{
		title: 'CTO',
		company: 'Researchbuddy AI',
		startDate: '2025 Apr',
		endDate: 'Present',
		bullets: [
			'Developed a cross-platform mobile application with React Native and TypeScript, now serving 1,000+ active monthly users.',
			'Architected and deployed a scalable backend on GCP & Firebase, achieving 99.9% uptime and auto-scaling to meet demand spikes.',
			'Integrated Google Vertex AI and Gemini APIs to power virtual lab features—interactive experiment sims, AI-guided workflows, and real-time insights.',
			'Designed and built custom AI agents for deep-search, topic brainstorming, and paper summarization, reducing research time by 50%.',
			'Implemented analytics dashboards with Firebase Analytics & Google Data Studio to track user engagement and drive product roadmap decisions.',
			'Technologies: React Native, TypeScript, Firebase, Google Vertex AI, Google Gemini API, GCP',
		],
	},
	{
		title: 'Instructor',
		company: 'Arkansas Tech University',
		startDate: '2024 Sep',
		endDate: '2025 Apr',
		bullets: [
			'Delivered comprehensive lectures and hands-on training in Web and Mobile Application Development to a class of 30 students, focusing on the MERN stack (MongoDB, Express, React, Node.js), fostering full-stack development expertise.',
			'Taught Advanced Python Programming, emphasizing practical applications using Flask and Django frameworks, equipping students with skills for scalable and dynamic web application development.',
			'Conducted engaging sessions on Introduction to Networking, integrating foundational networking principles with real-world case studies to enhance conceptual understanding.',
			'Designed and organized a Student Computer Club Hackathon, attended by diverse student teams, resulting in innovative project solutions and increased interest in applied technology.',
			'Incorporated industry-relevant tools and methodologies, including Agile practices and version control (Git), to prepare students for real-world software development environments.',
		],
	},
	{
		title: 'Software Engineering Intern',
		company: 'Gainwell Technologies',
		startDate: '2023 Apr',
		endDate: '2023 Aug',
		bullets: [
			'Designed and implemented API caching and key management system using Redis, reducing the total usage cost by 30% and streamlining key distribution across services.',
			'Developed Gabby AI, a conversational agent built using PyTorch and Langchain, automating patient triage by analyzing symptoms, needs, and medical history to route calls to appropriate healthcare professionals.',
		],
	},
	{
		title: 'Research Assistant (Machine Learning)',
		company: 'COSMOS',
		startDate: '2022 Sep',
		endDate: '2024 May',
		bullets: [
			'Developed and deployed a YouTube content discovery bot using transformer models (BERT) and Google\'s Gemini model for automated narrative extraction from video transcripts. Implemented topic modeling algorithms to detect anomalous engagement, enhancing content moderation.',
			'Engineered and deployed AI-driven content moderation solutions using Kubernetes for scaling, improving detection of harmful content, and enhancing user safety on digital platforms.',
			'Led development initiatives that increased operational efficiency by 50% by introducing automated CI/CD pipelines and optimized data flow management across distributed systems.',
		],
	},
	{
		title: 'Master of Science in Computer Science',
		company: 'University of Arkansas, Little Rock',
		startDate: '2022 Aug',
		endDate: '2024 May',
		bullets: [
			'Key Courses: Advanced Software Engineering, Information Visualization, Analysis of Algorithms, Artificial Intelligence',
			'Solaiman, I., & Agarwal, N. (2024). Multiagent-based Youtube Content Discovery Bot. In Proceedings of the 2023 IEEE/ACM ASONAM \'23 (pp. 450–453).',
			'Solaiman, I., Agarwal, N., … (2024) Detecting and Characterizing Inorganic User Engagement on YouTube, In Proceedings of the 18th International AAAI Conference on Web and Social Media, CySoc 2024.',
		],
	},
	{
		title: 'Full Stack Software Engineer I',
		company: 'Optimizely',
		startDate: '2021 Jan',
		endDate: '2022 Jul',
		bullets: [
			'Reduced average weekly bugs by 50% by implementing automated testing and code reviews, performing root cause analysis on recurring issues, and refactoring legacy code.',
			'Led the full-cycle development of a GPT-3 powered Smart Content feature, integrating API-based content suggestions, optimized caching strategies, and performance monitoring, resulting in 600 daily active users over 6 months.',
			'Improved marketing workflow efficiency by 40% by implementing a Redis caching layer, optimizing database queries, and compressing data payloads, significantly reducing page load times.',
			'Increased code coverage to 90% on both backend and frontend by designing and implementing unit, integration, and end-to-end tests, ensuring high software reliability and maintainability.',
		],
	},
	{
		title: 'Bachelor of Science in Computer Science',
		company: 'Brac University',
		startDate: '2016 Sep',
		endDate: '2021 Apr',
		bullets: [
			'Data Structures, Algorithms, Software Engineering, Computer Architecture, System Analysis and Design, Web Development, Android Development, Artificial Intelligence, Neural Networks, Natural Language Processing',
			'Statistics, Calculus, Complex Variables and Laplace Transformations, Discrete Mathematics',
			'Solaiman, I. (2022). X-Ray Classification to Detect COVID-19 Using Ensemble Model. In Proceedings of the 14th International Conference on Agents and Artificial Intelligence - Volume 2.',
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
					const index = parseInt(entry.target.getAttribute('data-index') || '0');
					if (entry.isIntersecting) {
						setVisibleItems((prev) => new Set([...prev, index]));
					}
				});
			},
			{
				threshold: 0.2,
				rootMargin: '-50px 0px',
			}
		);

		itemRefs.current.forEach((ref) => {
			if (ref) observer.observe(ref);
		});

		return () => observer.disconnect();
	}, []);

	return (
		<section id="journey" className="py-20 px-4">
			<div className="container mx-auto max-w-6xl">
				<h2 className="text-4xl md:text-5xl font-bold text-center text-neon-yellow mb-16 animate-fade-in-up">
					My Journey
				</h2>

				<div className="relative">
					{/* Timeline Line - centered for mobile, left-positioned for desktop */}
					<div className="absolute left-1/2 md:left-4 lg:left-1/2 top-0 bottom-0 w-0.5 bg-neon-green transform -translate-x-px md:translate-x-0 lg:-translate-x-px"></div>

					{experienceData.map((item, index) => (
						<div
							key={index}
							ref={(el) => {
								itemRefs.current[index] = el;
							}}
							data-index={index}
							className={`relative mb-12 md:mb-16 transition-all duration-700 ${
								visibleItems.has(index)
									? 'opacity-100 translate-y-0'
									: 'opacity-0 translate-y-10'
							}`}
							style={{ transitionDelay: `${index * 100}ms` }}
						>
							{/* Timeline Dot - centered for mobile */}
							<div
								className={`absolute left-1/2 md:left-2 lg:left-1/2 w-4 h-4 bg-neon-purple rounded-full border-2 border-neon-green transform -translate-x-2 md:translate-x-0 lg:-translate-x-2 z-10 transition-all duration-500 ${
									visibleItems.has(index) ? 'animate-glow-pulse scale-100' : 'scale-75'
								}`}
							>
								{/* Year label below dot, alternating left/right */}
                <span
                  className={`absolute top-full mt-1 text-base md:text-md text-neon-yellow font-bold whitespace-nowrap select-none pointer-events-none
                    ${index % 2 === 0
                      ? 'left-auto right-full -translate-x-2 md:-translate-x-4 text-right'
                      : 'left-full right-auto translate-x-2 md:translate-x-4 text-left'
                    }`}
                  style={{ minWidth: '2.5rem' }}
                >
                  {item.startDate}
                </span>
							</div>

							{/* Content - centered for mobile, alternating for desktop */}
							<div
								className={`relative z-20 w-[90%] mx-auto md:w-full md:mx-0 md:ml-12 lg:ml-0 lg:w-5/12 ${
									index % 2 === 0 ? 'lg:ml-auto lg:pl-8' : 'lg:pr-8'
								}`}
							>
								<div className="section-container">
									<div className="flex items-center justify-between mb-4">
										<div className="flex items-center text-neon-pink text-sm">
											<Calendar size={16} className="mr-2" />
											{item.startDate} - {item.endDate}
										</div>
									</div>

									<h3 className="text-2xl font-bold text-neon-yellow mb-2">{item.title}</h3>

									<div className="flex items-center text-neon-green mb-4">
										<MapPin size={16} className="mr-2" />
										{item.company}
									</div>

									<ul className="space-y-3">
										{item.bullets.map((bullet, bulletIndex) => (
											<li
												key={bulletIndex}
												className="flex items-start text-gray-300 text-sm leading-relaxed"
											>
												<ChevronRight size={16} className="text-neon-purple mr-2 mt-0.5 flex-shrink-0" />
												<span>{bullet}</span>
											</li>
										))}
									</ul>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
};

export default Journey;
