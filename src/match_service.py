from matching import calculate_final_match
from skill_gap import analyze_skill_gap
from job_analyzer import (
    analyze_job_description,
    detect_skill_priority
)
from skill_extraction import extract_skills


def build_candidate_match(
    candidate_text,
    job_text,
    tfidf_score,
    semantic_score,
    skill_list,
    skill_aliases,
    core_skill_groups
):
    # Analyze job description
    job_analysis = analyze_job_description(
        job_text,
        skill_list,
        skill_aliases
    )

    # Detect candidate skills
    candidate_skills = set(
        extract_skills(
            candidate_text,
            skill_list,
            skill_aliases
        )
    )

    # Core skill coverage
    required_skills = set(job_analysis["Required_Skills"])

    if required_skills:
        core_coverage = (
            len(candidate_skills & required_skills)
            / len(required_skills)
        )
    else:
        core_coverage = 0.0

    # Supporting skills coverage
    job_priority = detect_skill_priority(
        job_text,
        skill_list,
        skill_aliases
    )

    supporting_skills = (
        set(job_priority["important"])
        | set(job_priority["optional"])
    )

    if supporting_skills:
        supporting_coverage = (
            len(candidate_skills & supporting_skills)
            / len(supporting_skills)
        )
    else:
        supporting_coverage = 0.0

    # Overall skill score
    skill_score = (
        (core_coverage + supporting_coverage) / 2
    )

    # Calculate final match score
    match_scores = calculate_final_match(
        tfidf_score,
        semantic_score,
        skill_score
    )

    # Skill gap analysis
    skill_gap = analyze_skill_gap(
        candidate_text,
        job_analysis,
        skill_list,
        skill_aliases
    )

    return {
        "TFIDF_Score": match_scores["TFIDF_Score"],
        "Semantic_Score": match_scores["Semantic_Score"],
        "Core_Coverage": core_coverage,
        "Supporting_Coverage": supporting_coverage,
        "Skill_Score": match_scores["Skill_Score"],
        "Final_Match_Score": match_scores["Final_Match_Score"],
        "Matched_Required": skill_gap["Matched_Required"],
        "Missing_Required": skill_gap["Missing_Required"],
        "Matched_Preferred": skill_gap["Matched_Preferred"],
        "Missing_Preferred": skill_gap["Missing_Preferred"],
        "Candidate_Skills": skill_gap["Candidate_Skills"]
    }