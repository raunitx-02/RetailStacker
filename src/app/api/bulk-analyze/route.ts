import { NextRequest, NextResponse } from "next/server";
import {
  getBestPrice,
  getKeepaRating,
  getProductImageUrl,
  estimateMonthlyRevenue,
  estimateFBAFee,
  estimateGrossMargin,
  formatINR,
} from "@/lib/keepa";

const KEEPA_KEY = process.env.KEEPA_API_KEY!;
const KEEPA_DOMAIN = "10"; // Amazon India

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const asins: string[] = body.asins || [];

    if (!Array.isArray(asins) || asins.length === 0) {
      return NextResponse.json({ error: "No ASINs provided" }, { status: 400 });
    }

    // Process all provided ASINs (frontend should send chunks of max 50-100)
    const asinList = asins.join(",");
    const url = new URL("https://api.keepa.com/product");
    url.searchParams.set("key", KEEPA_KEY);
    url.searchParams.set("domain", KEEPA_DOMAIN);
    url.searchParams.set("asin", asinList);
    url.searchParams.set("stats", "1");
    url.searchParams.set("history", "0");

    const res = await fetch(url.toString(), { next: { revalidate: 0 } });
    const data = await res.json();

    if (!data.products || !Array.isArray(data.products)) {
       return NextResponse.json({ products: [] });
    }

    const parsed = data.products.map((p: any) => {
      const current = p.stats?.current || [];
      const price = getBestPrice(current) || 0;
      const bsr = current[3] > 0 ? current[3] : 999999;
      const reviews = current[17] > 0 ? current[17] : 0;
      const rating = getKeepaRating(current) || 0;
      
      const categoryName = p.categoryTree?.[0]?.name || "General";
      const fbaFee = estimateFBAFee(price);
      const margin = estimateGrossMargin(price, fbaFee);
      const revenue = estimateMonthlyRevenue(bsr, price, categoryName);

      return {
        asin: p.asin,
        title: p.title || "Amazon Product",
        brand: p.brand || p.manufacturer || "Unknown Brand",
        image: getProductImageUrl(p.imagesCSV, p.asin),
        price: price > 0 ? formatINR(price) : "N/A",
        priceNum: price,
        bsr: bsr,
        rating: rating,
        reviews: reviews,
        revenueEstimate: formatINR(revenue),
        revenueNum: revenue,
        fbaFee: formatINR(fbaFee),
        margin: `${margin}%`,
        marginNum: margin,
        category: categoryName,
      };
    });

    return NextResponse.json({ products: parsed });
  } catch (err) {
    console.error("Bulk analyze error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
