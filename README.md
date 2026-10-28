# TalentLens AI — Intelligent Resume Shortlisting System
> **"Better hiring decisions, backed by evidence."**

TalentLens AI is an evidence-based recruitment intelligence platform designed to replace black-box hiring heuristics with transparent matching, explainable skill alignment, and recruiter-controlled decision workflows.

---

## 1. Product Architecture

TalentLens AI features a decoupled, production-grade client-server architecture:

```
┌────────────────────────────────────────────────────────┐
│                   React 18 + Vite                      │
│       TypeScript • Tailwind CSS • Lucide Icons         │
│  Landing Page • Workspace • Kanban Shortlist • AI Lab  │
└───────────────────────────▲────────────────────────────┘
                            │ REST JSON & Multipart Uploads
┌───────────────────────────▼────────────────────────────┐
│                  FastAPI Backend Server                │
│             Uvicorn • Python 3 • PyMuPDF               │
│                                                        │
│  ┌──────────────────┐  ┌─────────────────────────────┐ │
│  │ Extraction Engine│  │      AI Reasoning (CO1-CO5) │ │
│  │ PDF / DOCX / TXT │  │ TF-IDF • Bayes • Graph Trave│ │
│  └──────────────────┘  └─────────────────────────────┘ │
│                            ▲                           │
│                            │                           │
│                 ┌──────────▼──────────┐                │
│                 │  SQLite Persistence │                │
│                 │   talentlens.db     │                │
│                 └─────────────────────┘                │
└────────────────────────────────────────────────────────┘
```

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide React icons.
- **Backend**: Python FastAPI with asynchronous endpoints and CORS middleware.
- **NLP / ML**: `scikit-learn` (TF-IDF vectorizer + n-gram cosine similarity matrix).
- **Document Extractors**: `pymupdf` (fitz) for PDF documents, `python-docx` and XML fallback for Microsoft Word `.docx` documents.
- **Database**: SQLite with persistent schemas for `jobs`, `candidates`, and `activity_log`.

---

## 2. Five Artificial Intelligence Course Outcomes (CO1–CO5)

TalentLens AI naturally integrates the five fundamental AI course outcomes into the recruitment workflow:

| Course Outcome | Academic Concept | System Feature Implementation |
| :--- | :--- | :--- |
| **CO1** | **Intelligent Agents & Problem-Solving** | Goal-based utility agent that perceives raw resumes, constructs normalized state percepts, evaluates hard rules, applies ML scoring, and produces actionable shortlist recommendations with audit logging. |
| **CO2** | **Uninformed & Informed Search** | Full bipartite network connecting Job Roles, Required/Preferred Skills, and Candidate Profiles. Includes interactive **BFS (FIFO Queue)**, **DFS (LIFO Stack)**, and **A\* Heuristic Search** with step-by-step playback, frontier visualization, and visited node tracking. |
| **CO3** | **Knowledge Representation** | Formal semantic RDF-style triples `(Subject, Predicate, Object)` distinguishing explicit resume facts from inferred attributes with source evidence provenance. |
| **CO4** | **Probabilistic & Rule-Based Reasoning** | Dual-layer reasoning: (1) Hard constraint eligibility rules (minimum experience, required degree, core skill thresholds); (2) Genuine **Bayesian inference** computing posterior probability $P(\text{Match} \mid \text{Evidence})$ with explicit uncertainty intervals $\pm \sigma$. |
| **CO5** | **Machine Learning Decision-Making** | Scikit-learn TF-IDF sublinear vectorizer with $(1, 2)$ n-gram cosine similarity. Includes a configurable multi-criteria scoring formula with dynamic weights and live candidate re-ranking. |

### Mathematical Scoring Formula (CO5)
$$\text{Overall Score} = w_{\text{req}} \cdot S_{\text{req}} + w_{\text{pref}} \cdot S_{\text{pref}} + w_{\text{tfidf}} \cdot S_{\text{tfidf}} + w_{\text{exp}} \cdot S_{\text{exp}}$$

*Default Weights: $w_{\text{req}} = 0.40$, $w_{\text{pref}} = 0.15$, $w_{\text{tfidf}} = 0.30$, $w_{\text{exp}} = 0.15$ (Recruiter customizable in the AI Lab).*

---

## 3. Quick Start & Execution

### Prerequisites
- **Python**: 3.10+
- **Node.js**: v18+ and npm

### Step 1: Start the FastAPI Backend
```powershell
cd d:\resume_shortlisting\AI-Resume-Shortlisting\backend
python -m uvicorn main:app --port 8000 --host 127.0.0.1
```
*Backend runs at:* `http://127.0.0.1:8000`  
*API documentation (Swagger UI):* `http://127.0.0.1:8000/docs`

### Step 2: Start the React Frontend
```powershell
cd d:\resume_shortlisting\AI-Resume-Shortlisting\frontend
npm run dev -- --host 127.0.0.1 --port 5173
```
*Frontend opens at:* `http://127.0.0.1:5173`

---

## 4. Key Functional Areas

1. **Public Landing Page**: Clean, modern interface with Hero section, live interactive candidate preview card, 3-pillar value propositions, workflow explanation, capabilities overview, and ethical AI statement.
2. **Overview Dashboard**: High-level KPI metrics (active jobs, resumes processed, awaiting review, shortlisted finalists, average match score), recent activity stream, and quick shortcuts.
3. **Job Openings**: Create, edit, inspect, and delete requisition profiles with custom required and preferred skills, min experience, and required degree.
4. **Resume Screening**: Batch upload PDF and DOCX documents with drag-and-drop, real-time extraction progress, error handling, and demo resume loaders.
5. **Candidate Intelligence**: Candidate rankings leaderboard, sort and filter by stage/score, side-by-side comparison modal, detail drawer with verifiable source evidence quotes, and data correction editors.
6. **Shortlist Pipeline**: Kanban board (`New` → `Under Review` → `Shortlisted` → `Rejected`), recruiter evaluation notes, and one-click **CSV Export**.
7. **AI Insights & Analytics**: Real applicant skill coverage charts, frequently missing requirement distributions, and score histograms.
8. **AI Lab (CO1–CO5)**: Visual step player for BFS/DFS/A* graph traversal, RDF Knowledge Graph triple browser, Bayesian belief simulator, and dynamic ML weight tuner.

---

## 5. Security, Fairness & Ethical AI Safeguards

- **Protected Demographic Blindness**: Algorithms exclude candidate names, gender, age, ethnicity, addresses, and photos from scoring.
- **Verifiable Evidence**: Every match point links to verbatim quotes from the candidate's actual resume.
- **Mandatory Human-in-the-Loop**: Automated scores assist initial filtering; consequential hiring decisions require explicit recruiter approval.
- **Safe Parsing**: All document text extraction is sandboxed in memory without executing embedded macros or arbitrary scripts.
