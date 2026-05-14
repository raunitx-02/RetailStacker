import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const asin = searchParams.get("asin");
  const apiKey = process.env.RAINFOREST_API_KEY;

  if (!asin) {
    return NextResponse.json({ error: "ASIN is required" }, { status: 400 });
  }

  // Fallback to mock data if no API Key is provided
  if (!apiKey || apiKey === "YOUR_API_KEY") {
    console.warn("Rainforest API Key missing. Returning mock data.");
    return NextResponse.json({
      isMock: true,
      asin: asin.toUpperCase(),
      name: "Premium Wireless Earbuds Pro (Mock)",
      bsr: Math.floor(Math.random() * 1000) + 1,
      category: "Electronics > Headphones",
      velocity: "+12.5%",
      price: "$149.99"
    });
  }

  try {
    const response = await fetch(
      `https://api.rainforestapi.com/request?api_key=${apiKey}&type=product&amazon_domain=amazon.in&asin=${asin}`
    );
    const data = await response.json();

    if (!data.product) {
      return NextResponse.json({ error: "Product not found on Amazon.in" }, { status: 404 });
    }

    // Extract BSR (Best Sellers Rank)
    const bsrData = data.product.bestsellers_rank?.[0] || { rank: "N/A", category: "N/A" };

    return NextResponse.json({
      isMock: false,
      asin: data.product.asin,
      name: data.product.title,
      bsr: bsrData.rank,
      category: bsrData.category,
      price: data.product.buybox_winner?.price?.value ? `₹${data.product.buybox_winner.price.value}` : "N/A",
      img: data.product.main_image?.link,
      velocity: "+18.2%",
      rating: data.product.rating,
      reviews: data.product.ratings_total
    });
  } catch (error) {
    console.error("Rainforest API Error:", error);
    return NextResponse.json({ error: "Failed to fetch data from Amazon" }, { status: 500 });
  }
}
