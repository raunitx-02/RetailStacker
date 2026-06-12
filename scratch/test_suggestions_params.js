async function test() {
  const query = "phone";
  const params = [
    { name: "default", url: `https://completion.amazon.com/api/2017/suggestions?limit=10&prefix=${query}&alias=aps&site-variant=desktop&version=2` },
    { name: "mid", url: `https://completion.amazon.com/api/2017/suggestions?limit=10&prefix=${query}&alias=aps&site-variant=desktop&version=2&mid=A21TJRUUN4KGV` },
    { name: "mkt", url: `https://completion.amazon.com/api/2017/suggestions?limit=10&prefix=${query}&alias=aps&site-variant=desktop&version=2&mkt=44571` },
    { name: "marketplaceId", url: `https://completion.amazon.com/api/2017/suggestions?limit=10&prefix=${query}&alias=aps&site-variant=desktop&version=2&marketplaceId=A21TJRUUN4KGV` },
    { name: "obfuscatedMarketplaceId", url: `https://completion.amazon.com/api/2017/suggestions?limit=10&prefix=${query}&alias=aps&site-variant=desktop&version=2&obfuscatedMarketplaceId=A21TJRUUN4KGV` },
  ];

  for (const p of params) {
    try {
      const res = await fetch(p.url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
      });
      const data = await res.json();
      console.log(p.name, "suggestions count:", data.suggestions ? data.suggestions.length : 0);
      if (data.suggestions && data.suggestions.length > 0) {
        console.log("Sample:", data.suggestions[0].value);
      }
    } catch (e) {
      console.error(p.name, "failed:", e.message);
    }
  }
}
test();
