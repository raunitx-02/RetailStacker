const apiKey = "pa8osmtpo6bq3bbf3vgfqmp78p0ifbouv34flbvs51hsjqkb7kg6qjgddpspinlp";

async function logResponse() {
  const url = `https://api.keepa.com/bestsellers?key=${apiKey}&domain=10&category=976442031`;
  const res = await fetch(url);
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2).substring(0, 1000));
}

logResponse();
