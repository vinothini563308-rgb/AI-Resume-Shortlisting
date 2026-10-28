import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  XCircle,
  BrainCircuit,
  FileText,
  Briefcase,
  GraduationCap,
  Quote,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Candidate, Job } from '../types';
import { AnimatedMatchMeter } from './AnimatedMatchMeter';

interface MatchScoreModalProps {
  candidate: Candidate | null;
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus?: (candidateId: number, newStage: Candidate['review_stage']) => void;
}

export const MatchScoreModal: React.FC<MatchScoreModalProps> = ({
  candidate,
  job,
  isOpen,
  onClose,
  onUpdateStatus,
}) => {
  const [scanStep, setScanStep] = useState<number>(0);
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [animKey, setAnimKey] = useState<number>(0);

  const steps = [
    { label: 'Token Ingestion & OCR Structuring', delay: 350 },
    { label: 'Skill Vector Parsing & Bipartite Mapping', delay: 400 },
    { label: 'TF-IDF Sublinear Cosine Similarity Matrix', delay: 450 },
    { label: 'Bayesian Posterior Inference P(Fit|Evidence)', delay: 450 },
    { label: 'Multi-Criteria Decision Synthesis Complete', delay: 200 },
  ];

  const triggerScan = () => {
    setIsScanning(true);
    setScanStep(0);
    setAnimKey((prev) => prev + 1);

    let current = 0;
    const runNextStep = () => {
      if (current < steps.length - 1) {
        current++;
        setScanStep(current);
        setTimeout(runNextStep, steps[current].delay);
      } else {
        setIsScanning(false);
      }
    };

    setTimeout(runNextStep, steps[0].delay);
  };

  useEffect(() => {
    if (isOpen && candidate) {
      triggerScan();
    }
  }, [isOpen, candidate?.id]);

  if (!isOpen || !candidate) return null;

  // Determine fit tier
  const score = candidate.score_overall;
  const getTier = (s: number) => {
    if (s >= 85) return { label: '🔥 EXCEPTIONAL FIT', desc: 'Top tier candidate exceeding core criteria', color: 'text-emerald-400 bg-emerald-950/80 border-emerald-500/50' };
    if (s >= 70) return { label: '✨ STRONG MATCH', desc: 'Solid technical background aligned with role requirements', color: 'text-cyan-300 bg-cyan-950/80 border-cyan-500/50' };
    if (s >= 50) return { label: '⚡ MODERATE FIT', desc: 'Matches basic criteria but exhibits skill or experience gaps', color: 'text-amber-300 bg-amber-950/80 border-amber-500/50' };
    return { label: '⚠️ LOW CORRELATION', desc: 'Substantial mismatch with primary job requirements', color: 'text-rose-300 bg-rose-950/80 border-rose-500/50' };
  };

  const tier = getTier(score);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto animate-fade-in">
      <div className="bg-[#080E1E] border border-blue-900/60 max-w-3xl w-full rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.9)] overflow-hidden my-6 border-slate-700/60">
        {/* Header Bar */}
        <div className="bg-[#0B1528] px-6 py-4 border-b border-blue-900/50 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-electric/20 border border-electric/40 flex items-center justify-center text-cyan-400">
              <Sparkles className="w-4 h-4 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-[10px] uppercase tracking-wider text-cyan-400 font-bold">
                  AI MATCH INTELLIGENCE ANALYZER
                </span>
                <span className="text-[10px] text-slate-500 font-mono">• CO1–CO5 Engine</span>
              </div>
              <h2 className="text-lg font-bold text-white font-display flex items-center space-x-2">
                <span>{candidate.name}</span>
                <span className="text-slate-400 text-xs font-normal">→ {job?.title || 'Target Job'}</span>
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={triggerScan}
              disabled={isScanning}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 flex items-center space-x-1.5 cursor-pointer transition-all disabled:opacity-50"
              title="Re-run animation scan"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
              <span>Re-Scan</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Step Progress Banner */}
        <div className="bg-[#050A16] px-6 py-2.5 border-b border-blue-950 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2 truncate">
            {isScanning ? (
              <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            )}
            <span className="font-mono text-slate-300 text-[11px] truncate">
              {isScanning ? `Analyzing: ${steps[scanStep].label}` : 'AI Evaluation Complete — All Percepts Verified'}
            </span>
          </div>
          <div className="flex items-center space-x-1 pl-2">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i < scanStep
                    ? 'w-4 bg-emerald-400'
                    : i === scanStep
                    ? 'w-6 bg-cyan-400 animate-pulse'
                    : 'w-2 bg-slate-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Main Visual: Central Animated Radial Gauge & Tier Banner */}
          <div className="bg-radial from-blue-950/40 via-[#070D1E] to-[#070D1E] border border-blue-900/50 p-6 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-inner relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Left: Large Animated Match Meter */}
            <div className="flex flex-col items-center flex-shrink-0">
              <AnimatedMatchMeter
                key={animKey}
                score={candidate.score_overall}
                size="lg"
                animate={true}
                theme="dark"
              />
            </div>

            {/* Right: Tier Badge, Summary & Recruiter Verdict */}
            <div className="flex-1 space-y-3 text-center sm:text-left">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider border shadow-xs" style={{}} >
                <span className={`px-2.5 py-0.5 rounded-full border text-[11px] ${tier.color}`}>
                  {tier.label}
                </span>
                <span className="text-slate-400 text-[11px] font-sans font-medium">{tier.desc}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
                <div className="bg-[#0B1528] p-2.5 rounded-xl border border-blue-900/40">
                  <span className="text-[10px] text-slate-400 uppercase block">Bayesian Probability</span>
                  <span className="text-base font-bold text-cyan-400">
                    {(candidate.bayes_prob * 100).toFixed(0)}%
                  </span>
                  <span className="text-[9px] text-slate-500 block">±{(candidate.bayes_uncertainty * 100).toFixed(0)}% uncertainty</span>
                </div>

                <div className="bg-[#0B1528] p-2.5 rounded-xl border border-blue-900/40">
                  <span className="text-[10px] text-slate-400 uppercase block">Rule Constraints</span>
                  <span className={`text-base font-bold ${candidate.rule_passed ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {candidate.rule_passed ? '✓ PASSED' : '✕ FLAGGED'}
                  </span>
                  <span className="text-[9px] text-slate-500 block">{candidate.rule_violations.length} violations</span>
                </div>
              </div>

              <div className="text-xs text-slate-300 flex items-center justify-center sm:justify-start space-x-4 pt-1 font-mono text-[11px]">
                <span className="flex items-center space-x-1">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                  <span>{candidate.experience_years} Yrs Exp</span>
                </span>
                <span className="flex items-center space-x-1 truncate max-w-[220px]">
                  <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{candidate.education || 'Degree on file'}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Sub-Criteria Real-Time Progress Bars */}
          <div className="bg-[#070D1E] p-5 rounded-2xl border border-blue-900/50 space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono uppercase font-semibold text-cyan-400 tracking-wider flex items-center space-x-1.5">
                <Layers className="w-3.5 h-3.5" />
                <span>Multi-Criteria Factor Breakdown</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Weighted Multi-Objective Optimization</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              {/* Required Skills */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-300">Required Skills Alignment</span>
                  <span className="text-cyan-400 font-bold">{candidate.score_required_skills}% (Weight: 40%)</span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-cyan-400 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${candidate.score_required_skills}%` }}
                  />
                </div>
              </div>

              {/* Preferred Skills */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-300">Preferred Skills Bonus</span>
                  <span className="text-indigo-400 font-bold">{candidate.score_preferred_skills}% (Weight: 15%)</span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-indigo-400 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${candidate.score_preferred_skills}%` }}
                  />
                </div>
              </div>

              {/* TF-IDF Cosine Similarity */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-300">TF-IDF Vector Cosine Sim</span>
                  <span className="text-emerald-400 font-bold">{candidate.score_tfidf}% (Weight: 30%)</span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-emerald-400 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${candidate.score_tfidf}%` }}
                  />
                </div>
              </div>

              {/* Experience Adequacy */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-300">Experience Adequacy</span>
                  <span className="text-purple-400 font-bold">{candidate.score_experience}% (Weight: 15%)</span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-purple-400 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${candidate.score_experience}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Skill Entanglement Matrix */}
          <div className="bg-[#070D1E] p-5 rounded-2xl border border-blue-900/50 space-y-3">
            <span className="font-mono text-xs uppercase font-semibold text-slate-300 tracking-wider block">
              Skill Alignment Verification
            </span>

            <div className="flex flex-wrap gap-1.5">
              {candidate.matched_skills.map((skill) => (
                <span
                  key={skill}
                  className="px-2.5 py-1 rounded-lg bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-medium flex items-center space-x-1"
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>{skill}</span>
                </span>
              ))}

              {candidate.preferred_matched_skills.map((skill) => (
                <span
                  key={skill}
                  className="px-2.5 py-1 rounded-lg bg-indigo-950/70 border border-indigo-500/40 text-indigo-300 text-xs font-mono font-medium flex items-center space-x-1"
                >
                  <span>★</span>
                  <span>{skill}</span>
                </span>
              ))}

              {candidate.missing_skills.map((skill) => (
                <span
                  key={skill}
                  className="px-2.5 py-1 rounded-lg bg-rose-950/70 border border-rose-500/40 text-rose-300 text-xs font-mono font-medium flex items-center space-x-1"
                >
                  <XCircle className="w-3 h-3 text-rose-400" />
                  <span>{skill}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Verifiable Resume Evidence Snippet */}
          {candidate.evidence_snippets && candidate.evidence_snippets.length > 0 && (
            <div className="bg-[#070D1E] p-5 rounded-2xl border border-blue-900/50 space-y-2">
              <div className="flex items-center space-x-2 text-xs font-mono uppercase text-slate-300 font-semibold">
                <Quote className="w-3.5 h-3.5 text-cyan-400" />
                <span>Extracted Resume Evidence Quote (Verifiable Provenance)</span>
              </div>
              <div className="p-3 bg-[#0B1528] rounded-xl border border-blue-900/40 text-xs text-slate-300 font-sans italic leading-relaxed">
                "{candidate.evidence_snippets[0].snippet}"
              </div>
              <div className="text-[10px] font-mono text-cyan-400">
                Source Clause Match: <strong className="uppercase">{candidate.evidence_snippets[0].skill}</strong>
              </div>
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="bg-[#0B1528] px-6 py-4 border-t border-blue-900/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
            <span>Status:</span>
            <span className="font-bold text-white uppercase">{candidate.review_stage}</span>
          </div>

          <div className="flex items-center space-x-2.5 w-full sm:w-auto">
            {onUpdateStatus && (
              <>
                <button
                  onClick={() => {
                    onUpdateStatus(candidate.id, 'Shortlisted');
                    onClose();
                  }}
                  className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer shadow-md"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Approve & Shortlist</span>
                </button>
                <button
                  onClick={() => {
                    onUpdateStatus(candidate.id, 'Under Review');
                    onClose();
                  }}
                  className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition-colors cursor-pointer"
                >
                  <span>Mark In Review</span>
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
