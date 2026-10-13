import re

from skill_extraction import extract_skills


def analyze_job_description(
    job_text,
    skill_list,
    skill_aliases
):
    text = job_text.lower()

    protected_text = (
        text
        .replace("asp.net", "asp_net")
        .replace(".net", "dot_net")
        .replace("node.js", "node_js")
    )

    sentences = re.split(
        r"[!?\n]+|(?<=[.!?])\s+",
        protected_text
    )

    required_skills = set()
    preferred_skills = set()

    for sentence in sentences:

        sentence = (
            sentence
            .replace("asp_net", "asp.net")
            .replace("dot_net", ".net")
            .replace("node_js", "node.js")
        )

        skills_found = extract_skills(
            sentence,
            skill_list,
            skill_aliases
        )

        if re.search(
            r"\b(required|required skills|must|mandatory|"
            r"strong experience|strong knowledge|essential)\b",
            sentence
        ):
            required_skills.update(skills_found)

        elif re.search(
            r"\b(preferred|preferred skills|nice to have|"
            r"plus|bonus|ideally)\b",
            sentence
        ):
            preferred_skills.update(skills_found)

        else:
            required_skills.update(skills_found)

    return {
        "Required_Skills": sorted(required_skills),
        "Preferred_Skills": sorted(preferred_skills)
    }


def detect_skill_priority(
    job_text,
    skill_list,
    skill_aliases
):
    text = job_text.lower()

    protected_text = (
        text
        .replace("asp.net", "asp_net")
        .replace(".net", "dot_net")
        .replace("node.js", "node_js")
    )

    sentences = re.split(
        r"[!?\n]+|(?<=[.!?])\s+",
        protected_text
    )

    core = set()
    important = set()
    optional = set()

    for sentence in sentences:

        sentence = (
            sentence
            .replace("asp_net", "asp.net")
            .replace("dot_net", ".net")
            .replace("node_js", "node.js")
        )

        skills_found = extract_skills(
            sentence,
            skill_list,
            skill_aliases
        )

        if re.search(
            r"\b(required|required skills|must|mandatory|"
            r"strong experience|strong knowledge|essential)\b",
            sentence
        ):
            core.update(skills_found)

        elif re.search(
            r"\b(preferred|preferred skills|nice to have|"
            r"plus|bonus|ideally)\b",
            sentence
        ):
            optional.update(skills_found)

        else:
            important.update(skills_found)

    return {
        "core": sorted(core),
        "important": sorted(important),
        "optional": sorted(optional)
    }

def detect_skill_priority(
    job_text,
    skill_list,
    skill_aliases
):
    text = job_text.lower()

    protected_text = (
        text
        .replace("asp.net", "asp_net")
        .replace(".net", "dot_net")
        .replace("node.js", "node_js")
    )

    sentences = re.split(
        r"[!?\n]+|(?<=[.!?])\s+",
        protected_text
    )

    core = set()
    important = set()
    optional = set()

    for sentence in sentences:

        sentence = (
            sentence
            .replace("asp_net", "asp.net")
            .replace("dot_net", ".net")
            .replace("node_js", "node.js")
        )

        skills_found = extract_skills(
            sentence,
            skill_list,
            skill_aliases
        )

        if re.search(
            r"\b(required|required skills|must|mandatory|"
            r"strong experience|strong knowledge|essential)\b",
            sentence
        ):
            core.update(skills_found)

        elif re.search(
            r"\b(preferred|preferred skills|nice to have|"
            r"plus|bonus|ideally)\b",
            sentence
        ):
            optional.update(skills_found)

        else:
            important.update(skills_found)

    return {
        "core": sorted(core),
        "important": sorted(important),
        "optional": sorted(optional)
    }
    