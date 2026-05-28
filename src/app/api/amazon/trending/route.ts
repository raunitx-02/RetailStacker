import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

// Amazon India (domain=10) BSR Category Node IDs
// These are real Amazon India browse node IDs for bestseller lists
const CATEGORY_NODES: Record<string, { nodeId: string; name: string }> = {
  "4202275031": { nodeId: "4202275031", name: "Baby Products" },
  "2454169031": { nodeId: "2454169031", name: "Bags, Wallets and Luggage" },
  "21844985031": { nodeId: "21844985031", name: "Beauty" },
  "1318081031": { nodeId: "1318081031", name: "Books" },
  "4772060031": { nodeId: "4772060031", name: "Car & Motorbike" },
  "1571271031": { nodeId: "1571271031", name: "Clothing & Accessories" },
  "976392031": { nodeId: "976392031", name: "Computers & Accessories" },
  "12365334031": { nodeId: "12365334031", name: "Electronics" },
  "15386965031": { nodeId: "15386965031", name: "Garden & Outdoors" },
  "2454178031": { nodeId: "2454178031", name: "Grocery & Gourmet Foods" },
  "1350384031": { nodeId: "1350384031", name: "Health & Personal Care" },
  "99967842031": { nodeId: "99967842031", name: "Home & Kitchen" },
  "4286640031": { nodeId: "4286640031", name: "Home Improvement" },
  "5866078031": { nodeId: "5866078031", name: "Industrial & Scientific" },
  "22143305031": { nodeId: "22143305031", name: "Jewellery" },
  "1571277031": { nodeId: "1571277031", name: "Kindle Store" },
  "976416031": { nodeId: "976416031", name: "Movies & TV Shows" },
  "4149520031": { nodeId: "4149520031", name: "Music" },
  "3677697031": { nodeId: "3677697031", name: "Musical Instruments" },
  "2454172031": { nodeId: "2454172031", name: "Office Products" },
  "85183752031": { nodeId: "85183752031", name: "Pet Supplies" },
  "1571283031": { nodeId: "1571283031", name: "Shoes & Handbags" },
  "1318117031": { nodeId: "1318117031", name: "Software" },
  "1984443031": { nodeId: "1984443031", name: "Sports, Fitness & Outdoors" },
  "1350380031": { nodeId: "1350380031", name: "Toys & Games" },
  "13945368031": { nodeId: "13945368031", name: "Video Games" },
  "21488213031": { nodeId: "21488213031", name: "Watches" },
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get("category") || "12365334031"; // Default to Electronics
  const apiKey = process.env.KEEPA_API_KEY || "pa8osmtpo6bq3bbf3vgfqmp78p0ifbouv34flbvs51hsjqkb7kg6qjgddpspinlp";

  const node = CATEGORY_NODES[categoryId] || CATEGORY_NODES["12365334031"];

  try {
    // Step 1: Get actual Amazon India bestseller ASINs for this category node
    const bsUrl = `https://api.keepa.com/bestsellers?key=${apiKey}&domain=10&category=${node.nodeId}`;
    const bsRes = await fetch(bsUrl, { next: { revalidate: 1800 } });
    const bsData = await bsRes.json();

    if (bsData.error) throw new Error(`Keepa Error: ${JSON.stringify(bsData.error)}`);

    let rankedAsins: string[] = bsData.bestSellersList?.asinList || [];
    
    // Fallback: If Amazon India doesn't expose a root bestseller list for this node, query top products by category name
    if (rankedAsins.length === 0) {
      const searchUrl = `https://api.keepa.com/search?key=${apiKey}&domain=10&type=product&term=${encodeURIComponent(node.name)}`;
      const searchRes = await fetch(searchUrl, { next: { revalidate: 1800 } });
      const searchData = await searchRes.json();
      if (searchData.products && searchData.products.length > 0) {
        // search endpoint only returns basic ASINs, not full stats, so we still pass them to the detail query
        rankedAsins = searchData.products.slice(0, 50);
      } else {
        return NextResponse.json({ error: "No bestseller data returned.", nodeUsed: node.nodeId, categoryName: node.name }, { status: 404 });
      }
    }
    const top12 = rankedAsins.slice(0, 12).join(",");
    const detailUrl = `https://api.keepa.com/product?key=${apiKey}&domain=10&asin=${top12}&stats=1`;
    const detailRes = await fetch(detailUrl, { next: { revalidate: 1800 } });
    const detailData = await detailRes.json();

    if (!detailData.products?.length) throw new Error("Could not retrieve product details from Keepa.");

    // Step 3: Sort by actual BSR rank (ascending = better rank)
    const formatted = detailData.products
      .map((item: any) => {
        const stats = item.stats?.current;

        const bsr: number = stats?.[3] > 0 ? stats[3] : rankedAsins.indexOf(item.asin) + 1;

        // Price in Indian Rupees: Fallback to last known price if current is missing/out-of-stock
        let priceRaw = stats?.[18] > 0 ? stats[18] : (stats?.[1] > 0 ? stats[1] : stats?.[0]);
        if (!(priceRaw > 0) && item.csv) {
          const bbCsv = item.csv[18] || item.csv[1]; // BuyBox or New price array
          if (bbCsv && bbCsv.length >= 2) {
             const lastValid = bbCsv.filter((v: number) => v > 0).pop();
             if (lastValid) priceRaw = lastValid;
          }
        }
        const price = priceRaw > 0 ? `₹${Math.round(priceRaw / 100).toLocaleString("en-IN")}` : "N/A";

        const ratingRaw = stats?.[16];
        const rating = ratingRaw > 0 ? (ratingRaw / 10).toFixed(1) : null;
        const reviews = stats?.[17] > 0 ? stats[17] : null;

        // Image: Use Amazon's reliable media CDN if imagesCSV is available
        let img = `https://images-na.ssl-images-amazon.com/images/P/${item.asin}.01.LZZZZZZZ.jpg`;
        if (item.imagesCSV) {
          const firstImage = item.imagesCSV.split(',')[0];
          img = `https://m.media-amazon.com/images/I/${firstImage}`;
        }

        // Category name from product's category tree
        const catName = item.categoryTree?.[item.categoryTree.length - 1]?.name
          || item.categoryTree?.[0]?.name
          || node.name;

        // Rank position in the bestseller list
        const rankPosition = rankedAsins.indexOf(item.asin) + 1;

        return {
          asin: item.asin,
          name: item.title || "Amazon India Product",
          bsr,
          rankPosition,
          price,
          img,
          category: catName,
          rating,
          reviews,
          isRealData: true,
        };
      })
      // Sort by their actual position in the bestseller list
      .sort((a: any, b: any) => a.rankPosition - b.rankPosition);

    return NextResponse.json({
      products: formatted,
      categoryName: node.name,
      totalRanked: rankedAsins.length,
      lastUpdated: new Date().toISOString(),
      source: "Keepa Bestsellers API — Amazon India Live Rankings",
    });

  } catch (error: any) {
    console.error("Trending API Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
