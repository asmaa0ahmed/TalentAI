def generate_match_summary(explanation):

    score = float(explanation["Match_Score"])

    matched = list(explanation["Matched_Skills"])

    missing = list(explanation["Not_Detected_Skills"])

    summary = f"Match score: {score}%."

    if matched:
        summary += (
            " Detected required skills: "
            + ", ".join(matched)
            + "."
        )

    if missing:
        summary += (
            " Skills not detected in the profile: "
            + ", ".join(missing)
            + "."
        )

    summary += (
        f" Core skill coverage: "
        f"{float(explanation['Core_Coverage'])}%."
    )

    summary += (
        f" Supporting skill coverage: "
        f"{float(explanation['Supporting_Coverage'])}%."
    )

    return summary


def generate_candidate_insight(explanation):

    score = float(explanation["Match_Score"])

    matched = list(explanation["Matched_Skills"])

    missing = list(explanation["Not_Detected_Skills"])

    insight = {
        "match_score": score,
        "strengths": matched,
        "skill_gaps": missing,
        "summary": generate_match_summary(explanation)
    }

    if score >= 70:
        insight["match_level"] = "Strong technical match"
    elif score >= 50:
        insight["match_level"] = "Moderate technical match"
    else:
        insight["match_level"] = "Low technical match"

    return insight


def answer_candidate_question(insight, question):

    question = question.lower().strip()

    if "strength" in question or "strong" in question:

        if insight["strengths"]:
            return (
                "The candidate's main technical strengths are: "
                + ", ".join(insight["strengths"])
                + "."
            )

        return "No specific technical strengths were detected."

    if "gap" in question or "missing" in question:

        if insight["skill_gaps"]:
            return (
                "The following required skills were not detected "
                "in the profile: "
                + ", ".join(insight["skill_gaps"])
                + "."
            )

        return "No required skill gaps were detected."

    if "score" in question or "match" in question:

        return (
            f"The technical match score is "
            f"{insight['match_score']}%."
        )

    return (
        "I can currently answer questions about the candidate's "
        "technical strengths, skill gaps, and match score."
    )


def answer_job_question(job_analysis, question):

    question = question.lower().strip()

    if "require" in question or "required" in question:

        required = job_analysis["Required_Skills"]

        if required:
            return (
                "The job requires these technical skills: "
                + ", ".join(required)
                + "."
            )

        return "No required technical skills were detected."

    if "preferred" in question or "optional" in question:

        preferred = job_analysis["Preferred_Skills"]

        if preferred:
            return (
                "The preferred technical skills are: "
                + ", ".join(preferred)
                + "."
            )

        return "No preferred technical skills were detected."

    return (
        "I can currently answer questions about the job's "
        "required and preferred technical skills."
    )


def answer_matching_question(job_analysis, insight, question):

    question = question.lower().strip()

    gaps = insight["skill_gaps"]

    required = job_analysis["Required_Skills"]

    matched = insight["strengths"]

    # Required skills count and list
    if (
        "required skills" in question
        and (
            "how many" in question
            or "which" in question
        )
    ):
        return (
            f"The candidate has {len(matched)} of "
            f"{len(required)} required skills detected: "
            + ", ".join(matched)
            + "."
        )

    # Missing skills
    if "missing" in question or "gap" in question:

        if gaps:
            return (
                "The required skills not detected in the "
                "candidate's profile are: "
                + ", ".join(gaps)
                + "."
            )

        return "No required skill gaps were detected."

    # Required-skill matching
    if "required" in question and "match" in question:

        return (
            f"The job requires {len(required)} technical skills. "
            f"{len(matched)} of them were detected in the "
            "candidate's profile."
        )

    return (
        "I can currently answer questions about skill gaps "
        "and required-skill matching."
    )


def ask_assistant(question, job_analysis, candidate_insight):

    question_lower = question.lower().strip()

    # Candidate match score
    if (
        "candidate" in question_lower
        and "score" in question_lower
    ):
        return answer_candidate_question(
            candidate_insight,
            question
        )

    # Required skills count and list
    if (
        "required skills" in question_lower
        and (
            "how many" in question_lower
            or "which" in question_lower
        )
    ):
        return answer_matching_question(
            job_analysis,
            candidate_insight,
            question
        )

    # Matching questions
    if (
        "missing" in question_lower
        or "gap" in question_lower
        or "match" in question_lower
    ):
        return answer_matching_question(
            job_analysis,
            candidate_insight,
            question
        )

    # Candidate questions
    if (
        "candidate" in question_lower
        and (
            "strength" in question_lower
            or "strong" in question_lower
        )
    ):
        return answer_candidate_question(
            candidate_insight,
            question
        )

    # Job questions
    if (
        "job" in question_lower
        and (
            "require" in question_lower
            or "required" in question_lower
            or "preferred" in question_lower
            or "skill" in question_lower
        )
    ):
        return answer_job_question(
            job_analysis,
            question
        )

    return (
        "I can answer questions about the candidate, "
        "the job requirements, and their technical match."
    )