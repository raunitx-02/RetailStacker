import urllib.request
import json
import time

API_KEY = "pa8osmtpo6bq3bbf3vgfqmp78p0ifbouv34flbvs51hsjqkb7kg6qjgddpspinlp"

categories = [
    "Amazon Launchpad", "Amazon Renewed", "Apps & Games", "Baby Products", 
    "Bags, Wallets and Luggage", "Beauty", "Books", "Car & Motorbike", 
    "Clothing & Accessories", "Computers & Accessories", "Electronics", 
    "Garden & Outdoors", "Gift Cards", "Grocery & Gourmet Foods", 
    "Health & Personal Care", "Home & Kitchen", "Home Improvement", 
    "Industrial & Scientific", "Jewellery", "Kindle Store", 
    "Movies & TV Shows", "Music", "Musical Instruments", 
    "Office Products", "Pet Supplies", "Shoes & Handbags", 
    "Software", "Sports, Fitness & Outdoors", "Toys & Games", 
    "Video Games", "Watches"
]

results = {}

for cat in categories:
    url = f"https://api.keepa.com/search?key={API_KEY}&domain=10&type=category&term={urllib.parse.quote(cat)}"
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read())
            
            # Find the best match
            best_id = None
            if data.get('categories'):
                # Sort by product count descending
                valid_cats = list(data['categories'].values())
                valid_cats.sort(key=lambda x: x.get('productCount', 0), reverse=True)
                if valid_cats:
                    best_id = valid_cats[0]['catId']
            
            results[cat] = best_id
            print(f"Found {cat} -> {best_id}")
    except Exception as e:
        print(f"Error fetching {cat}: {e}")
    time.sleep(1.5) # rate limit

print(json.dumps(results, indent=2))
