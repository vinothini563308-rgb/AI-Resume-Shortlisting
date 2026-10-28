import math
import heapq
from collections import deque
from typing import Dict, List, Tuple, Any, Optional, Set

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from extractor import normalize_text, extract_evidence_snippets

# =====================================================================
# CO1 — INTELLIGENT AGENTS AND PROBLEM-SOLVING
# =====================================================================

class RecruitmentScreeningAgent:
    """
    CO1: Intelligent Goal-Based Agent for Resume Screening.
    Architecture:
      - Environment: Job openings, pool of candidate resumes, recruiter requirements.
      - Percepts: Normalized texts, extracted skill tokens, experience years, degree.
      - Reasoning: Rule evaluation (hard constraints) + Bayesian belief update + ML similarity.
      - Actuators: Candidate rankings, evidence highlights, shortlist status recommendations.
    """
    def __init__(self, job: Dict[str, Any], weights: Optional[Dict[str, float]] = None):
        self.job = job
        self.weights = weights or {"req": 0.40, "pref": 0.15, "tfidf": 0.30, "exp": 0.15}
        self.agent_state = {
            "agent_id": "TalentLens-Screener-v2",
            "goal": f"Identify, evaluate, and rank candidates for role: {job.get('title')}",
            "execution_log": []
        }

    def log_step(self, phase: str, details: str):
        self.agent_state["execution_log"].append({
            "phase": phase,
            "details": details
        })

    def run_screening_cycle(self, candidates_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        self.log_step("Perception", f"Received {len(candidates_data)} candidate resumes for job: {self.job.get('title')}")

        # Compute TF-IDF text similarity
        tfidf_scores = compute_tfidf_similarities(
            self.job.get("description", ""),
            [c.get("raw_text", "") for c in candidates_data]
        )
        self.log_step("ML Vectorization (CO5)", "Computed TF-IDF term vectors and cosine similarity matrix")

        evaluated_candidates = []
        for cand, tfidf_score in zip(candidates_data, tfidf_scores):
            # Rule reasoning (CO4)
            rule_passed, violations = evaluate_rules(cand, self.job)

            # Skill matching
            req_skills = set(self.job.get("required_skills", []))
            pref_skills = set(self.job.get("preferred_skills", []))
            cand_skills = set(cand.get("detected_skills", []))

            matched_req = sorted(list(req_skills & cand_skills))
            missing_req = sorted(list(req_skills - cand_skills))
            matched_pref = sorted(list(pref_skills & cand_skills))

            score_req = (len(matched_req) / len(req_skills) * 100.0) if req_skills else 100.0
            score_pref = (len(matched_pref) / len(pref_skills) * 100.0) if pref_skills else 100.0

            # Experience score
            min_exp = float(self.job.get("min_experience_years", 2.0))
            cand_exp = float(cand.get("experience_years", 0.0))
            if min_exp <= 0:
                score_exp = 100.0
            else:
                score_exp = min(100.0, (cand_exp / min_exp) * 100.0)

            # Configurable weighted score (CO5)
            w_req = self.weights.get("req", 0.40)
            w_pref = self.weights.get("pref", 0.15)
            w_tfidf = self.weights.get("tfidf", 0.30)
            w_exp = self.weights.get("exp", 0.15)

            score_overall = (
                (w_req * score_req) +
                (w_pref * score_pref) +
                (w_tfidf * tfidf_score) +
                (w_exp * score_exp)
            )

            # Probabilistic Bayesian Reasoning (CO4)
            bayes_prob, uncertainty = compute_bayesian_probability(
                score_req=score_req,
                score_tfidf=tfidf_score,
                score_exp=score_exp,
                rule_passed=rule_passed
            )

            # Evidence extraction
            evidence = extract_evidence_snippets(cand.get("raw_text", ""), matched_req)

            cand_result = dict(cand)
            cand_result.update({
                "score_tfidf": round(float(tfidf_score), 1),
                "score_required_skills": round(float(score_req), 1),
                "score_preferred_skills": round(float(score_pref), 1),
                "score_experience": round(float(score_exp), 1),
                "score_overall": round(float(score_overall), 1),
                "matched_skills": matched_req,
                "missing_skills": missing_req,
                "preferred_matched_skills": matched_pref,
                "rule_passed": 1 if rule_passed else 0,
                "rule_violations": violations,
                "bayes_prob": round(float(bayes_prob), 2),
                "bayes_uncertainty": round(float(uncertainty), 2),
                "evidence_snippets": evidence,
            })
            evaluated_candidates.append(cand_result)

        # Rank by overall score
        evaluated_candidates.sort(key=lambda c: c["score_overall"], reverse=True)
        self.log_step("Decision Synthesis", f"Synthesized rankings for {len(evaluated_candidates)} candidates")

        return evaluated_candidates


# =====================================================================
# CO5 — MACHINE LEARNING & TF-IDF COSINE SIMILARITY
# =====================================================================

def compute_tfidf_similarities(job_desc: str, candidate_texts: List[str]) -> List[float]:
    """Compute TF-IDF vectors and cosine similarities between job and candidate documents."""
    if not candidate_texts:
        return []

    norm_job = normalize_text(job_desc)
    norm_cands = [normalize_text(t) for t in candidate_texts]

    # Guard against empty texts
    if not norm_job.strip():
        return [0.0] * len(candidate_texts)

    docs = [norm_job] + norm_cands
    try:
        vectorizer = TfidfVectorizer(
            stop_words="english",
            sublinear_tf=True,
            ngram_range=(1, 2)
        )
        tfidf_matrix = vectorizer.fit_transform(docs)
        sim_scores = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:])[0] * 100.0
        return [max(0.0, min(100.0, float(s))) for s in sim_scores]
    except Exception:
        # Fallback if vocabulary is completely empty or identical
        return [50.0] * len(candidate_texts)


# =====================================================================
# CO4 — PROBABILISTIC AND RULE-BASED REASONING
# =====================================================================

def evaluate_rules(candidate: Dict[str, Any], job: Dict[str, Any]) -> Tuple[bool, List[str]]:
    """
    CO4 Rule-based reasoning: Evaluates transparent eligibility constraints.
    Returns (passed, list_of_violations).
    """
    violations = []
    min_exp = float(job.get("min_experience_years", 0))
    cand_exp = float(candidate.get("experience_years", 0))

    if cand_exp < (min_exp * 0.6):  # allow reasonable leeway for early-career high achievers
        violations.append(f"Experience deficit: {cand_exp:.1f} yrs detected vs {min_exp:.1f} yrs required.")

    req_skills = set(job.get("required_skills", []))
    cand_skills = set(candidate.get("detected_skills", []))
    missing = req_skills - cand_skills

    # Rule: Missing more than 60% of mandatory required skills is a hard violation
    if req_skills and (len(missing) / len(req_skills) > 0.60):
        missing_preview = ", ".join(list(missing)[:3])
        violations.append(f"Insufficient core skill coverage (missing: {missing_preview}).")

    return (len(violations) == 0, violations)

def compute_bayesian_probability(
    score_req: float,
    score_tfidf: float,
    score_exp: float,
    rule_passed: bool
) -> Tuple[float, float]:
    """
    CO4 Probabilistic Reasoning:
    Computes posterior probability P(Suitable | Evidence) via Bayes' Theorem.
    Prior: P(Suitable) = 0.25 (typical qualified applicant base rate in recruitment).
    Evidence: Skill match likelihood + TF-IDF similarity + Experience sufficiency.
    Also produces an explicit uncertainty interval based on information completeness.
    """
    # Prior
    p_suitable = 0.25
    p_not_suitable = 0.75

    # Normalized evidence metrics [0, 1]
    e_req = max(0.05, min(0.99, score_req / 100.0))
    e_tfidf = max(0.05, min(0.99, score_tfidf / 100.0))
    e_exp = max(0.05, min(0.99, score_exp / 100.0))

    # Likelihood ratios: P(Evidence | Suitable) vs P(Evidence | Not Suitable)
    # A suitable candidate has high prob of having skills; unsuitable has low prob
    p_e_given_s = (e_req ** 1.2) * (e_tfidf ** 0.8) * (e_exp ** 0.6)
    p_e_given_ns = ((1.0 - e_req) ** 1.0) * ((1.0 - e_tfidf) ** 0.6) * ((1.0 - e_exp) ** 0.4) + 0.02

    if not rule_passed:
        p_e_given_s *= 0.35  # heavily penalize hard rule failure

    numerator = p_e_given_s * p_suitable
    denominator = numerator + (p_e_given_ns * p_not_suitable)

    posterior = numerator / denominator if denominator > 0 else 0.05
    posterior = max(0.02, min(0.98, posterior))

    # Uncertainty calculation: higher when scores are contradictory or borderline
    score_variance = ((score_req - score_tfidf)**2 + (score_req - score_exp)**2) / 20000.0
    uncertainty = 0.05 + min(0.25, score_variance * 0.4)

    return (posterior, uncertainty)


# =====================================================================
# CO2 — UNINFORMED AND INFORMED GRAPH SEARCH
# =====================================================================

class RecruitmentGraph:
    """
    CO2: Graph representation connecting:
    - Job Node
    - Skill Nodes (Required & Preferred)
    - Candidate Nodes
    - Experience/Project Evidence Nodes
    """
    def __init__(self):
        self.adj: Dict[str, List[Tuple[str, float]]] = {}
        self.node_meta: Dict[str, Dict[str, Any]] = {}

    def add_node(self, node_id: str, label: str, node_type: str, details: Optional[Dict[str, Any]] = None):
        if node_id not in self.adj:
            self.adj[node_id] = []
        self.node_meta[node_id] = {
            "id": node_id,
            "label": label,
            "type": node_type,
            "details": details or {}
        }

    def add_edge(self, u: str, v: str, weight: float = 1.0, bidirectional: bool = True):
        if u not in self.adj:
            self.adj[u] = []
        if v not in self.adj:
            self.adj[v] = []

        self.adj[u].append((v, weight))
        if bidirectional:
            self.adj[v].append((u, weight))

    def bfs(self, start_node: str, target_node: Optional[str] = None) -> Dict[str, Any]:
        """
        CO2 Uninformed Search: Breadth-First Search (Queue).
        Returns visited order, paths, and step-by-step trace for UI playback.
        """
        if start_node not in self.adj:
            return {"error": f"Node {start_node} not in graph"}

        visited: Set[str] = set()
        queue = deque([start_node])
        visited.add(start_node)

        traversal_order = []
        steps = []
        parent = {start_node: None}

        step_idx = 1
        found_target = False

        while queue:
            curr = queue.popleft()
            traversal_order.append(curr)

            # Record step snapshot for educational step player
            steps.append({
                "step": step_idx,
                "current_node": curr,
                "current_label": self.node_meta.get(curr, {}).get("label", curr),
                "current_type": self.node_meta.get(curr, {}).get("type", "unknown"),
                "frontier": list(queue),
                "visited": list(visited),
                "action": f"Popped '{self.node_meta.get(curr, {}).get('label')}' from FIFO queue"
            })
            step_idx += 1

            if target_node and curr == target_node:
                found_target = True
                break

            for neighbor, weight in self.adj.get(curr, []):
                if neighbor not in visited:
                    visited.add(neighbor)
                    parent[neighbor] = curr
                    queue.append(neighbor)
                    steps.append({
                        "step": step_idx,
                        "current_node": curr,
                        "current_label": self.node_meta.get(curr, {}).get("label", curr),
                        "current_type": self.node_meta.get(curr, {}).get("type", "unknown"),
                        "frontier": list(queue),
                        "visited": list(visited),
                        "action": f"Discovered neighbor '{self.node_meta.get(neighbor, {}).get('label')}', pushed to queue"
                    })
                    step_idx += 1

        path = []
        if target_node and found_target:
            curr = target_node
            while curr is not None:
                path.append(curr)
                curr = parent.get(curr)
            path.reverse()

        return {
            "algorithm": "Breadth-First Search (BFS)",
            "data_structure": "FIFO Queue",
            "traversal_order": traversal_order,
            "steps": steps,
            "target_found": found_target if target_node else None,
            "path_to_target": path,
            "total_nodes_visited": len(traversal_order)
        }

    def dfs(self, start_node: str, target_node: Optional[str] = None) -> Dict[str, Any]:
        """
        CO2 Uninformed Search: Depth-First Search (Stack).
        Returns visited order, paths, and step-by-step trace for UI playback.
        """
        if start_node not in self.adj:
            return {"error": f"Node {start_node} not in graph"}

        visited: Set[str] = set()
        stack = [start_node]
        traversal_order = []
        steps = []
        parent = {start_node: None}

        step_idx = 1
        found_target = False

        while stack:
            curr = stack.pop()
            if curr in visited:
                continue

            visited.add(curr)
            traversal_order.append(curr)

            steps.append({
                "step": step_idx,
                "current_node": curr,
                "current_label": self.node_meta.get(curr, {}).get("label", curr),
                "current_type": self.node_meta.get(curr, {}).get("type", "unknown"),
                "frontier": list(stack),
                "visited": list(visited),
                "action": f"Popped '{self.node_meta.get(curr, {}).get('label')}' from LIFO stack"
            })
            step_idx += 1

            if target_node and curr == target_node:
                found_target = True
                break

            # Reverse iterate for deterministic traversal
            for neighbor, weight in reversed(self.adj.get(curr, [])):
                if neighbor not in visited:
                    if neighbor not in parent:
                        parent[neighbor] = curr
                    stack.append(neighbor)
                    steps.append({
                        "step": step_idx,
                        "current_node": curr,
                        "current_label": self.node_meta.get(curr, {}).get("label", curr),
                        "current_type": self.node_meta.get(curr, {}).get("type", "unknown"),
                        "frontier": list(stack),
                        "visited": list(visited),
                        "action": f"Pushed neighbor '{self.node_meta.get(neighbor, {}).get('label')}' to stack"
                    })
                    step_idx += 1

        path = []
        if target_node and found_target:
            curr = target_node
            while curr is not None:
                path.append(curr)
                curr = parent.get(curr)
            path.reverse()

        return {
            "algorithm": "Depth-First Search (DFS)",
            "data_structure": "LIFO Stack",
            "traversal_order": traversal_order,
            "steps": steps,
            "target_found": found_target if target_node else None,
            "path_to_target": path,
            "total_nodes_visited": len(traversal_order)
        }

    def a_star(self, start_node: str, target_node: str) -> Dict[str, Any]:
        """
        CO2 Informed Search: A* Search with admissible heuristic.
        Heuristic: Estimated cost = distance to target node type based on missing skill count.
        """
        if start_node not in self.adj or target_node not in self.adj:
            return {"error": "Start or target node not in graph"}

        # Priority queue entries: (f_score, counter, current_node, path, g_score)
        counter = 0
        open_set = []

        g_scores = {node: float('inf') for node in self.adj}
        g_scores[start_node] = 0.0

        def heuristic(node: str) -> float:
            if node == target_node:
                return 0.0
            # Target is candidate, node is skill -> 1 hop
            if "skill" in node and "cand" in target_node:
                return 1.0
            return 2.0

        h_start = heuristic(start_node)
        heapq.heappush(open_set, (h_start, counter, start_node, [start_node], 0.0))

        steps = []
        visited = set()
        step_idx = 1
        found = False
        optimal_path = []
        final_cost = 0.0

        while open_set:
            f, _, curr, path, g = heapq.heappop(open_set)

            if curr in visited:
                continue
            visited.add(curr)

            steps.append({
                "step": step_idx,
                "current_node": curr,
                "current_label": self.node_meta.get(curr, {}).get("label", curr),
                "current_type": self.node_meta.get(curr, {}).get("type", "unknown"),
                "g_cost": round(g, 2),
                "h_cost": round(heuristic(curr), 2),
                "f_cost": round(f, 2),
                "visited": list(visited),
                "action": f"Expanded node '{self.node_meta.get(curr, {}).get('label')}' with f(n) = g({g:.1f}) + h({heuristic(curr):.1f}) = {f:.1f}"
            })
            step_idx += 1

            if curr == target_node:
                found = True
                optimal_path = path
                final_cost = g
                break

            for neighbor, weight in self.adj.get(curr, []):
                tentative_g = g + weight
                if tentative_g < g_scores.get(neighbor, float('inf')):
                    g_scores[neighbor] = tentative_g
                    h_neighbor = heuristic(neighbor)
                    f_neighbor = tentative_g + h_neighbor
                    counter += 1
                    heapq.heappush(open_set, (f_neighbor, counter, neighbor, path + [neighbor], tentative_g))

        return {
            "algorithm": "A* Informed Search",
            "heuristic_description": "Skill gap distance heuristic h(n)",
            "target_found": found,
            "optimal_path": optimal_path,
            "path_cost": round(final_cost, 2),
            "steps": steps,
            "total_nodes_evaluated": len(visited)
        }


def build_recruitment_graph(job: Dict[str, Any], candidates: List[Dict[str, Any]]) -> Tuple[RecruitmentGraph, Dict[str, Any]]:
    """Build the full recruitment graph for CO2 traversal and visualization."""
    graph = RecruitmentGraph()
    raw_nodes = []
    raw_edges = []

    # 1. Job Node
    job_id = f"job_{job.get('id', 1)}"
    graph.add_node(job_id, job.get("title", "Job Role"), "job", {"department": job.get("department", "")})
    raw_nodes.append({"id": job_id, "label": job.get("title", "Job Role"), "type": "job"})

    # 2. Skill Nodes
    req_skills = job.get("required_skills", [])
    pref_skills = job.get("preferred_skills", [])

    for skill in req_skills:
        skill_id = f"skill_req_{skill.replace(' ', '_')}"
        graph.add_node(skill_id, skill, "skill_required")
        graph.add_edge(job_id, skill_id, weight=1.0)
        raw_nodes.append({"id": skill_id, "label": skill, "type": "skill_required"})
        raw_edges.append({"source": job_id, "target": skill_id, "label": "requires", "weight": 1.0})

    for skill in pref_skills:
        skill_id = f"skill_pref_{skill.replace(' ', '_')}"
        graph.add_node(skill_id, skill, "skill_preferred")
        graph.add_edge(job_id, skill_id, weight=1.5)
        raw_nodes.append({"id": skill_id, "label": skill, "type": "skill_preferred"})
        raw_edges.append({"source": job_id, "target": skill_id, "label": "prefers", "weight": 1.5})

    # 3. Candidate Nodes and Connections to Skills
    for cand in candidates:
        cand_id = f"cand_{cand.get('id', 0)}"
        graph.add_node(
            cand_id,
            cand.get("name", "Candidate"),
            "candidate",
            {
                "score": cand.get("score_overall", 0),
                "experience": cand.get("experience_years", 0),
                "status": cand.get("review_stage", "New")
            }
        )
        raw_nodes.append({
            "id": cand_id,
            "label": cand.get("name", "Candidate"),
            "type": "candidate",
            "score": cand.get("score_overall", 0),
            "status": cand.get("review_stage", "New")
        })

        cand_skills = set(cand.get("detected_skills", []))
        for skill in req_skills:
            if skill in cand_skills:
                skill_id = f"skill_req_{skill.replace(' ', '_')}"
                graph.add_edge(skill_id, cand_id, weight=1.0)
                raw_edges.append({"source": skill_id, "target": cand_id, "label": "demonstrated_by", "weight": 1.0})

        for skill in pref_skills:
            if skill in cand_skills:
                skill_id = f"skill_pref_{skill.replace(' ', '_')}"
                graph.add_edge(skill_id, cand_id, weight=1.2)
                raw_edges.append({"source": skill_id, "target": cand_id, "label": "demonstrated_by", "weight": 1.2})

    return graph, {"nodes": raw_nodes, "edges": raw_edges}


# =====================================================================
# CO3 — KNOWLEDGE REPRESENTATION (SEMANTIC TRIPLES)
# =====================================================================

def generate_knowledge_triples(job: Dict[str, Any], candidates: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    CO3 Knowledge Representation: Structured semantic RDF-style triples.
    Format: Subject -> Predicate -> Object with confidence and explicit evidence flag.
    """
    triples = []
    job_title = job.get("title", "Job Role")

    # Job requirements
    for skill in job.get("required_skills", []):
        triples.append({
            "subject": f"Job: {job_title}",
            "predicate": "requiresMandatorySkill",
            "object": f"Skill: {skill.title()}",
            "confidence": 1.0,
            "evidence_type": "Job Specification",
            "is_explicit": True
        })

    for skill in job.get("preferred_skills", []):
        triples.append({
            "subject": f"Job: {job_title}",
            "predicate": "prefersSkill",
            "object": f"Skill: {skill.title()}",
            "confidence": 1.0,
            "evidence_type": "Job Specification",
            "is_explicit": True
        })

    if job.get("min_experience_years"):
        triples.append({
            "subject": f"Job: {job_title}",
            "predicate": "requiresMinExperience",
            "object": f"{job.get('min_experience_years')} Years",
            "confidence": 1.0,
            "evidence_type": "Job Specification",
            "is_explicit": True
        })

    # Candidate triples
    for cand in candidates:
        cand_name = cand.get("name", "Candidate")

        # Explicit skills
        for skill in cand.get("detected_skills", []):
            is_matched = skill in job.get("required_skills", []) or skill in job.get("preferred_skills", [])
            triples.append({
                "subject": f"Candidate: {cand_name}",
                "predicate": "hasVerifiedSkill" if is_matched else "hasSkill",
                "object": f"Skill: {skill.title()}",
                "confidence": 0.95,
                "evidence_type": "Extracted from Resume",
                "is_explicit": True
            })

        # Education
        if cand.get("education"):
            triples.append({
                "subject": f"Candidate: {cand_name}",
                "predicate": "hasCredential",
                "object": str(cand.get("education")),
                "confidence": 0.90,
                "evidence_type": "Education Section",
                "is_explicit": True
            })

        # Experience
        triples.append({
            "subject": f"Candidate: {cand_name}",
            "predicate": "hasDemonstratedExperience",
            "object": f"{cand.get('experience_years', 0):.1f} Years",
            "confidence": 0.85,
            "evidence_type": "Chronological Work History",
            "is_explicit": False  # Inferred from timeline spans
        })

        # AI Recommendation Triple
        stage = cand.get("review_stage", "New")
        triples.append({
            "subject": f"Candidate: {cand_name}",
            "predicate": "assignedReviewStage",
            "object": f"Stage: {stage}",
            "confidence": 1.0,
            "evidence_type": "Recruitment Pipeline State",
            "is_explicit": True
        })

    return triples
