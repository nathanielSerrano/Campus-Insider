import requests
from bs4 import BeautifulSoup
import time
import re
import json

BASE_URL = "https://en.wikipedia.org"
START_URL = "https://en.wikipedia.org/wiki/Lists_of_American_universities_and_colleges"
HEADERS = {"User-Agent": "Mozilla/5.0"}

def fetch_soup(url):
    r = requests.get(url, headers=HEADERS, timeout=15)
    r.raise_for_status()
    return BeautifulSoup(r.text, "html.parser")

def extract_colleges_from_section(content, state_name):
    """Extract college links from tables, lists, and paragraphs."""
    colleges = []

    # --- Handle tables (e.g., New Hampshire, Maine) ---
    for table in content.select("table.wikitable"):
        for row in table.select("tr"):
            link = row.select_one("a[href^='/wiki/']")
            if not link:
                continue
            name = link.get_text(strip=True)
            href = link["href"]
            if valid_college(name, href):
                colleges.append({
                    "state": state_name,
                    "name": name,
                    "wiki_url": BASE_URL + href
                })

    for link in content.select("ul a[href^='/wiki/'], p a[href^='/wiki/']"):
        name = link.get_text(strip=True)
        href = link["href"]
        if valid_college(name, href):
            colleges.append({
                "state": state_name,
                "name": name,
                "wiki_url": BASE_URL + href
            })


    return colleges

def valid_college(name, href):
    #Heuristic filter for legitimate institution names
    if not name:
        return False
    if any(skip in href for skip in [
        "Help:", "Special:", "Template:", "Talk:", "File:", 
        "Portal:", "Category:", "List_of_", "Outline_of_", "Index_of_"
    ]):
        return False
    if not re.search(r"(University|College|Institute|School|Academy|Community|Technical)", name):
        return False
    return True

def scrape_state(state_name, state_url, visited):
    #Scrape one state's page (including subpages if needed)
    if state_url in visited:
        return []
    visited.add(state_url)

    soup = fetch_soup(state_url)


    content = soup.select_one(".mw-parser-output")
    if not content:
        return []

    colleges = extract_colleges_from_section(content, state_name)

    # If no colleges found, recurse into subpages
    if not colleges:
        sub_links = [
            BASE_URL + a["href"]
            for a in content.select("a[href^='/wiki/List_of_']")
            if "Template:" not in a["href"]
        ]
        for sub_url in sub_links:
            colleges.extend(scrape_state(state_name, sub_url, visited))
            time.sleep(0.3)
    return colleges

def main():
    print("Fetching main state list...")
    soup = fetch_soup(START_URL)

    state_links = []
    seen = set()
    for a in soup.select("a[href^='/wiki/List_of_colleges_and_universities_in_']"):
        href = a["href"]
        text = a.get_text(strip=True)
        if not text or href in seen:
            continue
        seen.add(href)
        state_name = text.replace("List of colleges and universities in ", "")
        state_links.append((state_name, BASE_URL + href))

    print(f"Found {len(state_links)} states/territories.\n")

    LIMIT = 51
    if LIMIT:
        state_links = state_links[:LIMIT]

    results = []
    visited = set()

    for idx, (state, url) in enumerate(state_links, 1):
        print(f"[{idx}/{len(state_links)}] Scraping {state}...")
        data = scrape_state(state, url, visited)
        print(f"  ↳ Found {len(data)} institutions.")
        results.extend(data)
        time.sleep(0.5)

    # Deduplicate
    unique = { (r["state"], r["name"]): r for r in results }
    final = list(unique.values())

    with open("us_colleges_by_state.json", "w", encoding="utf-8") as f:
        json.dump(final, f, indent=2, ensure_ascii=False)

    print(f"Saved {len(final)} total institutions to file")

if __name__ == "__main__":
    main()