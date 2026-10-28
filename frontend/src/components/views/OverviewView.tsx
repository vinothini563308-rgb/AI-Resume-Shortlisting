import React from 'react';
import {
  Briefcase,
  FileText,
  Clock,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  Plus,
  UploadCloud,
  Network,
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';
import { OverviewStats, Job } from '../../types';
import { WorkspaceTab } from '../WorkspaceHeader';

interface OverviewViewProps {
  stats: OverviewStats | null;
  jobs: Job[];
  onNavigateTab: (tab: WorkspaceTab) => void;
  onSelectJob: (jobId: number) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  stats,
  jobs,
  onNavigateTab,
  onSelectJob,
}) => {
  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-slate-200/80 pb-6">
        <div>
          <div className="inline-flex items-center space-x-2 text-xs font-semibold uppercase tracking-widest text-electric">
            <Activity className="w-3.5 h-3.5" />
            <span>EXECUTIVE TELEMETRY DASHBOARD</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-navy-900 mt-1 tracking-tight">
            Recruitment Intelligence Platform
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl font-normal">
            Real-time screening telemetry, explainable multi-factor rankings, and recruiter shortlist decisions.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => onNavigateTab('screening')}
            className="inline-flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider bg-electric hover:bg-electric-hover text-white px-5 py-2.5 rounded-xl shadow-sm transition-all cursor-pointer"
          >
            <UploadCloud className="w-4 h-4 text-white" />
            <span>Screen Resumes</span>
          </button>
          <button
            onClick={() => onNavigateTab('jobs')}
            className="inline-flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider bg-white hover:bg-slate-50 text-navy-900 border border-slate-200 px-4 py-2.5 rounded-xl transition-all shadow-xs"
          >
            <Plus className="w-4 h-4 text-electric" />
            <span>New Requisition</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid — Clean White Cards with Pastel Accents */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Active Jobs */}
        <div className="bg-white border border-slate-200/80 hover:shadow-card-hover rounded-2xl p-5 shadow-xs transition-all duration-300">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Active Roles
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-electric">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-navy-900 font-mono mt-3">{stats?.total_jobs ?? 0}</div>
          <p className="text-[11px] text-slate-500 font-medium mt-1">Open Requisitions</p>
        </div>

        {/* Card 2: Resumes Screened */}
        <div className="bg-white border border-slate-200/80 hover:shadow-card-hover rounded-2xl p-5 shadow-xs transition-all duration-300">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Processed
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-navy-900 font-mono mt-3">{stats?.total_resumes ?? 0}</div>
          <p className="text-[11px] text-slate-500 font-medium mt-1">Normalized Resumes</p>
        </div>

        {/* Card 3: Awaiting Review */}
        <div className="bg-white border border-slate-200/80 hover:shadow-card-hover rounded-2xl p-5 shadow-xs transition-all duration-300">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Needs Review
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-amber-600 font-mono mt-3">{stats?.awaiting_review ?? 0}</div>
          <p className="text-[11px] text-slate-500 font-medium mt-1">Awaiting Recruiter Sign-Off</p>
        </div>

        {/* Card 4: Shortlisted */}
        <div className="bg-white border border-slate-200/80 hover:shadow-card-hover rounded-2xl p-5 shadow-xs transition-all duration-300">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Shortlisted
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 font-mono mt-3">{stats?.shortlisted_count ?? 0}</div>
          <p className="text-[11px] text-slate-500 font-medium mt-1">Qualified Finalists</p>
        </div>

        {/* Card 5: Average Similarity */}
        <div className="bg-white border border-slate-200/80 hover:shadow-card-hover rounded-2xl p-5 shadow-xs transition-all duration-300">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Avg Similarity
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-electric">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-electric font-mono mt-3">{stats?.avg_match_score ?? 0}%</div>
          <p className="text-[11px] text-slate-500 font-medium mt-1">Across Active Pool</p>
        </div>
      </div>

      {/* Main Grid: Active Roles & Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Active Roles List */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
            <h2 className="text-xl font-serif font-bold text-navy-900">Active Requisitions</h2>
            <button
              onClick={() => onNavigateTab('jobs')}
              className="text-xs font-semibold text-electric hover:underline flex items-center space-x-1"
            >
              <span>View All ({jobs.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {jobs.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-200 text-center space-y-3">
              <Briefcase className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-base text-slate-700 font-medium">No active job requisitions</p>
              <button
                onClick={() => onNavigateTab('jobs')}
                className="text-xs font-semibold uppercase bg-electric hover:bg-electric-hover text-white px-4 py-2.5 rounded-xl shadow-xs"
              >
                Create First Requisition
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  onClick={() => {
                    onSelectJob(job.id);
                    onNavigateTab('candidates');
                  }}
                  className="bg-white border border-slate-200/80 hover:border-electric/50 hover:shadow-card-hover p-5 rounded-2xl transition-all duration-300 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group shadow-xs"
                >
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2.5">
                      <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-electric/10 text-electric">
                        {job.department}
                      </span>
                      <h3 className="text-lg font-serif font-bold text-navy-900 group-hover:text-electric transition-colors">
                        {job.title}
                      </h3>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {job.required_skills.slice(0, 5).map((s) => (
                        <span
                          key={s}
                          className="text-[11px] px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-medium"
                        >
                          {s}
                        </span>
                      ))}
                      {job.required_skills.length > 5 && (
                        <span className="text-[11px] text-slate-400 pt-0.5">
                          +{job.required_skills.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-6 text-xs border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0">
                    <div className="text-right">
                      <span className="text-xl font-bold font-mono text-navy-900 block">
                        {job.candidate_count ?? 0}
                      </span>
                      <span className="text-[10px] uppercase text-slate-500 font-medium">Applicants</span>
                    </div>

                    <div className="text-right">
                      <span className="text-xl font-bold font-mono text-electric block">
                        {job.shortlisted_count ?? 0}
                      </span>
                      <span className="text-[10px] uppercase text-slate-500 font-medium">Shortlisted</span>
                    </div>

                    <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-electric group-hover:text-white transition-all text-slate-500 shadow-xs">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: AI Graph Banner & Audit Feed */}
        <div className="lg:col-span-4 space-y-6">
          {/* AI Graph Banner */}
          <div className="bg-gradient-to-br from-[#4C5BFF] to-[#303ECD] p-6 rounded-3xl text-white shadow-card space-y-4">
            <div className="flex items-center space-x-2">
              <Network className="w-4 h-4 text-white" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">
                AI COURSE OUTCOMES LAB
              </span>
            </div>
            <h3 className="text-xl font-serif font-bold text-white leading-tight">
              Graph Search & Traversal Engine (CO2)
            </h3>
            <p className="text-xs text-white/80 leading-relaxed font-normal">
              Execute Breadth-First, Depth-First, and A* heuristic searches linking requisition criteria to candidate profiles.
            </p>
            <button
              onClick={() => onNavigateTab('ai-lab')}
              className="w-full text-xs font-semibold uppercase tracking-wider bg-white hover:bg-slate-50 text-electric py-3 rounded-xl shadow-xs transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>Explore AI Search Lab</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Activity Log Feed */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-navy-900 block border-b border-slate-100 pb-2">
              Screening Audit Trail
            </span>

            {(!stats?.recent_activity || stats.recent_activity.length === 0) ? (
              <p className="text-xs text-slate-400 py-4 text-center">No logged activity yet.</p>
            ) : (
              <div className="space-y-3.5">
                {stats.recent_activity.map((item, idx) => (
                  <div key={idx} className="flex items-start space-x-3 text-xs border-b border-slate-100 pb-3 last:border-none last:pb-0">
                    <span className="w-2 h-2 rounded-full bg-electric mt-1.5 flex-shrink-0"></span>
                    <div className="space-y-0.5">
                      <div className="font-semibold text-navy-900">{item.action}</div>
                      <div className="text-slate-500 text-[11px] leading-snug">{item.details}</div>
                      <div className="font-mono text-[10px] text-slate-400">
                        {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
