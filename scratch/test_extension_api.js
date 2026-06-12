async function test() {
  try {
    console.log("Testing connection to production server...");
    const res = await fetch("https://retailstacker.com/api/extension/xray", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ asins: ["B08L5T7F6S"] })
    });
    console.log("Status:", res.status);
    const data = await res.text();
    console.log("Response:", data.slice(0, 500));
  } catch (e) {
    console.error("Fetch failed:", e);
  }
}

test();
