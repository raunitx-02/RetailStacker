import type { Metadata } from "next";
import LandingPage from "@/components/landing/LandingPage";

export const metadata: Metadata = {
  title: "RetailStacker — India's Most Powerful Seller Intelligence Platform",
  description: "AI-powered product research, keyword intelligence, listing optimizer and growth advisor built exclusively for Amazon India, Flipkart, Meesho and ONDC sellers. India ka apna Helium 10.",
  openGraph: {
    title: "RetailStacker — India's Seller Intelligence Platform",
    description: "Amazon India, Flipkart, Meesho aur ONDC sellers ke liye AI-powered growth platform",
    type: "website",
  },
};

export default function Home() {
  return <LandingPage />;
}
