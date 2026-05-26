const fs = require('fs');

async function scrape() {
  try {
    const res = await fetch('https://www.amazon.in/gp/bestsellers/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
        'Accept': 'text/html'
      }
    });
    const html = await res.text();
    // Regex to match left nav links: <a href="/gp/bestsellers/kitchen/976442031/ref=..." ...>Home & Kitchen</a>
    const regex = /<a href="\/gp\/bestsellers\/[^/]+\/(\d+)[^>]*>([^<]+)<\/a>/g;
    let match;
    const nodes = {};
    while ((match = regex.exec(html)) !== null) {
      nodes[match[2].trim()] = match[1];
    }
    console.log(JSON.stringify(nodes, null, 2));
  } catch (err) {
    console.error(err);
  }
}
scrape();
