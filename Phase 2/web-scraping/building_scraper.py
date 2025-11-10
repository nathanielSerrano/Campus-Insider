import requests
from bs4 import BeautifulSoup
import json
import time

BASE = "https://tdx.maine.edu"
INDEX_URL = f"{BASE}/TDClient/2624/Portal/KB/?CategoryID=22631"

def get_building_links():
    res = requests.get(INDEX_URL)
    res.raise_for_status()
    soup = BeautifulSoup(res.text, "html.parser")

    links = []
    for div in soup.select("div.gutter-bottom-lg h3 a"):
        title = div.get_text(strip=True)
        href = div["href"]
        url = BASE + href
        # only include building lists
        if title.lower().startswith("list of rooms"):
            links.append({"title": title, "url": url})
    return links


def scrape_building_page(url):
    res = requests.get(url)
    res.raise_for_status()
    soup = BeautifulSoup(res.text, "html.parser")

    building_name = soup.find("h1").get_text(strip=True)
    rooms = []

    for strong_tag in soup.select("strong"):
        room_name = strong_tag.get_text(strip=True)
        if not room_name.lower().startswith("room"):
            continue
        ul = strong_tag.find_next("ul")
        if not ul:
            continue
        attrs = [li.get_text(strip=True) for li in ul.select("li")]
        rooms.append({
            "room": room_name,
            "attributes": attrs
        })
    return {"building": building_name, "rooms": rooms}


def main():
    buildings = get_building_links()
    print(f"Found {len(buildings)} building pages.")
    all_data = []

    for i, b in enumerate(buildings, 1):
        print(f"[{i}/{len(buildings)}] Scraping {b['title']}...")
        try:
            data = scrape_building_page(b["url"])
            all_data.append(data)
            time.sleep(1)  # polite delay
        except Exception as e:
            print(f"Error scraping {b['url']}: {e}")

    with open("usm_rooms.json", "w") as f:
        json.dump(all_data, f, indent=2)
    print("Done. Data saved to usm_rooms.json")


if __name__ == "__main__":
    main()
