async function test() {
  try {
    const res = await fetch(`https://completion.amazon.in/api/2017/suggestions?limit=10&prefix=s25%20ultra&alias=aps&site-variant=desktop&version=2`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json"
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
