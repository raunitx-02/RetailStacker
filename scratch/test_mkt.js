async function test() {
  const mkt = "44571"; // India
  const query = "phone";
  try {
    const url = `https://completion.amazon.com/search/complete?search-alias=aps&client=amazon-search-ui&mkt=${mkt}&q=${encodeURIComponent(query)}`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });
    console.log("Status:", res.status);
    const data = await res.json();
    console.log("Data:", JSON.stringify(data));
  } catch (e) {
    console.error("Error:", e);
  }
}
test();
