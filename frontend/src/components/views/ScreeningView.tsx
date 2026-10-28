import React, { useState } from 'react';
import {
  UploadCloud,
  FileText,
  AlertCircle,
  CheckCircle2,
  Trash2,
  ArrowRight,
  Briefcase,
  Sparkles,
  Zap,
  Check,
  BrainCircuit,
  Eye,
  Award
} from 'lucide-react';
import { Job, Candidate } from '../../types';
import { api } from '../../api';
import { AnimatedMatchMeter } from '../AnimatedMatchMeter';
import { MatchScoreModal } from '../MatchScoreModal';

interface ScreeningViewProps {
  jobs: Job[];
  activeJobId: number | null;
  onJobChange: (jobId: number) => void;
  onNavigateCandidates: () => void;
  onRefreshData: () => void;
}

export const ScreeningView: React.FC<ScreeningViewProps> = ({
  jobs,
  activeJobId,
  onJobChange,
  onNavigateCandidates,
  onRefreshData,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [screeningPhase, setScreeningPhase] = useState<string>('Document Ingestion');
  const [modalCandidate, setModalCandidate] = useState<Candidate | null>(null);

  const [result, setResult] = useState<{
    success: boolean;
    processed_count: number;
    errors: string[];
    message: string;
    candidates?: any[];
  } | null>(null);

  const activeJob = jobs.find((j) => j.id === activeJobId) || jobs[0];

  const handleFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validExtensions = ['.pdf', '.docx', '.doc', '.txt'];

    const newFiles = fileArray.filter((file) => {
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      return validExtensions.includes(ext);
    });

    if (newFiles.length < fileArray.length) {
      alert('Some files were ignored because only PDF, DOCX, DOC, and TXT files are supported.');
    }

    setSelectedFiles((prev) => [...prev, ...newFiles]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer && e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleStartScreening = async () => {
    if (!activeJob) {
      alert('Please select a target job opening first.');
      return;
    }
    if (selectedFiles.length === 0) {
      alert('Please upload or select at least one resume (PDF or DOCX).');
      return;
    }

    const phases = [
      'Ingesting PDF / DOCX byte streams & token extraction...',
      'Parsing semantic skills & extracting entity triples...',
      'Computing TF-IDF n-gram vector cosine similarity matrix...',
      'Evaluating Bayesian belief updater & rule constraints...',
      'Finalizing composite match scores & candidate rankings...'
    ];

    try {
      setUploading(true);
      setUploadProgress(15);
      setScreeningPhase(phases[0]);
      setResult(null);

      const progressInterval = setInterval(() => {
        setUploadProgress((p) => {
          if (p < 88) {
            const nextP = p + 16;
            const phaseIdx = Math.min(phases.length - 1, Math.floor(nextP / 20));
            setScreeningPhase(phases[phaseIdx]);
            return nextP;
          }
          return p;
        });
      }, 300);

      const res = await api.uploadResumes(activeJob.id, selectedFiles);
      clearInterval(progressInterval);
      setUploadProgress(100);
      setScreeningPhase('AI Match Computation Complete');
      setResult(res);

      if (res.success) {
        setSelectedFiles([]);
        onRefreshData();
      }
    } catch (err: any) {
      setResult({
        success: false,
        processed_count: 0,
        errors: [err.message || 'Screening pipeline failed'],
        message: 'Parsing failed',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleLoadNitharshanaResume = () => {
    const resume = new File(
      [
        `NITHARSHANA P S\n` +
        `SOFTWARE DEVELOPER | +91 9994198237 | nitharshh2007@gmail.com\n\n` +
        `SUMMARY:\n` +
        `Computer Science (AI & ML) student with a CGPA of 8.8, passionate about building real-world solutions using software and artificial intelligence. Experienced in developing full-stack applications and AI-driven projects, with a strong focus on problem-solving, scalability, and user-centric design. Continuously learning and exploring modern technologies to grow as a developer.\n\n` +
        `WORK EXPERIENCE / COLLEGE PROJECTS & HACKATHONS:\n` +
        `ATRIVA\n` +
        `• Developed an AI-driven ICU crisis intelligence system for real-time patient monitoring\n` +
        `• Processed multimodal healthcare data (ECG, vital signs) for analysis\n` +
        `• Implemented predictive models to detect early signs of patient deterioration\n` +
        `• Designed a scalable architecture using federated learning concepts\n` +
        `• Focused on improving clinical decision-making and reducing response time\n\n` +
        `Auriva\n` +
        `• Built an AI-powered accessibility solution to enhance digital usability\n` +
        `• Developed intelligent features to assist users with diverse accessibility needs\n` +
        `• Improved navigation and interaction through adaptive system design\n` +
        `• Focused on creating an inclusive and user-friendly experience\n\n` +
        `ARGUS\n` +
        `• Developed an intelligent monitoring and analytics platform\n` +
        `• Implemented real-time data tracking and anomaly detection\n` +
        `• Generated actionable insights for faster decision-making\n` +
        `• Focused on improving system efficiency and reliability\n\n` +
        `RAIN\n` +
        `• Created an AI-based environmental monitoring system\n` +
        `• Implemented rainfall prediction and climate analysis models\n` +
        `• Processed environmental data to generate insights and alerts\n` +
        `• Focused on enabling better planning for weather-dependent activities\n\n` +
        `CampusSync\n` +
        `• Designed and developed a full-stack campus management system\n` +
        `• Implemented authentication with role-based access (student, admin)\n` +
        `• Built secure login with device-based restrictions\n` +
        `• Developed QR-based attendance tracking system\n\n` +
        `EDUCATION:\n` +
        `I am currently pursuing a Bachelor of Technology (B.Tech) in Computer Science (AI & ML) at Karunya Institute of Technology and Sciences, Coimbatore, with a CGPA of 8.8. I am in Semester 2 (First Year) and expected to graduate in 2029.\n\n` +
        `SKILLS:\n` +
        `HTML, CSS, JavaScript, React, SQL, C Programming, Python, Internet of Things, Git, GitHub, API Integration, Database Management, Artificial Intelligence, Machine Learning Fundamentals, Problem Solving\n`
      ],
      "Nitharshana_PS_Resume.txt",
      { type: "text/plain" }
    );
    setSelectedFiles((prev) => [...prev, resume]);
  };

  const handleLoadRealBatch = () => {
    const resume1 = new File(
      [
        `NITHARSHANA P S\n` +
        `SOFTWARE DEVELOPER | +91 9994198237 | nitharshh2007@gmail.com\n\n` +
        `SUMMARY:\n` +
        `Computer Science (AI & ML) student with a CGPA of 8.8, passionate about building real-world solutions using software and artificial intelligence. Experienced in developing full-stack applications and AI-driven projects, with a strong focus on problem-solving, scalability, and user-centric design.\n\n` +
        `COLLEGE PROJECTS & HACKATHONS:\n` +
        `ATRIVA: AI ICU crisis intelligence system for real-time patient monitoring (ECG, vital signs, federated learning).\n` +
        `Auriva: AI accessibility solution with adaptive system design.\n` +
        `CampusSync: Full-stack campus management system in React, Python, SQL with QR attendance.\n` +
        `RAIN: AI environmental rainfall prediction.\n\n` +
        `EDUCATION: B.Tech in CS (AI & ML) - Karunya Institute of Technology (CGPA 8.8)\n` +
        `SKILLS: Python, React, JavaScript, HTML, CSS, SQL, Git, GitHub, AI, Machine Learning, Problem Solving, Database Management, API Integration\n`
      ],
      "Nitharshana_PS_Resume.txt",
      { type: "text/plain" }
    );

    const resume2 = new File(
      [
        `Alex Mercer\nSan Francisco, CA | alex.mercer@example.com | +1 (555) 234-5678\n\n` +
        `SUMMARY:\nSenior AI & Machine Learning Engineer with 5+ years experience in Python, PyTorch, Scikit-learn, SQL, and FastAPI.\n\n` +
        `EXPERIENCE:\nSenior AI Engineer - HyperScale AI (2021 - Present)\n` +
        `- Designed NLP models achieving 94% F1-score with PyTorch.\n` +
        `- Built REST APIs with Docker on AWS.\n\n` +
        `EDUCATION: B.S. in Computer Science - UC Berkeley (2019)\n` +
        `SKILLS: Python, Machine Learning, Scikit-Learn, PyTorch, SQL, REST API, Docker, AWS, NLP, Pandas, Git, FastAPI`
      ],
      "Alex_Mercer_AI_Engineer.txt",
      { type: "text/plain" }
    );

    const resume3 = new File(
      [
        `Priyanshu Sharma\nBengaluru, India | priyanshu.sharma@example.com\n\n` +
        `SUMMARY:\nFull-Stack Software Developer with 2+ years experience building React frontends, Python REST APIs, and SQL databases.\n\n` +
        `EXPERIENCE:\nFull-Stack Engineer - NextWave Tech (2023 - Present)\n` +
        `- Built responsive web applications in React and TypeScript.\n` +
        `- Developed PostgreSQL data pipelines with Python and Docker.\n\n` +
        `EDUCATION: B.Tech in Computer Science - NIT (2022)\n` +
        `SKILLS: React, JavaScript, TypeScript, Python, SQL, REST API, HTML, CSS, Git, GitHub, Docker, API Integration`
      ],
      "Priyanshu_Sharma_FullStack.txt",
      { type: "text/plain" }
    );

    setSelectedFiles((prev) => [...prev, resume1, resume2, resume3]);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner */}
      <div className="border-b border-slate-200/80 pb-6">
        <span className="text-[11px] font-bold uppercase tracking-widest text-electric flex items-center space-x-2">
          <Zap className="w-3.5 h-3.5" />
          <span>DOCUMENT INGESTION & AI MATCH ENGINE</span>
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-navy-900 mt-1 tracking-tight">
          Resume Screening Pipeline
        </h1>
        <p className="text-sm text-slate-600 mt-1 max-w-2xl font-normal">
          Upload PDF or DOCX candidate resumes to parse clauses, extract verifiable skill entities, and run live 5-layer academic matching algorithms with animated fit score analysis.
        </p>
      </div>

      {/* Target Requisition Confirmation Panel */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center space-x-2 text-navy-900 font-semibold text-xs uppercase tracking-wider">
          <Briefcase className="w-4 h-4 text-electric" />
          <span>Stage 01: Select Target Requisition</span>
        </div>

        {jobs.length === 0 ? (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl">
            No active requisitions found. Please create one in the Job Openings tab first.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">
                Target Requisition Profile:
              </label>
              <select
                value={activeJob?.id || ''}
                onChange={(e) => onJobChange(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 text-navy-900 p-2.5 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-electric/30 cursor-pointer"
              >
                {jobs.map((j) => (
                  <option key={j.id} value={j.id} className="bg-white text-navy-900">
                    {j.title} ({j.department})
                  </option>
                ))}
              </select>
            </div>

            {activeJob && (
              <div className="bg-[#FAF8F3] p-4 rounded-xl border border-slate-200/80 text-xs space-y-1">
                <div className="font-semibold text-electric uppercase text-[10px]">Criteria Snapshot:</div>
                <div className="text-slate-700 text-[11px] truncate">
                  <strong className="text-slate-500">Required Skills:</strong> {activeJob.required_skills.join(', ')}
                </div>
                <div className="text-slate-700 text-[11px]">
                  <strong className="text-slate-500">Min Experience:</strong> {activeJob.min_experience_years} Years
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Upload Dropzone Card with Drag & Drop Animations */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-2">
          <div className="flex items-center space-x-2 text-navy-900 font-semibold text-xs uppercase tracking-wider">
            <UploadCloud className="w-4 h-4 text-electric" />
            <span>Stage 02: Ingest PDF / DOCX Resumes</span>
          </div>

          {/* Quick Demo Resume Loaders */}
          <div className="flex items-center space-x-2 text-xs">
            <button
              type="button"
              onClick={handleLoadNitharshanaResume}
              className="px-2.5 py-1 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200 font-semibold text-[11px] transition-colors cursor-pointer flex items-center space-x-1"
            >
              <Sparkles className="w-3 h-3 text-cyan-600" />
              <span>+ Load Nitharshana P. S. Resume</span>
            </button>
            <button
              type="button"
              onClick={handleLoadRealBatch}
              className="px-2.5 py-1 rounded-lg bg-electric/10 hover:bg-electric/20 text-electric border border-electric/20 font-semibold text-[11px] transition-colors cursor-pointer"
            >
              + Load Batch (3 Resumes)
            </button>
          </div>
        </div>

        {/* Interactive Drop Area */}
        <div
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed p-10 rounded-2xl text-center transition-all duration-300 cursor-pointer ${
            isDragging
              ? 'border-electric bg-[#F3F0FF] scale-[1.02] shadow-float'
              : 'border-slate-300 hover:border-electric bg-slate-50/60 hover:bg-slate-50'
          }`}
        >
          <input
            type="file"
            id="resume-file-input"
            multiple
            accept=".pdf,.docx,.doc,.txt"
            onChange={handleFileChange}
            className="hidden"
          />
          <label htmlFor="resume-file-input" className="cursor-pointer space-y-4 block">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto transition-transform duration-300 ${
                isDragging
                  ? 'bg-electric text-white scale-110 shadow-float animate-bounce'
                  : 'bg-white border border-slate-200 text-electric hover:scale-105 shadow-xs'
              }`}
            >
              <UploadCloud className="w-7 h-7" />
            </div>

            <div>
              <div className="text-lg font-serif font-bold text-navy-900 tracking-tight">
                {isDragging ? (
                  <span className="text-electric animate-pulse">Release to drop resumes into AI engine</span>
                ) : (
                  <>
                    Drag and drop resumes here, or{' '}
                    <span className="text-electric underline">browse files</span>
                  </>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1.5 font-normal">
                Supports PDF, DOCX, DOC, or TXT documents up to 15MB each
              </p>
            </div>
          </label>
        </div>

        {/* Selected Files List */}
        {selectedFiles.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-xs font-semibold uppercase text-slate-500">
              <span className="flex items-center space-x-1.5 text-navy-900">
                <FileText className="w-3.5 h-3.5 text-electric" />
                <span>Ready for AI Processing ({selectedFiles.length} File{selectedFiles.length > 1 ? 's' : ''})</span>
              </span>
              <button
                onClick={() => setSelectedFiles([])}
                className="text-rose-500 hover:underline text-[11px] cursor-pointer"
              >
                Clear all
              </button>
            </div>

            <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
              {selectedFiles.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-slate-50 border border-slate-200/80 hover:border-slate-300 p-3 rounded-xl text-xs transition-all duration-200"
                >
                  <div className="flex items-center space-x-3 truncate">
                    <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-electric border border-slate-200">
                      <FileText className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-navy-900 truncate">{file.name}</span>
                    <span className="text-[10px] text-slate-600 bg-slate-200/70 px-2 py-0.5 rounded">
                      {(file.size / 1024).toFixed(0)} KB
                    </span>
                  </div>

                  <button
                    onClick={() => removeFile(idx)}
                    className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-slate-200/50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dynamic Loading Animation & AI Radar Scanner */}
        {uploading && (
          <div className="bg-[#070D1E] p-6 rounded-2xl border border-blue-900/60 text-white space-y-4 shadow-lg animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-cyan-400">
                  <BrainCircuit className="w-5 h-5 animate-spin-slow" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold block">
                    AI Screening Engine In Action
                  </span>
                  <div className="text-sm font-bold font-sans text-slate-100 flex items-center space-x-2">
                    <span>{screeningPhase}</span>
                  </div>
                </div>
              </div>
              <span className="text-2xl font-bold font-mono text-cyan-400">{uploadProgress}%</span>
            </div>

            {/* Glowing animated progress bar */}
            <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800 p-0.5">
              <div
                className="bg-gradient-to-r from-cyan-400 via-electric to-emerald-400 h-full rounded-full transition-all duration-300 relative"
                style={{ width: `${uploadProgress}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
              </div>
            </div>

            <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 pt-1 border-t border-blue-950">
              <span>Evaluating: TF-IDF Cosine • Bayes P(Fit) • Rule Verification</span>
              <span className="text-cyan-400">CO1–CO5 Active</span>
            </div>
          </div>
        )}

        {/* Action Trigger Button */}
        <div className="pt-2">
          <button
            onClick={handleStartScreening}
            disabled={uploading || selectedFiles.length === 0 || !activeJob}
            className="w-full inline-flex items-center justify-center space-x-2.5 text-xs font-semibold uppercase tracking-wider bg-electric hover:bg-electric-hover text-white py-4 rounded-xl shadow-md transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {uploading ? (
              <span>Extracting & Screening Resumes... ({uploadProgress}%)</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-white" />
                <span>Extract, Match & Rank Resumes ({selectedFiles.length})</span>
              </>
            )}
          </button>
        </div>

        {/* Upload Result / Feedback Banner */}
        {result && (
          <div className="space-y-4 pt-2">
            <div
              className={`p-5 rounded-2xl border text-xs space-y-3 shadow-xs ${
                result.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 font-bold text-base">
                  {result.success ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-600" />
                  )}
                  <span>{result.message}</span>
                </div>
                {result.success && (
                  <button
                    onClick={onNavigateCandidates}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                  >
                    <span>View All Ranked Candidates</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {result.errors.length > 0 && (
                <div className="space-y-1 pt-1 font-mono text-[11px]">
                  <span className="font-bold uppercase text-slate-700">Warning Logs:</span>
                  <ul className="list-disc pl-5 text-slate-600 space-y-0.5">
                    {result.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Newly Screened Candidates Spotlight with Animated Radial Match Gauges */}
            {result.success && result.candidates && result.candidates.length > 0 && (
              <div className="bg-[#070D1E] p-6 rounded-2xl border border-blue-900/60 space-y-4 shadow-lg text-white">
                <div className="flex items-center justify-between border-b border-blue-950 pb-3">
                  <div className="flex items-center space-x-2">
                    <Award className="w-4 h-4 text-cyan-400" />
                    <span className="font-mono text-xs uppercase font-bold text-cyan-400 tracking-wider">
                      Newly Screened Candidate Match Spotlight ({result.candidates.length})
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">Click candidate to simulate live match</span>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {result.candidates.map((cand: any, idx: number) => (
                    <div
                      key={idx}
                      className="bg-[#0B1528] border border-blue-900/40 hover:border-cyan-500/50 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-serif font-bold text-base text-white">{cand.name}</h4>
                          <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border ${
                            cand.score_overall >= 85
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50'
                              : cand.score_overall >= 70
                              ? 'bg-cyan-950 text-cyan-300 border-cyan-500/50'
                              : 'bg-amber-950 text-amber-300 border-amber-500/50'
                          }`}>
                            {cand.score_overall >= 85 ? '🔥 Top Match' : cand.score_overall >= 70 ? '✨ Strong Fit' : '⚡ Moderate'}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 font-mono">
                          {cand.email || 'Email extracted'} • {cand.experience_years} Yrs Exp • {cand.education || 'Degree verified'}
                        </div>
                        <div className="flex flex-wrap gap-1 pt-1">
                          {(cand.matched_skills || []).slice(0, 4).map((s: string) => (
                            <span key={s} className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-300">
                              ✓ {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 border-t sm:border-t-0 border-blue-950 pt-3 sm:pt-0">
                        {/* Animated Radial Match Meter */}
                        <AnimatedMatchMeter score={cand.score_overall} size="md" animate={true} theme="dark" />

                        <button
                          type="button"
                          onClick={() => setModalCandidate(cand)}
                          className="px-3 py-2 bg-gradient-to-r from-cyan-600 to-electric hover:from-cyan-500 hover:to-electric-hover text-white rounded-xl font-mono text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-md cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Simulate Match</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* AI Match Simulator Modal */}
      <MatchScoreModal
        candidate={modalCandidate}
        job={activeJob}
        isOpen={!!modalCandidate}
        onClose={() => setModalCandidate(null)}
      />
    </div>
  );
};
