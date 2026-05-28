<div align="center">

# 🌟 RetailStacker

**The Next Generation Amazon Seller Intelligence Platform**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](#)

*Experience the future of e-commerce analytics with a stunning, Apple-inspired liquid glass interface.*

</div>

---

## 🚀 Overview

**RetailStacker** is a comprehensive, production-grade demo portal designed to replicate the immense power of industry-standard Amazon seller tools, but completely reimagined through a modern, high-fidelity UI/UX lens. 

Gone are the days of clunky, utilitarian dashboards. RetailStacker brings a **"liquid glass" aesthetic**, featuring seamless Light & Dark modes, vibrant blue accents, frosted glass cards, and fluid animations.

Whether you're an investor, an agency, or a developer looking to build the next big SaaS, RetailStacker provides the perfect frontend blueprint.

---

## ✨ Key Features

RetailStacker comes packed with **22 meticulously crafted tools**, categorized for ultimate seller success:

### 🔍 Product Research
- **Black Box (Amazon Product Research)**: The ultimate product discovery tool. Black Box allows users to apply advanced filters (such as monthly revenue, price, review count, and search volume) to instantly find winning product opportunities hidden in Amazon's massive catalog.
- **Xray (Market Intelligence)**: A powerful, Chrome extension-style competitor intelligence table. It simulates extracting live data directly from Amazon search results, providing instant estimates on a product's monthly sales, revenue, BSR (Best Sellers Rank), and FBA fees.
- **Trendster (Seasonality Tracker)**: A visual seasonality and trend analysis tool. It overlays product BSR history with historical pricing and search volume data, allowing sellers to determine if a product is a year-round winner or just a seasonal fad.

### 🔑 Keyword Research
- **Cerebro (Reverse ASIN Lookup)**: The core keyword discovery engine. By entering a competitor's ASIN, Cerebro simulates pulling the exact keywords that the product ranks for, including organic rank, sponsored rank, and estimated search volume.
- **Magnet (Keyword Aggregator)**: A comprehensive keyword expansion tool. Enter a seed keyword, and Magnet generates thousands of related, high-volume, and long-tail keyword suggestions to help identify untapped traffic sources.
- **Frankenstein (Keyword Processor)**: A massive keyword list cleaner. It takes thousands of raw keywords and instantly removes duplicates, strips out irrelevant terms, and processes them into a clean, comma-separated list ready to be pasted into the Amazon backend.
- **Misspellinator (Search Term Optimizer)**: Discover highly searched but easily ranked misspelled keywords. It identifies common customer typos for specific search terms, allowing sellers to rank for them organically with zero competition.

### 📝 Listing Optimization
- **Listing Builder (AI-Powered Editor)**: A dynamic listing editor featuring a real-time keyword optimization scoring ring. It guides the user through placing critical keywords into the Title, Bullet Points, and Description, evaluating the listing's potential to rank on page one.
- **Scribbles (Live Text Tracking)**: A visual text editor with a dynamic keyword checklist. As you write your listing, Scribbles automatically crosses off used keywords and tracks character limits, ensuring no important search terms are left behind.
- **Index Checker (Visibility Verifier)**: A simulation tool to verify if Amazon's A9 algorithm is actively indexing specific ASINs for crucial keywords. It checks traditional indexing, field-specific indexing, and storefront visibility.
- **Listing Analyzer (Health Scoring)**: Comprehensive listing health analysis. It generates an immediate "Listing Quality Score" based on image count, title length, bullet point density, and review velocity, paired with visual charts to pinpoint areas of improvement.

### ⚙️ Operations
- **Alerts (Listing Monitoring)**: A real-time 24/7 monitoring dashboard. It simulates sending instant notifications for critical listing changes, such as a hijacker jumping on the listing, the buy box being lost, or the product dimensions being altered by Amazon.
- **Follow-Up (Email Automation)**: A visual campaign management tool. It simulates the creation of automated email sequences triggered by specific buyer events (like order delivery), helping sellers passively generate more organic reviews.
- **Inventory Management (Stock Forecasting)**: Advanced reorder forecasting. It calculates precise reorder dates and quantities based on current sales velocity, lead times, and seasonal spikes, preventing costly stockouts.
- **Inventory Protector (Coupon Abuse Prevention)**: A crucial defense tool. It simulates setting hard limits on the maximum order quantity a single buyer can purchase, preventing malicious actors or coupon bots from wiping out an entire inventory during a promotion.
- **Refund Genie (FBA Reimbursements)**: Automated FBA reimbursement tracking. It scans simulated seller data for lost or damaged inventory in Amazon warehouses and generates pre-written reports to claim owed money.

### 📈 Analytics & Ads
- **Profits Dashboard (Financial Hub)**: The top-level P&L and revenue tracking center. It features interactive `Recharts` graphs to visualize gross revenue, ad spend, FBA fees, COGS (Cost of Goods Sold), and net profit margins over custom date ranges.
- **Keyword Tracker (Rank Monitoring)**: Daily keyword rank tracking with beautiful sparkline charts. It allows sellers to monitor exactly where their product ranks organically and via PPC for their most critical search terms over time.
- **Market Tracker (Competitor Share)**: A high-level market share visualization tool. It uses pie and area charts to display how much of the total market revenue a seller controls compared to their top 5 competitors.
- **Ads (Adtomic) (PPC Optimization)**: A complete PPC (Pay-Per-Click) campaign management simulator. It visualizes ACoS (Advertising Cost of Sales), RoAS (Return on Ad Spend), and CPC (Cost Per Click) metrics, offering automated bid optimization suggestions.

### 🛠️ Utilities
- **URL Builder (Super URL Generator)**: A tool for generating heavily tagged Amazon super URLs (like 2-Step Via Brand, Add-to-Cart, or Buy Together URLs) designed to manipulate search algorithms and boost keyword ranking during product launches.
- **QR Code Generator (Exportable Graphics)**: A fully functional custom QR generator. It takes any generated Super URL or landing page and instantly creates an exportable, scannable QR code image for product inserts and packaging.

---

## 🎨 Design System: "Liquid Glass"

RetailStacker is built on a custom design system that prioritizes aesthetics without sacrificing performance.

*   🌓 **Dynamic Theming**: Powered by `next-themes`, instantly toggle between Light and Dark mode without page reloads.
*   🧊 **Frosted Glass**: Heavy use of `backdrop-filter: blur(24px)` creates a stunning depth effect over dynamic, animated background orbs.
*   🍎 **Apple-Inspired Palette**: Clean typography (Inter font), subtle shadows, and striking blue accents (`#007AFF` / `#0A84FF`) provide a premium, native-app feel in the browser.
*   📊 **Themed Data Visualizations**: All `Recharts` graphs are bound to CSS variables, ensuring they look perfect whether the lights are on or off.

---

## 💻 Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: Vanilla CSS Variables & custom glassmorphism utilities
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)
- **Theme Management**: `next-themes`

---

## 🛠️ Getting Started

To run RetailStacker locally:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/raunitx-02/RetailStacker.git
   cd RetailStacker
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Explore:** Open [http://localhost:3000](http://localhost:3000) in your browser to see the liquid glass UI in action.

---

<div align="center">
  <i>Built with ❤️ for Amazon Sellers and Design Enthusiasts.</i>
</div>
