import React, { useState } from 'react';
import {
  Download,
  MessageSquare,
  CheckCircle2,
  Clock,
  XCircle,
  HelpCircle,
  ChevronRight,
  GripVertical,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Candidate, Job } from '../../types';
import { api } from '../../api';
import { AnimatedMatchMeter } from '../AnimatedMatchMeter';
import { MatchScoreModal } from '../MatchScoreModal';

interface ShortlistViewProps {
  candidates: Candidate[];
  job: Job | null;
  onRefresh: () => void;
}

export const ShortlistView: React.FC<ShortlistViewProps> = ({
  candidates,
  job,
  onRefresh,
}) => {
  const [editingNotesId, setEditingNotesId] = useState<number | null>(null);
  const [noteText, setNoteText] = useState('');
  const [draggingCardId, setDraggingCardId] = useState<number | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<Candidate['review_stage'] | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [modalCandidate, setModalCandidate] = useState<Candidate | null>(null);

  const stages: Candidate['review_stage'][] = ['New', 'Under Review', 'Shortlisted', 'Rejected'];

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleStageChange = async (candidateId: number, newStage: Candidate['review_stage']) => {
    try {
      const cand = candidates.find((c) => c.id === candidateId);
      await api.updateCandidateStatus(candidateId, {
        review_stage: newStage,
        human_decision: newStage === 'Shortlisted' ? 'Approved' : newStage === 'Rejected' ? 'Declined' : 'Pending',
      });
      triggerToast(`Moved ${cand?.name || 'candidate'} to ${newStage}`);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to update stage');
    }
  };

  const handleSaveNote = async (candidateId: number, currentStage: string) => {
    try {
      await api.updateCandidateStatus(candidateId, {
        review_stage: currentStage,
        recruiter_notes: noteText,
      });
      setEditingNotesId(null);
      triggerToast('Evaluation note saved');
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to save notes');
    }
  };

  const handleExportCSV = () => {
    if (candidates.length === 0) {
      alert('No candidates available to export.');
      return;
    }

    const headers = [
      'Rank',
      'Name',
      'Email',
      'Phone',
      'Review Stage',
      'Overall Match Score (%)',
      'TF-IDF Text Similarity (%)',
      'Required Skills Match (%)',
      'Experience (Years)',
      'Matched Skills',
      'Missing Skills',
      'Recruiter Evaluation Notes',
      'File Name',
    ];

    const rows = candidates.map((c, i) => [
      i + 1,
      `"${c.name}"`,
      `"${c.email || ''}"`,
      `"${c.phone || ''}"`,
      `"${c.review_stage}"`,
      c.score_overall,
      c.score_tfidf,
      c.score_required_skills,
      c.experience_years,
      `"${c.matched_skills.join(', ')}"`,
      `"${c.missing_skills.join(', ')}"`,
      `"${(c.recruiter_notes || '').replace(/"/g, '""')}"`,
      `"${c.filename}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `TalentLens_Shortlist_${job?.title || 'Candidates'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-navy-900 border border-electric text-white px-4 py-2.5 rounded-xl shadow-float text-xs font-semibold flex items-center space-x-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-electric" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-slate-200/80 pb-6">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-electric">
            INTERACTIVE DRAG-AND-DROP PIPELINE
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-navy-900 mt-1 tracking-tight">
            Shortlist Management
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl font-normal">
            Drag candidate cards across columns to update review status with automatic audit logging.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider bg-electric hover:bg-electric-hover text-white px-5 py-2.5 rounded-xl shadow-sm transition-all self-start sm:self-auto cursor-pointer"
        >
          <Download className="w-4 h-4 text-white" />
          <span>Export Finalists to CSV</span>
        </button>
      </div>

      {/* Kanban Board Columns — Clean White & Pastel Theme with Fluid HTML5 Drag & Drop */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-start">
        {stages.map((stage) => {
          const stageCandidates = candidates.filter((c) => c.review_stage === stage);
          const isOverThisColumn = dragOverColumn === stage;

          const headerTheme =
            stage === 'Shortlisted'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : stage === 'Under Review'
              ? 'bg-amber-50 text-amber-800 border-amber-200'
              : stage === 'Rejected'
              ? 'bg-rose-50 text-rose-800 border-rose-200'
              : 'bg-[#EFF2FC] text-navy-900 border-slate-200';

          return (
            <div
              key={stage}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
              }}
              onDragEnter={() => setDragOverColumn(stage)}
              onDragLeave={(e) => {
                if (e.currentTarget.contains(e.relatedTarget as Node)) return;
                setDragOverColumn(null);
              }}
              onDrop={(e) => {
                e.preventDefault();
                const candId = Number(e.dataTransfer.getData('text/plain'));
                if (candId) {
                  handleStageChange(candId, stage);
                }
                setDragOverColumn(null);
              }}
              className={`rounded-2xl p-4 space-y-4 min-h-[560px] transition-all duration-300 ${
                isOverThisColumn
                  ? 'bg-[#F3F0FF] border-2 border-dashed border-electric shadow-float scale-[1.01]'
                  : 'bg-white border border-slate-200/80 shadow-xs'
              }`}
            >
              {/* Column Header */}
              <div
                className={`p-3 rounded-xl border ${headerTheme} flex items-center justify-between font-bold text-xs uppercase tracking-wider`}
              >
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-electric"></span>
                  <span>{stage}</span>
                </div>
                <span className="px-2 py-0.5 bg-white text-navy-900 rounded-lg border border-slate-200 text-[11px] font-mono">
                  {stageCandidates.length}
                </span>
              </div>

              {/* Drag indicator when hovering with item */}
              {isOverThisColumn && (
                <div className="border border-dashed border-electric bg-white p-3 rounded-xl text-center text-xs font-semibold text-electric animate-pulse">
                  Drop candidate here to move to {stage}
                </div>
              )}

              {stageCandidates.length === 0 ? (
                <div className="py-24 text-center text-xs text-slate-400">
                  Drag candidates here
                </div>
              ) : (
                <div className="space-y-3">
                  {stageCandidates.map((cand) => {
                    const isBeingDragged = draggingCardId === cand.id;
                    return (
                      <div
                        key={cand.id}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData('text/plain', cand.id.toString());
                          setDraggingCardId(cand.id);
                        }}
                        onDragEnd={() => setDraggingCardId(null)}
                        className={`bg-[#FAF8F3] border p-4 rounded-xl space-y-3 transition-all duration-200 cursor-grab active:cursor-grabbing hover:shadow-md hover:-translate-y-0.5 ${
                          isBeingDragged
                            ? 'opacity-40 border-electric scale-95 shadow-float'
                            : 'border-slate-200/70 hover:border-electric/50'
                        }`}
                      >
                        <div className="flex items-start justify-between border-b border-slate-200/60 pb-2.5">
                          <div className="flex items-start space-x-2">
                            <GripVertical className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0 cursor-grab" />
                            <div>
                              <h4 className="text-sm font-serif font-bold text-navy-900 tracking-tight">{cand.name}</h4>
                              <span className="text-[10px] text-slate-500 uppercase">
                                {cand.experience_years} Yrs Exp
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-1.5">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setModalCandidate(cand);
                              }}
                              className="p-1 rounded-lg hover:bg-electric/10 text-electric transition-colors cursor-pointer"
                              title="Simulate AI Match Score"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                            </button>
                            <AnimatedMatchMeter score={cand.score_overall} size="sm" animate={true} />
                          </div>
                        </div>

                        {/* Skills Chips */}
                        <div className="flex flex-wrap gap-1">
                          {cand.matched_skills.slice(0, 3).map((s) => (
                            <span
                              key={s}
                              className="text-[10px] px-2 py-0.5 rounded-md bg-[#EFF2FC] border border-slate-200 text-[#2E4374] font-medium"
                            >
                              {s}
                            </span>
                          ))}
                        </div>

                        {/* Recruiter Evaluation Notes */}
                        <div className="pt-2 border-t border-slate-200/60 space-y-1">
                          {editingNotesId === cand.id ? (
                            <div className="space-y-2">
                              <textarea
                                rows={2}
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value)}
                                placeholder="Record recruiter evaluation..."
                                className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg text-navy-900 focus:outline-none focus:ring-1 focus:ring-electric"
                              />
                              <div className="flex justify-end space-x-1 text-[10px]">
                                <button
                                  onClick={() => setEditingNotesId(null)}
                                  className="px-2 py-1 text-slate-500 hover:text-navy-900"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleSaveNote(cand.id, cand.review_stage)}
                                  className="px-2.5 py-1 bg-electric hover:bg-electric-hover text-white font-semibold rounded shadow-xs"
                                >
                                  Save Note
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div
                              onClick={() => {
                                setEditingNotesId(cand.id);
                                setNoteText(cand.recruiter_notes || '');
                              }}
                              className="cursor-pointer group flex items-start space-x-1.5 text-xs text-slate-500 hover:text-electric transition-colors"
                            >
                              <MessageSquare className="w-3.5 h-3.5 mt-0.5 text-electric flex-shrink-0" />
                              <p className="italic text-xs leading-snug line-clamp-2">
                                {cand.recruiter_notes
                                  ? `"${cand.recruiter_notes}"`
                                  : '+ Add recruiter evaluation remark...'}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Quick Dropdown Move Option (Alternative to Drag) */}
                        <div className="pt-2">
                          <label className="text-[10px] uppercase text-slate-500 block mb-0.5 font-semibold">
                            Move Column:
                          </label>
                          <select
                            value={cand.review_stage}
                            onChange={(e) => handleStageChange(cand.id, e.target.value as any)}
                            className="w-full bg-white border border-slate-200 text-navy-900 text-xs rounded-lg p-1.5 focus:outline-none cursor-pointer"
                          >
                            {stages.map((stg) => (
                              <option key={stg} value={stg} className="bg-white text-navy-900">
                                {stg}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* AI Match Simulator Modal */}
      <MatchScoreModal
        candidate={modalCandidate}
        job={job}
        isOpen={!!modalCandidate}
        onClose={() => setModalCandidate(null)}
        onUpdateStatus={(candId, newStage) => handleStageChange(candId, newStage)}
      />
    </div>
  );
};
