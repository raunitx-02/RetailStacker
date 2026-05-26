async function run() {
  const res = await fetch("https://api.keepa.com/category?key=pa8osmtpo6bq3bbf3vgfqmp78p0ifbouv34flbvs51hsjqkb7kg6qjgddpspinlp&domain=10&category=0");
  const data = await res.json();
  const rootNodes = data.categories[0].children;
  // Let's fetch details for the root nodes to get their names
  const res2 = await fetch(`https://api.keepa.com/category?key=pa8osmtpo6bq3bbf3vgfqmp78p0ifbouv34flbvs51hsjqkb7kg6qjgddpspinlp&domain=10&category=${rootNodes.slice(0, 10).join(",")}`);
  const data2 = await res2.json();
  console.log(Object.values(data2.categories).map(c => `${c.catId}: ${c.name}`));
}
run();
