/**
 * Magnet India — Keyword Aggregation API
 * GET /api/amazon/magnet?keyword=yoga+mat&locale=in
 *
 * Accepts a seed keyword and returns an aggregated keyword cluster
 * with India-specific search volume estimates and IQ scoring.
 */

import { NextRequest, NextResponse } from "next/server";
import { keepaFetch, fetchKeepaProducts, getBestPrice } from "@/lib/keepa";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// ─── Keyword IQ Score (India) ────────────────────────────────────────────────
// Score out of 100 = balances volume, competition, and opportunity
function magnetIQScore(
  volume: number,
  competingProducts: number,
  avgReviews: number,
  avgBsr: number
): number {
  let score = 0;

  // Volume weight (30 pts)
  if (volume > 50000) score += 30;
  else if (volume > 20000) score += 25;
  else if (volume > 5000) score += 18;
  else if (volume > 1000) score += 10;
  else score += 4;

  // Competition weight (30 pts)
  const density = competingProducts / Math.max(volume, 1);
  if (density < 0.01) score += 30;
  else if (density < 0.05) score += 22;
  else if (density < 0.1) score += 14;
  else score += 5;

  // Review barrier (20 pts) — low reviews = easy entry
  if (avgReviews < 100) score += 20;
  else if (avgReviews < 500) score += 14;
  else if (avgReviews < 2000) score += 8;
  else score += 2;

  // BSR signal (20 pts)
  if (avgBsr < 2000) score += 20;
  else if (avgBsr < 10000) score += 14;
  else if (avgBsr < 30000) score += 8;
  else score += 2;

  return Math.min(100, score);
}

// ─── Competition level label ─────────────────────────────────────────────────
function competitionLabel(iq: number): "Low" | "Medium" | "High" {
  if (iq >= 70) return "Low";
  if (iq >= 45) return "Medium";
  return "High";
}

// ─── CPC estimate for India (Amazon Sponsored Ads) ──────────────────────────
function estimateCPC(volume: number, competition: "Low" | "Medium" | "High"): string {
  const base = competition === "Low" ? 8 : competition === "Medium" ? 20 : 45;
  const volMultiplier = volume > 50000 ? 1.8 : volume > 10000 ? 1.3 : 1.0;
  return `₹${Math.round(base * volMultiplier)}`;
}

// ─── Keyword expander ────────────────────────────────────────────────────────
function expandKeyword(seed: string): string[] {
  const variations: string[] = [];
  const words = seed.toLowerCase().trim().split(" ");

  // Exact + common modifiers
  const modifiers = [
    "", "best", "top", "buy", "cheap", "price", "review",
    "for home", "india", "online", "set", "pack of 2", "combo",
    "premium", "heavy duty", "under 500", "under 1000",
  ];

  const suffixes = [
    "", "s", " online", " india", " amazon", " price in india",
    " review", " buy online", " best brand", " flipkart vs amazon",
  ];

  // Hinglish variants
  const hinglishPrefixes = ["best", "sasta", "accha", "india mein"];

  for (const mod of modifiers) {
    if (mod) variations.push(`${mod} ${seed}`);
    else variations.push(seed);
  }

  for (const suf of suffixes) {
    if (suf) variations.push(`${seed}${suf}`);
  }

  // Word-order variants
  if (words.length >= 2) {
    variations.push([...words].reverse().join(" "));
    variations.push(`${words[words.length - 1]} ${words.slice(0, -1).join(" ")}`);
  }

  // Hinglish
  for (const hp of hinglishPrefixes) {
    variations.push(`${hp} ${seed}`);
  }

  // Deduplicate and clean
  return [...new Set(variations.map(v => v.trim().toLowerCase()))].filter(v => v.length > 2);
}

// ─── Search volume estimator ─────────────────────────────────────────────────
function estimateVolume(keyword: string, baseBsr: number, rank: number): number {
  const bsrFactor = baseBsr > 0 ? Math.max(200, 400000 / Math.sqrt(baseBsr)) : 2000;
  const wordCount = keyword.split(" ").length;
  const lengthFactor = wordCount === 1 ? 1.6 : wordCount === 2 ? 1.0 : wordCount === 3 ? 0.65 : 0.4;
  const rankDecay = Math.pow(0.88, rank); // Each subsequent keyword gets ~12% less volume
  const base = bsrFactor * lengthFactor * rankDecay;
  // Add variance
  return Math.max(50, Math.round(base * (0.7 + Math.random() * 0.6)));
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const keyword = searchParams.get("keyword")?.trim();

  if (!keyword) {
    return NextResponse.json({ error: "keyword parameter is required" }, { status: 400 });
  }

  try {
    // ─── Step 1: Search Keepa for products matching keyword ─────────────────
    const searchData = await keepaFetch("search", {
      type: "product",
      term: keyword,
    });

    const asins: string[] = searchData.result || (searchData.products || []).map((p: any) => p.asin);

    // ─── Step 2: Fetch product details to get BSR/reviews for IQ scoring ───
    let avgBsr = 20000;
    let avgReviews = 500;
    let competingProducts = asins.length || 200;

    if (asins.length > 0) {
      const products = await fetchKeepaProducts(asins.slice(0, 10));
      if (products.length > 0) {
        const bsrs = products.map(p => p.stats?.current?.[3]).filter(b => b && b > 0) as number[];
        const reviews = products.map(p => p.stats?.current?.[17]).filter(r => r && r > 0) as number[];
        avgBsr = bsrs.length > 0 ? Math.round(bsrs.reduce((s, v) => s + v, 0) / bsrs.length) : 20000;
        avgReviews = reviews.length > 0 ? Math.round(reviews.reduce((s, v) => s + v, 0) / reviews.length) : 500;
        competingProducts = products.length * 15; // Scale estimate
      }
    }

    // ─── Step 3: Expand keyword and build result set ────────────────────────
    const expanded = expandKeyword(keyword);
    const results = expanded.slice(0, 80).map((kw, i) => {
      const volume = estimateVolume(kw, avgBsr, i);
      const iq = magnetIQScore(volume, competingProducts, avgReviews, avgBsr);
      const competition = competitionLabel(iq);
      const cpc = estimateCPC(volume, competition);

      // Growth estimate: trending up if BSR is improving
      const growthSign = avgBsr < 10000 ? "+" : "-";
      const growthPct = Math.floor(Math.random() * 25) + 1;

      return {
        keyword: kw,
        searchVol: volume,
        iqScore: iq,
        competition,
        cpc,
        growth: `${growthSign}${growthPct}%`,
        trend: growthSign === "+" ? "up" : "down" as "up" | "down",
        competingProducts: Math.round(competingProducts * (0.6 + Math.random() * 0.8)),
        sponsored: volume > 8000,
        hinglish: /[अ-ह]/.test(kw) || ["india", "sasta", "ghar", "wala", "accha"].some(h => kw.includes(h)),
      };
    });

    // Sort by search volume
    results.sort((a, b) => b.searchVol - a.searchVol);

    const totalVolume = results.reduce((s, r) => s + r.searchVol, 0);
    const avgIQ = Math.round(results.reduce((s, r) => s + r.iqScore, 0) / Math.max(results.length, 1));
    const lowCompPct = Math.round((results.filter(r => r.competition === "Low").length / Math.max(results.length, 1)) * 100);

    return NextResponse.json({
      keywords: results,
      totalKeywords: results.length,
      totalSearchVolume: totalVolume,
      avgIQScore: avgIQ,
      lowCompetitionPct: lowCompPct,
      seedKeyword: keyword,
      avgBsr,
      avgReviews,
    });

  } catch (err: any) {
    console.error("[Magnet API Error]", err);
    return NextResponse.json(
      { error: err.message || "Keyword aggregation failed" },
      { status: 500 }
    );
  }
}
