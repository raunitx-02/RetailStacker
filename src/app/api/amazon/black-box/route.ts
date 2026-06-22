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

    // ─── Step 1: Fetch ASINs from Keepa category bestsellers or search ───────
    let asins: string[] = [];

    // Try bestsellers list for highly accurate/popular products in this category
    const catMeta = AMAZON_IN_CATEGORIES[filters.category] || AMAZON_IN_CATEGORIES["All"];
    if (catMeta && catMeta.id) {
      try {
        const bsData = await keepaFetch("bestsellers", {
          category: catMeta.id,
        });
        asins = bsData.bestSellersList?.asinList || [];
      } catch (err) {
        console.error("[Black Box Bestsellers Error] Fallback to search:", err);
      }
    }

    // Fallback to keyword search if bestsellers returned no results
    if (asins.length === 0) {
      const term = catMeta.term || "bestsellers india";

      const searchData = await keepaFetch("search", {
        type: "product",
        term,
      });

      asins = searchData.result || [];
      if (asins.length === 0 && searchData.products) {
        asins = searchData.products.map((p: any) => p.asin);
      }
    }

    if (asins.length === 0) {
      return NextResponse.json({
        products: [],
        total: 0,
        tokensUsed: 0,
        message: "No products found for this search. Try different filters.",
      });
    }

    // Filter ASIN list to match the user's max BSR constraint
    const maxRankLimit = filters.maxBsr || 100000;
    const eligibleAsins = asins.slice(0, maxRankLimit);

    // Sample 100 ASINs evenly across the eligible ranks
    const sampledAsins: string[] = [];
    if (eligibleAsins.length > 0) {
      const sampleTiers = [0, 50, 150, 300, 600, 1000, 2000, 4000, 7000, 10000];
      const itemsPerTier = Math.max(5, Math.floor(100 / sampleTiers.length));
      
      for (const tier of sampleTiers) {
        if (tier < eligibleAsins.length) {
          const slice = eligibleAsins.slice(tier, tier + itemsPerTier);
          sampledAsins.push(...slice);
        }
      }
      
      // Fallback/fill to ensure we get a full list
      const uniqueSampled = [...new Set(sampledAsins)];
      if (uniqueSampled.length < 100) {
        const remaining = eligibleAsins.filter(a => !uniqueSampled.includes(a));
        uniqueSampled.push(...remaining.slice(0, 100 - uniqueSampled.length));
      }
      sampledAsins.splice(0, sampledAsins.length, ...uniqueSampled);
    }

    const finalAsins = [...new Set(sampledAsins)].slice(0, 100);

    // ─── Step 2: Fetch full product details ────────────────────────────────
    const products = await fetchKeepaProducts(finalAsins);

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
