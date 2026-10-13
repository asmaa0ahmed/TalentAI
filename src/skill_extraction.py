
import re


def extract_skills(text, skills, aliases):
    text = text.lower()
    found_skills = []

    for skill in skills:
        variants = aliases.get(skill, [skill])

        for variant in variants:
            variant = variant.lower()

            if skill == ".net":
                pattern = r"(?<!asp)(?<!\w)\.net(?!\w)"
            else:
                pattern = r"(?<!\w)" + re.escape(variant) + r"(?!\w)"

            if re.search(pattern, text):
                found_skills.append(skill)
                break

    return sorted(set(found_skills))
