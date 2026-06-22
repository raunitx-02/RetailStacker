/**
 * Keepa API Client — RetailStacker Production Layer
 * Amazon India (domain=10) optimized
 * All price values from Keepa are integers × 100 for India
 */

export const KEEPA_API_KEY = process.env.KEEPA_API_KEY!;
export const KEEPA_DOMAIN = "10"; // Amazon.in

// ─── Keepa stats.current index reference ────────────────────────────────────
// [0]  AMAZON price
// [1]  NEW price
// [2]  USED price
// [3]  SALES_RANK (BSR)
// [10] FBA fees (approximate)
// [16] RATING (× 10, e.g. 45 = 4.5 stars)
// [17] REVIEW_COUNT
// [18] BUY_BOX price
// ────────────────────────────────────────────────────────────────────────────

export interface KeepaProduct {
  asin: string;
  title: string;
  brand: string;
  manufacturer: string;
  imagesCSV: string;
  categoryTree: { catId: number; name: string }[];
  rootCategory: number;
  stats: {
    current: number[];
    avg: number[];
    avg30: number[];
    avg90: number[];
    avg180: number[];
    atIntervalEnd: number[];
  };
  csv: (number[] | null)[];
  monthlySold: number;
  tokensLeft: number;
}

export interface KeepaApiResponse {
  products: KeepaProduct[];
  tokensLeft: number;
  processingTimeInMs: number;
  error?: { type: string; message: string };
}

// ─── Price normalizer for Amazon India ─────────────────────────────────────
// Keepa returns India prices as raw INR × 100 (e.g., 49900 = ₹499)
export function normalizeKeepaPrice(raw: number | undefined | null): number | null {
  if (!raw || raw <= 0) return null;
  // Keepa India: raw value is INR × 100
  return raw / 100;
}

export function formatINR(amount: number): string {
  return `₹${amount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

// ─── Get best available price ───────────────────────────────────────────────
export function getBestPrice(current: number[]): number | null {
  // Prefer Buy Box → New → Amazon
  const candidates = [current[18], current[1], current[0]];
  for (const c of candidates) {
    const normalized = normalizeKeepaPrice(c);
    if (normalized && normalized > 0 && normalized < 500000) return normalized;
  }
  return null;
}

// ─── Rating ─────────────────────────────────────────────────────────────────
export function getKeepaRating(current: number[]): number | null {
  const raw = current[16];
  if (!raw || raw <= 0) return null;
  return raw / 10;
}

// ─── Primary image URL ───────────────────────────────────────────────────────
export function getProductImageUrl(imagesData: any, asin: string): string {
  // If it's a string (legacy imagesCSV format)
  if (typeof imagesData === "string" && imagesData.trim() !== "") {
    const firstId = imagesData.split(",")[0];
    if (firstId && firstId.length > 5) {
      return `https://m.media-amazon.com/images/I/${firstId}.jpg`;
    }
  } 
  // If it's an array of objects (new Keepa format `p.images`)
  else if (Array.isArray(imagesData) && imagesData.length > 0) {
    const imgObj = imagesData[0];
    const imageId = imgObj.l || imgObj.m || imgObj.s;
    if (imageId) {
      // Keepa image objects just contain the filename, e.g. "61aKwQGThtL.jpg"
      return `https://m.media-amazon.com/images/I/${imageId}`;
    }
  }
  
  // Robust fallback using just ASIN
  return `https://m.media-amazon.com/images/P/${asin}.01._SL300_.jpg`;
}

// ─── BSR Velocity (estimated monthly sold based on BSR) ─────────────────────
// India-specific BSR→Sales conversion model
export function estimateMonthlySales(bsr: number, category: string): number {
  if (!bsr || bsr <= 0) return 0;
  // Simplified model calibrated for Amazon.in categories
  const base = category.toLowerCase().includes("electronics") ? 3000 :
               category.toLowerCase().includes("home") ? 2500 :
               category.toLowerCase().includes("beauty") ? 2800 :
               category.toLowerCase().includes("sports") ? 2000 : 2200;
  // Rough logarithmic decay: BSR 1 ≈ base sales, BSR 10000 ≈ ~20% of base
  return Math.max(5, Math.round(base / Math.pow(bsr, 0.55)));
}

// ─── Estimated Monthly Revenue ───────────────────────────────────────────────
export function estimateMonthlyRevenue(bsr: number, price: number, category: string): number {
  const sales = estimateMonthlySales(bsr, category);
  return sales * price;
}

// ─── FBA Fee Estimator (India-specific) ─────────────────────────────────────
export function estimateFBAFee(price: number): number {
  // Amazon India FBA fee tiers (simplified)
  if (price <= 250) return 35;
  if (price <= 500) return 55;
  if (price <= 1000) return 85;
  if (price <= 2000) return 130;
  if (price <= 5000) return 200;
  if (price <= 10000) return 320;
  return Math.round(price * 0.05);
}

// ─── Gross Margin Estimator ──────────────────────────────────────────────────
export function estimateGrossMargin(price: number, fbaFee: number): number {
  // Assume ~35% COGS for India FBA sellers
  const cogs = price * 0.35;
  const amazonReferralFee = price * 0.10; // ~10% average for Amazon.in
  const gst = price * 0.12; // 12% GST slab average
  const netProfit = price - cogs - fbaFee - amazonReferralFee - gst;
  return Math.max(0, Math.round((netProfit / price) * 100));
}

// ─── Opportunity Score ───────────────────────────────────────────────────────
export type OpportunityLevel = "High" | "Medium" | "Low";

export function calculateOpportunity(
  bsr: number,
  reviews: number,
  margin: number,
  rating: number
): OpportunityLevel {
  let score = 0;
  if (bsr < 5000) score += 3;
  else if (bsr < 15000) score += 2;
  else if (bsr < 30000) score += 1;

  if (reviews < 100) score += 3;
  else if (reviews < 500) score += 2;
  else if (reviews < 2000) score += 1;

  if (margin > 30) score += 2;
  else if (margin > 20) score += 1;

  if (rating >= 4.0 && rating <= 4.3) score += 1; // Sweet spot

  if (score >= 7) return "High";
  if (score >= 4) return "Medium";
  return "Low";
}

// ─── Core API fetcher ────────────────────────────────────────────────────────────
const KEEPA_TIMEOUT_MS = 20000; // 20s timeout per request

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms / 1000}s`)), ms)
    ),
  ]);
}

export async function keepaFetch(endpoint: string, params: Record<string, string>): Promise<any> {
  const apiKey = process.env.KEEPA_API_KEY || "pa8osmtpo6bq3bbf3vgfqmp78p0ifbouv34flbvs51hsjqkb7kg6qjgddpspinlp";
  const url = new URL(`https://api.keepa.com/${endpoint}`);
  url.searchParams.set("key", apiKey);
  url.searchParams.set("domain", KEEPA_DOMAIN);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v); // URLSearchParams handles encoding — do NOT pre-encode values
  }

  const res = await withTimeout(
    fetch(url.toString()),
    KEEPA_TIMEOUT_MS,
    `Keepa /${endpoint}`
  );

  if (!res.ok) {
    throw new Error(`Keepa HTTP ${res.status}: ${res.statusText}`);
  }

  const data = await withTimeout(res.json(), 10000, "Keepa JSON parse");

  if (data.error) {
    throw new Error(`Keepa API Error: ${data.error.message || data.error.type}`);
  }

  return data;
}

// ─── Fetch product details by ASINs ─────────────────────────────────────────
export async function fetchKeepaProducts(asins: string[]): Promise<KeepaProduct[]> {
  if (asins.length === 0) return [];
  const asinStr = asins.slice(0, 100).join(","); // Max 100 per request
  const data = await keepaFetch("product", {
    asin: asinStr,
    stats: "1",
    history: "0",
    rating: "1",
  });
  return data.products || [];
}

// ─── Search Keepa for products (returns full product objects) ────────────────
export async function searchKeepaProducts(term: string): Promise<KeepaProduct[]> {
  const data = await keepaFetch("search", {
    type: "product",
    term, // Do NOT encodeURIComponent here — searchParams.set does it automatically
  });
  // Keepa search returns full product objects in data.products
  return (data.products || []) as KeepaProduct[];
}

// ─── Category ID map for Amazon India ───────────────────────────────────────
export const AMAZON_IN_CATEGORIES: Record<string, { id: string; term: string }> = {
  "All": { id: "1571271031", term: "bestsellers india" },
  "Electronics": { id: "976419031", term: "electronics gadgets india" },
  "Home & Kitchen": { id: "976442031", term: "home kitchen products india" },
  "Sports & Outdoors": { id: "1983396031", term: "sports fitness india" },
  "Beauty & Personal Care": { id: "1355016031", term: "beauty personal care india" },
  "Clothing": { id: "1571274031", term: "clothing fashion india" },
  "Books": { id: "976389031", term: "books bestsellers india" },
  "Toys & Games": { id: "1350387031", term: "toys games india" },
  "Health": { id: "1350361031", term: "health wellness india" },
  "Kitchen": { id: "4369109031", term: "kitchen appliances india" },
};
