import sqlite3
import json
from pathlib import Path
from datetime import datetime

BACKEND_DIR = Path(__file__).resolve().parent
DB_PATH = BACKEND_DIR / "talentlens.db"

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()

    # Jobs Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS jobs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        department TEXT,
        location TEXT,
        employment_type TEXT DEFAULT 'Full-time',
        min_experience_years INTEGER DEFAULT 2,
        required_degree TEXT,
        description TEXT NOT NULL,
        required_skills TEXT NOT NULL, -- JSON array
        preferred_skills TEXT NOT NULL, -- JSON array
        weights TEXT NOT NULL, -- JSON object {req, pref, tfidf, exp}
        created_at TEXT NOT NULL
    )
    """)

    # Candidates Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS candidates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        job_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        filename TEXT NOT NULL,
        raw_text TEXT NOT NULL,
        detected_skills TEXT NOT NULL, -- JSON array
        matched_skills TEXT NOT NULL, -- JSON array
        missing_skills TEXT NOT NULL, -- JSON array
        preferred_matched_skills TEXT NOT NULL, -- JSON array
        experience_years REAL DEFAULT 0,
        education TEXT,
        score_tfidf REAL DEFAULT 0,
        score_required_skills REAL DEFAULT 0,
        score_preferred_skills REAL DEFAULT 0,
        score_experience REAL DEFAULT 0,
        score_overall REAL DEFAULT 0,
        bayes_prob REAL DEFAULT 0.5,
        bayes_uncertainty REAL DEFAULT 0.2,
        rule_passed INTEGER DEFAULT 1,
        rule_violations TEXT DEFAULT '[]', -- JSON array
        evidence_snippets TEXT DEFAULT '[]', -- JSON array of {skill, snippet}
        review_stage TEXT DEFAULT 'New', -- New, Under Review, Shortlisted, Rejected
        recruiter_notes TEXT DEFAULT '',
        human_decision TEXT DEFAULT 'Pending', -- Pending, Approved, Declined
        reviewed_at TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (job_id) REFERENCES jobs (id) ON DELETE CASCADE
    )
    """)

    # Activity Log Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS activity_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        job_id INTEGER,
        candidate_id INTEGER,
        action TEXT NOT NULL,
        details TEXT,
        created_at TEXT NOT NULL
    )
    """)

    conn.commit()

    # Seed initial data if empty
    cursor.execute("SELECT COUNT(*) FROM jobs")
    job_count = cursor.fetchone()[0]

    if job_count == 0:
        seed_data(conn)

    conn.close()

def seed_data(conn):
    cursor = conn.cursor()
    now = datetime.now().isoformat(timespec="seconds")

    # Job 1: Senior AI/ML Engineer
    cursor.execute("""
    INSERT INTO jobs (title, department, location, employment_type, min_experience_years, required_degree, description, required_skills, preferred_skills, weights, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        "Senior AI & Machine Learning Engineer",
        "Engineering",
        "San Francisco, CA (Hybrid)",
        "Full-time",
        3,
        "Bachelor's in Computer Science or related field",
        "We are looking for an experienced AI/ML Engineer to develop and deploy production machine learning models, build high-throughput NLP data pipelines, and collaborate with product teams. Strong proficiency in Python, Scikit-learn, PyTorch, SQL, and REST APIs is required. Familiarity with Docker, cloud deployments (AWS), and MLOps is highly valued.",
        json.dumps(["python", "machine learning", "scikit-learn", "sql", "pytorch", "rest api"]),
        json.dumps(["docker", "aws", "nlp", "pandas", "fastapi"]),
        json.dumps({"req": 0.40, "pref": 0.15, "tfidf": 0.30, "exp": 0.15}),
        now
    ))
    job1_id = cursor.lastrowid

    # Job 2: Full-Stack React Developer
    cursor.execute("""
    INSERT INTO jobs (title, department, location, employment_type, min_experience_years, required_degree, description, required_skills, preferred_skills, weights, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        "Full-Stack React & Node Developer",
        "Product Engineering",
        "Remote",
        "Full-time",
        2,
        "Bachelor's degree or equivalent practical experience",
        "Seeking a passionate Full-Stack Developer to build responsive, accessible web applications. Must have demonstrated expertise in TypeScript, React, Node.js, REST APIs, and modern CSS. Experience with PostgreSQL or MongoDB and cloud deployments is preferred.",
        json.dumps(["react", "typescript", "javascript", "node.js", "rest api"]),
        json.dumps(["postgresql", "mongodb", "docker", "git", "tailwind"]),
        json.dumps({"req": 0.45, "pref": 0.15, "tfidf": 0.25, "exp": 0.15}),
        now
    ))
    job2_id = cursor.lastrowid

    # Job 3: AI & Full-Stack Software Developer (Associate / Campus Specialist)
    cursor.execute("""
    INSERT INTO jobs (title, department, location, employment_type, min_experience_years, required_degree, description, required_skills, preferred_skills, weights, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        "AI & Full-Stack Software Developer (Associate)",
        "Emerging Tech & AI Labs",
        "Bengaluru / Hybrid",
        "Full-time",
        0.5,
        "Bachelor of Technology (B.Tech) in CS, AI & ML, or related",
        "Looking for an agile and ambitious Software Developer with a solid foundation in Artificial Intelligence, Machine Learning, and modern full-stack web applications. Responsibilities include prototyping AI models (predictive analytics, anomaly detection, NLP), designing responsive web applications using React and JavaScript, and building clean REST APIs with SQL databases.",
        json.dumps(["python", "react", "artificial intelligence", "sql", "machine learning", "javascript"]),
        json.dumps(["git", "github", "api integration", "database management", "c programming", "internet of things", "html", "css"]),
        json.dumps({"req": 0.40, "pref": 0.20, "tfidf": 0.25, "exp": 0.15}),
        now
    ))
    job3_id = cursor.lastrowid

    # Raw text for Nitharshana P S
    nitharshana_raw_text = """NITHARSHANA P S
SOFTWARE DEVELOPER | +91 9994198237 | nitharshh2007@gmail.com

SUMMARY
Computer Science (AI & ML) student with a CGPA of 8.8, passionate about building real-world solutions using software and artificial intelligence. Experienced in developing full-stack applications and AI-driven projects, with a strong focus on problem-solving, scalability, and user-centric design. Continuously learning and exploring modern technologies to grow as a developer.

WORK EXPERIENCE
COLLEGE PROJECTS & HACKATHONS
ATRIVA
• Developed an AI-driven ICU crisis intelligence system for real-time patient monitoring
• Processed multimodal healthcare data (ECG, vital signs) for analysis
• Implemented predictive models to detect early signs of patient deterioration
• Designed a scalable architecture using federated learning concepts
• Focused on improving clinical decision-making and reducing response time
Auriva
• Built an AI-powered accessibility solution to enhance digital usability
• Developed intelligent features to assist users with diverse accessibility needs
• Improved navigation and interaction through adaptive system design
• Focused on creating an inclusive and user-friendly experience
ARGUS
• Developed an intelligent monitoring and analytics platform
• Implemented real-time data tracking and anomaly detection
• Generated actionable insights for faster decision-making
• Focused on improving system efficiency and reliability
RAIN
• Created an AI-based environmental monitoring system
• Implemented rainfall prediction and climate analysis models
• Processed environmental data to generate insights and alerts
• Focused on enabling better planning for weather-dependent activities
CampusSync
• Designed and developed a full-stack campus management system
• Implemented authentication with role-based access (student, admin)
• Built secure login with device-based restrictions
• Developed QR-based attendance tracking system

EDUCATION
I am currently pursuing a Bachelor of Technology (B.Tech) in Computer Science (AI & ML) at Karunya Institute of Technology and Sciences, Coimbatore, with a CGPA of 8.8. I am in Semester 2 (First Year) and expected to graduate in 2029.

SKILLS
HTML, CSS, JavaScript, React, SQL, C Programming, Python, Internet of Things, Git, GitHub, API Integration, Database Management, Artificial Intelligence, Machine Learning Fundamentals, Problem Solving"""

    nitharshana_detected_skills = [
        "python", "react", "javascript", "html", "css", "sql", "git", "github",
        "artificial intelligence", "machine learning", "api integration", "c programming",
        "database management", "internet of things", "problem-solving"
    ]

    # Seed candidates for Job 1 with realistic profiles
    candidates_job1 = [
        {
            "name": "Alex Mercer",
            "email": "alex.mercer@example.com",
            "phone": "+1 (555) 234-5678",
            "filename": "Alex_Mercer_AI_Engineer.pdf",
            "raw_text": """Alex Mercer
San Francisco, CA | alex.mercer@example.com | +1 (555) 234-5678 | github.com/alexmercer
SUMMARY:
Senior Machine Learning Engineer with 5+ years of experience designing scalable AI systems, NLP pipelines, and REST APIs using Python, PyTorch, Scikit-learn, and SQL. Deployed microservices on AWS with Docker.
EXPERIENCE:
Senior AI Engineer - HyperScale AI (2021 - Present)
- Designed and trained deep learning NLP models using PyTorch and Scikit-learn, achieving 94% F1-score on customer intent classification.
- Engineered resilient REST APIs with FastAPI and Docker, handling 15M daily requests.
- Optimized complex SQL queries and data extraction across 20TB PostgreSQL cluster.
Machine Learning Developer - DataStream Inc (2019 - 2021)
- Built predictive models using Python, Pandas, and Scikit-learn for churn prediction.
EDUCATION:
B.S. in Computer Science - University of California, Berkeley (2019)
SKILLS:
Python, Machine Learning, Scikit-Learn, PyTorch, SQL, REST API, Docker, AWS, NLP, Pandas, Git, FastAPI""",
            "detected_skills": ["python", "machine learning", "scikit-learn", "pytorch", "sql", "rest api", "docker", "aws", "nlp", "pandas", "git", "fastapi"],
            "matched_skills": ["python", "machine learning", "scikit-learn", "sql", "pytorch", "rest api"],
            "missing_skills": [],
            "preferred_matched_skills": ["docker", "aws", "nlp", "pandas", "fastapi"],
            "experience_years": 5.0,
            "education": "B.S. in Computer Science - UC Berkeley",
            "score_tfidf": 84.5,
            "score_required_skills": 100.0,
            "score_preferred_skills": 100.0,
            "score_experience": 100.0,
            "score_overall": 92.1,
            "bayes_prob": 0.94,
            "bayes_uncertainty": 0.06,
            "rule_passed": 1,
            "rule_violations": [],
            "evidence_snippets": [
                {"skill": "machine learning", "snippet": "Designed and trained deep learning NLP models using PyTorch and Scikit-learn, achieving 94% F1-score."},
                {"skill": "rest api", "snippet": "Engineered resilient REST APIs with FastAPI and Docker, handling 15M daily requests."},
                {"skill": "sql", "snippet": "Optimized complex SQL queries and data extraction across 20TB PostgreSQL cluster."}
            ],
            "review_stage": "Shortlisted",
            "recruiter_notes": "Exemplary match across all core requirements. Strong production deployment track record.",
            "human_decision": "Approved"
        },
        {
            "name": "Nitharshana P S",
            "email": "nitharshh2007@gmail.com",
            "phone": "+91 9994198237",
            "filename": "Nitharshana_PS_Resume.pdf",
            "raw_text": nitharshana_raw_text,
            "detected_skills": nitharshana_detected_skills,
            "matched_skills": ["python", "machine learning", "sql"],
            "missing_skills": ["scikit-learn", "pytorch", "rest api"],
            "preferred_matched_skills": ["git", "database management", "api integration"],
            "experience_years": 1.0,
            "education": "B.Tech in Computer Science (AI & ML) - Karunya Institute of Technology and Sciences (CGPA: 8.8)",
            "score_tfidf": 68.4,
            "score_required_skills": 50.0,
            "score_preferred_skills": 60.0,
            "score_experience": 33.3,
            "score_overall": 64.5,
            "bayes_prob": 0.62,
            "bayes_uncertainty": 0.16,
            "rule_passed": 0,
            "rule_violations": ["Experience 1.0 yrs below senior requirement (3.0 yrs)", "Missing frameworks: PyTorch, Scikit-learn"],
            "evidence_snippets": [
                {"skill": "machine learning", "snippet": "Implemented predictive models to detect early signs of patient deterioration in ICU crisis intelligence system (ATRIVA)."},
                {"skill": "python", "snippet": "Created AI-based environmental monitoring system (RAIN) and rainfall prediction models using Python."},
                {"skill": "sql", "snippet": "Designed and developed campus management system with SQL database and role-based access."}
            ],
            "review_stage": "Under Review",
            "recruiter_notes": "Outstanding foundational AI/ML and full-stack projects. Exceptional potential; better aligned for Associate role.",
            "human_decision": "Pending"
        },
        {
            "name": "Sarah Chen",
            "email": "sarah.chen@example.com",
            "phone": "+1 (555) 345-6789",
            "filename": "Sarah_Chen_Resume.pdf",
            "raw_text": """Sarah Chen
New York, NY | sarah.chen@example.com | +1 (555) 345-6789
PROFESSIONAL SUMMARY:
Data Scientist & ML Developer with 3.5 years of experience in statistical analysis, machine learning algorithms, Scikit-learn, and Python programming. Experienced in SQL database querying and cloud deployments.
PROFESSIONAL EXPERIENCE:
Data Scientist - FinTech Labs (2022 - Present)
- Developed fraud detection algorithms with Scikit-learn, Python, and SQL.
- Created microservices and REST API endpoints for real-time risk scoring.
- Assisted in containerization with Docker and deployments to AWS EC2.
EDUCATION:
B.S. in Statistics and Data Science - Columbia University (2020)
SKILLS:
Python, Machine Learning, Scikit-Learn, SQL, REST API, Docker, AWS, Pandas, NumPy""",
            "detected_skills": ["python", "machine learning", "scikit-learn", "sql", "rest api", "docker", "aws", "pandas", "numpy"],
            "matched_skills": ["python", "machine learning", "scikit-learn", "sql", "rest api"],
            "missing_skills": ["pytorch"],
            "preferred_matched_skills": ["docker", "aws", "pandas"],
            "experience_years": 3.5,
            "education": "B.S. in Statistics and Data Science - Columbia University",
            "score_tfidf": 72.3,
            "score_required_skills": 83.3,
            "score_preferred_skills": 60.0,
            "score_experience": 100.0,
            "score_overall": 79.2,
            "bayes_prob": 0.81,
            "bayes_uncertainty": 0.12,
            "rule_passed": 1,
            "rule_violations": [],
            "evidence_snippets": [
                {"skill": "machine learning", "snippet": "Developed fraud detection algorithms with Scikit-learn, Python, and SQL."},
                {"skill": "rest api", "snippet": "Created microservices and REST API endpoints for real-time risk scoring."}
            ],
            "review_stage": "Under Review",
            "recruiter_notes": "Solid ML foundation with Scikit-learn and SQL. Needs verification on PyTorch depth.",
            "human_decision": "Pending"
        },
        {
            "name": "Marcus Rodriguez",
            "email": "marcus.r@example.com",
            "phone": "+1 (555) 456-7890",
            "filename": "Marcus_Rodriguez_CV.pdf",
            "raw_text": """Marcus Rodriguez
Austin, TX | marcus.r@example.com
PROFILE:
Backend Software Engineer with 4 years experience building distributed backend systems in Python, SQL, and REST APIs.
EDUCATION:
B.S. in Information Technology - Texas A&M (2020)
SKILLS:
Python, SQL, REST API, Docker, Git, Django, PostgreSQL""",
            "detected_skills": ["python", "sql", "rest api", "docker", "git", "django", "postgresql"],
            "matched_skills": ["python", "sql", "rest api"],
            "missing_skills": ["machine learning", "scikit-learn", "pytorch"],
            "preferred_matched_skills": ["docker"],
            "experience_years": 4.0,
            "education": "B.S. in Information Technology - Texas A&M",
            "score_tfidf": 48.0,
            "score_required_skills": 50.0,
            "score_preferred_skills": 20.0,
            "score_experience": 100.0,
            "score_overall": 52.4,
            "bayes_prob": 0.44,
            "bayes_uncertainty": 0.18,
            "rule_passed": 0,
            "rule_violations": ["Missing required ML frameworks: PyTorch, Scikit-learn, Machine Learning"],
            "evidence_snippets": [
                {"skill": "python", "snippet": "Developed backend architectures in Python and Django."},
                {"skill": "rest api", "snippet": "Implemented REST APIs and managed PostgreSQL databases."}
            ],
            "review_stage": "New",
            "recruiter_notes": "Strong backend credentials but lacks core Machine Learning experience for this senior role.",
            "human_decision": "Pending"
        }
    ]

    # Seed candidates for Job 2: Full-Stack React & Node Developer
    candidates_job2 = [
        {
            "name": "Priyanshu Sharma",
            "email": "priyanshu.sharma@example.com",
            "phone": "+91 98765 43210",
            "filename": "Priyanshu_Sharma_FullStack.pdf",
            "raw_text": """Priyanshu Sharma - Full-Stack Developer with React, TypeScript, Node.js, SQL, REST APIs, and Docker.""",
            "detected_skills": ["react", "typescript", "javascript", "node.js", "rest api", "sql", "docker", "git"],
            "matched_skills": ["react", "typescript", "javascript", "node.js", "rest api"],
            "missing_skills": [],
            "preferred_matched_skills": ["docker", "git"],
            "experience_years": 2.5,
            "education": "B.Tech in Computer Science - NIT",
            "score_tfidf": 81.2,
            "score_required_skills": 100.0,
            "score_preferred_skills": 80.0,
            "score_experience": 100.0,
            "score_overall": 88.5,
            "bayes_prob": 0.91,
            "bayes_uncertainty": 0.08,
            "rule_passed": 1,
            "rule_violations": [],
            "evidence_snippets": [
                {"skill": "react", "snippet": "Engineered modern responsive UI with React, TypeScript, and HTML/CSS."},
                {"skill": "node.js", "snippet": "Developed authentication services and API endpoints in Node.js and PostgreSQL."}
            ],
            "review_stage": "Shortlisted",
            "recruiter_notes": "Very strong full-stack profile. Production experience with TypeScript and Node.js.",
            "human_decision": "Approved"
        },
        {
            "name": "Nitharshana P S",
            "email": "nitharshh2007@gmail.com",
            "phone": "+91 9994198237",
            "filename": "Nitharshana_PS_Resume.pdf",
            "raw_text": nitharshana_raw_text,
            "detected_skills": nitharshana_detected_skills,
            "matched_skills": ["react", "javascript"],
            "missing_skills": ["typescript", "node.js", "rest api"],
            "preferred_matched_skills": ["git", "database management", "api integration"],
            "experience_years": 1.0,
            "education": "B.Tech in Computer Science (AI & ML) - Karunya Institute of Technology and Sciences (CGPA: 8.8)",
            "score_tfidf": 64.0,
            "score_required_skills": 40.0,
            "score_preferred_skills": 50.0,
            "score_experience": 50.0,
            "score_overall": 58.0,
            "bayes_prob": 0.55,
            "bayes_uncertainty": 0.15,
            "rule_passed": 0,
            "rule_violations": ["Experience 1.0 yrs below requirement (2.0 yrs)"],
            "evidence_snippets": [
                {"skill": "react", "snippet": "Designed and developed full-stack campus management system with React frontend."},
                {"skill": "javascript", "snippet": "Built interactive accessibility tools and dynamic web interfaces with JavaScript and HTML/CSS."}
            ],
            "review_stage": "Under Review",
            "recruiter_notes": "Strong frontend capabilities with React and JavaScript. CampusSync system demonstrates solid practical engineering.",
            "human_decision": "Pending"
        }
    ]

    # Seed candidates for Job 3: AI & Full-Stack Software Developer (Associate)
    candidates_job3 = [
        {
            "name": "Nitharshana P S",
            "email": "nitharshh2007@gmail.com",
            "phone": "+91 9994198237",
            "filename": "Nitharshana_PS_Resume.pdf",
            "raw_text": nitharshana_raw_text,
            "detected_skills": nitharshana_detected_skills,
            "matched_skills": ["python", "react", "artificial intelligence", "sql", "machine learning", "javascript"],
            "missing_skills": [],
            "preferred_matched_skills": ["git", "github", "api integration", "database management", "c programming", "internet of things", "html", "css"],
            "experience_years": 1.0,
            "education": "B.Tech in Computer Science (AI & ML) - Karunya Institute of Technology and Sciences (CGPA: 8.8, Class of 2029)",
            "score_tfidf": 89.2,
            "score_required_skills": 100.0,
            "score_preferred_skills": 100.0,
            "score_experience": 100.0,
            "score_overall": 94.6,
            "bayes_prob": 0.96,
            "bayes_uncertainty": 0.04,
            "rule_passed": 1,
            "rule_violations": [],
            "evidence_snippets": [
                {"skill": "artificial intelligence", "snippet": "Developed an AI-driven ICU crisis intelligence system for real-time patient monitoring (ATRIVA)."},
                {"skill": "machine learning", "snippet": "Implemented rainfall prediction and climate analysis models in RAIN, and early signs detection in ATRIVA."},
                {"skill": "react", "snippet": "Built CampusSync full-stack campus management system with interactive React frontend and QR attendance."},
                {"skill": "python", "snippet": "Created AI environmental monitoring platform (RAIN) and healthcare data analytics using Python."},
                {"skill": "sql", "snippet": "Implemented authentication and role-based access control with SQL database management in CampusSync."},
                {"skill": "api integration", "snippet": "Built secure login with device restrictions and integrated external APIs for analytics in ARGUS."}
            ],
            "review_stage": "Shortlisted",
            "recruiter_notes": "Top-tier candidate! 100% required and preferred skill match. Outstanding projects across AI healthcare, environmental AI, and full-stack systems. High academic distinction (CGPA 8.8).",
            "human_decision": "Approved"
        },
        {
            "name": "Priyanshu Sharma",
            "email": "priyanshu.sharma@example.com",
            "phone": "+91 98765 43210",
            "filename": "Priyanshu_Sharma_FullStack.pdf",
            "raw_text": """Priyanshu Sharma - Full-Stack Developer with React, TypeScript, Node.js, SQL, REST APIs, and Python.""",
            "detected_skills": ["react", "javascript", "python", "sql", "git", "github", "api integration", "database management", "html", "css"],
            "matched_skills": ["python", "react", "sql", "javascript"],
            "missing_skills": ["artificial intelligence", "machine learning"],
            "preferred_matched_skills": ["git", "github", "api integration", "database management", "html", "css"],
            "experience_years": 2.0,
            "education": "B.Tech in Computer Science - NIT",
            "score_tfidf": 76.5,
            "score_required_skills": 66.7,
            "score_preferred_skills": 87.5,
            "score_experience": 100.0,
            "score_overall": 81.3,
            "bayes_prob": 0.83,
            "bayes_uncertainty": 0.11,
            "rule_passed": 1,
            "rule_violations": [],
            "evidence_snippets": [
                {"skill": "react", "snippet": "Engineered modern responsive UI with React and TypeScript."},
                {"skill": "sql", "snippet": "Managed database schema and migrations in PostgreSQL."}
            ],
            "review_stage": "Under Review",
            "recruiter_notes": "Strong engineering profile. Would need upskilling in AI/ML fundamentals.",
            "human_decision": "Pending"
        }
    ]

    def insert_cand_list(job_id, cands):
        for cand in cands:
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
                json.dumps(cand["rule_violations"]), json.dumps(cand["evidence_snippets"]), cand["review_stage"],
                cand["recruiter_notes"], cand["human_decision"], now
            ))

    insert_cand_list(job1_id, candidates_job1)
    insert_cand_list(job2_id, candidates_job2)
    insert_cand_list(job3_id, candidates_job3)

    # Log seed activity
    cursor.execute("""
    INSERT INTO activity_log (job_id, action, details, created_at)
    VALUES (?, ?, ?, ?)
    """, (job1_id, "Job Created", "Job 'Senior AI & Machine Learning Engineer' initialized with baseline candidates", now))

    cursor.execute("""
    INSERT INTO activity_log (job_id, action, details, created_at)
    VALUES (?, ?, ?, ?)
    """, (job3_id, "Job Created", "Job 'AI & Full-Stack Software Developer (Associate)' initialized with real candidate profiles including Nitharshana P S", now))

    conn.commit()

if __name__ == "__main__":
    init_db()
    print("Database initialized successfully with schema and seed data.")
