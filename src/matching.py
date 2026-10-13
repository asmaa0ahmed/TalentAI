
import numpy as np


def calculate_final_match(
    tfidf_score,
    semantic_score,
    skill_score
):
    final_score = (
        0.15 * tfidf_score +
        0.35 * semantic_score +
        0.50 * skill_score
    )

    return {
        "TFIDF_Score": tfidf_score,
        "Semantic_Score": semantic_score,
        "Skill_Score": skill_score,
        "Final_Match_Score": final_score
    }


def build_match_result(
    candidate_id,
    candidate_position,
    match_scores,
    skill_gap_result
):
    return {
        "Candidate_ID": candidate_id,
        "Position": candidate_position,
        "TFIDF_Score": match_scores["TFIDF_Score"],
        "Semantic_Score": match_scores["Semantic_Score"],
        "Skill_Score": match_scores["Skill_Score"],
        "Final_Match_Score": match_scores["Final_Match_Score"],
        "Matched_Required": skill_gap_result["Matched_Required"],
        "Missing_Required": skill_gap_result["Missing_Required"],
        "Candidate_Skills": skill_gap_result["Candidate_Skills"]
    }


def calculate_batch_scores(
    tfidf_scores,
    semantic_scores,
    skill_scores
):
    tfidf_scores = np.asarray(tfidf_scores)
    semantic_scores = np.asarray(semantic_scores)
    skill_scores = np.asarray(skill_scores)

    final_scores = (
        0.15 * tfidf_scores +
        0.35 * semantic_scores +
        0.50 * skill_scores
    )

    return final_scores
