export interface Job {
  id: number;
  title: string;
  department: string;
  location: string;
  employment_type: string;
  min_experience_years: number;
  required_degree: string;
  description: string;
  required_skills: string[];
  preferred_skills: string[];
  weights: {
    req: number;
    pref: number;
    tfidf: number;
    exp: number;
  };
  created_at: string;
  candidate_count?: number;
  shortlisted_count?: number;
}

export interface EvidenceSnippet {
  skill: string;
  snippet: string;
}

export interface Candidate {
  id: number;
  job_id: number;
  name: string;
  email: string | null;
  phone: string | null;
  filename: string;
  raw_text: string;
  detected_skills: string[];
  matched_skills: string[];
  missing_skills: string[];
  preferred_matched_skills: string[];
  experience_years: number;
  education: string | null;
  score_tfidf: number;
  score_required_skills: number;
  score_preferred_skills: number;
  score_experience: number;
  score_overall: number;
  bayes_prob: number;
  bayes_uncertainty: number;
  rule_passed: number;
  rule_violations: string[];
  evidence_snippets: EvidenceSnippet[];
  review_stage: 'New' | 'Under Review' | 'Shortlisted' | 'Rejected';
  recruiter_notes: string;
  human_decision: 'Pending' | 'Approved' | 'Declined';
  reviewed_at: string | null;
  created_at: string;
  rank?: number;
}

export interface OverviewStats {
  total_jobs: number;
  total_resumes: number;
  awaiting_review: number;
  shortlisted_count: number;
  avg_match_score: number;
  recent_activity: {
    action: string;
    details: string;
    created_at: string;
  }[];
}

export interface JobInsights {
  total_candidates: number;
  skill_coverage: {
    skill: string;
    count: number;
    percentage: number;
  }[];
  missing_skills_freq: {
    skill: string;
    count: number;
    percentage: number;
  }[];
  score_distribution: {
    range: string;
    count: number;
  }[];
  stages_breakdown: {
    stage: string;
    count: number;
    percentage: number;
  }[];
}

export interface GraphNode {
  id: string;
  label: string;
  type: 'job' | 'skill_required' | 'skill_preferred' | 'candidate';
  score?: number;
  status?: string;
}

export interface GraphEdge {
  source: string;
  target: string;
  label: string;
  weight: number;
}

export interface TraversalStep {
  step: number;
  current_node: string;
  current_label: string;
  current_type: string;
  frontier?: string[];
  visited: string[];
  action: string;
  g_cost?: number;
  h_cost?: number;
  f_cost?: number;
}

export interface GraphSearchResponse {
  graph_topology: {
    nodes: GraphNode[];
    edges: GraphEdge[];
  };
  search_result: {
    algorithm: string;
    data_structure?: string;
    traversal_order?: string[];
    steps: TraversalStep[];
    target_found?: boolean;
    optimal_path?: string[];
    path_to_target?: string[];
    path_cost?: number;
    total_nodes_visited?: number;
    total_nodes_evaluated?: number;
  };
}

export interface KnowledgeTriple {
  subject: string;
  predicate: string;
  object: string;
  confidence: number;
  evidence_type: string;
  is_explicit: boolean;
}

export interface KnowledgeGraphResponse {
  triples: KnowledgeTriple[];
  total_facts: number;
  explicit_facts: number;
  inferred_facts: number;
}
