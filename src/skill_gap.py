
def analyze_skill_gap(
    candidate_text,
    job_analysis,
    skill_list,
    skill_aliases
):
    candidate_skills = set(
        extract_skills(
            candidate_text,
            skill_list,
            skill_aliases
        )
    )

    required_skills = set(job_analysis["Required_Skills"])
    preferred_skills = set(job_analysis["Preferred_Skills"])

    matched_required = sorted(
        candidate_skills & required_skills
    )

    missing_required = sorted(
        required_skills - candidate_skills
    )

    matched_preferred = sorted(
        candidate_skills & preferred_skills
    )

    missing_preferred = sorted(
        preferred_skills - candidate_skills
    )

    required_score = (
        len(matched_required) / len(required_skills)
        if required_skills else 0
    )

    preferred_score = (
        len(matched_preferred) / len(preferred_skills)
        if preferred_skills else 0
    )

    return {
        "Candidate_Skills": sorted(candidate_skills),
        "Matched_Required": matched_required,
        "Missing_Required": missing_required,
        "Matched_Preferred": matched_preferred,
        "Missing_Preferred": missing_preferred,
        "Required_Match_Count": len(matched_required),
        "Required_Gap_Count": len(missing_required),
        "Required_Score": required_score,
        "Preferred_Score": preferred_score
    }
