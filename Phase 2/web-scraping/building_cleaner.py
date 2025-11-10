import json
import re
import csv
from collections import defaultdict

# ---------- CONFIG ----------
INPUT_FILE = "usm_rooms.json"     # input
OUTPUT_JSON = "rooms_clean.json"  # cleaned JSON
OUTPUT_CSV = "rooms_clean.csv"    # cleaned CSV
INSTITUTION = "USM"               

# Attribute normalization map
ATTR_MAP = {
    "Web Conferencing Lecture Style": "web_conferencing",
    "Presentation": "presentation",
    "Customizations": "custom",
    "No In-Room PC": "no_pc",
    "No In-Room PCs": "no_pc",
    "No Tech": "no_tech"
}

# Regex to extract building + campus names
BUILDING_RE = re.compile(
    r"List of Rooms in (.*?) on (?:USM's )?(.*?) Campus", re.IGNORECASE
)


def clean_text(s: str) -> str:
    """Normalize whitespace and unicode artifacts."""
    s = s.replace("\u00a0", " ")  # replace non-breaking space
    s = re.sub(r"\s+", " ", s).strip()
    return s


def parse_building(building_str: str):
    """Extract building and campus names from header."""
    m = BUILDING_RE.match(building_str)
    if m:
        return clean_text(m.group(1)), clean_text(m.group(2))
    else:
        # handle special case (like "List of Rooms on the Lewiston-Auburn Campus")
        if "Lewiston" in building_str:
            return None, "Lewiston-Auburn"
        return clean_text(building_str), None


def normalize_attributes(attrs):
    """Standardize attribute values using lookup."""
    cleaned = []
    for a in attrs:
        a = clean_text(a)
        norm = ATTR_MAP.get(a, a.lower())
        if norm not in cleaned:
            cleaned.append(norm)
    return cleaned


def parse_room_number(room_name: str):
    """Extract numeric part of room name if any."""
    match = re.search(r"\d+", room_name)
    return match.group(0) if match else None


def clean_data(raw_data):
    """Perform all cleaning steps and return normalized list."""
    cleaned = []

    for b in raw_data:
        building_raw = b["building"]
        building_name, campus = parse_building(building_raw)

        # fallback names
        building_name = building_name or "Unknown Building"
        campus = campus or "Unknown Campus"

        # deduplicate rooms within this building
        room_map = defaultdict(set)
        for r in b["rooms"]:
            room_name = clean_text(r["room"])
            attrs = normalize_attributes(r["attributes"])
            for a in attrs:
                room_map[room_name].add(a)

        # flatten deduplicated entries
        for room_name, attrs in room_map.items():
            cleaned.append({
                "institution": INSTITUTION,
                "campus": campus,
                "building": building_name,
                "room": room_name,
                "room_number": parse_room_number(room_name),
                "attributes": sorted(list(attrs)),
                # Add convenient boolean flags
                "has_web_conf": "web_conferencing" in attrs,
                "has_pc": not any(a == "no_pc" for a in attrs),
                "customized": "custom" in attrs
            })

    return cleaned


def save_json(data, path):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"Saved cleaned JSON → {path}")


def save_csv(data, path):
    if not data:
        return
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=list(data[0].keys()))
        writer.writeheader()
        writer.writerows(data)
    print(f"Saved cleaned CSV → {path}")


if __name__ == "__main__":
    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        raw_data = json.load(f)

    cleaned = clean_data(raw_data)

    save_json(cleaned, OUTPUT_JSON)
    # save_csv(cleaned, OUTPUT_CSV)

    print(f"{len(cleaned)} total unique rooms cleaned and saved.")
