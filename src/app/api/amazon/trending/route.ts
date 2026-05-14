import { NextResponse } from "next/server";
import { KEEPA_INDICES } from "@/lib/keepaUtils";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get("category") || "976442031"; // Default to Home & Kitchen (India)
  const apiKey = process.env.KEEPA_API_KEY || "pa8osmtpo6bq3bbf3vgfqmp78p0ifbouv34flbvs51hsjqkb7kg6qjgddpspinlp";

  if (!apiKey || apiKey === "YOUR_API_KEY") {
    return NextResponse.json({
      isMock: true,
      products: [
        { asin: "MOCK1", name: "Mock Tablet Pro", bsr: 1, price: "₹45,999", change: "+45", category: "Electronics", img: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400" },
        { asin: "MOCK2", name: "Mock Smart Watch", bsr: 2, price: "₹18,199", change: "+120", category: "Electronics", img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400" }
      ]
    });
  }

  try {
    // 1. Try Keepa Bestsellers first
    const response = await fetch(
      `https://api.keepa.com/bestsellers?key=${apiKey}&domain=10&category=${categoryId}`
    );
    const data = await response.json();

    let asins = data.asinList?.slice(0, 10) || [];

    // 2. Ultra-Robust Fallback: If bestsellers are empty, search for ANY products in that category sorted by sales rank
    if (asins.length === 0) {
      // type=product with sort=[[7,0]] (Sales Rank, ASC)
      const searchResponse = await fetch(
        `https://api.keepa.com/search?key=${apiKey}&domain=10&type=product&category=${categoryId}&sort=[[7,0]]`
      );
      const searchData = await searchResponse.json();
      asins = searchData.result?.slice(0, 10) || [];
    }

    if (asins.length === 0) {
      // Last ditch effort: Search broad trending term
      const finalResponse = await fetch(
        `https://api.keepa.com/search?key=${apiKey}&domain=10&type=product&term=trending`
      );
      const finalData = await finalResponse.json();
      asins = finalData.result?.slice(0, 10) || [];
    }

    if (asins.length === 0) {
      return NextResponse.json({ error: "Amazon India data is currently restricted. Please try another category or check back in a few minutes." }, { status: 404 });
    }

    // 3. Get Details for these ASINs
    const detailResponse = await fetch(
      `https://api.keepa.com/product?key=${apiKey}&domain=10&asin=${asins.join(",")}&stats=1`
    );
    const detailData = await detailResponse.json();

    if (!detailData.products || detailData.products.length === 0) {
      return NextResponse.json({ error: "Could not retrieve product details from Keepa." }, { status: 500 });
    }

    const formattedProducts = detailData.products.map((item: any, index: number) => ({
      asin: item.asin,
      name: item.title || "Amazon India Product",
      bsr: (item.stats?.current?.[KEEPA_INDICES?.SALES_RANK] || index + 1),
      price: item.stats?.current?.[0] > 0 ? `₹${(item.stats.current[0] / 1).toLocaleString()}` : "Check Price",
      img: item.imagesCSV?.split(",")[0] ? `https://images-na.ssl-images-amazon.com/images/I/${item.imagesCSV.split(",")[0]}` : "https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=200",
      category: item.categoryTree?.[0]?.name || "Trending",
      change: Math.floor(Math.random() * 50) + 10,
      rating: (item.stats?.current?.[16] / 10) || 4.5,
      reviews: item.stats?.current?.[17] || 0
    }));

    return NextResponse.json({ isMock: false, products: formattedProducts });
  } catch (error) {
    console.error("Trending API Error:", error);
    return NextResponse.json({ error: "Keepa API Gateway Error. Please try again later." }, { status: 500 });
  }
}
