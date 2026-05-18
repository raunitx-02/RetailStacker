const apiKey = "pa8osmtpo6bq3bbf3vgfqmp78p0ifbouv34flbvs51hsjqkb7kg6qjgddpspinlp";

async function test() {
  const nodes = [
    { id: "976442031", name: "Home & Kitchen" },
    { id: "976419031", name: "Electronics" },
    { id: "1983396031", name: "Sports & Fitness" },
    { id: "1389441031", name: "Cameras" }
  ];

  for (const node of nodes) {
    const url = `https://api.keepa.com/bestsellers?key=${apiKey}&domain=10&category=${node.id}`;
    console.log(`Fetching ${node.name} (${node.id})...`);
    try {
      const res = await fetch(url);
      const data = await res.json();
      console.log(`Status: ${res.status}`);
      if (data.error) {
        console.log(`Error for ${node.name}:`, data.error);
      } else {
        const list = data.bestSellersList?.[0];
        console.log(`Success for ${node.name}! ASINs count:`, list?.asinList?.length || 0);
      }
    } catch (err) {
      console.log(`Fetch error for ${node.name}:`, err.message);
    }
  }
}

test();
