import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { message, platform = "amazon" } = await req.json();
    const query = message.toLowerCase();

    let responseText = "";

    // Platform-specific terminology
    const platformName = platform.charAt(0).toUpperCase() + platform.slice(1);
    const idTerm = platform === "amazon" ? "ASINs" : platform === "shopify" ? "product variants" : "listings";
    const competitorTerm = platform === "amazon" ? "B0XXXXXX" : "a rival seller";
    const portalName = platform === "amazon" ? "Seller Central" : platform === "flipkart" ? "Seller Hub" : platform === "meesho" ? "Supplier Panel" : "Shopify Admin";
    const featureName = platform === "amazon" ? "Manage Experiments tool" : `${platformName} A/B testing`;
    
    if (query.includes("sales") && (query.includes("gir") || query.includes("down") || query.includes("drop"))) {
      responseText = `I've analyzed your ${platformName} account health and recent metrics. Your sales drop is directly tied to the following critical issues:

**1. CTR (Click-Through Rate) Down**
Your main image on the top-selling ${idTerm} is losing traction. Your competitors have updated their main images with better lighting and higher resolution, causing a 2.4% drop in your CTR over the last 7 days.

**2. Reviews Issue**
You received two 1-star reviews recently which pushed your average rating below 4.0 stars on a high-volume product. This immediately suppressed your conversion rate.

**3. Keyword Ranking Drop**
Your organic rank for your top 3 primary keywords dropped from Page 1 to Page 2.

**4. Competitor Discounting**
Your closest competitor (${competitorTerm}) is currently running a 15% discount campaign, stealing your usual sales share.

**5. Image Quality Weak**
Infographics in your gallery are outdated and not mobile-optimized. Customers are bouncing off your listing because the dimensions/features aren't clear.

---
### 🔥 Actionable Steps to Recover Sales on ${platformName}:
*   **Step 1:** Immediately run a 5% off coupon/discount. This will add a badge to your listing, artificially boosting CTR to counteract the competitor's discount.
*   **Step 2:** Request reviews from past buyers using the tools in ${portalName} to drown out the recent negative reviews.
*   **Step 3:** Increase your top-of-search ad bids by 20% for your 3 main keywords to force your listing back onto Page 1 while your organic rank recovers.
*   **Step 4:** A/B test a new, brighter main image using ${featureName}.
`;
    } else if (query.includes("hijacker") || query.includes("fake seller") || query.includes("mapping")) {
      responseText = `I detect a potential unauthorized seller mapping to your ${platformName} listing. 

**Immediate Action Required:**
1. Lower your price marginally to instantly win back the buy box/top placement.
2. Send a Cease & Desist message to the seller if possible on ${platformName}.
3. If you have Brand Registry or Trademark protection, report a violation immediately via the ${portalName} support.
`;
    } else {
      responseText = `I'm analyzing your ${platformName} storefront data. Currently, I don't see any critical red flags related to that query. 

However, if you're looking for ways to optimize, I recommend checking your **Listing SEO** or reviewing your **Keyword Tracker** to see if any competitors are out-bidding you on generic search terms. How else can I assist your ${platformName} growth today?`;
    }

    // Simulate network delay for AI processing
    await new Promise(resolve => setTimeout(resolve, 1500));

    return NextResponse.json({ reply: responseText });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
