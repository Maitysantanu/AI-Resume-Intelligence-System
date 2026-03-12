import re


def extract_email(text):

    email_pattern = r"[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+"

    match = re.search(email_pattern, text)

    if match:
        return match.group()

    return None


def extract_name(text):

    lines = text.split("\n")

    for line in lines:

        line = line.strip()

        if len(line.split()) >= 2 and len(line) < 40:
            return line

    return "Unknown"