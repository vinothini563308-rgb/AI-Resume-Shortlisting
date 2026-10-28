import os
from pathlib import Path
import fitz

BASE_DIR = Path(__file__).resolve().parent
SAMPLE_DIR = BASE_DIR / "sample_resumes"
SAMPLE_DIR.mkdir(exist_ok=True)

RESUMES = {
    "Nitharshana_PS_Resume": {
        "text": """NITHARSHANA P S
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
HTML, CSS, JavaScript, React, SQL, C Programming, Python, Internet of Things, Git, GitHub, API Integration, Database Management, Artificial Intelligence, Machine Learning Fundamentals, Problem Solving
""",
        "title": "NITHARSHANA P S — Software Developer"
    },
    "Alex_Mercer_AI_Engineer": {
        "text": """Alex Mercer
San Francisco, CA | alex.mercer@example.com | +1 (555) 234-5678 | github.com/alexmercer

SUMMARY
Senior Machine Learning Engineer with 5+ years of experience designing scalable AI systems, NLP pipelines, and REST APIs using Python, PyTorch, Scikit-learn, and SQL. Deployed microservices on AWS with Docker.

EXPERIENCE
Senior AI Engineer - HyperScale AI (2021 - Present)
• Designed and trained deep learning NLP models using PyTorch and Scikit-learn, achieving 94% F1-score on customer intent classification.
• Engineered resilient REST APIs with FastAPI and Docker, handling 15M daily requests.
• Optimized complex SQL queries and data extraction across 20TB PostgreSQL cluster.

Machine Learning Developer - DataStream Inc (2019 - 2021)
• Built predictive models using Python, Pandas, and Scikit-learn for churn prediction.
• Implemented automated model monitoring pipelines.

EDUCATION
B.S. in Computer Science - University of California, Berkeley (2019)

SKILLS
Python, Machine Learning, Scikit-Learn, PyTorch, SQL, REST API, Docker, AWS, NLP, Pandas, Git, FastAPI, Database Management
""",
        "title": "Alex Mercer — Senior AI & ML Engineer"
    },
    "Sarah_Chen_Data_Scientist": {
        "text": """Sarah Chen
New York, NY | sarah.chen@example.com | +1 (555) 345-6789

PROFESSIONAL SUMMARY
Data Scientist & ML Developer with 3.5 years of experience in statistical analysis, machine learning algorithms, Scikit-learn, and Python programming. Experienced in SQL database querying and cloud deployments.

PROFESSIONAL EXPERIENCE
Data Scientist - FinTech Labs (2022 - Present)
• Developed fraud detection algorithms with Scikit-learn, Python, and SQL.
• Created microservices and REST API endpoints for real-time risk scoring.
• Assisted in containerization with Docker and deployments to AWS EC2.

Junior Python Developer - NextGen Systems (2020 - 2022)
• Maintained data pipelines with Pandas, NumPy, and SQL.

EDUCATION
B.S. in Statistics and Data Science - Columbia University (2020)

SKILLS
Python, Machine Learning, Scikit-Learn, SQL, REST API, Docker, AWS, Pandas, NumPy, Statistics, Git
""",
        "title": "Sarah Chen — Data Scientist"
    },
    "Priyanshu_Sharma_FullStack": {
        "text": """Priyanshu Sharma
Bengaluru, India | priyanshu.sharma@example.com | +91 98765 43210

PROFESSIONAL SUMMARY
Full-Stack & AI Software Developer with 2+ years of hands-on experience building reactive React interfaces, high-throughput Python backends, and ML inference microservices. Passionate about end-to-end product engineering.

WORK EXPERIENCE
Full-Stack Engineer - NextWave Technologies (2023 - Present)
• Engineered modern responsive UI with React, TypeScript, Tailwind CSS, and HTML/CSS.
• Integrated REST APIs and GraphQL endpoints handling 200k monthly active users.
• Built predictive analytics dashboards using Python, Pandas, and SQL databases.

Associate Software Developer - CodeLabs (2022 - 2023)
• Developed automated database migrations and authentication services in PostgreSQL and Node.js.
• Containerized microservices using Docker and orchestrated CI/CD workflows on GitHub.

EDUCATION
B.Tech in Computer Science and Engineering - National Institute of Technology (NIT) (2022)

SKILLS
React, JavaScript, TypeScript, Python, SQL, REST API, HTML, CSS, Git, GitHub, Node.js, Docker, API Integration, Problem Solving
""",
        "title": "Priyanshu Sharma — Full-Stack & AI Developer"
    }
}

def generate_pdf(filename: str, title: str, text: str):
    doc = fitz.open()
    page = doc.new_page(width=595, height=842) # A4 format

    # Add header accent banner
    rect = fitz.Rect(0, 0, 595, 60)
    page.draw_rect(rect, color=(0.04, 0.1, 0.2), fill=(0.05, 0.12, 0.25))

    page.insert_text(fitz.Point(36, 38), title, fontsize=15, color=(1, 1, 1), fontname="helv")

    # Body lines
    y = 85
    lines = text.split("\n")
    for line in lines:
        if y > 800:
            page = doc.new_page(width=595, height=842)
            y = 50

        line_str = line.strip()
        if not line_str:
            y += 8
            continue

        if line_str in ["SUMMARY", "PROFESSIONAL SUMMARY", "WORK EXPERIENCE", "COLLEGE PROJECTS & HACKATHONS", "EXPERIENCE", "PROFESSIONAL EXPERIENCE", "EDUCATION", "SKILLS"]:
            y += 6
            page.draw_line(fitz.Point(36, y - 2), fitz.Point(559, y - 2), color=(0.8, 0.85, 0.9), width=0.8)
            page.insert_text(fitz.Point(36, y + 10), line_str, fontsize=11, color=(0.05, 0.15, 0.35), fontname="helv")
            y += 18
        elif line_str.startswith("•"):
            page.insert_text(fitz.Point(46, y), line_str, fontsize=8.5, color=(0.2, 0.2, 0.2), fontname="helv")
            y += 13
        elif any(line_str.startswith(x) for x in ["ATRIVA", "Auriva", "ARGUS", "RAIN", "CampusSync", "Senior AI", "Data Scientist", "Full-Stack", "Junior", "Associate"]):
            page.insert_text(fitz.Point(36, y), line_str, fontsize=9.5, color=(0.1, 0.15, 0.25), fontname="helv")
            y += 14
        else:
            # Regular text
            page.insert_text(fitz.Point(36, y), line_str[:95], fontsize=8.5, color=(0.25, 0.25, 0.25), fontname="helv")
            y += 13

    pdf_path = SAMPLE_DIR / f"{filename}.pdf"
    doc.save(str(pdf_path))
    doc.close()

    # Save matching TXT
    txt_path = SAMPLE_DIR / f"{filename}.txt"
    txt_path.write_text(text, encoding="utf-8")
    print(f"Generated: {pdf_path.name} and {txt_path.name}")

for fname, data in RESUMES.items():
    generate_pdf(fname, data["title"], data["text"])

print("All real resumes generated successfully.")
