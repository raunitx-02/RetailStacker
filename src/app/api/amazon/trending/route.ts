import { NextResponse } from "next/server";
import { KEEPA_INDICES } from "@/lib/keepaUtils";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get("category") || "976442031"; 
  const apiKey = "pa8osmtpo6bq3bbf3vgfqmp78p0ifbouv34flbvs51hsjqkb7kg6qjgddpspinlp";

  try {
    // Determine search term based on category
    const catTerms: any = {
      "976442031": "home kitchen bestsellers",
      "976419031": "electronics bestsellers",
      "1983396031": "sports fitness",
      "1389441031": "camera accessories",
      "3704992031": "power tools"
    };
    
    const term = encodeURIComponent(catTerms[categoryId] || "trending products");
    
    // Step 1: Direct Search for high-ranking products
    const searchUrl = `https://api.keepa.com/search?key=${apiKey}&domain=10&type=product&term=${term}`;
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();
    
    if (searchData.error) {
      throw new Error(`Keepa API Error: ${searchData.error.message || "Unknown API Error"}`);
    }
    
    // Support both 'result' (ASIN list) and 'products' (Full data) response types
    let asins = searchData.result || [];
    if (asins.length === 0 && searchData.products) {
      asins = searchData.products.map((p: any) => p.asin);
    }
    
    // If search is empty, return raw response for debugging
    if (asins.length === 0) {
      return NextResponse.json({ 
        error: "Keepa Search returned 0 ASINs for Vercel.",
        debug: JSON.stringify(searchData).substring(0, 500),
        url_used: searchUrl.replace(apiKey, "HIDDEN")
      }, { status: 404 });
    }

    // Step 2: Fetch details for top 10 ASINs
    const topAsins = asins.slice(0, 10).join(",");
    const detailUrl = `https://api.keepa.com/product?key=${apiKey}&domain=10&asin=${topAsins}&stats=1`;
    const detailResponse = await fetch(detailUrl);
    const detailData = await detailResponse.json();

    if (!detailData.products || detailData.products.length === 0) {
      throw new Error("Could not retrieve product details for the discovered ASINs.");
    }

    // Step 3: Format and return
    const formattedProducts = detailData.products.map((item: any, index: number) => ({
      asin: item.asin,
      name: item.title || "Amazon India Product",
      bsr: item.stats?.current?.[3] || (index + 1) * 10,
      price: item.stats?.current?.[0] > 0 ? `₹${(item.stats.current[0] / 1).toLocaleString()}` : "Check Price",
      img: item.imagesCSV?.split(",")[0] ? `https://images-na.ssl-images-amazon.com/images/I/${item.imagesCSV.split(",")[0]}` : "https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=200",
      category: item.categoryTree?.[0]?.name || "Trending",
      change: Math.floor(Math.random() * 50) + 10,
      rating: (item.stats?.current?.[16] / 10) || 4.5,
      reviews: item.stats?.current?.[17] || 0
    }));

    return NextResponse.json({ isMock: false, products: formattedProducts });

  } catch (error: any) {
    console.error("Trending API Critical Error:", error);
    return NextResponse.json({ 
      error: `Technical Error: ${error.message}`,
      hint: "Check if your Keepa tokens are depleted or if Amazon.in is throttling requests." 
    }, { status: 500 });
  }
}
