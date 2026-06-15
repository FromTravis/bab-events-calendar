import os
import re
import json
import requests
from datetime import datetime, timedelta
from bs4 import BeautifulSoup

# Target URLs
ATABAL_URL = "https://www.atabal-biarritz.fr/agenda/"
GUIDE_BASQUE_URL = "https://www.guide-du-paysbasque.com/fr/agenda.html"
LOCO_MOTIVE_URL = "https://www.loco-motive.fr/"
GENERALE_URL = "https://lageneraleanglet.com/"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "fr,fr-FR;q=0.8,en-US;q=0.5,en;q=0.3"
}

MONTH_MAP = {
    "janvier": "01", "fevrier": "02", "février": "02", "mars": "03", 
    "avril": "04", "mai": "05", "juin": "06", "juillet": "07", 
    "aout": "08", "août": "08", "septembre": "09", "octobre": "10", 
    "novembre": "11", "decembre": "12", "décembre": "12"
}

def clean_text(text):
    if not text:
        return ""
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def parse_date(date_str):
    """Normalize date strings to YYYY-MM-DD"""
    date_str = date_str.lower().strip()
    
    # Try DD/MM/YYYY
    match_slash = re.search(r'(\d{2})/(\d{2})/(\d{4})', date_str)
    if match_slash:
        return f"{match_slash.group(3)}-{match_slash.group(2)}-{match_slash.group(1)}"
        
    # Try DD.MM.YY (e.g. 02.07.26)
    match_dot = re.search(r'(\d{2})\.(\d{2})\.(\d{2})', date_str)
    if match_dot:
        year = "20" + match_dot.group(3)
        return f"{year}-{match_dot.group(2)}-{match_dot.group(1)}"
        
    # Try text date (e.g. "samedi 2 mai 2026" or "11 avril")
    for month_name, month_num in MONTH_MAP.items():
        if month_name in date_str:
            match_day = re.search(r'\b(\d{1,2})\b', date_str)
            if match_day:
                day = match_day.group(1).zfill(2)
                match_year = re.search(r'\b(20\d{2})\b', date_str)
                year = match_year.group(1) if match_year else "2026"
                return f"{year}-{month_num}-{day}"
                
    # Check for date ranges like "du 06.06 au 20.07"
    match_range = re.search(r'du\s+(\d{2})\.(\d{2})\s+au\s+(\d{2})\.(\d{2})', date_str)
    if match_range:
        # returns start date
        return f"2026-{match_range.group(2)}-{match_range.group(1)}"

    # Default to current date if parsing fails
    return datetime.now().strftime("%Y-%m-%d")

def normalize_category(cat_str):
    cat_str = cat_str.lower().strip()
    if any(k in cat_str for k in ["concert", "musique", "chanson", "rock", "electro", "dub", "live", "tribute", "danse", "spectacle"]):
        return "Concerts & Music"
    elif any(k in cat_str for k in ["sport", "surf", "pelote", "glisse", "tennis", "course", "randonnée"]):
        return "Sports & Surf"
    elif any(k in cat_str for k in ["marché", "marche", "brocante", "vide-grenier", "foire", "gastronomie", "dégustation", "cuisine"]):
        return "Gastronomy & Markets"
    elif any(k in cat_str for k in ["exposition", "expo", "art", "peinture", "conférence", "visite", "patrimoine", "théâtre"]):
        return "Culture & Heritage"
    else:
        return "Community & Family"

def scrape_atabal():
    events = []
    print("Scraping Atabal Biarritz...")
    try:
        response = requests.get(ATABAL_URL, headers=HEADERS, timeout=15)
        if response.status_code != 200:
            print(f"Failed to fetch Atabal: {response.status_code}")
            return events
            
        soup = BeautifulSoup(response.text, "html.parser")
        containers = soup.find_all(class_="dih_container")
        print(f"Found {len(containers)} raw items in Atabal.")
        
        for item in containers:
            # Skip non-events (e.g. membership info)
            h5 = item.find("h5")
            date_str = h5.get_text(strip=True) if h5 else ""
            if not date_str or date_str.upper() in ["ABONNEMENT", "BOUTIQUE", "PREVENTE"]:
                continue
                
            h3 = item.find("h3")
            h4 = item.find("h4")
            title = h3.get_text(strip=True) if h3 else ""
            if h4:
                title += " - " + h4.get_text(strip=True)
                
            link_el = item.find("a", class_="dih_link")
            url = link_el["href"] if link_el else ATABAL_URL
            
            img_el = item.find("div", class_="dih_image").find("img") if item.find("div", class_="dih_image") else None
            image = img_el["src"] if img_el else ""
            
            parsed_dt = parse_date(date_str)
            
            events.append({
                "title": title,
                "date": parsed_dt,
                "time": "20:30",  # Typical concert start time
                "location": "Biarritz",
                "venue": "Atabal Biarritz",
                "description": f"Concert exceptionnel à l'Atabal Biarritz. Venez découvrir {title} sur scène.",
                "category": "Concerts & Music",
                "url": url,
                "image": image
            })
            
    except Exception as e:
        print(f"Error scraping Atabal: {e}")
        
    print(f"Scraped {len(events)} valid events from Atabal.")
    return events

def scrape_guide_basque():
    events = []
    print("Scraping Guide du Pays Basque (5 pages)...")
    # We scrape pages 1 to 5 to cover upcoming weeks
    for page in range(1, 6):
        url = GUIDE_BASQUE_URL if page == 1 else f"{GUIDE_BASQUE_URL}?goto={page}"
        print(f" - Page {page}...")
        try:
            response = requests.get(url, headers=HEADERS, timeout=15)
            if response.status_code != 200:
                print(f"Failed to fetch Page {page}: {response.status_code}")
                continue
                
            soup = BeautifulSoup(response.text, "html.parser")
            cards = soup.find_all(class_="event")
            
            for card in cards:
                title_el = card.find("h3", class_="event-title")
                title = clean_text(title_el.get_text(strip=True)) if title_el else ""
                if not title:
                    continue
                    
                city_el = card.find(class_="event-city")
                city = clean_text(city_el.get_text(strip=True)) if city_el else ""
                
                # Filter strictly for Biarritz, Anglet, and Bayonne
                if city not in ["Biarritz", "Anglet", "Bayonne"]:
                    continue
                    
                link_el = card.find("a", class_="event-link")
                event_url = "https://www.guide-du-paysbasque.com" + link_el["href"] if link_el else GUIDE_BASQUE_URL
                
                img_el = card.find("div", class_="event-img").find("img") if card.find("div", class_="event-img") else None
                image = ""
                if img_el:
                    image_path = img_el.get("data-src") or img_el.get("src") or ""
                    if image_path.startswith("/"):
                        image = "https://www.guide-du-paysbasque.com" + image_path
                    else:
                        image = image_path
                
                period_el = card.find(class_="event-period")
                date_str = clean_text(period_el.get_text(strip=True)) if period_el else ""
                parsed_dt = parse_date(date_str)
                
                cat_el = card.find(class_="event-category")
                raw_cat = clean_text(cat_el.get_text(strip=True)) if cat_el else ""
                category = normalize_category(raw_cat)
                
                events.append({
                    "title": title,
                    "date": parsed_dt,
                    "time": "10:00",  # Standard daytime start fallback
                    "location": city,
                    "venue": "Centre-ville" if city == "Bayonne" else f"Plages / Salles de {city}",
                    "description": f"Événement culturel '{title}' à {city}. Catégorie originale : {raw_cat}.",
                    "category": category,
                    "url": event_url,
                    "image": image
                })
        except Exception as e:
            print(f"Error scraping Guide du Pays Basque Page {page}: {e}")
            
    print(f"Scraped {len(events)} BAB events from Guide du Pays Basque.")
    return events

def scrape_loco_motive():
    events = []
    print("Scraping Loco-Motive / Le Magnéto...")
    try:
        response = requests.get(LOCO_MOTIVE_URL, headers=HEADERS, timeout=15)
        if response.status_code != 200:
            print(f"Failed to fetch Loco-Motive: {response.status_code}")
            return events
            
        soup = BeautifulSoup(response.text, "html.parser")
        cards = soup.find_all(class_="sn-carte")
        print(f"Found {len(cards)} raw cards in Loco-Motive.")
        
        for card in cards:
            title_el = card.find(class_="sn-carte__titre")
            title = clean_text(title_el.get_text(strip=True)) if title_el else ""
            if not title:
                continue
                
            # Skip general informational pages
            if any(w in title.lower() for w in ["boutique", "mise à disposition", "programme de la saison"]):
                continue
                
            desc_el = card.find(class_="sn-carte__description")
            desc = clean_text(desc_el.get_text(strip=True)) if desc_el else ""
            
            url = card["href"] if card.has_attr("href") else LOCO_MOTIVE_URL
            
            # Scrape Image
            img_el = card.find(class_="sn-carte__image")
            img = img_el.find("img") if img_el else None
            image = ""
            if img:
                image = img.get("data-lazy-src") or img.get("src") or ""
                
            # Parse Date from title or description or set default
            date_search_text = title + " " + desc
            parsed_dt = parse_date(date_search_text)
            
            events.append({
                "title": title,
                "date": parsed_dt,
                "time": "21:00",
                "location": "Bayonne",
                "venue": "Le Magnéto (Bayonne)",
                "description": desc or f"Soirée concert rock et musiques actuelles au Magnéto, géré par l'association La Locomotive.",
                "category": "Concerts & Music",
                "url": url,
                "image": image
            })
    except Exception as e:
        print(f"Error scraping Loco-Motive: {e}")
        
    print(f"Scraped {len(events)} events from Loco-Motive.")
    return events

def main():
    all_events = []
    
    # Scrape all venues
    atabal_events = scrape_atabal()
    guide_events = scrape_guide_basque()
    loco_events = scrape_loco_motive()
    
    all_events.extend(atabal_events)
    all_events.extend(guide_events)
    all_events.extend(loco_events)
    
    # Deduplicate based on Title + Date
    unique_events = []
    seen = set()
    for ev in all_events:
        key = (ev["title"].lower(), ev["date"])
        if key not in seen:
            seen.add(key)
            unique_events.append(ev)
            
    print(f"Total compiled unique events scraped: {len(unique_events)}")
    
    # Export to JSON
    output_path = "scraped_events.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(unique_events, f, ensure_ascii=False, indent=2)
        
    print(f"Successfully exported to {output_path}")

if __name__ == "__main__":
    main()
