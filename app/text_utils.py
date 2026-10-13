import re

def technical_tokenizer(text):
    return re.findall(
        r"(?u)(?:[a-zA-Z]+\+\+|[a-zA-Z]+#|\.[a-zA-Z]+|[a-zA-Z]+\.[a-zA-Z]+|\w+)",
        text.lower()
    )

