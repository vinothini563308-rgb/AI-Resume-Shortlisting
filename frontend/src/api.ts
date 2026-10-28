import {
  Job,
  Candidate,
  OverviewStats,
  JobInsights,
  GraphSearchResponse,
  KnowledgeGraphResponse
} from './types';

const API_BASE = 'http://127.0.0.1:8000/api';

export const api = {
  async getOverview(): Promise<OverviewStats> {
    const res = await fetch(`${API_BASE}/overview`);
    if (!res.ok) throw new Error('Failed to fetch overview metrics');
    return res.json();
  },

  async getJobs(): Promise<Job[]> {
    const res = await fetch(`${API_BASE}/jobs`);
    if (!res.ok) throw new Error('Failed to fetch job openings');
    return res.json();
  },

  async getJob(jobId: number): Promise<Job> {
    const res = await fetch(`${API_BASE}/jobs/${jobId}`);
    if (!res.ok) throw new Error('Failed to fetch job details');
    return res.json();
  },

  async createJob(jobData: Partial<Job>): Promise<{ message: string; job_id: number }> {
    const res = await fetch(`${API_BASE}/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(jobData),
    });
    if (!res.ok) throw new Error('Failed to create job opening');
    return res.json();
  },

  async updateJob(jobId: number, jobData: Partial<Job>): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/jobs/${jobId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(jobData),
    });
    if (!res.ok) throw new Error('Failed to update job opening');
    return res.json();
  },

  async deleteJob(jobId: number): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/jobs/${jobId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete job opening');
    return res.json();
  },

  async getCandidates(
    jobId: number,
    options?: { stage?: string; minScore?: number; search?: string }
  ): Promise<Candidate[]> {
    const params = new URLSearchParams();
    if (options?.stage && options.stage !== 'All') params.append('stage', options.stage);
    if (options?.minScore) params.append('min_score', options.minScore.toString());
    if (options?.search) params.append('search', options.search);

    const res = await fetch(`${API_BASE}/jobs/${jobId}/candidates?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch candidates');
    return res.json();
  },

  async uploadResumes(
    jobId: number,
    files: File[]
  ): Promise<{ success: boolean; processed_count: number; errors: string[]; message: string }> {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));

    const res = await fetch(`${API_BASE}/jobs/${jobId}/upload-resumes`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error('Failed to upload and process resumes');
    return res.json();
  },

  async getCandidate(candidateId: number): Promise<Candidate> {
    const res = await fetch(`${API_BASE}/candidates/${candidateId}`);
    if (!res.ok) throw new Error('Failed to fetch candidate details');
    return res.json();
  },

  async updateCandidateStatus(
    candidateId: number,
    data: { review_stage: string; recruiter_notes?: string; human_decision?: string }
  ): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/candidates/${candidateId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update candidate status');
    return res.json();
  },

  async editCandidate(
    candidateId: number,
    data: Partial<Candidate>
  ): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/candidates/${candidateId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update candidate profile');
    return res.json();
  },

  async deleteCandidate(candidateId: number): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/candidates/${candidateId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete candidate');
    return res.json();
  },

  async recalculateWeights(
    jobId: number,
    weights: { req: number; pref: number; tfidf: number; exp: number }
  ): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/jobs/${jobId}/recalculate-weights`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(weights),
    });
    if (!res.ok) throw new Error('Failed to recalculate weights');
    return res.json();
  },

  async getInsights(jobId: number): Promise<JobInsights> {
    const res = await fetch(`${API_BASE}/jobs/${jobId}/insights`);
    if (!res.ok) throw new Error('Failed to fetch job insights');
    return res.json();
  },

  async getGraphSearch(
    jobId: number,
    algorithm: 'bfs' | 'dfs' | 'a_star',
    targetCandidateId?: number
  ): Promise<GraphSearchResponse> {
    const params = new URLSearchParams({ algorithm });
    if (targetCandidateId) params.append('target_candidate_id', targetCandidateId.toString());

    const res = await fetch(`${API_BASE}/jobs/${jobId}/graph-search?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to run graph search');
    return res.json();
  },

  async getKnowledgeGraph(jobId: number): Promise<KnowledgeGraphResponse> {
    const res = await fetch(`${API_BASE}/jobs/${jobId}/knowledge-graph`);
    if (!res.ok) throw new Error('Failed to fetch knowledge graph');
    return res.json();
  },

  async getAgentLog(jobId: number): Promise<any> {
    const res = await fetch(`${API_BASE}/jobs/${jobId}/ai-agent-log`);
    if (!res.ok) throw new Error('Failed to fetch agent log');
    return res.json();
  },
};
