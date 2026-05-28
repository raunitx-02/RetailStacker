const https = require('https');
const apiKey = process.env.KEEPA_API_KEY || "pa8osmtpo6bq3bbf3vgfqmp78p0ifbouv34flbvs51hsjqkb7kg6qjgddpspinlp";
const url = `https://api.keepa.com/category?key=${apiKey}&domain=10&category=0`;

https.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      if(parsed.categories && parsed.categories['0']) {
        const root = parsed.categories['0'];
        const childrenIds = root.children;
        console.log("Root children IDs:", childrenIds.slice(0, 10)); // just look at a few
      } else {
        console.log("No root category found or error:", parsed);
      }
    } catch(e) {
      console.log("Error parsing:", e);
    }
  });
}).on('error', (e) => {
  console.log("Req Error:", e);
});
