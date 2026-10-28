import React, { useState } from 'react';
import {
  ArrowRight,
  Sparkles,
  CheckCircle2,
  FileText,
  Search,
  ExternalLink,
  ChevronRight,
  Play,
  Scissors,
  UserCheck,
  FileCheck,
  BarChart3,
  Network,
  Users,
  Compass,
  Layers,
  ShieldCheck,
  Award,
  Clock,
  Briefcase,
  Check,
  MapPin,
  Flame
} from 'lucide-react';

interface LandingPageProps {
  onStartScreening: () => void;
}

interface DemoCandidate {
  id: string;
  name: string;
  avatar: string;
  role: string;
  exp: string;
  location: string;
  score: number;
  skills: { name: string; score: number; color?: string }[];
  evidence: { req: string; excerpt: string; confidence: string }[];
  experience: { company: string; role: string; period: string; desc: string }[];
}

interface DemoRole {
  id: string;
  title: string;
  countText: string;
  candidates: DemoCandidate[];
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartScreening }) => {
  // Live Demo state
  const [selectedRoleId, setSelectedRoleId] = useState<string>('swe');
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>('c1');
  const [activeTab, setActiveTab] = useState<'skills' | 'evidence' | 'experience'>('skills');

  const demoRoles: DemoRole[] = [
    {
      id: 'swe',
      title: 'Software Engineer',
      countText: '3 candidates matched • Based on 5 key requirements',
      candidates: [
        {
          id: 'c1',
          name: 'Nitharshana P S',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
          role: 'Software Developer (AI & ML)',
          exp: 'B.Tech AI & ML (CGPA 8.8)',
          location: 'Coimbatore, India',
          score: 96,
          skills: [
            { name: 'Python', score: 95, color: '#4C5BFF' },
            { name: 'React', score: 92, color: '#4C5BFF' },
            { name: 'Artificial Intelligence', score: 94, color: '#10B981' },
            { name: 'SQL & Database', score: 88, color: '#06B6D4' },
            { name: 'Machine Learning', score: 90, color: '#8B5CF6' },
          ],
          evidence: [
            {
              req: 'AI ICU Intelligence (ATRIVA)',
              excerpt: 'Developed an AI-driven ICU crisis intelligence system for real-time patient monitoring (ECG, vital signs) with predictive models and federated learning.',
              confidence: 'High (Verified Project)',
            },
            {
              req: 'Full-Stack CampusSync',
              excerpt: 'Designed and developed full-stack campus management system with React frontend, role-based auth, and QR attendance.',
              confidence: 'High (Source Code Verified)',
            },
            {
              req: 'Environmental AI (RAIN)',
              excerpt: 'Created AI-based environmental monitoring system with rainfall prediction and climate analysis models.',
              confidence: 'High (Verified)',
            },
          ],
          experience: [
            {
              company: 'Karunya Institute of Technology & Sciences',
              role: 'B.Tech Computer Science (AI & ML) — CGPA 8.8',
              period: '2025 – 2029 (Expected)',
              desc: 'Specializing in Artificial Intelligence, predictive modeling, federated learning, and full-stack software development.',
            },
            {
              company: 'College Projects & Hackathons',
              role: 'Lead AI & Full-Stack Developer',
              period: '2025 – Present',
              desc: 'Engineered 5 production-grade solutions: ATRIVA (ICU AI), Auriva (Accessibility), ARGUS (Anomaly Analytics), RAIN (Climate AI), and CampusSync.',
            },
          ],
        },
        {
          id: 'c2',
          name: 'Rohan Mehta',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256',
          role: 'Data Analyst / SWE',
          exp: '1.5 Yrs Exp',
          location: 'Chennai, India',
          score: 84,
          skills: [
            { name: 'Python', score: 90, color: '#4C5BFF' },
            { name: 'Pandas', score: 86, color: '#4C5BFF' },
            { name: 'Excel', score: 88, color: '#4C5BFF' },
            { name: 'SQL', score: 80, color: '#A98BFF' },
            { name: 'Communication', score: 75, color: '#FF8199' },
          ],
          evidence: [
            {
              req: 'Python Scripting & Automation',
              excerpt: 'Automated weekly ETL workflows in Python saving 15 manual engineering hours per sprint.',
              confidence: 'High (Verified)',
            },
            {
              req: 'SQL Data Extraction',
              excerpt: 'Queried multi-terabyte data warehouses for user conversion funnels.',
              confidence: 'Medium (Verified in coursework & internship)',
            },
          ],
          experience: [
            {
              company: 'DataMetrics India',
              role: 'Associate Analytics Developer',
              period: '2023 – Present',
              desc: 'Automated data pipelines and built interactive KPI dashboards for operations.',
            },
          ],
        },
        {
          id: 'c3',
          name: 'Sneha Patel',
          avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=256',
          role: 'Backend Developer',
          exp: '3 Yrs Exp',
          location: 'Hyderabad, India',
          score: 78,
          skills: [
            { name: 'Java', score: 92, color: '#4C5BFF' },
            { name: 'Spring Boot', score: 85, color: '#4C5BFF' },
            { name: 'SQL', score: 84, color: '#4C5BFF' },
            { name: 'Docker', score: 72, color: '#FF8199' },
            { name: 'Communication', score: 70, color: '#A98BFF' },
          ],
          evidence: [
            {
              req: 'Backend API Development',
              excerpt: 'Engineered REST endpoints using Java and Spring Boot for banking ledger transactions.',
              confidence: 'High (Verified)',
            },
            {
              req: 'Database Schema Design',
              excerpt: 'Normalized transaction tables in Oracle & PostgreSQL with strict foreign key constraints.',
              confidence: 'High (Verified)',
            },
          ],
          experience: [
            {
              company: 'FinEdge Solutions',
              role: 'Backend Java Developer',
              period: '2021 – Present',
              desc: 'Maintained core banking service modules and optimized batch ledger processing.',
            },
          ],
        },
      ],
    },
    {
      id: 'da',
      title: 'Data Analyst',
      countText: '3 candidates matched • Based on 4 key requirements',
      candidates: [
        {
          id: 'c2_da',
          name: 'Rohan Mehta',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256',
          role: 'Lead Data Analyst',
          exp: '2.5 Yrs Exp',
          location: 'Chennai, India',
          score: 92,
          skills: [
            { name: 'Python', score: 94, color: '#4C5BFF' },
            { name: 'Pandas', score: 95, color: '#4C5BFF' },
            { name: 'SQL', score: 90, color: '#4C5BFF' },
            { name: 'Tableau', score: 85, color: '#FF8199' },
            { name: 'Statistics', score: 88, color: '#A98BFF' },
          ],
          evidence: [
            {
              req: 'Statistical Data Modeling',
              excerpt: 'Developed regression and churn prediction models in Python and Scikit-learn with 89% accuracy.',
              confidence: 'High (Verified)',
            },
          ],
          experience: [
            {
              company: 'DataMetrics India',
              role: 'Data Analyst',
              period: '2022 – Present',
              desc: 'Led quantitative customer churn analysis and SQL warehouse migrations.',
            },
          ],
        },
        {
          id: 'c1_da',
          name: 'Priya Sharma',
          avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256',
          role: 'Quantitative Analyst',
          exp: '2 Yrs Exp',
          location: 'Bangalore, India',
          score: 86,
          skills: [
            { name: 'Python', score: 95, color: '#4C5BFF' },
            { name: 'SQL', score: 88, color: '#4C5BFF' },
            { name: 'PowerBI', score: 78, color: '#4C5BFF' },
            { name: 'Statistics', score: 82, color: '#A98BFF' },
          ],
          evidence: [
            {
              req: 'SQL & Analytics',
              excerpt: 'Extracted telemetry data and built automated reporting pipelines in PostgreSQL.',
              confidence: 'High (Verified)',
            },
          ],
          experience: [
            {
              company: 'Nexus Tech Systems',
              role: 'Software & Data Analyst',
              period: '2023 – Present',
              desc: 'Supported business metrics extraction and backend query optimization.',
            },
          ],
        },
      ],
    },
    {
      id: 'ml',
      title: 'ML Engineer',
      countText: '3 candidates matched • Based on 5 key requirements',
      candidates: [
        {
          id: 'c1_ml',
          name: 'Priya Sharma',
          avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256',
          role: 'ML Systems Engineer',
          exp: '2 Yrs Exp',
          location: 'Bangalore, India',
          score: 94,
          skills: [
            { name: 'Python', score: 96, color: '#4C5BFF' },
            { name: 'PyTorch', score: 90, color: '#4C5BFF' },
            { name: 'Scikit-Learn', score: 92, color: '#4C5BFF' },
            { name: 'FastAPI', score: 88, color: '#FF8199' },
            { name: 'MLOps', score: 80, color: '#A98BFF' },
          ],
          evidence: [
            {
              req: 'Machine Learning Pipelines',
              excerpt: 'Trained and deployed PyTorch transformer models for text classification with latency < 50ms.',
              confidence: 'High (Verified)',
            },
          ],
          experience: [
            {
              company: 'Nexus Tech Systems',
              role: 'Machine Learning Engineer',
              period: '2023 – Present',
              desc: 'Built embedding retrieval and vector matching pipelines using PyTorch.',
            },
          ],
        },
      ],
    },
    {
      id: 'fe',
      title: 'Frontend Developer',
      countText: '3 candidates matched • Based on 4 key requirements',
      candidates: [
        {
          id: 'c1_fe',
          name: 'Priya Sharma',
          avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256',
          role: 'Frontend UI/UX Engineer',
          exp: '2 Yrs Exp',
          location: 'Bangalore, India',
          score: 95,
          skills: [
            { name: 'React', score: 96, color: '#4C5BFF' },
            { name: 'TypeScript', score: 90, color: '#4C5BFF' },
            { name: 'Tailwind CSS', score: 94, color: '#4C5BFF' },
            { name: 'Next.js', score: 86, color: '#FF8199' },
          ],
          evidence: [
            {
              req: 'Modern React Architecture',
              excerpt: 'Built accessible, responsive interfaces using React hooks, Tailwind CSS, and strict TypeScript types.',
              confidence: 'High (Verified)',
            },
          ],
          experience: [
            {
              company: 'Nexus Tech Systems',
              role: 'Frontend UI Engineer',
              period: '2023 – Present',
              desc: 'Spearheaded design system implementation across 14 enterprise modules.',
            },
          ],
        },
      ],
    },
  ];

  const currentRole = demoRoles.find((r) => r.id === selectedRoleId) || demoRoles[0];
  const currentCandidate =
    currentRole.candidates.find((c) => c.id === selectedCandidateId) || currentRole.candidates[0];

  return (
    <div className="min-h-screen bg-[#FAF8F3] text-navy-900 font-sans relative overflow-hidden">
      {/* Decorative Pastel Ambient Gradients */}
      <div className="absolute top-0 right-0 w-[600px] h-[550px] bg-gradient-to-bl from-pastel-pink/60 via-pastel-lavender/50 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-48 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-pastel-sky/50 via-pastel-yellow/40 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-10 w-[700px] h-[600px] bg-gradient-to-tl from-pastel-lavender/60 via-pastel-pink/40 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

      {/* 1. ELEGANT PERIWINKLE NAVIGATION BAR (Color from 2nd Image) */}
      <nav className="w-full bg-[#5661F6] sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-3.5 sm:py-4 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center space-x-2.5 cursor-pointer" onClick={onStartScreening}>
            <div className="text-white">
              <Sparkles className="w-6 h-6 fill-white text-white drop-shadow-sm" />
            </div>
            <span className="font-serif text-2xl font-bold tracking-tight text-white drop-shadow-xs">
              TalentLens AI
            </span>
          </div>

          {/* Links */}
          <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-white/90">
            <a href="#product" className="hover:text-white transition-colors">
              Product
            </a>
            <a href="#how-it-works" className="hover:text-white transition-colors">
              How It Works
            </a>
            <a href="#features" className="hover:text-white transition-colors">
              Features
            </a>
            <a href="#about" className="hover:text-white transition-colors">
              About
            </a>
          </div>

          {/* Right CTA */}
          <div className="flex items-center space-x-5">
            <button
              onClick={onStartScreening}
              className="text-sm font-medium text-white/90 hover:text-white transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={onStartScreening}
              className="inline-flex items-center space-x-1.5 bg-white hover:bg-slate-50 text-[#5661F6] text-xs font-bold px-5 py-2.5 rounded-full shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <section className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-8 pb-16 lg:pt-14 lg:pb-24 overflow-hidden lg:overflow-visible">
        {/* Subtle Geometric Dot Grid Pattern from Master Reference */}
        <div className="absolute inset-0 pointer-events-none opacity-30 -z-10">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="hero-dot-grid" width="28" height="28" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.2" fill="#5661F6" fillOpacity="0.3" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hero-dot-grid)" />
          </svg>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Hero Column */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-block text-[11px] font-bold uppercase tracking-widest text-[#5661F6] font-sans">
              AI-POWERED RECRUITMENT INTELLIGENCE
            </div>

            <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold text-navy-900 leading-[1.08] tracking-tight">
              The right talent.
              <br />
              <span className="italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-[#5661F6] via-[#7056E8] to-pastel-violet">
                A clearer perspective.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-xl font-normal leading-relaxed pt-1">
              Turn hundreds of resumes into a shortlist you can understand. Discover relevant
              skills, explore candidate evidence, and make more informed hiring decisions.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onStartScreening}
                className="inline-flex items-center space-x-2 bg-[#5661F6] hover:bg-[#4853EB] text-white text-sm font-semibold px-7 py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
              >
                <span>Start Screening</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  const elem = document.getElementById('try-it-live');
                  elem?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center space-x-2 bg-white hover:bg-slate-50 text-navy-900 text-sm font-semibold px-6 py-3.5 rounded-xl border border-slate-200/90 shadow-sm transition-all duration-200 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-navy-900" />
                <span>Watch Demo</span>
              </button>
            </div>

            {/* 4 Trust & Benefit Badges */}
            <div className="pt-6 border-t border-slate-200/80 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-medium text-slate-700">
              <div className="flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-[#5661F6]" />
                <span>Smart Matching</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Scissors className="w-4 h-4 text-[#A98BFF]" />
                <span>Skill Analysis</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <FileCheck className="w-4 h-4 text-[#FF8199]" />
                <span>Evidence Based</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <UserCheck className="w-4 h-4 text-[#5661F6]" />
                <span>Human in Control</span>
              </div>
            </div>
          </div>

          {/* Right Hero Column — Asymmetrical Layered Cards with Geometric Facet Prism Backdrop */}
          <div className="lg:col-span-6 relative flex justify-center lg:justify-end min-h-[460px] select-none">
            {/* Master Reference Pattern: Translucent Geometric Facets / Prism Shards */}
            <div className="absolute -inset-4 sm:-inset-10 pointer-events-none -z-0 overflow-visible flex items-center justify-center">
              <svg
                viewBox="0 0 540 460"
                className="w-full h-full max-w-[580px] opacity-85 drop-shadow-xs"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Sky Blue Translucent Facet Shard */}
                <polygon
                  points="30,70 270,20 330,190 110,240"
                  fill="#DCEEFF"
                  fillOpacity="0.75"
                  stroke="#BADEFD"
                  strokeWidth="1.5"
                />
                {/* Soft Pink Translucent Facet Shard */}
                <polygon
                  points="250,30 490,60 430,290 200,230"
                  fill="#FFDDE9"
                  fillOpacity="0.70"
                  stroke="#FFBDD2"
                  strokeWidth="1.5"
                />
                {/* Soft Lavender Translucent Facet Shard */}
                <polygon
                  points="310,160 530,220 470,440 250,370"
                  fill="#E9E1FF"
                  fillOpacity="0.75"
                  stroke="#D3C1FE"
                  strokeWidth="1.5"
                />
                {/* Pale Yellow / Golden Amber Translucent Facet Shard */}
                <polygon
                  points="50,200 240,160 290,400 80,370"
                  fill="#FFE9A8"
                  fillOpacity="0.65"
                  stroke="#FDE08A"
                  strokeWidth="1.5"
                />
                {/* Mint Ice Facet Shard */}
                <polygon
                  points="150,310 390,260 360,460 120,430"
                  fill="#D9F5E8"
                  fillOpacity="0.55"
                  stroke="#B4EBD0"
                  strokeWidth="1.5"
                />
                {/* Geometric Refraction Connector Lines */}
                <line x1="270" y1="20" x2="310" y2="160" stroke="#5661F6" strokeOpacity="0.25" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="110" y1="240" x2="250" y2="370" stroke="#5661F6" strokeOpacity="0.2" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="430" y1="290" x2="360" y2="460" stroke="#FF8199" strokeOpacity="0.25" strokeWidth="1" strokeDasharray="3 3" />
              </svg>
            </div>

            {/* Cute handwritten annotation */}
            <div className="absolute -top-3 left-4 sm:left-6 z-20 hidden sm:block text-violet-700 font-serif italic text-sm tracking-wide">
              <span>Better</span>
              <br />
              <span className="ml-1">matches.</span>
              <br />
              <span className="ml-2 font-bold">Faster.</span>
              <div className="w-8 h-8 border-b-2 border-r-2 border-violet-500 rounded-br-full rotate-45 ml-6 -mt-1 opacity-70"></div>
            </div>

            {/* Decorative Sparkle Stars */}
            <div className="absolute top-0 right-12 text-[#FF8199] text-xl animate-pulse">✦</div>
            <div className="absolute top-28 right-0 text-[#FFE9A8] text-sm animate-pulse-slow">✦</div>
            <div className="absolute bottom-6 right-2 text-[#5661F6] text-lg animate-pulse-slow">✦</div>
            <div className="absolute bottom-16 left-2 text-[#A98BFF] text-base animate-pulse">✦</div>

            {/* Card 2 (Layered behind to the left): Rohan Mehta */}
            <div className="absolute top-10 left-4 sm:left-12 w-64 bg-white/95 rounded-2xl p-4 shadow-md border border-slate-100 transform -rotate-6 transition-transform hover:-rotate-3 duration-300">
              <div className="flex items-center justify-between">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120"
                  alt="Rohan Mehta"
                  className="w-10 h-10 rounded-full object-cover border border-slate-200"
                />
                <div className="w-10 h-10 rounded-full border-2 border-indigo-200 flex flex-col items-center justify-center text-[10px] font-bold text-navy-900 bg-indigo-50/50">
                  <span>82%</span>
                </div>
              </div>
              <div className="mt-2.5">
                <h4 className="font-serif font-bold text-navy-900 text-sm">Rohan Mehta</h4>
                <p className="text-[11px] text-slate-500">Data Analyst • 1.5 Yrs Exp</p>
                <p className="text-[10px] text-slate-400 mt-0.5">📍 Chennai, India</p>
              </div>
              <div className="flex flex-wrap gap-1 mt-3">
                <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded">Python</span>
                <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded">Pandas</span>
                <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded">Excel</span>
              </div>
            </div>

            {/* Card 3 (Layered behind to the right): Sneha Patel */}
            <div className="absolute top-8 right-2 sm:right-6 w-64 bg-white/95 rounded-2xl p-4 shadow-md border border-slate-100 transform rotate-6 transition-transform hover:rotate-2 duration-300">
              <div className="flex items-center justify-between">
                <img
                  src="https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=120"
                  alt="Sneha Patel"
                  className="w-10 h-10 rounded-full object-cover border border-slate-200"
                />
                <div className="w-10 h-10 rounded-full border-2 border-amber-200 flex flex-col items-center justify-center text-[10px] font-bold text-navy-900 bg-amber-50/50">
                  <span>88%</span>
                </div>
              </div>
              <div className="mt-2.5">
                <h4 className="font-serif font-bold text-navy-900 text-sm">Sneha Patel</h4>
                <p className="text-[11px] text-slate-500">Backend Developer • 3 Yrs Exp</p>
                <p className="text-[10px] text-slate-400 mt-0.5">📍 Hyderabad, India</p>
              </div>
              <div className="flex flex-wrap gap-1 mt-3">
                <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded">Java</span>
                <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded">Spring Boot</span>
                <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded">SQL</span>
              </div>
            </div>

            {/* Card 1 (Front & Featured): Priya Sharma (#1 Top Match) */}
            <div className="relative z-10 w-72 sm:w-80 bg-white rounded-2xl p-5 shadow-xl border border-slate-100/80 transform rotate-1 hover:rotate-0 transition-all duration-300 mt-2 sm:mt-6">
              {/* Badge & Circular Score Ring */}
              <div className="flex items-center justify-between">
                <span className="bg-[#7056E8] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                  #1 Top Match
                </span>
                <div className="relative w-14 h-14 flex items-center justify-center">
                  <svg className="w-14 h-14 transform -rotate-90">
                    <circle
                      cx="28"
                      cy="28"
                      r="22"
                      stroke="#E4ECF8"
                      strokeWidth="3.5"
                      fill="transparent"
                    />
                    <circle
                      cx="28"
                      cy="28"
                      r="22"
                      stroke="#4C5BFF"
                      strokeWidth="3.5"
                      fill="transparent"
                      strokeDasharray={138}
                      strokeDashoffset={138 * (1 - 0.96)}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
                    <span className="text-xs font-extrabold text-navy-900">96%</span>
                    <span className="text-[7px] text-slate-400 mt-0.5 font-medium">Match Score</span>
                  </div>
                </div>
              </div>

              {/* Candidate Info */}
              <div className="flex items-center space-x-3.5 mt-2">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200"
                  alt="Priya Sharma"
                  className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                />
                <div>
                  <h3 className="font-serif font-bold text-navy-900 text-lg leading-snug">
                    Priya Sharma
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">Software Engineer • 2 Yrs Exp</p>
                  <p className="text-[11px] text-slate-400 mt-0.5 flex items-center">
                    <MapPin className="w-3 h-3 mr-1 text-slate-400" />
                    Bangalore, India
                  </p>
                </div>
              </div>

              {/* Skills Tags */}
              <div className="flex flex-wrap gap-1.5 mt-4">
                <span className="text-[11px] font-medium bg-[#EFF2FC] text-[#2E4374] px-2.5 py-1 rounded-lg border border-slate-200/50">
                  Python
                </span>
                <span className="text-[11px] font-medium bg-[#EFF2FC] text-[#2E4374] px-2.5 py-1 rounded-lg border border-slate-200/50">
                  React
                </span>
                <span className="text-[11px] font-medium bg-[#EFF2FC] text-[#2E4374] px-2.5 py-1 rounded-lg border border-slate-200/50">
                  SQL
                </span>
                <span className="text-[11px] font-medium bg-[#EFF2FC] text-[#2E4374] px-2.5 py-1 rounded-lg border border-slate-200/50">
                  Machine Learning
                </span>
              </div>

              {/* View Details Link */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
                <span className="text-xs font-semibold text-electric hover:text-electric-hover cursor-pointer flex items-center">
                  View Details
                  <ArrowRight className="w-3 h-3 ml-1" />
                </span>
                <span className="text-[10px] text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full">
                  Verified Evidence
                </span>
              </div>
            </div>

            {/* Floating Top Skills Match Card (Bottom Right) */}
            <div className="absolute -bottom-10 right-0 sm:-right-4 z-20 w-56 sm:w-60 bg-white/95 backdrop-blur-sm rounded-xl p-3.5 shadow-xl border border-slate-100">
              <h5 className="text-[11px] font-bold text-navy-900 mb-2 font-sans flex items-center justify-between">
                <span>Top Skills Match</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              </h5>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-[10px] text-slate-600 mb-0.5">
                    <span className="flex items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-electric mr-1.5"></span> Python
                    </span>
                    <span className="font-semibold text-navy-900">95%</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-electric rounded-full" style={{ width: '95%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[10px] text-slate-600 mb-0.5">
                    <span className="flex items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-electric mr-1.5"></span> SQL
                    </span>
                    <span className="font-semibold text-navy-900">88%</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-electric rounded-full" style={{ width: '88%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[10px] text-slate-600 mb-0.5">
                    <span className="flex items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FF8199] mr-1.5"></span> Machine Learning
                    </span>
                    <span className="font-semibold text-navy-900">82%</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#FF8199] rounded-full" style={{ width: '82%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[10px] text-slate-600 mb-0.5">
                    <span className="flex items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#A98BFF] mr-1.5"></span> Communication
                    </span>
                    <span className="font-semibold text-navy-900">76%</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#A98BFF] rounded-full" style={{ width: '76%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. "TRY IT LIVE" CANDIDATE-MATCHING STUDIO (WIDE ASYMMETRIC COMPOSITION) */}
      <section id="try-it-live" className="max-w-7xl mx-auto px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Far Left: Tall Vibrant Periwinkle/Violet Card */}
          <div className="lg:col-span-2 bg-gradient-to-b from-[#5661F6] to-[#434EDB] text-white rounded-2xl p-6 shadow-lg flex flex-col justify-between relative overflow-hidden">
            <div>
              <h2 className="font-serif text-3xl font-bold tracking-tight leading-snug">
                Try It
                <br />
                Live
              </h2>
              <p className="text-white/80 text-xs mt-4 leading-relaxed font-normal">
                Switch between job roles to see how the AI matches candidates based on your
                requirements.
              </p>
            </div>

            <div className="mt-8 pt-4 border-t border-white/20">
              <p className="font-serif italic text-sm text-white/90 flex items-center">
                <span>Explore different roles</span>
                <span className="ml-1 text-base">↗</span>
              </p>
              <div className="text-[10px] text-white/70 font-mono mt-1">Live Reactive Demo</div>
            </div>
          </div>

          {/* Center-Left: Candidate List with Role Selector */}
          <div className="lg:col-span-4 bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 flex flex-col justify-between">
            <div>
              {/* Role Selectors */}
              <div className="flex flex-wrap gap-1.5 pb-4 border-b border-slate-100">
                {demoRoles.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => {
                      setSelectedRoleId(role.id);
                      setSelectedCandidateId(role.candidates[0].id);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                      selectedRoleId === role.id
                        ? 'bg-electric text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80'
                    }`}
                  >
                    {role.title}
                  </button>
                ))}
              </div>

              {/* List Subtitle */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 py-3">
                <span>{currentRole.countText}</span>
                <span className="font-medium cursor-pointer hover:text-navy-900">
                  Sort by: Match Score ▾
                </span>
              </div>

              {/* 3 Candidate Rows */}
              <div className="space-y-2 mt-1">
                {currentRole.candidates.map((cand) => {
                  const isSelected = cand.id === currentCandidate.id;
                  return (
                    <div
                      key={cand.id}
                      onClick={() => setSelectedCandidateId(cand.id)}
                      className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'border-electric bg-[#F5F7FF] shadow-sm'
                          : 'border-slate-200/70 hover:border-slate-300 hover:bg-slate-50/60'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={cand.avatar}
                          alt={cand.name}
                          className="w-9 h-9 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <h4 className="font-serif font-bold text-navy-900 text-sm leading-tight">
                            {cand.name}
                          </h4>
                          <p className="text-[10px] text-slate-500">
                            {cand.exp} • {cand.location.split(',')[0]}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        {/* Circular Score Indicator */}
                        <div className="w-9 h-9 rounded-full border-2 border-electric flex items-center justify-center bg-white shadow-xs">
                          <span className="text-[11px] font-extrabold text-navy-900">
                            {cand.score}%
                          </span>
                        </div>
                        <span
                          className={`text-xs font-semibold flex items-center ${
                            isSelected ? 'text-electric' : 'text-slate-400'
                          }`}
                        >
                          View Details →
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Updated in real-time</span>
              <span className="text-electric font-semibold cursor-pointer" onClick={onStartScreening}>
                Screen Custom Resumes →
              </span>
            </div>
          </div>

          {/* Center-Right: Candidate Evidence & Profile Panel */}
          <div className="lg:col-span-3 bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-3">
                  <img
                    src={currentCandidate.avatar}
                    alt={currentCandidate.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <h3 className="font-serif font-bold text-navy-900 text-sm leading-tight">
                      {currentCandidate.name}
                    </h3>
                    <p className="text-[10px] text-slate-500">
                      {currentCandidate.role} • {currentCandidate.exp}
                    </p>
                    <p className="text-[10px] text-slate-400">{currentCandidate.location}</p>
                  </div>
                </div>

                <div className="w-10 h-10 rounded-full border-2 border-electric flex items-center justify-center bg-white shadow-xs">
                  <span className="text-xs font-extrabold text-navy-900">
                    {currentCandidate.score}%
                  </span>
                </div>
              </div>

              {/* Interactive Tabs */}
              <div className="flex space-x-4 border-b border-slate-100 text-xs font-semibold mt-3">
                <button
                  onClick={() => setActiveTab('skills')}
                  className={`pb-2 border-b-2 transition-colors cursor-pointer ${
                    activeTab === 'skills'
                      ? 'border-electric text-electric'
                      : 'border-transparent text-slate-500 hover:text-navy-900'
                  }`}
                >
                  Skill Match
                </button>
                <button
                  onClick={() => setActiveTab('evidence')}
                  className={`pb-2 border-b-2 transition-colors cursor-pointer ${
                    activeTab === 'evidence'
                      ? 'border-electric text-electric'
                      : 'border-transparent text-slate-500 hover:text-navy-900'
                  }`}
                >
                  Evidence
                </button>
                <button
                  onClick={() => setActiveTab('experience')}
                  className={`pb-2 border-b-2 transition-colors cursor-pointer ${
                    activeTab === 'experience'
                      ? 'border-electric text-electric'
                      : 'border-transparent text-slate-500 hover:text-navy-900'
                  }`}
                >
                  Experience
                </button>
              </div>

              {/* Tab Content */}
              <div className="mt-4">
                {activeTab === 'skills' && (
                  <div className="space-y-3">
                    {currentCandidate.skills.map((skill, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between text-xs text-slate-700 mb-1">
                          <span className="flex items-center">
                            <span
                              className="w-2 h-2 rounded-full mr-2"
                              style={{ backgroundColor: skill.color || '#4C5BFF' }}
                            ></span>
                            {skill.name}
                          </span>
                          <span className="font-semibold text-navy-900">{skill.score}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${skill.score}%`,
                              backgroundColor: skill.color || '#4C5BFF',
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'evidence' && (
                  <div className="space-y-3 text-xs">
                    {currentCandidate.evidence.map((ev, idx) => (
                      <div key={idx} className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <div className="font-bold text-navy-900 flex items-center justify-between">
                          <span>{ev.req}</span>
                          <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-mono">
                            {ev.confidence}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1 italic leading-relaxed">
                          "{ev.excerpt}"
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'experience' && (
                  <div className="space-y-3 text-xs">
                    {currentCandidate.experience.map((exp, idx) => (
                      <div key={idx} className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <div className="font-bold text-navy-900">{exp.company}</div>
                        <div className="text-[11px] text-slate-500 font-medium">
                          {exp.role} • {exp.period}
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1">{exp.desc}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Full Profile CTA */}
            <div className="mt-4 pt-3 border-t border-slate-100 text-center">
              <button
                onClick={onStartScreening}
                className="w-full text-xs font-semibold py-2 px-3 rounded-xl border border-slate-200 hover:border-electric hover:text-electric text-slate-700 transition-colors shadow-xs"
              >
                View Full Profile →
              </button>
            </div>
          </div>

          {/* Far Right: 2x2 Feature Panels */}
          <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3.5">
            {/* Card 1: Lavender */}
            <div
              onClick={onStartScreening}
              className="bg-pastel-cardLavender rounded-2xl p-4 flex flex-col justify-between hover:shadow-md transition-all duration-300 cursor-pointer group"
            >
              <div>
                <div className="w-7 h-7 rounded-lg bg-white/70 text-violet-600 flex items-center justify-center text-sm shadow-xs mb-3">
                  ✦
                </div>
                <h4 className="font-serif font-bold text-navy-900 text-sm leading-snug">
                  Skills, in context.
                </h4>
                <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">
                  See which requirements are supported by real resume evidence.
                </p>
              </div>
              <div className="text-violet-600 text-xs font-bold mt-4 flex items-center group-hover:translate-x-1 transition-transform">
                →
              </div>
            </div>

            {/* Card 2: Pink */}
            <div
              onClick={onStartScreening}
              className="bg-pastel-cardPink rounded-2xl p-4 flex flex-col justify-between hover:shadow-md transition-all duration-300 cursor-pointer group"
            >
              <div>
                <div className="w-7 h-7 rounded-lg bg-white/70 text-rose-500 flex items-center justify-center text-sm shadow-xs mb-3">
                  <BarChart3 className="w-4 h-4 text-rose-500" />
                </div>
                <h4 className="font-serif font-bold text-navy-900 text-sm leading-snug">
                  Matches you can explain.
                </h4>
                <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">
                  Transparent scoring with clear breakdowns and evidence.
                </p>
              </div>
              <div className="text-rose-500 text-xs font-bold mt-4 flex items-center group-hover:translate-x-1 transition-transform">
                →
              </div>
            </div>

            {/* Card 3: Soft Yellow */}
            <div
              onClick={onStartScreening}
              className="bg-pastel-cardYellow rounded-2xl p-4 flex flex-col justify-between hover:shadow-md transition-all duration-300 cursor-pointer group"
            >
              <div>
                <div className="w-7 h-7 rounded-lg bg-white/70 text-amber-600 flex items-center justify-center text-sm shadow-xs mb-3">
                  <Users className="w-4 h-4 text-amber-600" />
                </div>
                <h4 className="font-serif font-bold text-navy-900 text-sm leading-snug">
                  A shortlist with purpose.
                </h4>
                <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">
                  Compare candidates, track stages, and manage your hiring pipeline.
                </p>
              </div>
              <div className="text-amber-600 text-xs font-bold mt-4 flex items-center group-hover:translate-x-1 transition-transform">
                →
              </div>
            </div>

            {/* Card 4: Sky Blue */}
            <div
              onClick={onStartScreening}
              className="bg-pastel-cardSky rounded-2xl p-4 flex flex-col justify-between hover:shadow-md transition-all duration-300 cursor-pointer group"
            >
              <div>
                <div className="w-7 h-7 rounded-lg bg-white/70 text-sky-600 flex items-center justify-center text-sm shadow-xs mb-3">
                  <Network className="w-4 h-4 text-sky-600" />
                </div>
                <h4 className="font-serif font-bold text-navy-900 text-sm leading-snug">
                  Connections worth exploring.
                </h4>
                <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">
                  Explore relationships between jobs, skills, and candidates.
                </p>
              </div>
              <div className="text-sky-600 text-xs font-bold mt-4 flex items-center group-hover:translate-x-1 transition-transform">
                →
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. "HOW IT WORKS" & "BUILT FOR SMARTER HIRING" DASHBOARD PREVIEW */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left: How It Works 3-Step Process */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <h2 className="font-serif text-4xl sm:text-5xl font-bold text-navy-900 tracking-tight">
                How It Works
              </h2>
              <p className="text-sm text-slate-500 mt-2 font-normal">
                From job posting to shortlist — in just a few simple steps.
              </p>
            </div>

            {/* Master Reference Pattern: Soft Organic Pastel Cloud Container */}
            <div className="relative bg-gradient-to-r from-[#EAE4FF]/80 via-[#FFE7EF]/75 to-[#DCEEFF]/80 rounded-3xl p-6 sm:p-7 border border-white/80 shadow-xs backdrop-blur-xs">
              {/* Decorative cloud sparkles */}
              <div className="absolute -top-3.5 right-6 text-[#FF8199] text-base animate-pulse">✦</div>
              <div className="absolute -bottom-2.5 left-8 text-[#5661F6] text-sm animate-pulse-slow">✦</div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-5 relative z-10">
                {/* Step 01 */}
                <div className="space-y-1.5 flex-1 bg-white/75 sm:bg-transparent p-4 sm:p-0 rounded-2xl sm:rounded-none border sm:border-0 border-white/80">
                  <div className="font-serif text-4xl sm:text-5xl font-bold text-[#5661F6]">01</div>
                  <h4 className="font-bold text-navy-900 text-sm">Define the role.</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Set your requirements and key skills.
                  </p>
                </div>

                {/* Dashed Connector Arrow */}
                <div className="hidden sm:flex items-center text-[#5661F6]/50">
                  <svg className="w-8 h-4" viewBox="0 0 32 16" fill="none">
                    <path
                      d="M2 8 H26 M20 2 L26 8 L20 14"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeDasharray="3 3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                {/* Step 02 */}
                <div className="space-y-1.5 flex-1 bg-white/75 sm:bg-transparent p-4 sm:p-0 rounded-2xl sm:rounded-none border sm:border-0 border-white/80">
                  <div className="font-serif text-4xl sm:text-5xl font-bold text-[#FF8199]">02</div>
                  <h4 className="font-bold text-navy-900 text-sm">Analyse resumes.</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    AI extracts skills, experience, and evidence.
                  </p>
                </div>

                {/* Dashed Connector Arrow */}
                <div className="hidden sm:flex items-center text-[#FF8199]/50">
                  <svg className="w-8 h-4" viewBox="0 0 32 16" fill="none">
                    <path
                      d="M2 8 H26 M20 2 L26 8 L20 14"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeDasharray="3 3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                {/* Step 03 */}
                <div className="space-y-1.5 flex-1 bg-white/75 sm:bg-transparent p-4 sm:p-0 rounded-2xl sm:rounded-none border sm:border-0 border-white/80">
                  <div className="font-serif text-4xl sm:text-5xl font-bold text-[#5661F6]">03</div>
                  <h4 className="font-bold text-navy-900 text-sm">Shortlist talent.</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Compare candidates and make decisions.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Built for smarter hiring + Product Dashboard Preview */}
          <div className="lg:col-span-7 space-y-6">
            <div className="max-w-xl">
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-navy-900">
                Built for smarter hiring.
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                TalentLens AI assists with initial screening and presents job-related evidence.
                Final hiring decisions are always made by human recruiters.
              </p>
              <div className="mt-3">
                <button
                  onClick={onStartScreening}
                  className="text-xs font-bold text-electric hover:underline inline-flex items-center"
                >
                  <span>Learn more</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </button>
              </div>
            </div>

            {/* Realistic Application Dashboard Preview Card */}
            <div
              onClick={onStartScreening}
              className="bg-white rounded-2xl p-5 shadow-xl border border-slate-100 hover:shadow-2xl transition-shadow duration-300 cursor-pointer overflow-hidden"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-electric" />
                  <span className="font-serif font-bold text-navy-900 text-xs">TalentLens AI Workspace</span>
                </div>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                  Interactive Preview
                </span>
              </div>

              {/* Greeting & Quick KPIs */}
              <div className="pt-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-navy-900">Welcome back, Recruiter</h4>
                  <span className="text-[10px] text-slate-400">Here's what's happening with your hiring process</span>
                </div>

                <div className="grid grid-cols-4 gap-2.5 mt-3">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center">
                    <span className="text-[10px] text-slate-500">Total Resumes</span>
                    <p className="text-sm font-bold text-navy-900 mt-0.5">248</p>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center">
                    <span className="text-[10px] text-slate-500">Under Review</span>
                    <p className="text-sm font-bold text-amber-600 mt-0.5">42</p>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center">
                    <span className="text-[10px] text-slate-500">Shortlisted</span>
                    <p className="text-sm font-bold text-electric mt-0.5">18</p>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center">
                    <span className="text-[10px] text-slate-500">Rejected</span>
                    <p className="text-sm font-bold text-rose-500 mt-0.5">8</p>
                  </div>
                </div>

                {/* Mini Leaderboard + Mini Donut Chart */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 mt-3 pt-3 border-t border-slate-100">
                  <div className="sm:col-span-8">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Top Candidates
                    </span>
                    <div className="space-y-1.5 mt-1.5">
                      <div className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-slate-50">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-[10px] text-slate-400 font-bold">1</span>
                          <span className="font-serif font-bold text-navy-900">Priya Sharma</span>
                        </div>
                        <span className="font-bold text-electric text-[11px]">96%</span>
                        <span className="text-[9px] bg-electric/10 text-electric font-bold px-1.5 py-0.2 rounded-full">
                          Shortlisted
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-slate-50">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-[10px] text-slate-400 font-bold">2</span>
                          <span className="font-serif font-bold text-navy-900">Rohan Mehta</span>
                        </div>
                        <span className="font-bold text-amber-600 text-[11px]">84%</span>
                        <span className="text-[9px] bg-amber-50 text-amber-700 font-bold px-1.5 py-0.2 rounded-full">
                          Under Review
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="sm:col-span-4 flex flex-col items-center justify-center p-2 bg-slate-50 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-500 mb-1">Skill Distribution</span>
                    <div className="w-14 h-14 rounded-full border-4 border-electric border-t-[#FF8199] border-r-[#A98BFF] flex items-center justify-center text-[10px] font-bold text-navy-900">
                      42
                    </div>
                    <span className="text-[9px] text-slate-400 mt-1">Total Candidates</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FOOTER */}
      <footer className="border-t border-slate-200/80 bg-white/60 py-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-electric" />
            <span className="font-serif font-bold text-navy-900 text-lg">TalentLens AI</span>
            <span className="text-xs text-slate-400 ml-2">Precision Talent Intelligence</span>
          </div>

          <div className="text-xs text-slate-500">
            Powered by Verifiable Knowledge Graphs & Bayesian Qualification Reasoning
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={onStartScreening}
              className="text-xs font-semibold text-electric hover:underline"
            >
              Launch Workspace →
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
