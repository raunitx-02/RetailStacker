async function test() {
  const mid = "A21TJRUUN4KGV"; // India
  const query = "phone";
  const url = `https://completion.amazon.com/search/complete?q=${encodeURIComponent(query)}&search-alias=aps&client=amazon-search-ui&mid=${mid}&mkt=44571`;
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });
    console.log("Status:", res.status);
    const text = await res.text();
    console.log("Response text:", text);
  } catch (e) {
    console.error("Error:", e);
  }
}
test();
