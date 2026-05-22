/**
 * Xray India — Live Market Analysis API
 * GET /api/amazon/xray?asin=B08XYZ1234
 *
 * Returns competitive landscape, price history, and market intelligence
 * for any Amazon.in ASIN, powered by Keepa.
 */

import { NextRequest, NextResponse } from "next/server";
import {
  keepaFetch,
  fetchKeepaProducts,
  searchKeepaProducts,
  getBestPrice,
  getKeepaRating,
  getProductImageUrl,
  estimateMonthlyRevenue,
  estimateFBAFee,
  estimateGrossMargin,
  calculateOpportunity,
  formatINR,
  normalizeKeepaPrice,
} from "@/lib/keepa";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// ─── Parse Keepa CSV history to chart-friendly format ───────────────────────
function parseKeepaHistory(csv: number[] | null | undefined, maxPoints = 90): { date: string; value: number }[] {
  if (!csv || csv.length < 2) return [];

  const KEEPA_EPOCH_OFFSET = 21564000; // minutes since Jan 1, 2011
  const points: { date: string; value: number }[] = [];

  for (let i = 0; i < csv.length - 1; i += 2) {
    const keepaTime = csv[i];
    const value = csv[i + 1];
    if (keepaTime < 0 || value < 0) continue;

    const unixMs = (keepaTime + KEEPA_EPOCH_OFFSET) * 60 * 1000;
    const date = new Date(unixMs);
    const label = date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
    points.push({ date: label, value });
  }

  // Sample down to maxPoints evenly
  if (points.length <= maxPoints) return points;
  const step = Math.floor(points.length / maxPoints);
  return points.filter((_, i) => i % step === 0).slice(0, maxPoints);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  let asin = searchParams.get("asin")?.trim().toUpperCase();

  if (!asin || asin.length < 10) {
    return NextResponse.json({ error: "Valid ASIN required (10 characters)" }, { status: 400 });
  }

  try {
    // ─── Step 1: Fetch target product with full history ─────────────────────
    const data = await keepaFetch("product", {
      asin,
      stats: "1",
      history: "1",
    });

    if (!data.products || data.products.length === 0) {
      return NextResponse.json({ error: "Product not found on Amazon.in" }, { status: 404 });
    }

    const target = data.products[0];
    const targetCurrent = target.stats?.current || [];

    // ─── Step 2: Find competing products via category search ────────────────
    const categoryName = target.categoryTree?.[0]?.name || "General";
    const searchTerm = target.title
      ? target.title.split(" ").slice(0, 3).join(" ") // Use first 3 words
      : categoryName;

    const competitorProducts = await searchKeepaProducts(searchTerm);
    const competitorAsins = competitorProducts.map(p => p.asin).filter(Boolean);
    const allAsins = [...new Set([asin, ...competitorAsins.slice(0, 15)])];

    // ─── Step 3: Fetch all products (target + competitors) ──────────────────
    const products = await fetchKeepaProducts(allAsins);

    // ─── Step 4: Build product analysis array ───────────────────────────────
    const analyzed = products.map(p => {
      const current = p.stats?.current || [];
      const price = getBestPrice(current) || 0;
      const bsr = current[3] > 0 ? current[3] : 999999;
      const reviews = current[17] > 0 ? current[17] : 0;
      const rating = getKeepaRating(current) || 0;
      const fbaFee = estimateFBAFee(price);
      const margin = estimateGrossMargin(price, fbaFee);
      const revenue = estimateMonthlyRevenue(bsr, price, categoryName);
      const avg90Bsr = p.stats?.avg90?.[3] || bsr;
      const trend = bsr < avg90Bsr * 0.9 ? "up" : bsr > avg90Bsr * 1.1 ? "down" : "stable";

      const gstSlab = categoryName.toLowerCase().includes("book") ? "0%" :
                      categoryName.toLowerCase().includes("food") ? "5%" :
                      categoryName.toLowerCase().includes("clothing") ? "12%" :
                      categoryName.toLowerCase().includes("electronics") ? "18%" : "12%";

      return {
        asin: p.asin,
        title: p.title || "Amazon Product",
        img: getProductImageUrl(p.imagesCSV, p.asin),
        brand: p.brand || "—",
        price: price > 0 ? formatINR(price) : "N/A",
        priceNum: price,
        bsr,
        rating,
        reviews,
        revenueEstimate: formatINR(revenue),
        revenueNum: revenue,
        monthlySales: price > 0 ? Math.round(revenue / price) : 0,
        fbaFee: formatINR(fbaFee),
        margin: `${margin}%`,
        marginNum: margin,
        gstSlab,
        opportunity: calculateOpportunity(bsr, reviews, margin, rating),
        trend: trend as "up" | "down" | "stable",
      };
    }).filter(p => p.priceNum > 0); // Filter out products with no price

    // Sort by revenue descending
    analyzed.sort((a, b) => b.revenueNum - a.revenueNum);

    // ─── Step 5: Parse price + BSR history for the target product ───────────
    const priceHistoryRaw = parseKeepaHistory(target.csv?.[1]); // New price
    const bsrHistoryRaw = parseKeepaHistory(target.csv?.[3]);   // Sales rank

    // Merge price and BSR into one array for dual-axis chart
    const priceHistory = priceHistoryRaw.slice(-60).map((pt, i) => ({
      date: pt.date,
      price: Math.round((normalizeKeepaPrice(pt.value) || 0)),
      bsr: bsrHistoryRaw[Math.floor(i * bsrHistoryRaw.length / priceHistoryRaw.length)]?.value || 0,
    })).filter(pt => pt.price > 0);

    // ─── Step 6: Build summary stats ────────────────────────────────────────
    const validProducts = analyzed.filter(p => p.priceNum > 0 && p.bsr < 500000);
    const avgRevenue = validProducts.reduce((s, p) => s + p.revenueNum, 0) / Math.max(validProducts.length, 1);
    const avgPrice = validProducts.reduce((s, p) => s + p.priceNum, 0) / Math.max(validProducts.length, 1);
    const avgReviews = validProducts.reduce((s, p) => s + p.reviews, 0) / Math.max(validProducts.length, 1);
    const avgBsr = validProducts.reduce((s, p) => s + p.bsr, 0) / Math.max(validProducts.length, 1);
    const totalRevenue = validProducts.reduce((s, p) => s + p.revenueNum, 0);

    return NextResponse.json({
      products: analyzed.slice(0, 12),
      summary: {
        avgRevenue: formatINR(Math.round(avgRevenue)),
        avgPrice: formatINR(Math.round(avgPrice)),
        avgReviews: Math.round(avgReviews).toLocaleString("en-IN"),
        avgBsr: `#${Math.round(avgBsr).toLocaleString("en-IN")}`,
        totalRevenue: formatINR(Math.round(totalRevenue)),
        opportunityScore: Math.round((analyzed.filter(p => p.opportunity === "High").length / Math.max(analyzed.length, 1)) * 100),
      },
      priceHistory,
      category: categoryName,
      targetAsin: asin,
    });

  } catch (err: any) {
    console.error("[Xray API Error]", err);
    return NextResponse.json(
      { error: err.message || "Market analysis failed" },
      { status: 500 }
    );
  }
}
