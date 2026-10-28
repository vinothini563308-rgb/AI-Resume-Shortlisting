import React, { useState } from 'react';
import {
  Users,
  Search,
  CheckCircle2,
  XCircle,
  FileCheck2,
  Eye,
  Columns,
  X,
  AlertTriangle,
  BrainCircuit,
  Save,
  Edit3,
  ArrowRight,
  ShieldCheck,
  Activity,
  Check,
  Sparkles
} from 'lucide-react';
import { Candidate, Job } from '../../types';
import { api } from '../../api';
import { AnimatedMatchMeter } from '../AnimatedMatchMeter';
import { MatchScoreModal } from '../MatchScoreModal';

interface CandidatesViewProps {
  candidates: Candidate[];
  job: Job | null;
  onRefresh: () => void;
}

export const CandidatesView: React.FC<CandidatesViewProps> = ({
  candidates,
  job,
  onRefresh,
}) => {
  const [stageFilter, setStageFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'overall' | 'tfidf' | 'skills' | 'exp'>('overall');

  // Candidate Detail Drawer State
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [matchScanCandidate, setMatchScanCandidate] = useState<Candidate | null>(null);
  const [recruiterNotes, setRecruiterNotes] = useState('');
  const [reviewStage, setReviewStage] = useState<Candidate['review_stage']>('New');
  const [savingStatus, setSavingStatus] = useState(false);

  // Edit Candidate Profile Modal State
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editExp, setEditExp] = useState(0);
  const [editEducation, setEditEducation] = useState('');
  const [editSkillsStr, setEditSkillsStr] = useState('');

  // Side-by-Side Comparison State
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [compareIdA, setCompareIdA] = useState<number | null>(null);
  const [compareIdB, setCompareIdB] = useState<number | null>(null);

  const openCandidateDetail = (cand: Candidate) => {
    setSelectedCandidate(cand);
    setRecruiterNotes(cand.recruiter_notes || '');
    setReviewStage(cand.review_stage);
  };

  const handleSaveStatus = async () => {
    if (!selectedCandidate) return;
    try {
      setSavingStatus(true);
      await api.updateCandidateStatus(selectedCandidate.id, {
        review_stage: reviewStage,
        recruiter_notes: recruiterNotes,
        human_decision: reviewStage === 'Shortlisted' ? 'Approved' : reviewStage === 'Rejected' ? 'Declined' : 'Pending',
      });
      setSelectedCandidate((prev) =>
        prev
          ? {
              ...prev,
              review_stage: reviewStage,
              recruiter_notes: recruiterNotes,
              human_decision: reviewStage === 'Shortlisted' ? 'Approved' : reviewStage === 'Rejected' ? 'Declined' : 'Pending',
            }
          : null
      );
      onRefresh();
    } catch (err) {
      console.error('Failed to update candidate status:', err);
    } finally {
      setSavingStatus(false);
    }
  };

  const openEditModal = (cand: Candidate) => {
    setEditingCandidate(cand);
    setEditName(cand.name);
    setEditEmail(cand.email || '');
    setEditPhone(cand.phone || '');
    setEditExp(cand.experience_years);
    setEditEducation(cand.education || '');
    setEditSkillsStr((cand.matched_skills || []).join(', '));
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCandidate) return;
    try {
      const skillsArray = editSkillsStr
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      await api.editCandidate(editingCandidate.id, {
        name: editName,
        email: editEmail,
        phone: editPhone,
        experience_years: editExp,
        education: editEducation,
        detected_skills: skillsArray,
      });

      setEditingCandidate(null);
      if (selectedCandidate && selectedCandidate.id === editingCandidate.id) {
        setSelectedCandidate(null);
      }
      onRefresh();
    } catch (err) {
      console.error('Failed to update candidate profile:', err);
    }
  };

  const openCompareModal = () => {
    if (candidates.length >= 2) {
      setCompareIdA(candidates[0].id);
      setCompareIdB(candidates[1].id);
      setCompareModalOpen(true);
    }
  };

  // Filter & sort logic
  const filtered = candidates
    .filter((c) => {
      if (stageFilter !== 'All' && c.review_stage !== stageFilter) return false;
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        c.name.toLowerCase().includes(term) ||
        (c.email && c.email.toLowerCase().includes(term)) ||
        c.filename.toLowerCase().includes(term) ||
        c.matched_skills.some((s) => s.toLowerCase().includes(term))
      );
    })
    .sort((a, b) => {
      if (sortBy === 'overall') return b.score_overall - a.score_overall;
      if (sortBy === 'tfidf') return b.score_tfidf - a.score_tfidf;
      if (sortBy === 'skills') return b.score_required_skills - a.score_required_skills;
      if (sortBy === 'exp') return b.experience_years - a.experience_years;
      return 0;
    });

  const candidateA = candidates.find((c) => c.id === compareIdA);
  const candidateB = candidates.find((c) => c.id === compareIdB);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-slate-200/80 pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-electric">
              APPLICANT LEADERBOARD & AI RANKINGS
            </span>
            {job && (
              <span className="text-[10px] font-semibold uppercase px-2.5 py-0.5 rounded-full bg-electric/10 text-electric border border-electric/20">
                {job.title}
              </span>
            )}
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-navy-900 mt-1 tracking-tight">
            Candidate Intelligence
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl font-normal">
            Ranked applicant evaluations with multi-factor scoring formulas, rule validations, and auditable proof.
          </p>
        </div>

        {candidates.length >= 2 && (
          <button
            onClick={openCompareModal}
            className="inline-flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider bg-white hover:bg-slate-50 text-navy-900 border border-slate-200 px-4 py-2.5 rounded-xl transition-all shadow-xs self-start sm:self-auto cursor-pointer"
          >
            <Columns className="w-4 h-4 text-electric" />
            <span>Side-by-Side Compare</span>
          </button>
        )}
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative min-w-[260px] flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search candidates by name, email, skill..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-navy-900 text-xs rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-electric/30 placeholder:text-slate-400"
          />
        </div>

        {/* Stage Filter Buttons */}
        <div className="flex items-center space-x-1 text-xs font-medium">
          <span className="text-slate-500 mr-1.5 text-[11px]">Filter:</span>
          {['All', 'New', 'Under Review', 'Shortlisted', 'Rejected'].map((stage) => (
            <button
              key={stage}
              onClick={() => setStageFilter(stage)}
              className={`px-3 py-1.5 text-xs rounded-xl transition-all cursor-pointer ${
                stageFilter === stage
                  ? 'bg-electric text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-navy-900 hover:bg-slate-100'
              }`}
            >
              {stage}
            </button>
          ))}
        </div>

        {/* Sort Selector */}
        <div className="flex items-center space-x-2 text-xs font-medium">
          <span className="text-slate-500 text-[11px]">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-50 border border-slate-200 text-navy-900 text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-electric/30 cursor-pointer"
          >
            <option value="overall">Overall Fit Score</option>
            <option value="tfidf">TF-IDF Similarity</option>
            <option value="skills">Skill Coverage</option>
            <option value="exp">Experience Span</option>
          </select>
        </div>
      </div>

      {/* Candidate Cards Leaderboard */}
      {filtered.length === 0 ? (
        <div className="bg-white p-14 rounded-2xl border border-dashed border-slate-200 text-center space-y-3">
          <Users className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-xl font-serif font-bold text-navy-900">No candidates match criteria</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Adjust search keywords or upload resumes in the Screening tab.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((cand, idx) => {
            return (
              <div
                key={cand.id}
                onClick={() => openCandidateDetail(cand)}
                className="bg-white border border-slate-200/80 hover:border-electric/50 hover:shadow-card-hover p-5 rounded-2xl transition-all duration-300 cursor-pointer flex flex-col lg:flex-row lg:items-center justify-between gap-5 group shadow-xs"
              >
                {/* Left Column: Candidate identity, rank & skills */}
                <div className="space-y-2 flex-1">
                  <div className="flex items-center space-x-3">
                    <span className="w-7 h-7 rounded-lg bg-slate-100 text-navy-900 font-mono font-bold text-xs flex items-center justify-center">
                      0{idx + 1}
                    </span>
                    <h3 className="text-lg font-serif font-bold text-navy-900 group-hover:text-electric transition-colors">
                      {cand.name}
                    </h3>

                    {/* Review Stage Badge */}
                    <span
                      className={`text-[10px] font-semibold uppercase px-2.5 py-0.5 rounded-full border ${
                        cand.review_stage === 'Shortlisted'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : cand.review_stage === 'Under Review'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : cand.review_stage === 'Rejected'
                          ? 'bg-rose-50 text-rose-800 border-rose-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {cand.review_stage}
                    </span>

                    {cand.rule_passed === 0 && (
                      <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full flex items-center space-x-1">
                        <AlertTriangle className="w-3 h-3 text-rose-500" />
                        <span>Rule Flags</span>
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-slate-500 flex flex-wrap gap-x-4 gap-y-1">
                    {cand.email && <span>{cand.email}</span>}
                    <span>{cand.experience_years} Years Experience</span>
                    {cand.education && <span className="truncate max-w-sm text-slate-500">{cand.education}</span>}
                  </div>

                  {/* Skills Palette */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {cand.matched_skills.slice(0, 5).map((skill) => (
                      <span
                        key={skill}
                        className="text-xs px-2.5 py-0.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-medium"
                      >
                        ✓ {skill}
                      </span>
                    ))}
                    {cand.missing_skills.slice(0, 2).map((skill) => (
                      <span
                        key={skill}
                        className="text-xs px-2.5 py-0.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 font-medium"
                      >
                        ✕ {skill}
                      </span>
                    ))}
                    {cand.missing_skills.length > 2 && (
                      <span className="text-[10px] text-slate-400">
                        +{cand.missing_skills.length - 2} more missing
                      </span>
                    )}
                  </div>
                </div>

                {/* Right Column: Score Breakdown Numbers with Animated Radial Match Meter */}
                <div className="flex items-center space-x-3 sm:space-x-5 text-xs border-t lg:border-t-0 border-slate-100 pt-3 lg:pt-0">
                  <div className="text-right hidden sm:block">
                    <span className="text-[10px] uppercase text-slate-500 block font-medium">TF-IDF</span>
                    <span className="text-base font-bold font-mono text-navy-900">{cand.score_tfidf}%</span>
                  </div>

                  <div className="text-right hidden sm:block">
                    <span className="text-[10px] uppercase text-slate-500 block font-medium">Skills</span>
                    <span className="text-base font-bold font-mono text-electric">{cand.score_required_skills}%</span>
                  </div>

                  {/* Animated Circular Gauge & Live Match Scanner Trigger */}
                  <div className="flex items-center space-x-3 pl-2 sm:pl-3 border-l border-slate-200">
                    <AnimatedMatchMeter score={cand.score_overall} size="sm" animate={true} />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMatchScanCandidate(cand);
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-electric/10 hover:bg-electric text-electric hover:text-white font-mono text-[10px] font-bold uppercase tracking-wider flex items-center space-x-1.5 transition-all cursor-pointer shadow-xs hover:shadow-sm"
                      title="Run Live AI Match Scanner Simulation"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Scan Fit</span>
                    </button>
                  </div>

                  <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-electric group-hover:text-white transition-all text-slate-400 shadow-xs">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Candidate Detail Drawer / Modal — Dark Navy Theme */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-[#0B1528] border border-blue-900/60 max-w-3xl w-full p-6 sm:p-8 rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.8)] space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-blue-900/40 pb-5">
              <div className="space-y-1">
                <div className="flex items-center space-x-3">
                  <h2 className="text-2xl font-bold text-white font-display">{selectedCandidate.name}</h2>
                  <span className="px-2.5 py-0.5 rounded-full font-mono text-xs font-bold uppercase bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                    {selectedCandidate.score_overall}% Match
                  </span>
                  <button
                    onClick={() => openEditModal(selectedCandidate)}
                    className="p-1 text-slate-400 hover:text-cyan-400 text-xs font-mono font-medium flex items-center space-x-1 cursor-pointer transition-colors"
                    title="Edit profile to correct extraction"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => setMatchScanCandidate(selectedCandidate)}
                    className="px-3 py-1 bg-gradient-to-r from-cyan-600/30 to-electric/30 hover:from-cyan-600 hover:to-electric text-cyan-300 hover:text-white border border-cyan-500/40 rounded-xl text-xs font-mono font-semibold flex items-center space-x-1.5 cursor-pointer transition-all shadow-xs"
                    title="Run Full Animated Match Simulation"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>⚡ Live Match Scan</span>
                  </button>
                </div>
                <div className="text-xs font-mono text-slate-400 flex flex-wrap gap-x-4">
                  <span>{selectedCandidate.email || 'No email detected'}</span>
                  <span>{selectedCandidate.phone || 'No phone detected'}</span>
                  <span>{selectedCandidate.experience_years} Years Experience</span>
                  <span>File: {selectedCandidate.filename}</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedCandidate(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/50 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Score Breakdown Grid */}
            <div className="bg-[#070D1E] p-5 rounded-2xl border border-blue-900/50 space-y-3 shadow-inner">
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-cyan-400 block">
                Multi-Factor Scoring Breakdown (CO5)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-[#0B1528] p-3 rounded-xl border border-blue-900/40 space-y-0.5">
                  <span className="font-mono text-[10px] uppercase text-slate-400">Required Skills</span>
                  <div className="text-xl font-bold font-mono text-cyan-400">
                    {selectedCandidate.score_required_skills}%
                  </div>
                  <span className="font-mono text-[10px] text-slate-500">Weight: 40%</span>
                </div>

                <div className="bg-[#0B1528] p-3 rounded-xl border border-blue-900/40 space-y-0.5">
                  <span className="font-mono text-[10px] uppercase text-slate-400">Preferred Skills</span>
                  <div className="text-xl font-bold font-mono text-indigo-400">
                    {selectedCandidate.score_preferred_skills}%
                  </div>
                  <span className="font-mono text-[10px] text-slate-500">Weight: 15%</span>
                </div>

                <div className="bg-[#0B1528] p-3 rounded-xl border border-blue-900/40 space-y-0.5">
                  <span className="font-mono text-[10px] uppercase text-slate-400">TF-IDF Cosine</span>
                  <div className="text-xl font-bold font-mono text-emerald-400">
                    {selectedCandidate.score_tfidf}%
                  </div>
                  <span className="font-mono text-[10px] text-slate-500">Weight: 30%</span>
                </div>

                <div className="bg-[#0B1528] p-3 rounded-xl border border-blue-900/40 space-y-0.5">
                  <span className="font-mono text-[10px] uppercase text-slate-400">Experience</span>
                  <div className="text-xl font-bold font-mono text-purple-400">
                    {selectedCandidate.score_experience}%
                  </div>
                  <span className="font-mono text-[10px] text-slate-500">Weight: 15%</span>
                </div>
              </div>
            </div>

            {/* Probabilistic & Rule Reasoning Banner (CO4) */}
            <div className="bg-[#070D1E] p-5 rounded-2xl border border-blue-900/50 space-y-2 shadow-inner">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <div className="flex items-center space-x-2 font-mono uppercase">
                  <BrainCircuit className="w-4 h-4 text-cyan-400" />
                  <span>Bayesian Inference & Rule Checks (CO4)</span>
                </div>
                <span className="font-mono text-xs">
                  Posterior Suitability: <strong className="text-cyan-400">{(selectedCandidate.bayes_prob * 100).toFixed(0)}%</strong> (±{(selectedCandidate.bayes_uncertainty * 100).toFixed(0)}% uncertainty)
                </span>
              </div>

              {selectedCandidate.rule_passed === 1 ? (
                <div className="p-3 bg-emerald-950/60 rounded-xl border border-emerald-500/40 text-xs text-emerald-200 flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Passed all mandatory criteria (Minimum experience span and core competency threshold).</span>
                </div>
              ) : (
                <div className="p-3 bg-rose-950/60 rounded-xl border border-rose-500/40 text-xs space-y-1">
                  <div className="flex items-center space-x-2 font-semibold text-rose-300">
                    <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                    <span>Eligibility Constraint Violations:</span>
                  </div>
                  <ul className="list-disc pl-5 font-mono text-[11px] text-slate-300 space-y-0.5">
                    {selectedCandidate.rule_violations.map((v, i) => (
                      <li key={i}>{v}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Matched vs Missing Skills */}
            <div className="space-y-4">
              <div>
                <span className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                  Verified Skills ({selectedCandidate.matched_skills.length})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCandidate.matched_skills.map((skill) => (
                    <span
                      key={skill}
                      className="text-xs font-mono px-2.5 py-1 rounded-lg bg-emerald-950/70 border border-emerald-500/40 text-emerald-300"
                    >
                      ✓ {skill}
                    </span>
                  ))}
                  {selectedCandidate.matched_skills.length === 0 && (
                    <span className="text-xs text-slate-500 font-mono">None detected</span>
                  )}
                </div>
              </div>

              <div>
                <span className="font-mono text-xs font-semibold uppercase tracking-wider text-rose-400 block mb-2">
                  Missing Requirements ({selectedCandidate.missing_skills.length})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCandidate.missing_skills.map((skill) => (
                    <span
                      key={skill}
                      className="text-xs font-mono px-2.5 py-1 rounded-lg bg-rose-950/70 border border-rose-500/40 text-rose-300"
                    >
                      ✕ {skill}
                    </span>
                  ))}
                  {selectedCandidate.missing_skills.length === 0 && (
                    <span className="text-xs font-mono text-cyan-400 font-semibold">All required skills detected</span>
                  )}
                </div>
              </div>
            </div>

            {/* Verifiable Resume Excerpts */}
            {selectedCandidate.evidence_snippets && selectedCandidate.evidence_snippets.length > 0 && (
              <div className="space-y-2">
                <span className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                  Verbatim Resume Evidence Excerpts
                </span>
                <div className="space-y-2">
                  {selectedCandidate.evidence_snippets.map((ev, i) => (
                    <div key={i} className="bg-[#070D1E] border border-blue-900/50 p-4 rounded-xl space-y-1">
                      <span className="font-mono text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/60 text-cyan-300">
                        {ev.skill}
                      </span>
                      <p className="text-sm italic text-slate-200 leading-relaxed pt-1">
                        "{ev.snippet}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Shortlist Decision & Notes Panel */}
            <div className="bg-[#070D1E] p-5 rounded-2xl border border-blue-900/50 space-y-4">
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-300 block border-b border-blue-900/40 pb-2">
                Recruiter Decision & Pipeline Status
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono uppercase text-slate-400 block mb-1">
                    Review Stage:
                  </label>
                  <select
                    value={reviewStage}
                    onChange={(e) => setReviewStage(e.target.value as any)}
                    className="w-full bg-[#0B1528] border border-blue-900/60 rounded-xl p-2.5 text-xs text-slate-200 cursor-pointer"
                  >
                    <option value="New">New</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Shortlisted">Shortlisted (Approved)</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-mono uppercase text-slate-400 block mb-1">
                    Evaluation Notes:
                  </label>
                  <textarea
                    rows={2}
                    value={recruiterNotes}
                    onChange={(e) => setRecruiterNotes(e.target.value)}
                    placeholder="Document interview rationale or reviewer feedback..."
                    className="w-full bg-[#0B1528] border border-blue-900/60 rounded-xl p-2.5 text-xs text-slate-200 placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSaveStatus}
                  disabled={savingStatus}
                  className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 px-5 py-2.5 rounded-xl shadow-md shadow-cyan-500/25 transition-all cursor-pointer font-mono font-extrabold"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingStatus ? 'Saving...' : 'Save Decision'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Candidate Profile Modal */}
      {editingCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-[#0B1528] border border-blue-900/60 max-w-lg w-full p-6 sm:p-7 rounded-3xl shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-blue-900/40 pb-3">
              <h3 className="text-xl font-bold text-white font-display">Edit Candidate Profile</h3>
              <button onClick={() => setEditingCandidate(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs text-slate-300">
              <div>
                <label className="font-mono uppercase text-[11px] text-slate-400">Candidate Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-[#070D1E] border border-blue-900/60 rounded-xl p-2.5 mt-1 text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-mono uppercase text-[11px] text-slate-400">Email</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full bg-[#070D1E] border border-blue-900/60 rounded-xl p-2.5 mt-1 text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="font-mono uppercase text-[11px] text-slate-400">Phone</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full bg-[#070D1E] border border-blue-900/60 rounded-xl p-2.5 mt-1 text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-mono uppercase text-[11px] text-slate-400">Experience (Years)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={editExp}
                    onChange={(e) => setEditExp(Number(e.target.value))}
                    className="w-full bg-[#070D1E] border border-blue-900/60 rounded-xl p-2.5 mt-1 text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="font-mono uppercase text-[11px] text-slate-400">Education</label>
                  <input
                    type="text"
                    value={editEducation}
                    onChange={(e) => setEditEducation(e.target.value)}
                    className="w-full bg-[#070D1E] border border-blue-900/60 rounded-xl p-2.5 mt-1 text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-mono uppercase text-[11px] text-slate-400">Detected Skills (Comma-separated)</label>
                <input
                  type="text"
                  value={editSkillsStr}
                  onChange={(e) => setEditSkillsStr(e.target.value)}
                  className="w-full bg-[#070D1E] border border-blue-900/60 rounded-xl p-2.5 mt-1 font-mono text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-blue-900/40">
                <button
                  type="button"
                  onClick={() => setEditingCandidate(null)}
                  className="px-4 py-2 border border-blue-900/60 rounded-xl bg-[#070D1E] text-slate-300 text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold rounded-xl text-xs shadow-md shadow-cyan-500/20 cursor-pointer"
                >
                  Save & Recalibrate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Side-by-Side Candidate Comparison Modal — Dark Navy Theme */}
      {compareModalOpen && candidateA && candidateB && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-[#0B1528] border border-blue-900/60 max-w-4xl w-full p-6 sm:p-8 rounded-3xl shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-blue-900/40 pb-4">
              <div className="flex items-center space-x-2">
                <Columns className="w-5 h-5 text-cyan-400" />
                <h3 className="text-2xl font-bold text-white font-display">Side-by-Side Comparison</h3>
              </div>
              <button onClick={() => setCompareModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Selectors */}
            <div className="grid grid-cols-2 gap-6 bg-[#070D1E] p-4 rounded-2xl border border-blue-900/50 shadow-inner">
              <div>
                <label className="font-mono text-xs uppercase text-slate-400 block mb-1">
                  Candidate Profile A:
                </label>
                <select
                  value={compareIdA || ''}
                  onChange={(e) => setCompareIdA(Number(e.target.value))}
                  className="w-full bg-[#0B1528] border border-blue-900/60 rounded-xl p-2 text-xs text-slate-200 cursor-pointer"
                >
                  {candidates.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.score_overall}%)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-mono text-xs uppercase text-slate-400 block mb-1">
                  Candidate Profile B:
                </label>
                <select
                  value={compareIdB || ''}
                  onChange={(e) => setCompareIdB(Number(e.target.value))}
                  className="w-full bg-[#0B1528] border border-blue-900/60 rounded-xl p-2 text-xs text-slate-200 cursor-pointer"
                >
                  {candidates.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.score_overall}%)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Direct Comparison Columns */}
            <div className="grid grid-cols-2 gap-8 text-xs divide-x divide-blue-900/40">
              {/* Candidate A Column */}
              <div className="space-y-4 pr-4">
                <div className="flex justify-between items-baseline border-b border-blue-900/30 pb-2">
                  <h4 className="text-xl font-bold text-white font-display">{candidateA.name}</h4>
                  <span className="text-2xl font-extrabold font-mono text-cyan-400">
                    {candidateA.score_overall}%
                  </span>
                </div>

                <div className="space-y-2 font-mono">
                  <div className="flex justify-between text-slate-300">
                    <span>Required Skills Score:</span>
                    <strong className="text-cyan-400">{candidateA.score_required_skills}%</strong>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>TF-IDF Text Similarity:</span>
                    <strong className="text-blue-400">{candidateA.score_tfidf}%</strong>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Experience Span:</span>
                    <strong className="text-purple-400">{candidateA.experience_years} Years</strong>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Bayesian Posterior:</span>
                    <strong className="text-emerald-400">{(candidateA.bayes_prob * 100).toFixed(0)}%</strong>
                  </div>
                </div>

                <div>
                  <span className="font-mono uppercase text-xs text-slate-400 block mb-1.5">
                    Verified Competencies:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {candidateA.matched_skills.map((s) => (
                      <span key={s} className="bg-emerald-950/70 text-emerald-300 px-2 py-0.5 rounded-lg border border-emerald-500/40 text-[11px] font-mono">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="font-mono uppercase text-xs text-rose-400 block mb-1.5">
                    Missing Requirements:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {candidateA.missing_skills.map((s) => (
                      <span key={s} className="bg-rose-950/70 text-rose-300 px-2 py-0.5 rounded-lg border border-rose-500/40 text-[11px] font-mono">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Candidate B Column */}
              <div className="space-y-4 pl-6">
                <div className="flex justify-between items-baseline border-b border-blue-900/30 pb-2">
                  <h4 className="text-xl font-bold text-white font-display">{candidateB.name}</h4>
                  <span className="text-2xl font-extrabold font-mono text-indigo-400">
                    {candidateB.score_overall}%
                  </span>
                </div>

                <div className="space-y-2 font-mono">
                  <div className="flex justify-between text-slate-300">
                    <span>Required Skills Score:</span>
                    <strong className="text-cyan-400">{candidateB.score_required_skills}%</strong>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>TF-IDF Text Similarity:</span>
                    <strong className="text-blue-400">{candidateB.score_tfidf}%</strong>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Experience Span:</span>
                    <strong className="text-purple-400">{candidateB.experience_years} Years</strong>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Bayesian Posterior:</span>
                    <strong className="text-emerald-400">{(candidateB.bayes_prob * 100).toFixed(0)}%</strong>
                  </div>
                </div>

                <div>
                  <span className="font-mono uppercase text-xs text-slate-400 block mb-1.5">
                    Verified Competencies:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {candidateB.matched_skills.map((s) => (
                      <span key={s} className="bg-emerald-950/70 text-emerald-300 px-2 py-0.5 rounded-lg border border-emerald-500/40 text-[11px] font-mono">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="font-mono uppercase text-xs text-rose-400 block mb-1.5">
                    Missing Requirements:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {candidateB.missing_skills.map((s) => (
                      <span key={s} className="bg-rose-950/70 text-rose-300 px-2 py-0.5 rounded-lg border border-rose-500/40 text-[11px] font-mono">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* AI Match Score Simulator Modal */}
      <MatchScoreModal
        candidate={matchScanCandidate}
        job={job}
        isOpen={!!matchScanCandidate}
        onClose={() => setMatchScanCandidate(null)}
        onUpdateStatus={async (candId, newStage) => {
          await api.updateCandidateStatus(candId, {
            review_stage: newStage,
            recruiter_notes: '',
            human_decision: newStage === 'Shortlisted' ? 'Approved' : 'Pending',
          });
          onRefresh();
        }}
      />
    </div>
  );
};
