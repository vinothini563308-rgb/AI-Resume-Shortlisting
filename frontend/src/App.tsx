import React, { useState, useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { WorkspaceHeader, WorkspaceTab } from './components/WorkspaceHeader';
import { OverviewView } from './components/views/OverviewView';
import { JobsView } from './components/views/JobsView';
import { ScreeningView } from './components/views/ScreeningView';
import { CandidatesView } from './components/views/CandidatesView';
import { ShortlistView } from './components/views/ShortlistView';
import { InsightsView } from './components/views/InsightsView';
import { AiCourseOutcomesView } from './components/views/AiCourseOutcomesView';
import { Job, Candidate, OverviewStats } from './types';
import { api } from './api';

export function App() {
  const queryParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const initialView = queryParams?.get('view') === 'workspace' ? 'workspace' : 'landing';
  const initialTab = (queryParams?.get('tab') as WorkspaceTab) || 'overview';

  const [viewMode, setViewMode] = useState<'landing' | 'workspace'>(initialView);
  const [workspaceTab, setWorkspaceTab] = useState<WorkspaceTab>(initialTab);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [activeJobId, setActiveJobId] = useState<number | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [overviewStats, setOverviewStats] = useState<OverviewStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Initial load
  useEffect(() => {
    loadAllData();
  }, []);

  // When active job changes, fetch candidates for that job
  useEffect(() => {
    if (activeJobId) {
      loadCandidates(activeJobId);
    }
  }, [activeJobId]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [jobsData, statsData] = await Promise.all([api.getJobs(), api.getOverview()]);
      setJobs(jobsData);
      setOverviewStats(statsData);

      if (jobsData.length > 0) {
        // default to first job or keep existing if still present
        setActiveJobId((prev) => {
          if (prev && jobsData.some((j) => j.id === prev)) return prev;
          return jobsData[0].id;
        });
      }
    } catch (err) {
      console.error('Failed to load initial workspace data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCandidates = async (jobId: number) => {
    try {
      const cands = await api.getCandidates(jobId);
      setCandidates(cands);
    } catch (err) {
      console.error('Failed to load candidates:', err);
    }
  };

  const handleSelectJob = (jobId: number) => {
    setActiveJobId(jobId);
  };

  const activeJob = jobs.find((j) => j.id === activeJobId) || null;

  // Render Public Landing Page
  if (viewMode === 'landing') {
    return <LandingPage onStartScreening={() => setViewMode('workspace')} />;
  }

  // Render Interactive Workspace
  return (
    <div className="min-h-screen bg-[#FAF8F3] text-navy-900 flex flex-col selection:bg-electric selection:text-white font-sans">
      <WorkspaceHeader
        currentTab={workspaceTab}
        onTabChange={(tab) => setWorkspaceTab(tab)}
        jobs={jobs}
        activeJobId={activeJobId}
        onJobChange={handleSelectJob}
        onBackToLanding={() => setViewMode('landing')}
      />

      <main className="flex-1">
        {loading && jobs.length === 0 ? (
          <div className="py-24 text-center text-xs text-slate-400 font-mono flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            <span>Loading enterprise intelligence workspace...</span>
          </div>
        ) : (
          <>
            {workspaceTab === 'overview' && (
              <OverviewView
                stats={overviewStats}
                jobs={jobs}
                onNavigateTab={(tab) => setWorkspaceTab(tab)}
                onSelectJob={handleSelectJob}
              />
            )}

            {workspaceTab === 'jobs' && (
              <JobsView
                jobs={jobs}
                onRefresh={loadAllData}
                onSelectJob={(id) => {
                  handleSelectJob(id);
                  setWorkspaceTab('candidates');
                }}
              />
            )}

            {workspaceTab === 'screening' && (
              <ScreeningView
                jobs={jobs}
                activeJobId={activeJobId}
                onJobChange={handleSelectJob}
                onNavigateCandidates={() => setWorkspaceTab('candidates')}
                onRefreshData={() => {
                  loadAllData();
                  if (activeJobId) loadCandidates(activeJobId);
                }}
              />
            )}

            {workspaceTab === 'candidates' && (
              <CandidatesView
                candidates={candidates}
                job={activeJob}
                onRefresh={() => {
                  if (activeJobId) loadCandidates(activeJobId);
                  loadAllData();
                }}
              />
            )}

            {workspaceTab === 'shortlist' && (
              <ShortlistView
                candidates={candidates}
                job={activeJob}
                onRefresh={() => {
                  if (activeJobId) loadCandidates(activeJobId);
                  loadAllData();
                }}
              />
            )}

            {workspaceTab === 'insights' && <InsightsView job={activeJob} />}

            {workspaceTab === 'ai-lab' && (
              <AiCourseOutcomesView
                job={activeJob}
                candidates={candidates}
                onRefreshData={() => {
                  if (activeJobId) loadCandidates(activeJobId);
                  loadAllData();
                }}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
