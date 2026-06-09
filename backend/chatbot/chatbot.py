print(">>> chatbot.py loaded <<<")

import os
import sys

# Force UTF-8 output on Windows to avoid cp1252 emoji encoding errors
if sys.stdout.encoding != "utf-8":
    sys.stdout.reconfigure(encoding="utf-8")

import certifi
os.environ["SSL_CERT_FILE"] = certifi.where()


import json
import re
import requests
from pathlib import Path
from dotenv import load_dotenv
from chatbot.prompt import SYSTEM_PROMPT


BASE_DIR = Path(__file__).parent
ENV_PATH = BASE_DIR.parent / ".env"   # shared backend/.env
DATA_PATH = BASE_DIR / "jaipur_city_data.json"



load_dotenv(dotenv_path=ENV_PATH)

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

if not OPENROUTER_API_KEY:
    raise RuntimeError("OPENROUTER_API_KEY missing in .env")

MODEL = "openai/gpt-3.5-turbo"

print("[OK] .env loaded successfully")
print("Resolved DATA_PATH:", DATA_PATH)


if not DATA_PATH.exists():
    raise FileNotFoundError(f"City data file not found: {DATA_PATH}")

with open(DATA_PATH, "r", encoding="utf-8") as f:
    CITY_DATA = json.load(f)

print("[OK] Jaipur city data loaded successfully!")



STOPWORDS = {
    "tell", "me", "about", "the", "timing", "timings", "of", "in", "jaipur",
    "any", "to", "visit", "best", "good", "place", "places",
    "show", "find", "where", "what", "which", "for", "a", "an",
    "please", "can", "you", "suggest", "recommend", "want", "know"
}

CATEGORY_KEYWORDS = {
    "temple": ["temple", "mandir", "religious", "shrine"],
    "fort": ["fort", "palace", "heritage"],
    "cafe": ["cafe", "coffee", "cafes"],
    "restaurant": ["restaurant", "food", "eat", "dining"],
    "street_food": ["street food", "snack", "chaat", "stall"],
    "metro": ["metro", "transport", "train"],
    "market": ["market", "bazaar", "shopping"],
}

def normalize(text: str) -> str:
    return re.sub(r"[^a-z0-9 ]", "", text.lower()).strip()


def tokenize(text: str):
    return [word for word in normalize(text).split() if word not in STOPWORDS]


def format_response(entity_name: str, data: dict) -> str:
    lines = [f"{entity_name.replace('_', ' ').title()}:\n"]

    for key, value in data.items():
        label = key.replace("_", " ").title()

        if isinstance(value, dict):
            lines.append(f"{label}:")
            for sk, sv in value.items():
                lines.append(f"  - {sk.replace('_', ' ').title()}: {sv}")

        elif isinstance(value, list):
            lines.append(f"{label}:")
            for item in value:
                lines.append(f"  - {item}")

        else:
            lines.append(f"{label}: {value}")

    return "\n".join(lines)


def flatten_entities():
    entities = []

    for section, content in CITY_DATA.items():
        if isinstance(content, dict):
            for key, value in content.items():
                if isinstance(value, dict):
                    entities.append({
                        "section": section,
                        "name": key,
                        "name_norm": normalize(key.replace("_", " ")),
                        "data": value
                    })


    return entities


ALL_ENTITIES = flatten_entities()


def find_best_entity_match(query: str):
    """
    Strong entity matching.
    Only returns if confidence is good.
    """
    query_norm = normalize(query)
    query_tokens = set(tokenize(query))

    best_match = None
    best_score = 0

    for entity in ALL_ENTITIES:
        name_norm = entity["name_norm"]
        name_tokens = set(tokenize(name_norm))

        # Exact entity name
        if query_norm == name_norm:
            return entity

        # Full place name appears in query
        if name_norm in query_norm:
            return entity

        overlap = query_tokens & name_tokens
        score = len(overlap)

        if len(name_tokens) > 0:
            score += len(overlap) / len(name_tokens)

        if score > best_score:
            best_score = score
            best_match = entity

    if best_match and best_score >= 2:
        return best_match

    return None


def is_broad_category_query(query: str) -> bool:
    """
    Detects broad recommendation-style questions only.
    Prevents 'Nahargarh fort' from being treated as 'show me forts'.
    """
    query_lower = query.lower()

    broad_patterns = [
        "best places",
        "places to visit",
        "where to visit",
        "suggest",
        "recommend",
        "any temple",
        "any fort",
        "best cafes",
        "best restaurants",
        "good food",
        "shopping places",
        "markets in jaipur",
        "temples in jaipur",
        "forts in jaipur",
        "cafes in jaipur",
        "restaurants in jaipur",
    ]

    return any(pattern in query_lower for pattern in broad_patterns)


def find_category_matches(query: str):
    """
    Handles broad category questions only.
    """
    query_norm = normalize(query)

    matched_category = None

    for category, words in CATEGORY_KEYWORDS.items():
        if any(w in query_norm for w in words):
            matched_category = category
            break

    if not matched_category:
        return []

    results = []

    for entity in ALL_ENTITIES:
        entity_text = entity["name_norm"] + " " + normalize(json.dumps(entity["data"]))

        if matched_category == "temple":
            if "temple" in entity_text or "mandir" in entity_text:
                results.append(entity)

        elif matched_category == "fort":
            if "fort" in entity_text or "palace" in entity_text:
                results.append(entity)

        elif matched_category == "cafe":
            if "cafe" in entity_text or "coffee" in entity_text:
                results.append(entity)

        elif matched_category == "restaurant":
            if "restaurant" in entity_text or "food" in entity_text:
                results.append(entity)

        elif matched_category == "street_food":
            if "street food" in entity_text or "chaat" in entity_text or "snack" in entity_text:
                results.append(entity)

        elif matched_category == "metro":
            if "metro" in entity_text:
                results.append(entity)

        elif matched_category == "market":
            if "bazaar" in entity_text or "market" in entity_text:
                results.append(entity)

    return results[:3]


def needs_reasoning(query: str) -> bool:
    keywords = [
        "why", "how", "should", "living", "locals",
        "daily life", "culture", "safe", "new to",
        "difference", "working", "adjust", "plan",
        "trip", "itinerary", "compare"
    ]
    q = query.lower()
    return any(word in q for word in keywords)


def ask_ai_fallback(user_query: str) -> str:
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost",
        "X-Title": "Sheherly Chatbot",
    }

    city_context = json.dumps(CITY_DATA, ensure_ascii=False, indent=2)

    payload = {
        "model": MODEL,
        "messages": [
            {
                "role": "system",
                "content": SYSTEM_PROMPT + "\n\nUse the following Jaipur local data if relevant:\n" + city_context
            },
            {
                "role": "user",
                "content": user_query
            },
        ],
        "temperature": 0.7,
    }

    try:
        res = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers=headers,
            json=payload,
            timeout=20,
            verify=certifi.where(),
        )

        if res.status_code != 200:
            print("❌ OpenRouter Error:", res.status_code, res.text)
            return "Sorry, I’m having trouble answering that right now."

        data = res.json()

        if "choices" not in data or not data["choices"]:
            return "Sorry, I couldn’t generate a response right now."

        return data["choices"][0]["message"]["content"].strip()

    except Exception as e:
        print("❌ Exception in ask_ai_fallback:", str(e))
        return "Sorry, I’m unable to respond right now."


def get_chatbot_response(user_query: str) -> str:
    if not user_query.strip():
        return "Please ask something about Jaipur."

    query_lower = user_query.lower()
    query_norm = normalize(user_query)

    # Greetings
    if query_lower in ["hi", "hello", "hey"]:
        return "Hello! How can I assist you with information about Jaipur today?"

    if query_lower in ["bye", "goodbye", "exit"]:
        return "Goodbye! If you have any more questions in the future, feel free to ask. Have a great day!"

    if "weather" in query_lower:
        return (
            "I can share Jaipur’s seasonal weather patterns, "
            "but I don’t have access to live weather updates."
        )


    best_entity = find_best_entity_match(user_query)

    if best_entity:
        name_norm = best_entity["name_norm"]
        overlap = set(tokenize(query_norm)) & set(tokenize(name_norm))

        if name_norm in query_norm or len(overlap) >= 2:
            return format_response(best_entity["name"], best_entity["data"])


    if is_broad_category_query(user_query):
        category_matches = find_category_matches(user_query)

        if category_matches:
            intro = "Here are some suggestions:\n"
            results = [format_response(item["name"], item["data"]) for item in category_matches]
            return intro + "\n\n".join(results)

    return ask_ai_fallback(user_query)

def main():
    print("\nSheherly – Explore Jaipur Like a Local 🌸")
    print("Type 'exit' to quit\n")

    while True:
        user = input("You: ").strip()
        if user.lower() == "exit":
            print("\nSheherly: Enjoy Jaipur ✨")
            break

        reply = get_chatbot_response(user)
        print("\nSheherly:", reply, "\n")


if __name__ == "__main__":
    main()