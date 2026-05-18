import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

// Amazon India (domain=10) BSR Category Node IDs
// These are real Amazon India browse node IDs for bestseller lists
const CATEGORY_NODES: Record<string, { nodeId: string; name: string }> = {
  "976442031":  { nodeId: "976442031",  name: "Home & Kitchen" },
  "976419031":  { nodeId: "976419031",  name: "Electronics" },
  "1983396031": { nodeId: "1983396031", name: "Sports & Fitness" },
  "1389441031": { nodeId: "1389441031", name: "Cameras & Photography" },
  "3704992031": { nodeId: "3704992031", name: "Power Tools" },
  "1951044031": { nodeId: "1951044031", name: "Clothing" },
  "2454178031": { nodeId: "2454178031", name: "Beauty" },
  "1571274031": { nodeId: "1571274031", name: "Books" },
  "2061109031": { nodeId: "2061109031", name: "Toys & Games" },
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get("category") || "976442031";
  const apiKey = process.env.KEEPA_API_KEY || "pa8osmtpo6bq3bbf3vgfqmp78p0ifbouv34flbvs51hsjqkb7kg6qjgddpspinlp";

  const node = CATEGORY_NODES[categoryId] || CATEGORY_NODES["976442031"];

  try {
    // Step 1: Get actual Amazon India bestseller ASINs for this category node
    // Keepa /bestsellers endpoint returns the current top-100 ASINs for any browse node
    const bsUrl = `https://api.keepa.com/bestsellers?key=${apiKey}&domain=10&category=${node.nodeId}`;
    const bsRes = await fetch(bsUrl, { next: { revalidate: 1800 } }); // Cache 30 min
    const bsData = await bsRes.json();

    if (bsData.error) {
      throw new Error(`Keepa Error: ${JSON.stringify(bsData.error)}`);
    }

    // bestsellers.bestSellersList[0].asinList has the ranked ASINs
    const rankedAsins: string[] = bsData.bestSellersList?.[0]?.asinList || [];

    if (rankedAsins.length === 0) {
      return NextResponse.json({
        error: "No bestseller data returned from Keepa for this category. The category node may need updating.",
        nodeUsed: node.nodeId,
        categoryName: node.name,
      }, { status: 404 });
    }

    // Step 2: Take top 12 ASINs and fetch full product details
    const top12 = rankedAsins.slice(0, 12).join(",");
    const detailUrl = `https://api.keepa.com/product?key=${apiKey}&domain=10&asin=${top12}&stats=1`;
    const detailRes = await fetch(detailUrl, { next: { revalidate: 1800 } });
    const detailData = await detailRes.json();

    if (!detailData.products?.length) {
      throw new Error("Could not retrieve product details from Keepa.");
    }

    // Step 3: Sort by actual BSR rank (ascending = better rank)
    const formatted = detailData.products
      .map((item: any, idx: number) => {
        const stats = item.stats?.current;

        // BSR: stats[3] is the current BSR in root category
        const bsr: number = stats?.[3] > 0 ? stats[3] : rankedAsins.indexOf(item.asin) + 1;

        // Price in Indian Rupees: Keepa stores prices in cents
        // For India domain, prices are stored as paise (×100), so divide by 100
        const priceRaw = stats?.[18] > 0 ? stats[18] : (stats?.[1] > 0 ? stats[1] : stats?.[0]);
        const price = priceRaw > 0 ? `₹${Math.round(priceRaw / 100).toLocaleString("en-IN")}` : "N/A";

        // Rating: Keepa stores as e.g. 43 meaning 4.3 stars
        const ratingRaw = stats?.[16];
        const rating = ratingRaw > 0 ? (ratingRaw / 10).toFixed(1) : null;

        // Review count
        const reviews = stats?.[17] > 0 ? stats[17] : null;

        // Image: use Keepa's own CDN for reliable images
        // Format: https://images-na.ssl-images-amazon.com/images/P/{ASIN}.01.LZZZZZZZ.jpg
        const img = `https://images-na.ssl-images-amazon.com/images/P/${item.asin}.01.LZZZZZZZ.jpg`;

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
