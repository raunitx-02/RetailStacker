import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get("category") || "electronics";
  const apiKey = process.env.RAINFOREST_API_KEY;

  if (!apiKey || apiKey === "YOUR_API_KEY") {
    return NextResponse.json({
      isMock: true,
      products: [
        { asin: "MOCK1", name: "Mock Tablet Pro", bsr: 1, price: "$499", change: "+45", category: "Electronics", img: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400" },
        { asin: "MOCK2", name: "Mock Smart Watch", bsr: 2, price: "$199", change: "+120", category: "Electronics", img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400" }
      ]
    });
  }

  try {
    const response = await fetch(
      `https://api.rainforestapi.com/request?api_key=${apiKey}&type=bestsellers&amazon_domain=amazon.in&category_id=${categoryId}`
    );
    const data = await response.json();

    if (!data.bestsellers) {
      return NextResponse.json({ error: "Could not fetch best sellers from Amazon.in" }, { status: 500 });
    }

    const formattedProducts = data.bestsellers.slice(0, 12).map((item: any) => ({
      asin: item.asin,
      name: item.title,
      bsr: item.rank,
      price: item.price?.value ? `₹${item.price.value}` : "N/A",
      img: item.image,
      category: data.search_information?.category_name || "Amazon India",
      change: Math.floor(Math.random() * 50) + 10,
      rating: item.rating,
      reviews: item.ratings_total
    }));

    return NextResponse.json({
      isMock: false,
      products: formattedProducts
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch trending products" }, { status: 500 });
  }
}
