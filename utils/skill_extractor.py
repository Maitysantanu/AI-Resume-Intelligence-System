import re


def load_all_skills(role_data):

    skills = set()

    # role_data is a dictionary
    for role in role_data:

        for skill in role_data[role]["required_skills"]:
            skills.add(skill.lower())

    return list(skills)


def extract_skills(text, all_skills):

    text = text.lower()

    extracted = []

    for skill in all_skills:

        pattern = r"\b" + re.escape(skill) + r"\b"

        if re.search(pattern, text):
            extracted.append(skill)

    return list(set(extracted))


def skill_overlap_score(candidate_skills, required_skills):

    candidate_set = set([s.lower() for s in candidate_skills])
    required_set = set([s.lower() for s in required_skills])

    matched = candidate_set.intersection(required_set)

    return len(matched) / len(required_set)