const fs = require('fs');

const API_KEY = "pa8osmtpo6bq3bbf3vgfqmp78p0ifbouv34flbvs51hsjqkb7kg6qjgddpspinlp";

const categories = [
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
];

const results = {};

async function delay(ms) {
  return new Promise(res => setTimeout(res, ms));
}

async function run() {
  for (const cat of categories) {
    try {
      const url = `https://api.keepa.com/search?key=${API_KEY}&domain=10&type=category&term=${encodeURIComponent(cat)}`;
      const res = await fetch(url);
      const data = await res.json();
      
      let bestId = null;
      if (data.categories) {
        const validCats = Object.values(data.categories);
        // Find best match (highest product count)
        validCats.sort((a, b) => (b.productCount || 0) - (a.productCount || 0));
        if (validCats.length > 0) {
          bestId = validCats[0].catId;
        }
      }
      results[cat] = bestId;
      console.log(`Found ${cat} -> ${bestId}`);
    } catch (err) {
      console.error(`Error fetching ${cat}: ${err.message}`);
    }
    await delay(1500); // Respect API rate limit
  }
  
  fs.writeFileSync('node_results.json', JSON.stringify(results, null, 2));
}

run();
