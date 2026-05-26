const cats = ["Amazon Launchpad", "Amazon Renewed", "Apps & Games", "Baby Products", "Bags, Wallets and Luggage", "Beauty", "Books", "Car & Motorbike", "Clothing & Accessories", "Computers & Accessories", "Electronics", "Garden & Outdoors", "Gift Cards", "Grocery & Gourmet Foods", "Health & Personal Care", "Home & Kitchen", "Home Improvement", "Industrial & Scientific", "Jewellery", "Kindle Store", "Movies & TV Shows", "Music", "Musical Instruments", "Office Products", "Pet Supplies", "Shoes & Handbags", "Software", "Sports, Fitness & Outdoors", "Toys & Games", "Video Games", "Watches"];

async function run() {
  const res = await fetch("https://api.keepa.com/search?key=pa8osmtpo6bq3bbf3vgfqmp78p0ifbouv34flbvs51hsjqkb7kg6qjgddpspinlp&domain=10&type=category&term=Books");
  const data = await res.json();
  console.log(data);
}
run();
