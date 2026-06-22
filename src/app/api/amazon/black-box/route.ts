/**
 * Black Box India — Product Discovery API
 * POST /api/amazon/black-box
 *
 * Accepts filter parameters and returns Keepa-powered product opportunities
 * filtered for the Amazon India marketplace.
 */

import { NextRequest, NextResponse } from "next/server";
import {
  keepaFetch,
  fetchKeepaProducts,
  getBestPrice,
  getKeepaRating,
  getProductImageUrl,
  estimateMonthlyRevenue,
  estimateFBAFee,
  estimateGrossMargin,
  calculateOpportunity,
  formatINR,
  AMAZON_IN_CATEGORIES,
} from "@/lib/keepa";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export interface BlackBoxFilters {
  category: string;
  minPrice: number;
  maxPrice: number;
  minRevenue: number;
  maxRevenue: number;
  minReviews: number;
  maxReviews: number;
  maxBsr: number;
  minMargin: number;
  minRating: number;
  gstFlag?: string; // "5" | "12" | "18" | "28"
  importRisk?: boolean;
  reviewVelocity?: number; // Max reviews acquired in last 30 days
}

export interface BlackBoxProduct {
  rank: number;
  asin: string;
  img: string;
  name: string;
  brand: string;
  category: string;
  price: string;
  priceNum: number;
  bsr: number;
  revenueEstimate: string;
  revenueNum: number;
  reviews: number;
  rating: number;
  margin: string;
  marginNum: number;
  fbaFee: string;
  opportunity: "High" | "Medium" | "Low";
  gstSlab: string;
  trend: "up" | "down" | "stable";
  monthlySales: number;
}

// ─── Amazon India category search terms map ──────────────────────────────────
const CATEGORY_SEARCH_MAP: Record<string, string[]> = {
  "All":                  ["bestsellers india amazon", "trending products india"],
  "Electronics":          ["electronics gadgets india", "wireless earphones india"],
  "Home & Kitchen":       ["home kitchen india bestseller", "kitchen organizer india"],
  "Sports & Outdoors":    ["sports equipment india", "fitness gym india"],
  "Beauty & Personal Care": ["beauty skincare india", "hair care india"],
  "Clothing":             ["clothing fashion india", "t-shirts india"],
  "Toys & Games":         ["toys kids india", "educational toys india"],
  "Health":               ["health supplements india", "vitamins india"],
  "Kitchen":              ["kitchen appliances india", "cookware india"],
  "Books":                ["books bestsellers india"],
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const filters: BlackBoxFilters = {
      category: body.category || "All",
      minPrice: Number(body.minPrice) || 0,
      maxPrice: Number(body.maxPrice) || 999999,
      minRevenue: Number(body.minRevenue) || 0,
      maxRevenue: Number(body.maxRevenue) || 999999999,
      minReviews: Number(body.minReviews) || 0,
      maxReviews: Number(body.maxReviews) || 999999,
      maxBsr: Number(body.maxBsr) || 100000,
      minMargin: Number(body.minMargin) || 0,
      minRating: Number(body.minRating) || 0,
      gstFlag: body.gstFlag,
      importRisk: body.importRisk,
      reviewVelocity: body.reviewVelocity,
    };

    // ─── Step 1: Fetch ASINs from Keepa search ─────────────────────────────
    const searchTerms = CATEGORY_SEARCH_MAP[filters.category] || CATEGORY_SEARCH_MAP["All"];
    const term = searchTerms[0];

    const searchData = await keepaFetch("search", {
      type: "product",
      term,
    });

    let asins: string[] = searchData.result || [];
    if (asins.length === 0 && searchData.products) {
      asins = searchData.products.map((p: any) => p.asin);
    }

    // If second term available and first gave few results, supplement
    if (asins.length < 10 && searchTerms[1]) {
      const term2 = searchTerms[1];
      const searchData2 = await keepaFetch("search", { type: "product", term: term2 });
      const asins2: string[] = searchData2.result || [];
      const combined = [...new Set([...asins, ...asins2])];
      asins = combined;
    }

    if (asins.length === 0) {
      return NextResponse.json({
        products: [],
        total: 0,
        tokensUsed: 0,
        message: "No products found for this search. Try different filters.",
      });
    }

    // ─── Step 2: Fetch full product details ────────────────────────────────
    const products = await fetchKeepaProducts(asins.slice(0, 20));

    // ─── Step 3: Normalize + filter ────────────────────────────────────────
    const results: BlackBoxProduct[] = [];

    for (const p of products) {
      if (!p.stats?.current) continue;

      const current = p.stats.current;
      const price = getBestPrice(current);
      if (!price) continue;

      const bsr = current[3] > 0 ? current[3] : 999999;
      const reviews = current[17] > 0 ? current[17] : 0;
      const rating = getKeepaRating(current) || 0;
      const fbaFee = estimateFBAFee(price);
      const margin = estimateGrossMargin(price, fbaFee);
      const categoryName = p.categoryTree?.[0]?.name || "General";
      const revenue = estimateMonthlyRevenue(bsr, price, categoryName);

      // ─── Apply filters ────────────────────────────────────────────────
      if (price < filters.minPrice || price > filters.maxPrice) continue;
      if (revenue < filters.minRevenue || revenue > filters.maxRevenue) continue;
      if (reviews < filters.minReviews || reviews > filters.maxReviews) continue;
      if (bsr > filters.maxBsr) continue;
      if (margin < filters.minMargin) continue;
      if (rating < filters.minRating) continue;

      // ─── 90-day BSR trend ─────────────────────────────────────────────
      const avg90Bsr = p.stats?.avg90?.[3] || bsr;
      const trend: "up" | "down" | "stable" = 
        bsr < avg90Bsr * 0.9 ? "up" :
        bsr > avg90Bsr * 1.1 ? "down" : "stable";

      // ─── GST slab (simple category-based) ────────────────────────────
      const gstSlab = categoryName.toLowerCase().includes("book") ? "0%" :
                      categoryName.toLowerCase().includes("food") ? "5%" :
                      categoryName.toLowerCase().includes("clothing") ? "12%" :
                      categoryName.toLowerCase().includes("electronics") ? "18%" : "12%";

      if (filters.gstFlag && gstSlab !== `${filters.gstFlag}%`) continue;

      const opportunity = calculateOpportunity(bsr, reviews, margin, rating);

      const monthlySalesEst = Math.round(revenue / price);

      results.push({
        rank: results.length + 1,
        asin: p.asin,
        img: getProductImageUrl(p.imagesCSV, p.asin),
        name: p.title || "Amazon India Product",
        brand: p.brand || "—",
        category: categoryName,
        price: formatINR(price),
        priceNum: price,
        bsr,
        revenueEstimate: formatINR(revenue),
        revenueNum: revenue,
        reviews,
        rating,
        margin: `${margin}%`,
        marginNum: margin,
        fbaFee: formatINR(fbaFee),
        opportunity,
        gstSlab,
        trend,
        monthlySales: monthlySalesEst,
      });
    }

    // Sort by revenue descending (best opportunities first)
    results.sort((a, b) => b.revenueNum - a.revenueNum);

    // Re-rank after sort
    results.forEach((r, i) => { r.rank = i + 1; });

    return NextResponse.json({
      products: results,
      total: results.length,
      category: filters.category,
      message: results.length === 0
        ? "No products matched your filters. Try relaxing the constraints."
        : null,
    });

  } catch (err: any) {
    console.error("[Black Box API Error]", err);
    return NextResponse.json(
      { error: err.message || "Internal Server Error", products: [] },
      { status: 500 }
    );
  }
}
