import json
from datetime import datetime
from typing import List, Optional, Dict, Any
from pathlib import Path

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from database import get_db, init_db
from extractor import (
    extract_text,
    detect_skills,
    extract_email,
    extract_phone,
    extract_candidate_name,
    estimate_experience_years,
    extract_education,
    extract_evidence_snippets
)
from ai_engine import (
    RecruitmentScreeningAgent,
    build_recruitment_graph,
    generate_knowledge_triples,
    evaluate_rules,
    compute_bayesian_probability
)

# Initialize database
init_db()

app = FastAPI(
    title="TalentLens AI API",
    description="Backend API for TalentLens AI - Intelligent Resume Shortlisting System",
    version="2.0.0"
)

# Enable CORS for local dev servers
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Models
class JobCreate(BaseModel):
    title: str
    department: Optional[str] = "Engineering"
    location: Optional[str] = "Remote"
    employment_type: Optional[str] = "Full-time"
    min_experience_years: Optional[float] = 2.0
    required_degree: Optional[str] = "Bachelor's Degree"
    description: str
    required_skills: List[str]
    preferred_skills: List[str] = []
    weights: Optional[Dict[str, float]] = {"req": 0.40, "pref": 0.15, "tfidf": 0.30, "exp": 0.15}

class CandidateStatusUpdate(BaseModel):
    review_stage: str
    recruiter_notes: Optional[str] = ""
    human_decision: Optional[str] = "Pending"

class CandidateEdit(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    experience_years: float
    education: Optional[str] = None
    detected_skills: List[str]

class WeightUpdate(BaseModel):
    req: float
    pref: float
    tfidf: float
    exp: float


@app.get("/api/health")
def health_check():
    return {"status": "ok", "app": "TalentLens AI", "timestamp": datetime.now().isoformat()}


@app.get("/api/overview")
def get_overview():
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM jobs")
    total_jobs = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM candidates")
    total_resumes = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM candidates WHERE review_stage IN ('New', 'Under Review')")
    awaiting_review = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM candidates WHERE review_stage = 'Shortlisted'")
    shortlisted_count = cursor.fetchone()[0]

    cursor.execute("SELECT AVG(score_overall) FROM candidates")
    avg_score_row = cursor.fetchone()[0]
    avg_score = round(float(avg_score_row), 1) if avg_score_row is not None else 0.0

    # Recent activity
    cursor.execute("SELECT action, details, created_at FROM activity_log ORDER BY id DESC LIMIT 6")
    recent_activity = [dict(row) for row in cursor.fetchall()]

    conn.close()
    return {
        "total_jobs": total_jobs,
        "total_resumes": total_resumes,
        "awaiting_review": awaiting_review,
        "shortlisted_count": shortlisted_count,
        "avg_match_score": avg_score,
        "recent_activity": recent_activity
    }


@app.get("/api/jobs")
def list_jobs():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT j.*,
               COUNT(c.id) as candidate_count,
               SUM(CASE WHEN c.review_stage = 'Shortlisted' THEN 1 ELSE 0 END) as shortlisted_count
        FROM jobs j
        LEFT JOIN candidates c ON j.id = c.job_id
        GROUP BY j.id
        ORDER BY j.id DESC
    """)
    rows = cursor.fetchall()
    jobs = []
    for r in rows:
        job = dict(r)
        job["required_skills"] = json.loads(job["required_skills"])
        job["preferred_skills"] = json.loads(job["preferred_skills"])
        job["weights"] = json.loads(job["weights"])
        jobs.append(job)
    conn.close()
    return jobs


@app.post("/api/jobs")
def create_job(job_in: JobCreate):
    conn = get_db()
    cursor = conn.cursor()
    now = datetime.now().isoformat(timespec="seconds")

    cursor.execute("""
        INSERT INTO jobs (title, department, location, employment_type, min_experience_years, required_degree, description, required_skills, preferred_skills, weights, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        job_in.title, job_in.department, job_in.location, job_in.employment_type,
        job_in.min_experience_years, job_in.required_degree, job_in.description,
        json.dumps(job_in.required_skills), json.dumps(job_in.preferred_skills),
        json.dumps(job_in.weights), now
    ))
    job_id = cursor.lastrowid

    # Log activity
    cursor.execute("INSERT INTO activity_log (job_id, action, details, created_at) VALUES (?, ?, ?, ?)",
                   (job_id, "Job Created", f"Created job '{job_in.title}'", now))
    conn.commit()
    conn.close()
    return {"message": "Job created successfully", "job_id": job_id}


@app.get("/api/jobs/{job_id}")
def get_job(job_id: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM jobs WHERE id = ?", (job_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Job opening not found")

    job = dict(row)
    job["required_skills"] = json.loads(job["required_skills"])
    job["preferred_skills"] = json.loads(job["preferred_skills"])
    job["weights"] = json.loads(job["weights"])
    conn.close()
    return job


@app.put("/api/jobs/{job_id}")
def update_job(job_id: int, job_in: JobCreate):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE jobs
        SET title = ?, department = ?, location = ?, employment_type = ?,
            min_experience_years = ?, required_degree = ?, description = ?,
            required_skills = ?, preferred_skills = ?, weights = ?
        WHERE id = ?
    """, (
        job_in.title, job_in.department, job_in.location, job_in.employment_type,
        job_in.min_experience_years, job_in.required_degree, job_in.description,
        json.dumps(job_in.required_skills), json.dumps(job_in.preferred_skills),
        json.dumps(job_in.weights), job_id
    ))
    conn.commit()
    conn.close()
    return {"message": "Job updated successfully"}


@app.delete("/api/jobs/{job_id}")
def delete_job(job_id: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM candidates WHERE job_id = ?", (job_id,))
    cursor.execute("DELETE FROM jobs WHERE id = ?", (job_id,))
    conn.commit()
    conn.close()
    return {"message": "Job and associated candidates deleted"}


@app.get("/api/jobs/{job_id}/candidates")
def get_job_candidates(
    job_id: int,
    stage: Optional[str] = None,
    min_score: Optional[float] = 0.0,
    search: Optional[str] = None
):
    conn = get_db()
    cursor = conn.cursor()

    query = "SELECT * FROM candidates WHERE job_id = ?"
    params = [job_id]

    if stage and stage != "All":
        query += " AND review_stage = ?"
        params.append(stage)

    if min_score and min_score > 0:
        query += " AND score_overall >= ?"
        params.append(min_score)

    if search:
        query += " AND (name LIKE ? OR email LIKE ?)"
        params.extend([f"%{search}%", f"%{search}%"])

    query += " ORDER BY score_overall DESC"
    cursor.execute(query, params)
    rows = cursor.fetchall()

    candidates = []
    for rank, r in enumerate(rows, start=1):
        c = dict(r)
        c["rank"] = rank
        c["detected_skills"] = json.loads(c["detected_skills"])
        c["matched_skills"] = json.loads(c["matched_skills"])
        c["missing_skills"] = json.loads(c["missing_skills"])
        c["preferred_matched_skills"] = json.loads(c["preferred_matched_skills"])
        c["rule_violations"] = json.loads(c["rule_violations"])
        c["evidence_snippets"] = json.loads(c["evidence_snippets"])
        candidates.append(c)

    conn.close()
    return candidates


@app.post("/api/jobs/{job_id}/upload-resumes")
async def upload_resumes(job_id: int, files: List[UploadFile] = File(...)):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM jobs WHERE id = ?", (job_id,))
    job_row = cursor.fetchone()
    if not job_row:
        conn.close()
        raise HTTPException(status_code=404, detail="Job opening not found")

    job = dict(job_row)
    job["required_skills"] = json.loads(job["required_skills"])
    job["preferred_skills"] = json.loads(job["preferred_skills"])
    job["weights"] = json.loads(job["weights"])

    parsed_candidates = []
    errors = []

    for file in files:
        filename = file.filename or "unknown_resume.pdf"
        try:
            content = await file.read()
            # File validation
            if len(content) > 15 * 1024 * 1024:
                errors.append(f"{filename}: File exceeds 15MB limit")
                continue

            text = extract_text(filename, content)
            if not text.strip():
                errors.append(f"{filename}: No extractable text found (scanned image or empty)")
                continue

            # Extract candidate metadata
            name = extract_candidate_name(text, filename)
            email = extract_email(text)
            phone = extract_phone(text)
            experience = estimate_experience_years(text)
            education = extract_education(text)
            skills = detect_skills(text)

            parsed_candidates.append({
                "job_id": job_id,
                "name": name,
                "email": email,
                "phone": phone,
                "filename": filename,
                "raw_text": text,
                "detected_skills": skills,
                "experience_years": experience,
                "education": education,
                "review_stage": "New",
                "recruiter_notes": "",
                "human_decision": "Pending",
                "created_at": datetime.now().isoformat(timespec="seconds")
            })

        except Exception as e:
            errors.append(f"{filename}: Parsing failed ({str(e)})")

    if not parsed_candidates:
        conn.close()
        return {
            "success": False,
            "processed_count": 0,
            "errors": errors,
            "message": "No valid resumes could be extracted."
        }

    # Run AI screening agent (CO1, CO4, CO5)
    agent = RecruitmentScreeningAgent(job, job["weights"])
    scored_candidates = agent.run_screening_cycle(parsed_candidates)

    now = datetime.now().isoformat(timespec="seconds")
    inserted_ids = []

    for cand in scored_candidates:
        cursor.execute("""
        INSERT INTO candidates (
            job_id, name, email, phone, filename, raw_text, detected_skills, matched_skills, missing_skills,
            preferred_matched_skills, experience_years, education, score_tfidf, score_required_skills,
            score_preferred_skills, score_experience, score_overall, bayes_prob, bayes_uncertainty,
            rule_passed, rule_violations, evidence_snippets, review_stage, recruiter_notes, human_decision, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            job_id, cand["name"], cand["email"], cand["phone"], cand["filename"], cand["raw_text"],
            json.dumps(cand["detected_skills"]), json.dumps(cand["matched_skills"]), json.dumps(cand["missing_skills"]),
            json.dumps(cand["preferred_matched_skills"]), cand["experience_years"], cand["education"],
            cand["score_tfidf"], cand["score_required_skills"], cand["score_preferred_skills"], cand["score_experience"],
            cand["score_overall"], cand["bayes_prob"], cand["bayes_uncertainty"], cand["rule_passed"],
            json.dumps(cand["rule_violations"]), json.dumps(cand["evidence_snippets"]), "New", "", "Pending", now
        ))
        cand_id = cursor.lastrowid
        inserted_ids.append(cand_id)
        cand["id"] = cand_id

    # Log activity
    cursor.execute("""
        INSERT INTO activity_log (job_id, action, details, created_at)
        VALUES (?, ?, ?, ?)
    """, (job_id, "Resumes Processed", f"Uploaded and analyzed {len(inserted_ids)} resumes for job '{job['title']}'", now))

    conn.commit()
    conn.close()

    return {
        "success": True,
        "processed_count": len(inserted_ids),
        "errors": errors,
        "message": f"Successfully processed {len(inserted_ids)} resume(s).",
        "candidates": scored_candidates
    }


@app.get("/api/candidates/{candidate_id}")
def get_candidate_detail(candidate_id: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM candidates WHERE id = ?", (candidate_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Candidate not found")

    c = dict(row)
    c["detected_skills"] = json.loads(c["detected_skills"])
    c["matched_skills"] = json.loads(c["matched_skills"])
    c["missing_skills"] = json.loads(c["missing_skills"])
    c["preferred_matched_skills"] = json.loads(c["preferred_matched_skills"])
    c["rule_violations"] = json.loads(c["rule_violations"])
    c["evidence_snippets"] = json.loads(c["evidence_snippets"])
    conn.close()
    return c


@app.patch("/api/candidates/{candidate_id}/status")
def update_candidate_status(candidate_id: int, update: CandidateStatusUpdate):
    conn = get_db()
    cursor = conn.cursor()
    now = datetime.now().isoformat(timespec="seconds")

    cursor.execute("""
        UPDATE candidates
        SET review_stage = ?, recruiter_notes = ?, human_decision = ?, reviewed_at = ?
        WHERE id = ?
    """, (update.review_stage, update.recruiter_notes, update.human_decision, now, candidate_id))

    cursor.execute("SELECT job_id, name FROM candidates WHERE id = ?", (candidate_id,))
    cand = cursor.fetchone()
    if cand:
        cursor.execute("""
            INSERT INTO activity_log (job_id, candidate_id, action, details, created_at)
            VALUES (?, ?, ?, ?, ?)
        """, (cand["job_id"], candidate_id, "Status Updated", f"Marked {cand['name']} as {update.review_stage}", now))

    conn.commit()
    conn.close()
    return {"message": "Candidate status updated"}


@app.put("/api/candidates/{candidate_id}")
def edit_candidate(candidate_id: int, cand_in: CandidateEdit):
    conn = get_db()
    cursor = conn.cursor()

    # Re-evaluate rules and scores when candidate info is manually corrected
    cursor.execute("SELECT job_id FROM candidates WHERE id = ?", (candidate_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Candidate not found")

    job_id = row["job_id"]
    cursor.execute("SELECT * FROM jobs WHERE id = ?", (job_id,))
    job_row = cursor.fetchone()
    job = dict(job_row)
    job["required_skills"] = json.loads(job["required_skills"])
    job["preferred_skills"] = json.loads(job["preferred_skills"])
    job["weights"] = json.loads(job["weights"])

    req_skills = set(job["required_skills"])
    pref_skills = set(job["preferred_skills"])
    cand_skills = set(cand_in.detected_skills)

    matched_req = sorted(list(req_skills & cand_skills))
    missing_req = sorted(list(req_skills - cand_skills))
    matched_pref = sorted(list(pref_skills & cand_skills))

    score_req = (len(matched_req) / len(req_skills) * 100.0) if req_skills else 100.0
    score_pref = (len(matched_pref) / len(pref_skills) * 100.0) if pref_skills else 100.0
    score_exp = min(100.0, (cand_in.experience_years / job["min_experience_years"]) * 100.0)

    # Keep existing TFIDF score
    cursor.execute("SELECT score_tfidf, raw_text FROM candidates WHERE id = ?", (candidate_id,))
    prev = cursor.fetchone()
    tfidf_score = prev["score_tfidf"]

    w = job["weights"]
    score_overall = (w["req"] * score_req) + (w["pref"] * score_pref) + (w["tfidf"] * tfidf_score) + (w["exp"] * score_exp)

    rule_passed, violations = evaluate_rules(
        {"experience_years": cand_in.experience_years, "detected_skills": cand_in.detected_skills},
        job
    )

    evidence = extract_evidence_snippets(prev["raw_text"], matched_req)

    cursor.execute("""
        UPDATE candidates
        SET name = ?, email = ?, phone = ?, experience_years = ?, education = ?,
            detected_skills = ?, matched_skills = ?, missing_skills = ?, preferred_matched_skills = ?,
            score_required_skills = ?, score_preferred_skills = ?, score_experience = ?,
            score_overall = ?, rule_passed = ?, rule_violations = ?, evidence_snippets = ?
        WHERE id = ?
    """, (
        cand_in.name, cand_in.email, cand_in.phone, cand_in.experience_years, cand_in.education,
        json.dumps(cand_in.detected_skills), json.dumps(matched_req), json.dumps(missing_req),
        json.dumps(matched_pref), score_req, score_pref, score_exp, round(score_overall, 1),
        1 if rule_passed else 0, json.dumps(violations), json.dumps(evidence), candidate_id
    ))

    conn.commit()
    conn.close()
    return {"message": "Candidate profile updated and scores recalibrated"}


@app.delete("/api/candidates/{candidate_id}")
def delete_candidate(candidate_id: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM candidates WHERE id = ?", (candidate_id,))
    conn.commit()
    conn.close()
    return {"message": "Candidate deleted"}


@app.post("/api/jobs/{job_id}/recalculate-weights")
def recalculate_job_weights(job_id: int, weights: WeightUpdate):
    """CO5: Dynamically recalibrate all candidate overall scores using custom weights."""
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("UPDATE jobs SET weights = ? WHERE id = ?", (json.dumps(weights.dict()), job_id))

    cursor.execute("SELECT id, score_required_skills, score_preferred_skills, score_tfidf, score_experience FROM candidates WHERE job_id = ?", (job_id,))
    candidates = cursor.fetchall()

    for cand in candidates:
        overall = (
            (weights.req * cand["score_required_skills"]) +
            (weights.pref * cand["score_preferred_skills"]) +
            (weights.tfidf * cand["score_tfidf"]) +
            (weights.exp * cand["score_experience"])
        )
        cursor.execute("UPDATE candidates SET score_overall = ? WHERE id = ?", (round(overall, 1), cand["id"]))

    conn.commit()
    conn.close()
    return {"message": f"Scores recalculated for {len(candidates)} candidates"}


@app.get("/api/jobs/{job_id}/insights")
def get_job_insights(job_id: int):
    """Aggregate analytics for AI Insights tab."""
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM jobs WHERE id = ?", (job_id,))
    job_row = cursor.fetchone()
    if not job_row:
        conn.close()
        raise HTTPException(status_code=404, detail="Job not found")

    req_skills = json.loads(job_row["required_skills"])
    cursor.execute("SELECT detected_skills, matched_skills, missing_skills, score_overall, review_stage FROM candidates WHERE job_id = ?", (job_id,))
    candidates = cursor.fetchall()
    total_candidates = len(candidates)

    if total_candidates == 0:
        conn.close()
        return {
            "total_candidates": 0,
            "skill_coverage": [],
            "missing_skills_freq": [],
            "score_distribution": [],
            "stages_breakdown": []
        }

    # 1. Skill Coverage across candidates
    skill_counts = {skill: 0 for skill in req_skills}
    missing_counts = {skill: 0 for skill in req_skills}
    scores = []
    stages = {"New": 0, "Under Review": 0, "Shortlisted": 0, "Rejected": 0}

    for c in candidates:
        matched = json.loads(c["matched_skills"])
        missing = json.loads(c["missing_skills"])
        scores.append(c["score_overall"])
        stage = c["review_stage"]
        stages[stage] = stages.get(stage, 0) + 1

        for s in matched:
            if s in skill_counts:
                skill_counts[s] += 1
        for s in missing:
            if s in missing_counts:
                missing_counts[s] += 1

    skill_coverage = [
        {"skill": k.title(), "count": v, "percentage": round((v / total_candidates) * 100, 1)}
        for k, v in skill_counts.items()
    ]
    skill_coverage.sort(key=lambda x: x["count"], reverse=True)

    missing_freq = [
        {"skill": k.title(), "count": v, "percentage": round((v / total_candidates) * 100, 1)}
        for k, v in missing_counts.items() if v > 0
    ]
    missing_freq.sort(key=lambda x: x["count"], reverse=True)

    # Score distribution brackets
    brackets = [
        {"range": "80-100%", "count": sum(1 for s in scores if s >= 80)},
        {"range": "60-79%", "count": sum(1 for s in scores if 60 <= s < 80)},
        {"range": "40-59%", "count": sum(1 for s in scores if 40 <= s < 60)},
        {"range": "< 40%", "count": sum(1 for s in scores if s < 40)},
    ]

    stages_breakdown = [
        {"stage": k, "count": v, "percentage": round((v / total_candidates) * 100, 1)}
        for k, v in stages.items()
    ]

    conn.close()
    return {
        "total_candidates": total_candidates,
        "skill_coverage": skill_coverage,
        "missing_skills_freq": missing_freq,
        "score_distribution": brackets,
        "stages_breakdown": stages_breakdown
    }


# =====================================================================
# AI COURSE OUTCOMES (CO1 - CO5) DEMONSTRATION ENDPOINTS
# =====================================================================

@app.get("/api/jobs/{job_id}/graph-search")
def run_graph_search(
    job_id: int,
    algorithm: str = Query("bfs", pattern="^(bfs|dfs|a_star)$"),
    target_candidate_id: Optional[int] = None
):
    """
    CO2: Executes real graph traversal (BFS, DFS, or A*) and returns
    full step-by-step playback trace and graph topology.
    """
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM jobs WHERE id = ?", (job_id,))
    job_row = cursor.fetchone()
    if not job_row:
        conn.close()
        raise HTTPException(status_code=404, detail="Job not found")

    job = dict(job_row)
    job["required_skills"] = json.loads(job["required_skills"])
    job["preferred_skills"] = json.loads(job["preferred_skills"])

    cursor.execute("SELECT * FROM candidates WHERE job_id = ? ORDER BY score_overall DESC", (job_id,))
    cands = [dict(r) for r in cursor.fetchall()]
    for c in cands:
        c["detected_skills"] = json.loads(c["detected_skills"])

    conn.close()

    graph, raw_graph = build_recruitment_graph(job, cands)
    start_node = f"job_{job_id}"
    target_node = f"cand_{target_candidate_id}" if target_candidate_id else None

    if algorithm == "bfs":
        result = graph.bfs(start_node, target_node)
    elif algorithm == "dfs":
        result = graph.dfs(start_node, target_node)
    else:  # a_star
        if not target_node and cands:
            target_node = f"cand_{cands[0]['id']}"
        result = graph.a_star(start_node, target_node or f"job_{job_id}")

    return {
        "graph_topology": raw_graph,
        "search_result": result
    }


@app.get("/api/jobs/{job_id}/knowledge-graph")
def get_knowledge_graph(job_id: int):
    """
    CO3: Returns structured RDF triples and graph connections.
    """
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM jobs WHERE id = ?", (job_id,))
    job_row = cursor.fetchone()
    if not job_row:
        conn.close()
        raise HTTPException(status_code=404, detail="Job not found")

    job = dict(job_row)
    job["required_skills"] = json.loads(job["required_skills"])
    job["preferred_skills"] = json.loads(job["preferred_skills"])

    cursor.execute("SELECT * FROM candidates WHERE job_id = ?", (job_id,))
    cands = [dict(r) for r in cursor.fetchall()]
    for c in cands:
        c["detected_skills"] = json.loads(c["detected_skills"])

    conn.close()

    triples = generate_knowledge_triples(job, cands)
    return {
        "triples": triples,
        "total_facts": len(triples),
        "explicit_facts": sum(1 for t in triples if t.get("is_explicit")),
        "inferred_facts": sum(1 for t in triples if not t.get("is_explicit"))
    }


@app.get("/api/jobs/{job_id}/ai-agent-log")
def get_agent_log(job_id: int):
    """
    CO1: Returns the screening agent's perception-reasoning-action trace.
    """
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM jobs WHERE id = ?", (job_id,))
    job_row = cursor.fetchone()
    if not job_row:
        conn.close()
        raise HTTPException(status_code=404, detail="Job not found")

    job = dict(job_row)
    job["required_skills"] = json.loads(job["required_skills"])
    job["preferred_skills"] = json.loads(job["preferred_skills"])
    job["weights"] = json.loads(job["weights"])

    cursor.execute("SELECT COUNT(*) FROM candidates WHERE job_id = ?", (job_id,))
    count = cursor.fetchone()[0]
    conn.close()

    return {
        "agent_name": "TalentLens AI Screener",
        "co_mapping": "CO1 (Intelligent Agents and Problem-Solving)",
        "agent_type": "Goal-Based Utility Agent",
        "environment": {
            "observable": "Partially Observable (Resumes may omit unmentioned skills)",
            "deterministic": "Deterministic (Given fixed weights and text inputs)",
            "sequential": "Episodic (Candidate evaluations are modular)",
            "discrete": "Discrete (Tokens, candidate pool, scoring metrics)"
        },
        "perception_phase": {
            "inputs": f"Extracted text from {count} uploaded resumes",
            "normalizer": "Regex text sanitization & canonical skill synonym lookup"
        },
        "reasoning_phase": {
            "co4_rules": "Evaluated hard eligibility rules (min years experience, core skills)",
            "co4_bayes": "Bayesian probability update with uncertainty interval",
            "co5_ml": "TF-IDF sublinear vectorization with N-gram (1,2) cosine similarity",
            "decision_synthesis": "Multi-criteria utility function with recruiter-specified weights"
        },
        "action_phase": {
            "outputs": "Ranked shortlisting table with evidence quotes and review state assignments"
        }
    }
