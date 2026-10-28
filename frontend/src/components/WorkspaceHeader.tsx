import React from 'react';
import {
  Sparkles,
  LayoutDashboard,
  Briefcase,
  UploadCloud,
  Users,
  CheckSquare,
  BarChart3,
  Network,
  Home,
  ChevronDown
} from 'lucide-react';
import { Job } from '../types';

export type WorkspaceTab =
  | 'overview'
  | 'jobs'
  | 'screening'
  | 'candidates'
  | 'shortlist'
  | 'insights'
  | 'ai-lab';

interface WorkspaceHeaderProps {
  currentTab: WorkspaceTab;
  onTabChange: (tab: WorkspaceTab) => void;
  jobs: Job[];
  activeJobId: number | null;
  onJobChange: (jobId: number) => void;
  onBackToLanding: () => void;
}

export const WorkspaceHeader: React.FC<WorkspaceHeaderProps> = ({
  currentTab,
  onTabChange,
  jobs,
  activeJobId,
  onJobChange,
  onBackToLanding,
}) => {
  const tabs = [
    { id: 'overview' as WorkspaceTab, label: 'Overview', icon: LayoutDashboard },
    { id: 'jobs' as WorkspaceTab, label: 'Job Openings', icon: Briefcase },
    { id: 'screening' as WorkspaceTab, label: 'Screening', icon: UploadCloud },
    { id: 'candidates' as WorkspaceTab, label: 'Candidate Intelligence', icon: Users },
    { id: 'shortlist' as WorkspaceTab, label: 'Shortlist Pipeline', icon: CheckSquare },
    { id: 'insights' as WorkspaceTab, label: 'AI Analytics', icon: BarChart3 },
    { id: 'ai-lab' as WorkspaceTab, label: 'AI Lab (CO1-CO5)', icon: Network },
  ];

  const activeJob = jobs.find((j) => j.id === activeJobId);

  return (
    <header className="bg-[#5661F6] sticky top-0 z-30 shadow-md border-b border-[#434EDB]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Landing Link */}
          <div className="flex items-center space-x-6">
            <div
              className="flex items-center space-x-2.5 cursor-pointer group"
              onClick={onBackToLanding}
            >
              <div className="text-white">
                <Sparkles className="w-5 h-5 fill-white text-white drop-shadow-sm" />
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="font-serif text-xl font-bold tracking-tight text-white group-hover:text-white/90 transition-colors drop-shadow-xs">
                  TalentLens AI
                </span>
                <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-white bg-white/20 px-2 py-0.5 rounded-full border border-white/30">
                  WORKSPACE
                </span>
              </div>
            </div>

            {/* Active Job Selector Dropdown */}
            {jobs.length > 0 && (
              <div className="hidden md:flex items-center space-x-2.5 border-l border-white/25 pl-5">
                <span className="text-[11px] font-semibold uppercase text-white/80 tracking-wider">
                  Target Role:
                </span>
                <div className="relative">
                  <select
                    value={activeJobId || ''}
                    onChange={(e) => onJobChange(Number(e.target.value))}
                    className="appearance-none bg-white/15 border border-white/30 hover:bg-white/25 text-white text-xs font-semibold rounded-xl pl-3 pr-8 py-1.5 focus:outline-none focus:ring-2 focus:ring-white/40 max-w-[260px] truncate cursor-pointer transition-all"
                  >
                    {jobs.map((job) => (
                      <option key={job.id} value={job.id} className="bg-slate-900 text-white">
                        {job.title}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-white/80 absolute right-2.5 top-2 pointer-events-none" />
                </div>
              </div>
            )}
          </div>

          {/* Return to Landing Button */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onBackToLanding}
              className="inline-flex items-center space-x-1.5 text-xs font-semibold text-white hover:text-white px-3.5 py-1.5 rounded-xl border border-white/30 bg-white/15 hover:bg-white/25 transition-all shadow-xs cursor-pointer group"
            >
              <Home className="w-3.5 h-3.5 text-white group-hover:scale-110 transition-transform" />
              <span>Public Landing</span>
            </button>
          </div>
        </div>

        {/* Workspace Navigation Tabs with Crisp High-Contrast Styling */}
        <div className="flex space-x-1 overflow-x-auto scrollbar-none border-t border-white/15 pt-1.5 pb-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-white text-[#5661F6] shadow-sm font-bold -translate-y-0.5'
                    : 'text-white/80 hover:text-white hover:bg-white/15 border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#5661F6]' : 'text-white/70'}`} />
                <span>{tab.label}</span>
                {tab.id === 'candidates' && activeJob && activeJob.candidate_count ? (
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                      isActive ? 'bg-[#5661F6]/15 text-[#5661F6]' : 'bg-white/25 text-white'
                    }`}
                  >
                    {activeJob.candidate_count}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
