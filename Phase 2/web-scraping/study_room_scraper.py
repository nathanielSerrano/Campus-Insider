import requests
from bs4 import BeautifulSoup
import json
import re

urls = {
    "Glickman Library": "https://libguides.usm.maine.edu/guides/group-study-rooms/glickman-library",
    "Gorham Library": "https://libguides.usm.maine.edu/guides/group-study-rooms/gorham-library",
    "LAC Library": "https://libguides.usm.maine.edu/guides/group-study-rooms/lac-library"
}

rooms = []

def parse_details(details_html):
    """Parse the details HTML element to extract floor, capacity, and amenities."""
    # Replace <br> tags with a newline before parsing
    html_str = (
        str(details_html)
        .replace("<br>", "\n")
        .replace("<br/>", "\n")
        .replace("<br />", "\n")
    )

    # Use BeautifulSoup to strip tags while preserving line breaks
    text = BeautifulSoup(html_str, "html.parser").get_text("\n", strip=True)

    # Split on newlines and clean
    parts = [p.strip() for p in text.split("\n") if p.strip()]

    floor = None
    capacity = None
    amenities = []

    for p in parts:
        lower = p.lower()
        if "floor" in lower:
            floor = p
        elif "capacity" in lower:
            match = re.search(r"(\d+)", p)
            if match:
                capacity = int(match.group(1))
        else:
            amenities.append(p)

    return {
        "floor": floor,
        "capacity": capacity,
        "amenities": amenities
    }


for library, url in urls.items():
    print(f"Scraping {library}...")
    resp = requests.get(url)
    resp.raise_for_status()
    soup = BeautifulSoup(resp.text, "html.parser")
    
    for row in soup.select("tbody tr"):
        tds = row.find_all("td", class_="ck_border")
        if len(tds) < 2:
            continue

        # Room name
        name_tag = tds[0].find("strong")
        name = name_tag.get_text(strip=True) if name_tag else None

        # Image
        img_tag = tds[0].find("img")
        img_url = None
        if img_tag and img_tag.get("src"):
            src = img_tag["src"]
            img_url = src if src.startswith("http") else "https:" + src

        # Details (pass raw HTML element now)
        parsed = parse_details(tds[1])

        rooms.append({
            "library": library,
            "room_name": name,
            "image_url": img_url,
            **parsed
        })


with open("usm_study_rooms.json", "w", encoding="utf-8") as f:
    json.dump(rooms, f, indent=2, ensure_ascii=False)

print(f"Scraped {len(rooms)} rooms and saved to usm_study_rooms.json")
