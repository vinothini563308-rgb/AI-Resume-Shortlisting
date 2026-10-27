
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

job_description = """
Python developer with machine learning, SQL,
Pandas, NumPy and problem-solving skills
"""

resumes = [
    "Python developer with SQL and machine learning skills",
    "Java developer with HTML, CSS and JavaScript",
    "Python programmer with Pandas and NumPy knowledge"
]

documents = [job_description] + resumes

vectorizer = TfidfVectorizer(stop_words="english")
matrix = vectorizer.fit_transform(documents)

scores = cosine_similarity(
    matrix[0:1],
    matrix[1:]
)[0] * 100

ranked_candidates = sorted(
    enumerate(scores, start=1),
    key=lambda x: x[1],
    reverse=True
)

print("Resume Shortlisting Results")

for rank, (candidate, score) in enumerate(
    ranked_candidates, start=1
):
    print(
        f"Rank {rank}: Candidate {candidate} "
        f"- Similarity Score: {score:.2f}%"
    )
