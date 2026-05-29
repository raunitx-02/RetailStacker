require("dotenv").config({ path: ".env.local" });
const apiKey = process.env.KEEPA_API_KEY;
const asin = "B0CQH57G8R"; // From screenshot

async function test() {
  const url = `https://api.keepa.com/product?key=${apiKey}&domain=10&asin=${asin}&stats=1&history=0`;
  const res = await fetch(url);
  const data = await res.json();
  const p = data.products[0];
  console.log("Stats current:", p.stats.current);
  console.log("Images:", p.imagesCSV);
}
test();
