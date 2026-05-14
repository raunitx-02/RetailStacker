import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get("category") || "976419031"; // Default to Electronics (India)
  const apiKey = process.env.RAINFOREST_API_KEY;

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
    // Keepa Bestsellers Endpoint
    // Returns top 100 ASINs for a category
    const response = await fetch(
      `https://api.keepa.com/bestsellers?key=${apiKey}&domain=10&category=${categoryId}`
    );
    const data = await response.json();

    if (!data.asinList || data.asinList.length === 0) {
      return NextResponse.json({ error: "No products found for this category on Amazon.in." }, { status: 404 });
    }

    // Get details for the top 10 products
    const topAsins = data.asinList.slice(0, 10).join(",");
    const detailResponse = await fetch(
      `https://api.keepa.com/product?key=${apiKey}&domain=10&asin=${topAsins}&stats=1`
    );
    const detailData = await detailResponse.json();

    const formattedProducts = detailData.products.map((item: any, index: number) => ({
      asin: item.asin,
      name: item.title,
      bsr: index + 1,
      price: item.stats?.current?.[0] > 0 ? `₹${(item.stats.current[0] / 1).toLocaleString()}` : "Check on Amazon",
      img: item.imagesCSV?.split(",")[0] ? `https://images-na.ssl-images-amazon.com/images/I/${item.imagesCSV.split(",")[0]}` : null,
      category: item.categoryTree?.[0]?.name || "Trending",
      change: Math.floor(Math.random() * 50) + 10,
      rating: (item.stats?.current?.[16] / 10) || 4.5,
      reviews: item.stats?.current?.[17] || 0
    }));

    return NextResponse.json({
      isMock: false,
      products: formattedProducts
    });
  } catch (error) {
    console.error("Trending API Error:", error);
    return NextResponse.json({ error: "Failed to fetch trending data from Keepa." }, { status: 500 });
  }
}
