import re
import hmac
import hashlib
import secrets
import sqlite3
from pathlib import Path
from datetime import datetime
import pandas as pd
import pymupdf
import streamlit as st
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
# =====================================================
# 1. APP CONFIGURATION
# =====================================================

st.set_page_config(
    page_title="TalentLens | Resume Intelligence",
    page_icon="📄",
    layout="wide",
    initial_sidebar_state="expanded",
)

APP_DIR = Path(__file__).resolve().parent
DB_PATH = APP_DIR / "talentlens_users.db"

# Demo administrator account. Change before sharing the app.
DEMO_USERNAME = "admin"
DEMO_PASSWORD = "TalentLens123"

SKILLS = [
    "python", "java", "c++", "c#", "javascript", "typescript",
    "html", "css", "react", "angular", "node.js", "flask",
    "django", "streamlit", "sql", "mysql", "postgresql",
    "mongodb", "machine learning", "artificial intelligence",
    "deep learning", "scikit-learn", "pandas", "numpy",
    "tensorflow", "pytorch", "data analysis", "data analytics",
    "data visualization", "power bi", "tableau", "excel",
    "statistics", "natural language processing", "nlp",
    "computer vision", "git", "github", "rest api", "aws",
    "azure", "google cloud", "docker", "kubernetes",
    "problem-solving", "teamwork", "communication",
    "data structures", "algorithms", "oop", "software testing",
]


# =====================================================
# 2. PROFESSIONAL STYLING
# =====================================================

st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Manrope:wght@400;600;700;800&display=swap');

html, body, [class*="css"] {
    font-family: 'DM Sans', sans-serif;
}
.stApp {
    background: #f4f7fb;
}
[data-testid="stSidebar"] {
    background: #142238;
}
[data-testid="stSidebar"] * {
    color: #f1f5f9;
}
.hero {
    background: linear-gradient(120deg, #132238, #24536b);
    padding: 30px;
    border-radius: 20px;
    color: white;
    margin-bottom: 24px;
}
.hero h1 {
    color: white;
    font-family: 'Manrope', sans-serif;
    font-size: 34px;
    margin-bottom: 8px;
}
.hero p {
    color: #d7e7f1;
    font-size: 15px;
}
.eyebrow {
    color: #6ee7d8;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 2px;
}
.metric-card {
    background: white;
    border: 1px solid #e3eaf2;
    border-radius: 15px;
    padding: 18px;
    min-height: 105px;
    box-shadow: 0 3px 12px #1422380a;
}
.metric-label {
    color: #64748b;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
}
.metric-value {
    color: #15263e;
    font-size: 27px;
    font-weight: 800;
    margin-top: 8px;
}
.auth-card {
    background: white;
    border: 1px solid #e1e8f0;
    border-radius: 18px;
    padding: 24px;
    box-shadow: 0 12px 40px #14223812;
}
.small-muted {
    color: #64748b;
    font-size: 13px;
}
.section-title {
    color: #15263e;
    font-family: 'Manrope', sans-serif;
    font-size: 22px;
    font-weight: 800;
}
div[data-testid="stMetric"] {
    background: white;
    border: 1px solid #e3eaf2;
    border-radius: 14px;
    padding: 15px;
}
.stButton button, .stDownloadButton button {
    border-radius: 9px;
    font-weight: 700;
    min-height: 42px;
}
.footer {
    text-align: center;
    color: #8492a6;
    font-size: 11px;
    padding: 22px 0;
}
</style>
""", unsafe_allow_html=True)


# =====================================================
# 3. DATABASE AND PASSWORD SECURITY
# =====================================================

def get_connection():
    return sqlite3.connect(DB_PATH)


def hash_password(password, salt=None):
    if salt is None:
        salt = secrets.token_bytes(16)

    password_hash = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt,
        200_000,
    )

    return salt.hex(), password_hash.hex()


def verify_password(password, salt_hex, hash_hex):
    try:
        salt = bytes.fromhex(salt_hex)
        _, calculated_hash = hash_password(password, salt)

        return hmac.compare_digest(
            calculated_hash,
            hash_hex,
        )
    except (ValueError, TypeError):
        return False


def initialize_database():
    with get_connection() as connection:
        connection.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                salt TEXT NOT NULL,
                password_hash TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
        """)

        # Create the fixed demo administrator if it does not exist.
        existing = connection.execute(
            "SELECT id FROM users WHERE username = ?",
            (DEMO_USERNAME,),
        ).fetchone()

        if existing is None:
            salt, password_hash = hash_password(DEMO_PASSWORD)

            connection.execute(
                """
                INSERT INTO users
                (username, salt, password_hash, created_at)
                VALUES (?, ?, ?, ?)
                """,
                (
                    DEMO_USERNAME,
                    salt,
                    password_hash,
                    datetime.now().isoformat(timespec="seconds"),
                ),
            )


def register_user(username, password):
    username = username.strip()

    if not re.fullmatch(r"[A-Za-z0-9_]{3,30}", username):
        return (
            False,
            "Username must be 3–30 characters using letters, "
            "numbers, or underscores.",
        )

    if len(password) < 8:
        return False, "Password must contain at least 8 characters."

    salt, password_hash = hash_password(password)

    try:
        with get_connection() as connection:
            connection.execute(
                """
                INSERT INTO users
                (username, salt, password_hash, created_at)
                VALUES (?, ?, ?, ?)
                """,
                (
                    username,
                    salt,
                    password_hash,
                    datetime.now().isoformat(timespec="seconds"),
                ),
            )

        return True, "Account created successfully. You can now sign in."

    except sqlite3.IntegrityError:
        return False, "That username already exists. Please choose another."


def authenticate_user(username, password):
    with get_connection() as connection:
        user = connection.execute(
            """
            SELECT username, salt, password_hash
            FROM users
            WHERE username = ?
            """,
            (username.strip(),),
        ).fetchone()

    if user is None:
        return False

    stored_username, salt, stored_hash = user

    return (
        verify_password(password, salt, stored_hash)
        and hmac.compare_digest(stored_username, username.strip())
    )


initialize_database()


# =====================================================
# 4. SESSION STATE
# =====================================================

defaults = {
    "authenticated": False,
    "username": "",
    "auth_page": "Login",
    "results": None,
    "required_skills": [],
    "analysis_time": "",
}

for key, value in defaults.items():
    if key not in st.session_state:
        st.session_state[key] = value


# =====================================================
# 5. RESUME PROCESSING HELPERS
# =====================================================

def normalize(text):
    text = text.lower()
    text = re.sub(r"[^a-z0-9+#.\s-]", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def extract_pdf_text(pdf_file):
    with pymupdf.open(
        stream=pdf_file.getvalue(),
        filetype="pdf",
    ) as document:
        return " ".join(
            page.get_text() for page in document
        ).strip()


def detect_skills(text):
    cleaned = normalize(text)

    return sorted(
        {
            skill
            for skill in SKILLS
            if normalize(skill) in cleaned
        },
        key=str.lower,
    )


def metric_card(label, value):
    st.markdown(
        f"""
        <div class="metric-card">
            <div class="metric-label">{label}</div>
            <div class="metric-value">{value}</div>
        </div>
        """,
        unsafe_allow_html=True,
    )


def show_brand():
    st.markdown(
        """
        <div class="hero">
            <div class="eyebrow">TALENT ACQUISITION WORKSPACE</div>
            <h1>TalentLens</h1>
            <p>Smarter resume screening. Clearer candidate insights.</p>
        </div>
        """,
        unsafe_allow_html=True,
    )


# =====================================================
# 6. LOGIN PAGE
# =====================================================

def show_login():
    show_brand()

    left, center, right = st.columns([1, 1.35, 1])

    with center:
        st.markdown('<div class="auth-card">', unsafe_allow_html=True)
        st.markdown("## Welcome back")
        st.markdown(
            '<p class="small-muted">Sign in to continue to your '
            'resume intelligence dashboard.</p>',
            unsafe_allow_html=True,
        )

        with st.form("login_form"):
            username = st.text_input(
                "Username",
                placeholder="Enter your username",
            )
            password = st.text_input(
                "Password",
                type="password",
                placeholder="Enter your password",
            )

            submitted = st.form_submit_button(
                "Sign in",
                type="primary",
                use_container_width=True,
            )

        if submitted:
            if authenticate_user(username, password):
                st.session_state.authenticated = True
                st.session_state.username = username.strip()
                st.session_state.auth_page = "Login"
                st.rerun()
            else:
                st.error("Invalid username or password.")

        st.markdown("</div>", unsafe_allow_html=True)

        st.write("")
        st.info(
            "Demo administrator credentials\n\n"
            "Username: `admin`\n\n"
            "Password: `TalentLens123`"
        )

        if st.button(
            "New here? Create an account",
            use_container_width=True,
        ):
            st.session_state.auth_page = "Register"
            st.rerun()


# =====================================================
# 7. REGISTRATION PAGE
# =====================================================

def show_registration():
    show_brand()

    left, center, right = st.columns([1, 1.35, 1])

    with center:
        st.markdown('<div class="auth-card">', unsafe_allow_html=True)
        st.markdown("## Create your account")
        st.markdown(
            '<p class="small-muted">Register to access TalentLens.</p>',
            unsafe_allow_html=True,
        )

        with st.form("registration_form"):
            username = st.text_input(
                "Choose a username",
                placeholder="e.g. vinothini25",
            )

            password = st.text_input(
                "Create password",
                type="password",
                placeholder="At least 8 characters",
            )

            confirm_password = st.text_input(
                "Confirm password",
                type="password",
                placeholder="Re-enter your password",
            )

            submitted = st.form_submit_button(
                "Create account",
                type="primary",
                use_container_width=True,
            )

        if submitted:
            if not username.strip():
                st.error("Please enter a username.")
            elif password != confirm_password:
                st.error("The passwords do not match.")
            else:
                success, message = register_user(username, password)

                if success:
                    st.success(message)
                    st.session_state.auth_page = "Login"
                else:
                    st.error(message)

        st.markdown("</div>", unsafe_allow_html=True)

        st.write("")

        if st.button(
            "Already have an account? Sign in",
            use_container_width=True,
        ):
            st.session_state.auth_page = "Login"
            st.rerun()


# =====================================================
# 8. MAIN DASHBOARD
# =====================================================

def show_dashboard():
    with st.sidebar:
        st.markdown("## 📄 TalentLens")
        st.caption("RESUME INTELLIGENCE")
        st.divider()

        st.markdown("**Navigation**")
        st.markdown("◈ Resume screening")
        st.markdown("◉ Candidate insights")
        st.markdown("⇩ Export reports")

        st.divider()
        st.caption("Signed in as")
        st.markdown(f"**{st.session_state.username}**")

        if st.button("Log out", use_container_width=True):
            st.session_state.authenticated = False
            st.session_state.username = ""
            st.session_state.results = None
            st.session_state.required_skills = []
            st.session_state.analysis_time = ""
            st.session_state.auth_page = "Login"
            st.rerun()

        st.divider()
        st.caption("AI engine: TF-IDF + cosine similarity")
        st.caption("Skill matching: keyword analysis")

    st.markdown(
        """
        <div class="hero">
            <div class="eyebrow">RECRUITMENT INTELLIGENCE</div>
            <h1>Resume Screening Dashboard</h1>
            <p>Compare candidate resumes, inspect skill alignment,
            and generate a ranked shortlist for human review.</p>
        </div>
        """,
        unsafe_allow_html=True,
    )

    role_col, resume_col = st.columns([1.1, 0.9], gap="large")

    with role_col:
        st.markdown("### 01 / Job description")
        job_description = st.text_area(
            "Enter the job requirements",
            height=220,
            placeholder=(
                "Example: Python developer with SQL, machine learning, "
                "Pandas, NumPy, and problem-solving skills..."
            ),
        )

    with resume_col:
        st.markdown("### 02 / Candidate resumes")
        uploaded_files = st.file_uploader(
            "Upload PDF resumes",
            type=["pdf"],
            accept_multiple_files=True,
        )

        if uploaded_files:
            st.success(f"{len(uploaded_files)} resume(s) selected.")

            for file in uploaded_files[:5]:
                st.caption(f"📄 {file.name}")

            if len(uploaded_files) > 5:
                st.caption(f"+ {len(uploaded_files) - 5} more file(s)")

    if st.button(
        "✦ Analyze and rank candidates",
        type="primary",
        use_container_width=True,
    ):
        if not job_description.strip():
            st.error("Please enter a job description.")
        elif not uploaded_files:
            st.error("Please upload at least one PDF resume.")
        else:
            records = []
            errors = []
            progress = st.progress(0, text="Reading resumes...")

            for index, file in enumerate(uploaded_files):
                try:
                    text = extract_pdf_text(file)

                    if text.strip():
                        records.append({
                            "Resume": file.name,
                            "Text": text,
                            "Clean": normalize(text),
                        })
                    else:
                        errors.append(
                            f"{file.name}: no selectable text found."
                        )

                except Exception:
                    errors.append(
                        f"{file.name}: unable to read this PDF."
                    )

                progress.progress(
                    (index + 1) / len(uploaded_files),
                    text=f"Processing resume {index + 1} of {len(uploaded_files)}",
                )

            progress.empty()

            for error in errors:
                st.warning(error)

            if not records:
                st.error(
                    "No readable resume text was found. "
                    "Try text-based PDFs rather than scanned images."
                )
            else:
                documents = [
                    normalize(job_description)
                ] + [record["Clean"] for record in records]

                try:
                    vectorizer = TfidfVectorizer(
                        stop_words="english"
                    )
                    matrix = vectorizer.fit_transform(documents)

                    scores = (
                        cosine_similarity(
                            matrix[0:1],
                            matrix[1:],
                        )[0] * 100
                    )

                except ValueError:
                    st.error(
                        "Not enough usable text to compare. "
                        "Please provide a more detailed job description."
                    )
                    st.stop()

                required_skills = detect_skills(job_description)
                output = []

                for record, score in zip(records, scores):
                    resume_skills = detect_skills(record["Text"])

                    matched = sorted(
                        set(required_skills) & set(resume_skills),
                        key=str.lower,
                    )

                    missing = sorted(
                        set(required_skills) - set(resume_skills),
                        key=str.lower,
                    )

                    skill_score = (
                        round(
                            len(matched) / len(required_skills) * 100,
                            2,
                        )
                        if required_skills else None
                    )

                    output.append({
                        "Resume": record["Resume"],
                        "Similarity Score (%)": round(
                            float(score), 2
                        ),
                        "Skill Alignment (%)": skill_score,
                        "Matched Skills": (
                            ", ".join(matched)
                            if matched else "None detected"
                        ),
                        "Missing Skills": (
                            ", ".join(missing)
                            if missing else (
                                "None detected"
                                if required_skills
                                else "No required skills detected"
                            )
                        ),
                        "_text": record["Text"],
                    })

                results = pd.DataFrame(output)
                results = results.sort_values(
                    "Similarity Score (%)",
                    ascending=False,
                ).reset_index(drop=True)

                results.insert(
                    0,
                    "Rank",
                    range(1, len(results) + 1),
                )

                st.session_state.results = results
                st.session_state.required_skills = required_skills
                st.session_state.analysis_time = datetime.now().strftime(
                    "%d %b %Y, %I:%M %p"
                )

    # Display the latest completed analysis
    if st.session_state.results is not None:
        results = st.session_state.results
        required_skills = st.session_state.required_skills
        best = results.iloc[0]

        st.divider()
        st.markdown("## Screening overview")
        st.caption(
            f"Last analysis: {st.session_state.analysis_time}"
        )

        col1, col2, col3, col4 = st.columns(4)

        with col1:
            metric_card("Resumes analyzed", str(len(results)))

        with col2:
            metric_card(
                "Top similarity",
                f'{best["Similarity Score (%)"]:.1f}%',
            )

        with col3:
            metric_card(
                "Average similarity",
                f'{results["Similarity Score (%)"].mean():.1f}%',
            )

        with col4:
            metric_card(
                "Required skills",
                str(len(required_skills)),
            )

        st.markdown("### 🏆 Top-matching resume")
        st.success(
            f'**{best["Resume"]}** — similarity score: '
            f'**{best["Similarity Score (%)"]:.2f}%**'
        )

        st.caption(
            "This is the highest text-similarity score, "
            "not a hiring recommendation."
        )

        chart_col, skills_col = st.columns([1.2, 1])

        with chart_col:
            st.markdown("### 📊 Candidate comparison")
            chart_data = results[
                ["Resume", "Similarity Score (%)"]
            ].set_index("Resume")

            st.bar_chart(
                chart_data,
                y="Similarity Score (%)",
                horizontal=True,
                height=300,
            )

        with skills_col:
            st.markdown("### 🧩 Required skills")

            if required_skills:
                st.write(", ".join(required_skills))
            else:
                st.info(
                    "No skills from the built-in keyword list "
                    "were detected in the job description."
                )

        st.markdown("### 📋 Ranked candidate results")

        visible_columns = [
            "Rank",
            "Resume",
            "Similarity Score (%)",
            "Skill Alignment (%)",
            "Matched Skills",
            "Missing Skills",
        ]

        st.dataframe(
            results[visible_columns],
            use_container_width=True,
            hide_index=True,
        )

        st.markdown("### 🔎 Candidate details")

        selected_name = st.selectbox(
            "Choose a resume to inspect",
            results["Resume"].tolist(),
        )

        selected = results[
            results["Resume"] == selected_name
        ].iloc[0]

        detail_col1, detail_col2 = st.columns(2)

        with detail_col1:
            st.markdown("**Matched skills**")
            st.write(selected["Matched Skills"])

        with detail_col2:
            st.markdown("**Missing skills**")
            st.write(selected["Missing Skills"])

        with st.expander("View extracted resume text"):
            extracted_text = results.loc[
                results["Resume"] == selected_name,
                "_text",
            ].iloc[0]

            st.text_area(
                "Extracted text",
                extracted_text,
                height=220,
                disabled=True,
            )

        csv_columns = [
            "Rank",
            "Resume",
            "Similarity Score (%)",
            "Skill Alignment (%)",
            "Matched Skills",
            "Missing Skills",
        ]

        csv_data = results[csv_columns].to_csv(
            index=False
        ).encode("utf-8-sig")

        st.download_button(
            "⬇ Download ranked results as CSV",
            data=csv_data,
            file_name="talentlens_shortlisting_results.csv",
            mime="text/csv",
            use_container_width=True,
        )

        st.info(
            "Review resumes manually. Similarity scores can miss context "
            "and synonyms; do not make hiring decisions based only on them."
        )

    st.markdown(
        '<div class="footer">TALENTLENS • RESUME INTELLIGENCE • STUDENT DEMO</div>',
        unsafe_allow_html=True,
    )


# =====================================================
# 9. APPLICATION ROUTING
# =====================================================

if st.session_state.authenticated:
    show_dashboard()
elif st.session_state.auth_page == "Register":
    show_registration()
else:
    show_login()
