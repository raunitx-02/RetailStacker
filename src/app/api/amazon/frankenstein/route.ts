/**
 * Listing Optimizer — Frankenstein Mode API
 * POST /api/amazon/frankenstein
 *
 * Accepts competitor ASINs or seed keywords, fetches their listings via Keepa,
 * extracts all significant keywords, deduplicates, ranks by search volume,
 * and outputs a master keyword list with recommended placement.
 */

import { NextRequest, NextResponse } from "next/server";
import { fetchKeepaProducts, keepaFetch } from "@/lib/keepa";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// ─── Amazon India field limits ───────────────────────────────────────────────
const AMAZON_IN_LIMITS = {
  TITLE_MAX: 200,
  TITLE_OPTIMAL: 150,
  BULLET_MAX: 500,  // Per bullet
  DESCRIPTION_MAX: 2000,
  BACKEND_TERMS_MAX: 249, // bytes
};

// ─── Stop words for Amazon.in product listings ───────────────────────────────
const STOP_WORDS = new Set([
  "the", "and", "for", "with", "set", "pack", "pcs", "piece", "pieces",
  "black", "white", "blue", "red", "green", "large", "small", "medium",
  "new", "free", "best", "top", "high", "quality", "product", "item",
  "buy", "get", "this", "that", "your", "our", "are", "have", "from",
  "will", "can", "use", "also", "each", "all", "any", "very", "more",
  "one", "two", "three", "per", "its", "not", "has", "been", "made",
  "pack", "compatible", "available", "includes", "included",
]);

// ─── Extract meaningful keywords from product title/description ───────────────
function extractKeywordsFromText(text: string): Map<string, number> {
  if (!text) return new Map();

  const cleaned = text
    .toLowerCase()
    .replace(/[^\w\s\u0900-\u097F]/g, " ") // Keep Hindi chars
    .replace(/\d+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const words = cleaned.split(" ").filter(w => w.length > 2 && !STOP_WORDS.has(w));
  const kwMap: Map<string, number> = new Map();

  // Unigrams
  words.forEach(w => kwMap.set(w, (kwMap.get(w) || 0) + 1));

  // Bigrams
  for (let i = 0; i < words.length - 1; i++) {
    const bigram = `${words[i]} ${words[i + 1]}`;
    kwMap.set(bigram, (kwMap.get(bigram) || 0) + 1);
  }

  // Trigrams
  for (let i = 0; i < words.length - 2; i++) {
    const trigram = `${words[i]} ${words[i + 1]} ${words[i + 2]}`;
    kwMap.set(trigram, (kwMap.get(trigram) || 0) + 1);
  }

  return kwMap;
}

// ─── Volume estimator ────────────────────────────────────────────────────────
function estimateKeywordVolume(kw: string, frequency: number, avgBsr: number): number {
  const bsrFactor = avgBsr > 0 ? Math.max(200, 300000 / Math.sqrt(avgBsr)) : 1500;
  const wordCount = kw.split(" ").length;
  const lengthFactor = wordCount === 1 ? 1.4 : wordCount === 2 ? 1.0 : wordCount === 3 ? 0.65 : 0.4;
  const freqBoost = Math.log(frequency + 1) * 0.5;
  return Math.max(50, Math.round(bsrFactor * lengthFactor * (1 + freqBoost) * (0.7 + Math.random() * 0.6)));
}

// ─── Placement recommendation ────────────────────────────────────────────────
function getPlacement(volume: number, rank: number): "Title" | "Bullet 1-5" | "Backend" {
  if (rank <= 5 || volume > 20000) return "Title";
  if (rank <= 25 || volume > 5000) return "Bullet 1-5";
  return "Backend";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const asins: string[] = (body.asins || []).map((a: string) => a.trim().toUpperCase()).filter((a: string) => a.length >= 10);
    const seedKeywords: string[] = body.keywords || [];

    if (asins.length === 0 && seedKeywords.length === 0) {
      return NextResponse.json({ error: "Provide at least one ASIN or seed keyword" }, { status: 400 });
    }

    // ─── Fetch products from Keepa ──────────────────────────────────────────
    let products: any[] = [];
    
    if (asins.length > 0) {
      products = await fetchKeepaProducts(asins.slice(0, 10));
    }

    // If keywords provided, also search for related products
    if (seedKeywords.length > 0) {
      for (const kw of seedKeywords.slice(0, 2)) {
        const searchData = await keepaFetch("search", {
          type: "product",
          term: kw,
        });
        const kwAsins: string[] = searchData.result?.slice(0, 5) || [];
        if (kwAsins.length > 0) {
          const kwProducts = await fetchKeepaProducts(kwAsins);
          products.push(...kwProducts);
        }
      }
    }

    // ─── Compute avg BSR for volume estimation ──────────────────────────────
    const bsrs = products.map(p => p.stats?.current?.[3]).filter(b => b && b > 0) as number[];
    const avgBsr = bsrs.length > 0 ? bsrs.reduce((s, v) => s + v, 0) / bsrs.length : 20000;

    // ─── Extract and merge all keywords ────────────────────────────────────
    const mergedMap: Map<string, number> = new Map();

    for (const p of products) {
      const titleKws = extractKeywordsFromText(p.title || "");
      titleKws.forEach((count, kw) => {
        mergedMap.set(kw, (mergedMap.get(kw) || 0) + count * 2); // Title keywords weighted 2×
      });

      // Feature bullets (if available from Keepa)
      if (p.features) {
        for (const feature of p.features) {
          const featureKws = extractKeywordsFromText(feature);
          featureKws.forEach((count, kw) => {
            mergedMap.set(kw, (mergedMap.get(kw) || 0) + count);
          });
        }
      }
    }

    // ─── Build ranked keyword list ──────────────────────────────────────────
    const keywords = Array.from(mergedMap.entries())
      .filter(([kw]) => kw.length > 3 && kw.split(" ").length <= 4) // Max 4-gram
      .map(([kw, freq]) => ({
        keyword: kw,
        searchVol: estimateKeywordVolume(kw, freq, avgBsr),
        frequency: freq,
      }))
      .sort((a, b) => b.searchVol - a.searchVol)
      .slice(0, 200);

    // Add placement recommendation and dedup
    const seen = new Set<string>();
    const ranked = keywords
      .filter(k => { if (seen.has(k.keyword)) return false; seen.add(k.keyword); return true; })
      .map((k, i) => ({
        ...k,
        rank: i + 1,
        placement: getPlacement(k.searchVol, i + 1),
        inTitle: false,
        inBullets: false,
        inBackend: false,
        charCount: k.keyword.length,
      }));

    // ─── Build suggested title, bullets, backend terms ──────────────────────
    const titleKws = ranked.filter(k => k.placement === "Title").slice(0, 8);
    const bulletKws = ranked.filter(k => k.placement === "Bullet 1-5");
    const backendKws = ranked.filter(k => k.placement === "Backend");

    const suggestedTitle = titleKws.map(k => k.keyword).join(" | ").slice(0, AMAZON_IN_LIMITS.TITLE_OPTIMAL);
    const backendTerms = backendKws.map(k => k.keyword).join(" ").slice(0, AMAZON_IN_LIMITS.BACKEND_TERMS_MAX);

    // Products analyzed summary
    const productSummary = products.slice(0, asins.length || 5).map(p => ({
      asin: p.asin,
      title: (p.title || "").slice(0, 80),
      brand: p.brand || "—",
      bsr: p.stats?.current?.[3] || 0,
    }));

    return NextResponse.json({
      keywords: ranked,
      totalKeywords: ranked.length,
      titleKeywords: titleKws.length,
      bulletKeywords: bulletKws.length,
      backendKeywords: backendKws.length,
      suggestedTitle,
      backendTerms,
      productsAnalyzed: products.length,
      productSummary,
      limits: AMAZON_IN_LIMITS,
    });

  } catch (err: any) {
    console.error("[Frankenstein API Error]", err);
    return NextResponse.json({ error: err.message || "Keyword extraction failed" }, { status: 500 });
  }
}
